// Глобальные переменные
let openingsCount = 0;

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
    
    // Итоговая площадь для укладки
    const totalArea = floorArea + wallsArea - totalOpeningsArea;
    
    // Площадь с запасом
    const totalWithReserve = totalArea * (1 + reserve / 100);
    
    // Отображение результатов
    document.getElementById('floor-area').textContent = floorArea.toFixed(2) + ' м²';
    document.getElementById('walls-area').textContent = wallsArea.toFixed(2) + ' м²';
    document.getElementById('openings-area').textContent = totalOpeningsArea.toFixed(2) + ' м²';
    document.getElementById('total-area').textContent = totalArea.toFixed(2) + ' м²';
    document.getElementById('total-with-reserve').textContent = totalWithReserve.toFixed(2) + ' м²';
    document.getElementById('reserve-percent').textContent = reserve;
    
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
    const totalWithReserveText = document.getElementById('total-with-reserve').textContent;
    const totalWithReserve = parseFloat(totalWithReserveText) || 0;
    
    if (tileWidth <= 0 || tileHeight <= 0) {
        alert('Пожалуйста, введите корректные размеры плитки');
        return;
    }
    
    if (totalWithReserve <= 0) {
        alert('Сначала выполните расчет площади помещения');
        return;
    }
    
    // Площадь одной плитки в м² (размеры в см переводим в м)
    const oneTileArea = (tileWidth / 100) * (tileHeight / 100);
    
    // Количество плиток
    const tilesCount = Math.ceil(totalWithReserve / oneTileArea);
    
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
