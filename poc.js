
// --- HÀM 1: LẤY SELECTOR DUY NHẤT ---
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

// --- HÀM 2: CÁC HELPER CHO CONTENTEDITABLE ---
function onEditDone(event) {
    const element = event.target;
    element.contentEditable = false;
    element.removeEventListener('keydown', onEditKeydown);
    const newText = element.innerText; // Lấy text SẠCH

    // Gửi message MỚI lên Nuxt
    window.parent.postMessage({
        type: 'text-updated',
        selector: getUniqueSelector(element),
        newText: newText
    }, '*');
}

function onEditKeydown(event) {
    if (event.key === 'Enter' || event.key === 'Escape') {
        event.preventDefault();
        event.target.blur(); // Trigger 'blur'
    }
}

// --- HÀM 3: LISTENER CLICK CHÍNH (ROUTER) ---
document.addEventListener('click', (event) => {

    // --- CHẾ ĐỘ KÉO THẢ (ALT+CLICK) ---
    if (event.altKey) {
        event.preventDefault();
        event.stopPropagation();
        let targetBlock = event.target;
        // "Leo cây" tìm "khối" (bất cứ thứ gì không phải text inline)
        while (targetBlock.parentElement && ['P', 'H1', 'H2', 'H3', 'SPAN', 'A', 'IMG', 'STRONG', 'EM', 'B', 'I'].includes(targetBlock.tagName)) {
            targetBlock = targetBlock.parentElement;
        }
        console.log('Iframe: Chế độ Structure, đã chọn block:', targetBlock);
        window.parent.postMessage({
            type: 'block-selected',
            selector: getUniqueSelector(targetBlock)
        }, '*');
        return;
    }

    // --- CHẾ ĐỘ TƯƠNG TÁC (CTRL+CLICK) ---
    if (event.ctrlKey || event.metaKey) {
        console.log('Iframe: Chế độ Interact, cho phép sự kiện mặc định.');
        return; // Không làm gì, cho phép modal mở
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
    if (textElement && !imageElement) { // Ưu tiên text (trừ khi nó nằm trên ảnh)
        console.log('Iframe: Chế độ Sửa Text', textElement);
        textElement.contentEditable = 'plaintext-only';
        textElement.focus();
        textElement.addEventListener('blur', onEditDone, { once: true });
        textElement.addEventListener('keydown', onEditKeydown);
        return;
    }

    // --- CHẾ ĐỘ SỬA ELEMENT (ẢNH, LINK...) ---
    // (Hoặc bất cứ thứ gì không phải text)
    const targetElement = elements[0]; // Lấy phần tử trên cùng
    console.log('Iframe: Chế độ Sửa Element', targetElement);
    window.parent.postMessage({
        type: 'element-clicked',
        selector: getUniqueSelector(targetElement),
        tagName: targetElement.tagName,
        styles: {} // (Tạm thời k gửi style để tập trung vào img/link)
    }, '*');

}, true); // Dùng Capture Phase

// --- HÀM 4: LISTENER NHẬN LỆNH TỪ NUXT ---
window.addEventListener('message', (event) => {
    // (Kiểm tra origin...)
    const data = event.data;

    // --- XỬ LÝ LỆNH "INIT DRAG" ---
    if (data.type === 'init-drag-mode') {
        const block = document.querySelector(data.selector);
        if (!block) {
            console.error('Iframe: Không tìm thấy block để kéo', data.selector);
            return;
        }

        const container = block.parentElement;
        if (container) {
            console.log('Iframe: Khởi tạo SortableJS cho', container);
            new Sortable(container, {
                group: `group-${getUniqueSelector(container)}`, // Nhóm động
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
        }
    }
});

