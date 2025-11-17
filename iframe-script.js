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

// --- HÀM 3: KHỞI TẠO SORTABLE (CẬP NHẬT VỚI "DYNAMIC INJECTION") ---
function initSortable(ruleset) {
    console.log('Iframe: Đã nhận Luật, khởi tạo SortableJS...', ruleset);
    
    // --- 1. ĐỊNH NGHĨA CHUỖI HTML CỦA ICON ---
    // (Đây là nơi bạn "bỏ" snippet của mình vào, dưới dạng 1 chuỗi JS)
    const handleBlockSVG = `
        <div class="handle-block" style="cursor: grab; position: absolute; top: 5px; left: 5px; z-index: 10;">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="2.5" cy="2.5" r="1.5" fill="#666"/>
            <circle cx="9.5" cy="2.5" r="1.5" fill="#666"/>
            <circle cx="2.5" cy="6" r="1.5" fill="#666"/>
            <circle cx="9.5" cy="6" r="1.5" fill="#666"/>
            <circle cx="2.5" cy="9.5" r="1.5" fill="#666"/>
            <circle cx="9.5" cy="9.5" r="1.5" fill="#666"/>
          </svg>
        </div>
    `;
    const handleSectionSVG = `
        <div class="handle-section" style="cursor: move; background: blue; color: white; padding: 2px; position: absolute; top: 0; left: 0; z-index: 9;">
            [Kéo Section]
        </div>
    `; // (Bạn cũng có thể đổi "Kéo Section" thành icon)

    // --- 2. TỰ ĐỘNG "TIÊM" TAY NẮM (HANDLES) ---
    ruleset.forEach(rule => {
        const containers = document.querySelectorAll(rule.selector);
        containers.forEach(containerEl => {
            const config = rule.config;
            
            // Tìm TẤT CẢ các item con có thể kéo được
            const draggables = containerEl.querySelectorAll(config.draggable);
            
            draggables.forEach(draggableEl => {
                // "Tiêm" tay nắm vào
                if (config.handle === '.handle-block') {
                    draggableEl.style.position = 'relative'; // Cần thiết để định vị tay nắm
                    draggableEl.insertAdjacentHTML('afterbegin', handleBlockSVG);
                } 
                else if (config.handle === '.handle-section') {
                    draggableEl.style.position = 'relative';
                    draggableEl.insertAdjacentHTML('afterbegin', handleSectionSVG);
                }
            });
        });
    });

    // --- 3. KHỞI TẠO SORTABLEJS (NHƯ CŨ) ---
    ruleset.forEach(rule => {
        const containerElements = document.querySelectorAll(rule.selector);
        
        if (containerElements.length > 0) {
            containerElements.forEach(containerEl => {
                console.log('Iframe: Kích hoạt D&D cho', containerEl, rule.config);
                const config = rule.config;
                new Sortable(containerEl, {
                    group: {
                        name: config.groupName,
                        put: function (to, from, dragEl) {
                            const dragType = dragEl.getAttribute('data-type');
                            return config.accepts.includes(dragType);
                        }
                    },
                    handle: config.handle,
                    draggable: config.draggable,
                    animation: 150,
                    onEnd: function (evt) {
                        // (postMessage 'element-dragged' như cũ...)
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
    const style = document.createElement('style');
    style.innerHTML = `
        /* Ẩn tất cả tay nắm theo mặc định */
        .handle-block, .handle-section {
            opacity: 0;
            transition: opacity 0.15s ease-in-out;
        }
        
        /* Khi hover vào Block, hiện tay nắm Block */
        [data-component="block"]:hover > .handle-block {
            opacity: 1;
        }
        
        /* Khi hover vào Section, hiện tay nắm Section */
        [data-type="section"]:hover > .handle-section {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
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

    // --- LOGIC MỚI: NHẬN "PING" TỪ PARENT ---
    if (data.type === 'parent-ready') {
        console.log('Iframe: Nhận được "PING" từ Parent, gửi "PONG" (ready-for-rules) LÊN.');
        
        // Gửi "PONG" (tin nhắn CŨ của bạn) LÊN
        window.parent.postMessage({ type: 'iframe-ready-for-rules' }, '*');
    }

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