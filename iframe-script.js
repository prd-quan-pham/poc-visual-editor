console.log('cuu toi voi')


// --- HÀM 1: GET SELECTOR (GIỮ NGUYÊN) ---
function getUniqueSelector(el) {
    if (!el || !(el instanceof Element)) return;
    let path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
        let selector = el.nodeName.toLowerCase();
        if (el.id) {
            selector = '#' + el.id;
            path.unshift(selector);
            break;
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

// --- HÀM 2: CÁC HELPER CHO CONTENTEDITABLE (GIỮ NGUYÊN) ---
function onEditDone(event) {
    const element = event.target;
    element.contentEditable = false;
    element.removeEventListener('keydown', onEditKeydown);
    element.removeEventListener('blur', onEditDone);
    const newText = element.innerText;
    window.parent.postMessage({
        type: 'text-updated',
        selector: getUniqueSelector(element),
        newText: newText
    }, '*');
}

function onEditKeydown(event) {
    if (event.key === 'Enter' || event.key === 'Escape') {
        event.preventDefault();
        event.target.blur();
    }
}

// --- HÀM 3: KHỞI TẠO SORTABLE THEO "LUẬT" (TỪ NUXT) ---
function initSortable(ruleset) {
    console.log('Iframe: Đã nhận Luật, khởi tạo SortableJS...', ruleset);
    
    ruleset.forEach(rule => {
        // Dùng querySelectorAll để tìm TẤT CẢ các container khớp
        const containerElements = document.querySelectorAll(rule.selector);

        if (containerElements.length > 0) {
            containerElements.forEach(containerEl => {
                console.log('Iframe: Kích hoạt D&D cho', containerEl, rule.config);
                
                const config = rule.config;

                new Sortable(containerEl, {
                    group: {
                        name: config.groupName,
                        // Quan trọng: Hàm 'put' này sẽ chạy logic "Luật"
                        put: function (to, from, dragEl) {
                            const dragType = dragEl.getAttribute('data-type');
                            // "accepts" là mảng ['card', 'block'] từ Nuxt
                            return config.accepts.includes(dragType);
                        }
                    },
                    handle: config.handle, // !!! DÙNG TAY NẮM
                    draggable: config.draggable, // !!! CHỈ KÉO CÁC ITEM NÀY
                    animation: 150,
                    
                    onEnd: function (evt) {
                        console.log('Iframe: Kéo xong, báo cáo cho Nuxt');
                        window.parent.postMessage({
                            type: 'element-dragged',
                            movedSelector: getUniqueSelector(evt.item),
                            parentSelector: getUniqueSelector(evt.to),
                            newIndex: evt.newIndex
                        }, '*');
                    }
                });
            });
        } else {
             console.warn('Iframe: Không tìm thấy container selector:', rule.selector);
        }
    });
}

// --- HÀM 4: KHỞI TẠO (DOM READY) ---
document.addEventListener('DOMContentLoaded', () => {
    // Báo cáo "Sẵn sàng" để "xin" Luật
    console.log('check DOMContentLoaded')
    window.parent.postMessage({ type: 'iframe-ready-for-rules' }, '*');
});

// --- HÀM 5: LISTENER 'CLICK' (ĐƠN GIẢN HÓA) ---
// Logic "mousedown" đã bị xóa bỏ.
document.addEventListener('click', (event) => {

    // --- CHẾ ĐỘ TƯƠNG TÁC (CTRL+CLICK) ---
    if (event.ctrlKey || event.metaKey) {
        console.log('Iframe: Chế độ Interact, cho phép sự kiện.');
        return; // Không làm gì, cho phép modal mở
    }

    // --- BỎ QUA NẾU CLICK VÀO TAY NẮM (HANDLE) ---
    if (event.target.closest('.handle-block, .handle-section')) {
        console.log('Iframe: Click vào Handle, bỏ qua.');
        event.preventDefault();
        event.stopPropagation();
        return;
    }

    // Ngăn chặn tất cả các hành vi khác
    event.preventDefault();
    event.stopPropagation();

    // --- TÌM TARGET (X-RAY VISION) ---
    const elements = document.elementsFromPoint(event.clientX, event.clientY) || [event.target];

    // 1. Ưu tiên tìm TEXT
    const textElement = elements.find(el =>
        ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'A'].includes(el.tagName)
    );

    // 2. Ưu tiên tìm ẢNH
    const imageElement = elements.find(el => el.tagName === 'IMG');

    // --- CHẾ ĐỘ SỬA TEXT (CLICK VÀO TEXT) ---
    if (textElement) {
        console.log('Iframe: Chế độ Sửa Text', textElement);
        textElement.contentEditable = 'plaintext-only';
        textElement.focus();
        textElement.addEventListener('blur', onEditDone, { once: true });
        textElement.addEventListener('keydown', onEditKeydown);
        return;
    }

    // --- CHẾ ĐỘ SỬA ELEMENT (ẢNH, LINK...) ---
    const targetElement = imageElement || elements[0]; // Ưu tiên ảnh nếu tìm thấy
    console.log('Iframe: Chế độ Sửa Element', targetElement);
    window.parent.postMessage({
        type: 'element-clicked',
        selector: getUniqueSelector(targetElement),
        tagName: targetElement.tagName,
    }, '*');

}, true); // Dùng Capture Phase

// --- HÀM 6: LISTENER NHẬN LỆNH TỪ NUXT ---
window.addEventListener('message', (event) => {
    // (Kiểm tra origin...)
    const data = event.data;

    // --- NHẬN VÀ KÍCH HOẠT D&D ---
    if (data.type === 'init-drag-rules') {
        initSortable(data.rules); // Gọi hàm khởi tạo D&D
    }

    // --- NHẬN LỆNH LIVE-PREVIEW STYLE ---
    if (data.type === 'apply-live-style') {
        const el = document.querySelector(data.selector);
        if (el) {
            el.style[data.style.property] = data.style.value;
        }
    }
});