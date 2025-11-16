
console.log('Iframe Script: Đã tải. Chờ DOM...');

// --- SECTION 1: HELPER FUNCTIONS ---

/**
 * Tạo ra một CSS Selector duy nhất cho một element
 * (Ví dụ: 'html > body > main > div:nth-of-type(2)')
 */
function getUniqueSelector(el) {
    if (!el || !(el instanceof Element)) return;
    let path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
        let selector = el.nodeName.toLowerCase();
        if (el.id) {
            selector = '#' + el.id;
            path.unshift(selector);
            break; // ID là duy nhất, dừng lại
        } else {
            let sib = el, nth = 1;
            while (sib = sib.previousElementSibling) {
                if (sib.nodeName.toLowerCase() == selector) nth++;
            }
            if (nth != 1) selector += `:nth-of-type(${nth})`;
        }
        path.unshift(selector);
        el = el.parentNode;
    }
    return path.join(' > ');
}

/**
 * Helper (1/2): Được gọi khi người dùng bấm Enter/Escape lúc sửa text
 */
function onEditKeydown(event) {
    if (event.key === 'Enter' || event.key === 'Escape') {
        event.preventDefault();
        event.target.blur(); // Trigger sự kiện 'blur'
    }
}

/**
 * Helper (2/2): Được gọi khi người dùng click ra ngoài (blur)
 * để kết thúc sửa text và gửi kết quả lên Nuxt
 */
function onEditDone(event) {
    const element = event.target;

    // Tắt chế độ sửa
    element.contentEditable = false;

    // Dọn dẹp listener
    element.removeEventListener('keydown', onEditKeydown);
    element.removeEventListener('blur', onEditDone); // (Tự dọn dẹp nếu dùng {once: true})

    // Lấy text SẠCH (quan trọng)
    const newText = element.innerText;

    console.log('Iframe: Sửa text xong, gửi "text-updated" lên Parent');

    // Gửi message MỚI lên Nuxt, báo rằng text ĐÃ được cập nhật
    window.parent.postMessage({
        type: 'text-updated',
        selector: getUniqueSelector(element),
        newText: newText
    }, '*'); // (Nên dùng origin thật)
}


// --- SECTION 2: KHỞI TẠO ---

document.addEventListener('DOMContentLoaded', () => {
    console.log('Iframe: DOM Sẵn sàng. Chờ hành động...');
    // Không khởi tạo D&D vội, chờ lệnh!
});


// --- SECTION 3: CLICK LISTENER CHÍNH (THE "ROUTER") ---

document.addEventListener('click', (event) => {

    // --- CHẾ ĐỘ 1: KÉO THẢ (ALT+CLICK) ---
    if (event.altKey) {
        event.preventDefault();
        event.stopPropagation();

        // Tìm "khối" (block) hoặc "section" gần nhất
        const target = event.target.closest('[data-component="block"], [data-component="section"]');

        if (target) {
            console.log('Iframe: Chế độ Structure (Alt+Click). Yêu cầu kéo:', target);
            // Gửi YÊU CẦU lên Nuxt
            window.parent.postMessage({
                type: 'drag-request',
                selector: getUniqueSelector(target)
            }, '*'); // (Nên dùng origin thật)
        } else {
            console.warn('Iframe: Alt+Click nhưng không tìm thấy [data-component] nào.');
        }
        return; // Dừng lại, không làm gì nữa
    }

    // --- CHẾ ĐỘ 2: TƯƠNG TÁC (CTRL+CLICK) ---
    if (event.ctrlKey || event.metaKey) {
        console.log('Iframe: Chế độ Interact (Ctrl+Click), cho phép sự kiện mặc định.');
        // KHÔNG preventDefault. Cho phép modal/drawer mở.
        return; // Dừng lại
    }

    // --- CHẾ ĐỘ 3: SỬA NỘI DUNG (CLICK BÌNH THƯỜNG) ---

    // Ngăn chặn mọi hành vi mặc định khác (như đi theo link)
    event.preventDefault();
    event.stopPropagation();

    // Dùng "X-Ray Vision" để tìm đúng target
    const elements = document.elementsFromPoint(event.clientX, event.clientY) || [event.target];

    // Ưu tiên 1: Tìm TEXT
    const textElement = elements.find(el =>
        ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'A', 'STRONG', 'EM', 'B', 'I'].includes(el.tagName)
    );

    // Ưu tiên 2: Tìm ẢNH
    const imageElement = elements.find(el => el.tagName === 'IMG');

    // KỊCH BẢN A: CLICK VÀO TEXT (VÀ KHÔNG PHẢI ẢNH)
    if (textElement && !imageElement) {
        console.log('Iframe: Chế độ Sửa Text', textElement);

        // Kích hoạt sửa tại chỗ (chỉ nhận text, chống paste HTML bẩn)
        textElement.contentEditable = 'plaintext-only';
        textElement.focus(); // Đặt con trỏ vào

        // Gắn listener để biết khi nào sửa xong
        textElement.addEventListener('blur', onEditDone, { once: true });
        textElement.addEventListener('keydown', onEditKeydown);
        return; // Dừng
    }

    // KỊCH BẢN B: CLICK VÀO (ẢNH, LINK) HOẶC KHỐI CHUNG
    // (Gửi lên Nuxt để mở Sidebar)
    const targetElement = elements[0]; // Lấy phần tử trên cùng
    console.log('Iframe: Chế độ Sửa Element (Ảnh/Link...), gửi lên Parent', targetElement);

    window.parent.postMessage({
        type: 'element-clicked',
        selector: getUniqueSelector(targetElement),
        tagName: targetElement.tagName,
        // Gửi style hiện tại lên (cho tính năng Style)
        styles: {
            color: window.getComputedStyle(targetElement).color,
            fontSize: window.getComputedStyle(targetElement).fontSize,
            backgroundColor: window.getComputedStyle(targetElement).backgroundColor
        }
    }, '*'); // (Nên dùng origin thật)

}, true); // Dùng Capture Phase (rất quan trọng)


// --- SECTION 4: LISTENER NHẬN LỆNH TỪ NUXT ---

window.addEventListener('message', (event) => {
    // (Nên kiểm tra event.origin ở đây)
    // if (event.origin !== 'http://localhost:3000') return;

    const data = event.data;

    // --- LỆNH 1: KHỞI TẠO KÉO-THẢ ---
    if (data.type === 'init-drag-mode') {
        console.log('Iframe: Nhận lệnh init-drag-mode', data);

        const containerEl = document.querySelector(data.containerSelector);
        if (containerEl) {
            // Hủy (destroy) Sortable cũ nếu có, để tránh lỗi
            if (containerEl.sortableInstance) {
                containerEl.sortableInstance.destroy();
            }

            // Khởi tạo Sortable mới
            containerEl.sortableInstance = new Sortable(containerEl, {
                group: 'shared-group',
                animation: 150,
                draggable: data.draggableSelector, // Dùng "Luật" từ Nuxt

                onEnd: (evt) => {
                    console.log('Iframe: Kéo xong, báo cáo Nuxt');
                    window.parent.postMessage({
                        type: 'element-dragged',
                        movedSelector: getUniqueSelector(evt.item),
                        parentSelector: getUniqueSelector(evt.to),
                        newIndex: evt.newIndex
                    }, '*'); // (Nên dùng origin thật)
                }
            });
        } else {
            console.error('Iframe: Không tìm thấy container cho D&D:', data.containerSelector);
        }
    }

    // --- LỆNH 2: XEM TRƯỚC STYLE (LIVE PREVIEW) ---
    if (data.type === 'apply-live-style') {
        console.log('Iframe: Đang áp dụng style...', data);
        const elementToStyle = document.querySelector(data.selector);
        if (elementToStyle) {
            // Áp dụng style trực tiếp vào DOM (inline)
            elementToStyle.style[data.style.property] = data.style.value;
        }
    }
});