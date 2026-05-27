// Адрес файла с данными (можно поменять на другой JSON)
const ASSETS_JSON_PATH = 'assets.json';

// Состояние
let allAssets = [];
let currentFilter = 'all';

// Элементы DOM
const grid = document.getElementById('assetsGrid');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const filterBtns = document.querySelectorAll('.filter-btn');

// Русские названия категорий
const categoryNames = {
    'sprites': '🎨 Спрайты',
    'models': '🗿 Модели',
    'music': '🎵 Музыка',
    'projects': '📦 Проекты'
};

// Загрузка данных
async function loadAssets() {
    try {
        const response = await fetch(ASSETS_JSON_PATH);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: не удалось загрузить ${ASSETS_JSON_PATH}`);
        }
        const data = await response.json();
        allAssets = data;
        renderAssets();
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        grid.innerHTML = `<div class="error-message">❌ Ошибка загрузки ассетов. Проверьте, что файл ${ASSETS_JSON_PATH} существует и имеет правильный формат.</div>`;
    }
}

// Фильтрация ассетов по текущей категории
function getFilteredAssets() {
    if (currentFilter === 'all') {
        return allAssets;
    }
    return allAssets.filter(asset => asset.category === currentFilter);
}

// Рендер сетки карточек
function renderAssets() {
    const filtered = getFilteredAssets();
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="loading">😢 Ассетов в этой категории пока нет</div>';
        return;
    }
    
    grid.innerHTML = filtered.map(asset => `
        <div class="card" data-asset-id="${asset.id}">
            <img class="card-preview" 
                 src="${asset.previewImage || 'images/placeholder.svg'}" 
                 alt="${asset.name}"
                 loading="lazy"
                 onerror="this.src='images/placeholder.svg'">
            <div class="card-content">
                <h3 class="card-title">${escapeHtml(asset.name)}</h3>
                <p class="card-description">${escapeHtml(truncate(asset.description, 100))}</p>
                <div class="card-footer">
                    <span class="card-badge">${categoryNames[asset.category] || asset.category}</span>
                    <span class="card-size">${asset.fileSize || '—'}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    // Навесить обработчики на карточки
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
            const assetId = card.dataset.assetId;
            const asset = allAssets.find(a => a.id === assetId);
            if (asset) {
                openModal(asset);
            }
        });
    });
}

// Открыть модальное окно
function openModal(asset) {
    modalBody.innerHTML = `
        <img class="modal-preview" 
             src="${asset.previewImage || 'images/placeholder.svg'}" 
             alt="${asset.name}"
             onerror="this.src='images/placeholder.svg'">
        <h2 class="modal-title">${escapeHtml(asset.name)}</h2>
        <div class="modal-category">${categoryNames[asset.category] || asset.category}</div>
        <p class="modal-description">${escapeHtml(asset.description)}</p>
        <div class="modal-meta">
            <span class="modal-size">📦 ${asset.fileSize || 'Размер не указан'}</span>
        </div>
        <a href="${asset.fileUrl}" class="download-btn" download="${getFileName(asset.fileUrl)}">⬇️ СКАЧАТЬ</a>
    `;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Закрыть модальное окно
function closeModal() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// Утилиты
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function truncate(str, maxLength) {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength).trim() + '…';
}

function getFileName(url) {
    if (!url) return 'download';
    const parts = url.split('/');
    let filename = parts.pop() || 'download';
    // Убрать возможные параметры URL
    filename = filename.split('?')[0];
    return filename;
}

// Настройка фильтров
function setupFilters() {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Обновить активную кнопку
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Обновить фильтр
            currentFilter = btn.dataset.category;
            renderAssets();
        });
    });
}

// Закрытие модалки по клику вне контента или на крестик
modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('modal-close')) {
        closeModal();
    }
});

// Закрытие по Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
    }
});

// Инициализация
setupFilters();
loadAssets();