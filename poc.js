
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

// --- HÀM 3: KHỞI TẠO (DOM READY) ---
// --- HÀM 3 (ĐÃ NÂNG CẤP): KHỞI TẠO 2 CẤP ĐỘ ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('Iframe: DOM Sẵn sàng. Khởi tạo D&D...');
    
    // --- LOGIC CẤP 1: KÉO THẢ "BLOCK" (BÊN TRONG CONTAINER) ---
    const containers = document.querySelectorAll('[data-component="container"]');
    containers.forEach(container => {
        const accepts = container.getAttribute('data-accepts')?.split(',') || [];
        console.log('Iframe: Kích hoạt Cấp 1 (Blocks) cho', container);
        
        new Sortable(container, {
            group: {
                name: 'shared-blocks', // Nhóm cho các "Blocks"
                put: (to, from, dragEl) => accepts.includes(dragEl.getAttribute('data-type')),
            },
            draggable: '[data-component="block"]', // Chỉ kéo block
            animation: 150,
            onEnd: (evt) => {
                console.log('Iframe: Kéo xong (Block), báo cáo Nuxt');
                window.parent.postMessage({
                    type: 'element-dragged',
                    movedSelector: getUniqueSelector(evt.item),
                    parentSelector: getUniqueSelector(evt.to),
                    newIndex: evt.newIndex
                }, '*');
            }
        });
    });

    // --- LOGIC CẤP 2 (MỚI): KÉO THẢ "SECTION" (BÊN NGOÀI) ---
    const pageBodies = document.querySelectorAll('[data-component="page-body"]');
    pageBodies.forEach(body => {
        console.log('Iframe: Kích hoạt Cấp 2 (Sections) cho', body);
        
        new Sortable(body, {
            group: 'sections', // Nhóm riêng cho các "Sections"
            draggable: '[data-component="section"]', // Chỉ kéo section
            animation: 150,
            onEnd: (evt) => {
                console.log('Iframe: Kéo xong (Section), báo cáo Nuxt');
                window.parent.postMessage({
                    type: 'element-dragged', // Dùng chung 1 message type
                    movedSelector: getUniqueSelector(evt.item),
                    parentSelector: getUniqueSelector(evt.to),
                    newIndex: evt.newIndex
                }, '*');
            }
        });
    });
});
// --- HÀM 4: LISTENER 'MOUSEDOWN' (ĐỂ KÉO) ---
// (Giữ nguyên y hệt như code trước)
document.addEventListener('mousedown', (event) => {
    if (event.ctrlKey || event.metaKey) { return; }

    const draggableBlock = event.target.closest('[data-component="block"]');
    if (draggableBlock) {
        console.log('Iframe: Mousedown trên block, cho phép SortableJS chạy.');
        event.stopPropagation();
        return;
    }
    event.preventDefault();
}, true);

// --- HÀM 5: LISTENER MỚI CHO 'MOUSEDOWN' (ĐỂ KÉO) ---
document.addEventListener('mousedown', (event) => {
    // Nếu giữ Ctrl/Cmd (mở modal), không làm gì cả
    if (event.ctrlKey || event.metaKey) { return; }

    // Kiểm tra xem có phải click vào "Block" (thứ có thể kéo)
    const draggableBlock = event.target.closest('[data-component="block"]');

    if (draggableBlock) {
        console.log('Iframe: Mousedown trên block, cho phép SortableJS chạy.');
        // KHÔNG preventDefault()
        // Chỉ cần ngăn "click" (ở dưới) chạy
        event.stopPropagation();
        return;
    }

    // Nếu click vào thứ khác (không phải block, không phải Ctrl)
    // thì mới chặn mousedown để chuẩn bị sửa text/ảnh
    event.preventDefault();

}, true);

document.addEventListener('click', (event) => {
    // Nếu giữ Ctrl/Cmd (đã xử lý ở mousedown, nhưng check lại)
    if (event.ctrlKey || event.metaKey) { return; }

    // Nếu là 'click' trên 'block' (tức là sau khi kéo xong)
    // thì ta phải chặn nó lại, không cho sửa text
    if (event.target.closest('[data-component="block"]')) {
        event.preventDefault();
        event.stopPropagation();
        return;
    }

    // Nếu click bình thường (không phải kéo, không phải Ctrl)
    event.preventDefault();
    event.stopPropagation();

    // --- CHẾ ĐỘ SỬA TEXT (CLICK VÀO TEXT) ---
    // (Logic 'elementsFromPoint' và 'contenteditable' như cũ...)
    const elements = document.elementsFromPoint(event.clientX, event.clientY) || [event.target];
    const textElement = elements.find(el => ['P', 'H1', 'H2', 'H3', 'A'].includes(el.tagName));

    if (textElement) {
        console.log('Iframe: Chế độ Sửa Text', textElement);
        textElement.contentEditable = 'plaintext-only';
        textElement.focus();
        textElement.addEventListener('blur', onEditDone, { once: true });
        textElement.addEventListener('keydown', onEditKeydown);
        return;
    }

    // --- CHẾ ĐỘ SỬA ELEMENT (ẢNH, LINK...) ---
    const targetElement = elements[0];
    console.log('Iframe: Chế độ Sửa Element', targetElement);
    window.parent.postMessage({
        type: 'element-clicked',
        selector: getUniqueSelector(targetElement),
        tagName: targetElement.tagName,
    }, '*');

}, true);

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

    if (data.type === 'init-drag-rules') {
        console.log('Iframe: Đã nhận Luật D&D', data.rules);

        data.rules.forEach(rule => {
            if (rule.type === 'container') {
                const containerEl = document.querySelector(rule.selector);
                if (containerEl) {
                    console.log('Iframe: Kích hoạt D&D cho', containerEl);
                    new Sortable(containerEl, {
                        ...rule.config, // Áp dụng "Luật" từ Nuxt
                        animation: 150,
                        onEnd: function (evt) {
                            // Báo cáo (như POC)
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
    }
});

