// Глобальные переменные
let openingsCount = 0;

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    
// Элементы DOM
const lengthInput = document.getElementById('length');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const reserveInput = document.getElementById('reserve');
const addOpeningBtn = document.getElementById('add-opening');
const openingsList = document.getElementById('openings-list');
const calculateBtn = document.getElementById('calculate');
const resultsSection = document.getElementById('results');
const tileInfoSection = document.getElementById('tile-info');
const tilesResultSection = document.getElementById('tiles-result');
const calculateTilesBtn = document.getElementById('calculate-tiles');

// Элементы ванны
const bathLengthInput = document.getElementById('bath-length');
const bathWidthInput = document.getElementById('bath-width');
const bathHeightInput = document.getElementById('bath-height');
const bathScreenCheckbox = document.getElementById('bath-screen');
const bathZoneCheckbox = document.getElementById('bath-zone');
const bathAreaRow = document.getElementById('bath-area-row');
const bathAreaElement = document.getElementById('bath-area');
const finalTotalRow = document.getElementById('final-total-row');
const finalTotalElement = document.getElementById('final-total');

// Функция добавления проема (окно/дверь)
function addOpening() {
    openingsCount++;
    
    const openingDiv = document.createElement('div');
    openingDiv.className = 'opening-item';
    openingDiv.id = `opening-${openingsCount}`;
    openingDiv.innerHTML = `
        <div class="form-group">
            <label>Ширина (м):</label>
            <input type="number" class="opening-width" min="0" step="0.01" placeholder="Например: 0.9">
        </div>
        <div class="form-group">
            <label>Высота (м):</label>
            <input type="number" class="opening-height" min="0" step="0.01" placeholder="Например: 2.1">
        </div>
        <button type="button" class="btn btn-danger" onclick="removeOpening(${openingsCount})">✕ Удалить</button>
    `;
    
    openingsList.appendChild(openingDiv);
}

// Функция удаления проема
function removeOpening(id) {
    const opening = document.getElementById(`opening-${id}`);
    if (opening) {
        opening.remove();
    }
}

// Функция расчета площади ванны
function calculateBathArea() {
    const bathLength = parseFloat(bathLengthInput.value) || 0;
    const bathWidth = parseFloat(bathWidthInput.value) || 0;
    const bathHeight = parseFloat(bathHeightInput.value) || 0;
    
    // Если размеры ванны не указаны, возвращаем 0
    if (bathLength <= 0 || bathWidth <= 0 || bathHeight <= 0) {
        return 0;
    }
    
    let totalBathArea = 0;
    
    // Облицовка экрана ванной (фронтальная панель): длина * высота (добавляем к общей площади)
    if (bathScreenCheckbox && bathScreenCheckbox.checked) {
        totalBathArea += bathLength * bathHeight;
    }
    
    // Плитка в зоне ванны (задняя стена + боковые стороны + пол под ванной)
    // Если чекбокс снят — вычитаем эту площадь из общей
    // Задняя стена: длина * высота
    // Боковые стороны: ширина * высота * 2
    // Пол под ванной: длина * ширина
    const bathZoneArea = (bathLength * bathHeight) + (2 * bathWidth * bathHeight) + (bathLength * bathWidth);
    
    // Если чекбокс "Плитка в зоне ванны" отмечен — добавляем, если нет — ничего не делаем (вычитание будет в main расчете)
    if (bathZoneCheckbox && bathZoneCheckbox.checked) {
        totalBathArea += bathZoneArea;
    } else {
        // Возвращаем отрицательное значение для вычитания из общей площади
        totalBathArea -= bathZoneArea;
    }
    
    return totalBathArea;
}

// Функция расчета площади
function calculateArea() {
    // Получаем значения
    const length = parseFloat(lengthInput.value) || 0;
    const width = parseFloat(widthInput.value) || 0;
    const height = parseFloat(heightInput.value) || 0;
    const reserve = parseFloat(reserveInput.value) || 0;
    
    // Проверка ввода
    if (length <= 0 || width <= 0 || height <= 0) {
        alert('Пожалуйста, введите корректные размеры помещения (все значения должны быть больше 0)');
        return;
    }
    
    // Расчет площади пола
    const floorArea = length * width;
    
    // Расчет площади стен (периметр * высота)
    const wallsArea = (2 * (length + width)) * height;
    
    // Расчет площади исключений (окна, двери)
    let totalOpeningsArea = 0;
    const openingItems = document.querySelectorAll('.opening-item');
    openingItems.forEach(item => {
        const openingWidth = parseFloat(item.querySelector('.opening-width').value) || 0;
        const openingHeight = parseFloat(item.querySelector('.opening-height').value) || 0;
        totalOpeningsArea += openingWidth * openingHeight;
    });
    
    // Итоговая площадь для укладки (без учета ванны)
    const totalArea = floorArea + wallsArea - totalOpeningsArea;
    
    // Площадь с запасом (без учета ванны)
    const totalWithReserve = totalArea * (1 + reserve / 100);
    
    // Расчет площади ванны
    const bathArea = calculateBathArea();
    
    // Общая площадь с учетом ванны
    const finalTotal = totalWithReserve + bathArea;
    
    // Отображение результатов
    document.getElementById('floor-area').textContent = floorArea.toFixed(2) + ' м²';
    document.getElementById('walls-area').textContent = wallsArea.toFixed(2) + ' м²';
    document.getElementById('openings-area').textContent = totalOpeningsArea.toFixed(2) + ' м²';
    document.getElementById('total-area').textContent = totalArea.toFixed(2) + ' м²';
    document.getElementById('total-with-reserve').textContent = totalWithReserve.toFixed(2) + ' м²';
    document.getElementById('reserve-percent').textContent = reserve;
    
    // Отображение результатов по ванне
    if (bathArea !== 0) {
        bathAreaRow.style.display = 'flex';
        finalTotalRow.style.display = 'flex';
        bathAreaElement.textContent = (bathArea >= 0 ? '+' : '') + bathArea.toFixed(2) + ' м²';
        finalTotalElement.textContent = finalTotal.toFixed(2) + ' м²';
    } else {
        bathAreaRow.style.display = 'none';
        finalTotalRow.style.display = 'none';
    }
    
    // Показываем секцию результатов
    resultsSection.style.display = 'block';
    tileInfoSection.style.display = 'block';
    tilesResultSection.style.display = 'none';
    
    // Прокрутка к результатам
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Функция расчета количества плитки
function calculateTiles() {
    const tileWidth = parseFloat(document.getElementById('tile-width').value) || 0;
    const tileHeight = parseFloat(document.getElementById('tile-height').value) || 0;
    // Используем финальную сумму с учетом ванны, если она есть
    let totalAreaValue;
    if (finalTotalRow.style.display !== 'none') {
        const finalTotalText = document.getElementById('final-total').textContent;
        totalAreaValue = parseFloat(finalTotalText) || 0;
    } else {
        const totalWithReserveText = document.getElementById('total-with-reserve').textContent;
        totalAreaValue = parseFloat(totalWithReserveText) || 0;
    }
    
    if (tileWidth <= 0 || tileHeight <= 0) {
        alert('Пожалуйста, введите корректные размеры плитки');
        return;
    }
    
    if (totalAreaValue <= 0) {
        alert('Сначала выполните расчет площади помещения');
        return;
    }
    
    // Площадь одной плитки в м² (размеры в см переводим в м)
    const oneTileArea = (tileWidth / 100) * (tileHeight / 100);
    
    // Количество плиток
    const tilesCount = Math.ceil(totalAreaValue / oneTileArea);
    
    // Отображение результатов
    document.getElementById('one-tile-area').textContent = oneTileArea.toFixed(4) + ' м²';
    document.getElementById('tiles-count').textContent = tilesCount + ' шт';
    
    tilesResultSection.style.display = 'block';
}

// Обработчики событий
addOpeningBtn.addEventListener('click', addOpening);
calculateBtn.addEventListener('click', calculateArea);
calculateTilesBtn.addEventListener('click', calculateTiles);

// Добавление одного проема по умолчанию
addOpening();

}); // Конец DOMContentLoaded
