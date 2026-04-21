// Глобальный массив для хранения проемов
let openings = [];

// Функция для получения значений полей
function getValue(id) {
    const element = document.getElementById(id);
    return element ? parseFloat(element.value) || 0 : 0;
}

// Функция для получения значения чекбокса
function getCheckboxValue(id) {
    const element = document.getElementById(id);
    return element ? element.checked : false;
}

// Функция для установки текста элемента
function setText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

// Функция для показа/скрытия элемента
function setDisplay(id, display) {
    const element = document.getElementById(id);
    if (element) {
        element.style.display = display;
    }
}

// Основная функция расчета площади
function calculateArea() {
    const length = getValue('length');
    const width = getValue('width');
    const height = getValue('height');
    const reservePercent = getValue('reserve');

    // Проверка на заполненность основных полей
    if (length <= 0 || width <= 0 || height <= 0) {
        setDisplay('resultsBlock', 'none');
        return;
    }

    // Показываем блок результатов
    setDisplay('resultsBlock', 'block');

    // Расчет площади пола
    const floorArea = length * width;

    // Расчет площади стен (периметр * высота)
    const perimeter = 2 * (length + width);
    const wallsTotal = perimeter * height;

    // Расчет площади исключений (окна, двери)
    let totalOpeningsArea = 0;
    openings.forEach(opening => {
        totalOpeningsArea += opening.width * opening.height;
    });

    // Расчет коррекции по ванне
    const bathLength = getValue('bathLength');
    const bathWidth = getValue('bathWidth');
    const bathHeight = getValue('bathHeight');
    const tileUnderBath = getCheckboxValue('tileUnderBath');
    const screenCladding = getCheckboxValue('screenCladding');

    let bathAdjustment = 0;
    let bathNote = "";

    if (bathLength > 0 && bathWidth > 0 && bathHeight > 0) {
        // Площадь зоны ванны, которую НЕ нужно облицовывать, если чекбокс снят
        // Задняя стена (длина * высота) + 2 боковые стороны (ширина * высота) + пол (длина * ширина)
        const backWall = bathLength * bathHeight;
        const sideWalls = 2 * (bathWidth * bathHeight);
        const floorUnderBath = bathLength * bathWidth;
        const areaNotToTile = backWall + sideWalls + floorUnderBath;

        // Площадь экрана ванны (длина * высота)
        const screenArea = bathLength * bathHeight;

        if (!tileUnderBath) {
            // Если плитка под ванной НЕ нужна, вычитаем эту зону
            bathAdjustment -= areaNotToTile;
            bathNote = `(-${areaNotToTile.toFixed(2)} м²)`;
        } else {
            bathNote = "(полная зона)";
        }

        if (screenCladding) {
            // Если нужна облицовка экрана, прибавляем площадь экрана
            bathAdjustment += screenArea;
            bathNote += ` (+${screenArea.toFixed(2)} м² экран)`;
        } else if (bathNote === "") {
            bathNote = "(без экрана)";
        }
    }

    // Итоговая площадь
    const totalArea = floorArea + (wallsTotal - totalOpeningsArea) + bathAdjustment;
    
    // Площадь с запасом
    const finalWithReserve = totalArea * (1 + reservePercent / 100);

    // Обновление результатов
    setText('floorAreaResult', `${floorArea.toFixed(2)} м²`);
    setText('wallsTotalResult', `${wallsTotal.toFixed(2)} м²`);
    setText('openingsResult', `-${totalOpeningsArea.toFixed(2)} м²`);
    
    // Формирование текста для зоны ванны
    let bathText = `${bathAdjustment >= 0 ? '+' : ''}${bathAdjustment.toFixed(2)} м²`;
    if (bathNote) {
        bathText += `<br><span class="adjustment">${bathNote}</span>`;
    }
    document.getElementById('bathAdjustmentResult').innerHTML = bathText;
    
    setText('totalAreaResult', `${totalArea.toFixed(2)} м²`);
    setText('reservePercentDisplay', reservePercent);
    setText('finalWithReserveResult', `${finalWithReserve.toFixed(2)} м²`);
}

// Добавление проема
function addOpening() {
    const width = getValue('openingWidth');
    const height = getValue('openingHeight');

    if (width <= 0 || height <= 0) {
        alert('Пожалуйста, введите корректные размеры проема');
        return;
    }

    openings.push({ width, height });
    
    // Очистка полей ввода
    document.getElementById('openingWidth').value = '';
    document.getElementById('openingHeight').value = '';
    
    renderOpenings();
    calculateArea();
}

// Удаление проема
function removeOpening(index) {
    openings.splice(index, 1);
    renderOpenings();
    calculateArea();
}

// Отрисовка списка проемов
function renderOpenings() {
    const container = document.getElementById('openingsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    openings.forEach((opening, index) => {
        const area = opening.width * opening.height;
        const div = document.createElement('div');
        div.className = 'opening-item';
        div.innerHTML = `
            <span>Проем ${index + 1}: ${opening.width}м × ${opening.height}м (${area.toFixed(2)} м²)</span>
            <button class="btn-remove" onclick="removeOpening(${index})">✕</button>
        `;
        container.appendChild(div);
    });
}

// Расчет количества плиток
function calculateTiles() {
    const totalAreaStr = document.getElementById('totalAreaResult').textContent;
    if (!totalAreaStr || totalAreaStr === '0 м²') {
        alert('Сначала рассчитайте площадь помещения');
        return;
    }

    const totalArea = parseFloat(totalAreaStr);
    const tileLengthCm = getValue('tileLength');
    const tileWidthCm = getValue('tileWidth');

    if (tileLengthCm <= 0 || tileWidthCm <= 0) {
        alert('Пожалуйста, введите корректные размеры плитки');
        return;
    }

    // Перевод размеров плитки в метры
    const tileLengthM = tileLengthCm / 100;
    const tileWidthM = tileWidthCm / 100;
    
    // Площадь одной плитки
    const tileArea = tileLengthM * tileWidthM;
    
    // Количество плиток
    const tilesNeeded = Math.ceil(totalArea / tileArea);

    const resultDiv = document.getElementById('tileResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        Площадь плитки: ${tileArea.toFixed(4)} м²<br>
        Необходимо плиток: <strong style="color: var(--accent-color); font-size: 1.4em;">${tilesNeeded} шт.</strong>
    `;
}

// Навешиваем обработчики событий после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Получаем все input элементы
    const inputs = document.querySelectorAll('input[type="number"]');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    // Добавляем обработчик события input для всех числовых полей
    inputs.forEach(input => {
        input.addEventListener('input', calculateArea);
    });
    
    // Добавляем обработчик события change для всех чекбоксов
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculateArea);
    });
});
