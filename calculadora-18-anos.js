// Configurações globais
const yearDisplay = document.getElementById('yearDisplay');
const yearSelector = document.getElementById('yearSelector');
const resultYear = document.getElementById('resultYear');

let currentYear = new Date().getFullYear();
let selectedYear = currentYear;
let yearList = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    generateYearList();
    createYearSelector();
    updateResult();
});

// Gerar lista de anos inteligente
function generateYearList() {
    // Lógica: máximo alguém não tem 18 é de (ano atual - 17)
    // Exemplo: 2025 - 17 = 2008, então vai de 2008 até 2025
    const minYear = currentYear - 17;
    const maxYear = currentYear;
    
    yearList = [];
    for (let year = maxYear; year >= minYear; year--) {
        yearList.push(year);
    }
    
    console.log(`Anos disponíveis: ${minYear} a ${maxYear}`);
}

// Criar seletor de anos estilo iPhone
function createYearSelector() {
    yearSelector.innerHTML = '';
    
    const yearListElement = document.createElement('div');
    yearListElement.className = 'year-list';
    
    // Adicionar anos extras para scroll suave
    const extraYears = 5;
    
    // Anos antes (invisíveis)
    for (let i = 0; i < extraYears; i++) {
        const yearItem = document.createElement('div');
        yearItem.className = 'year-item';
        yearItem.textContent = yearList[0] + extraYears - i;
        yearItem.style.opacity = '0';
        yearListElement.appendChild(yearItem);
    }
    
    // Anos reais
    yearList.forEach((year, index) => {
        const yearItem = document.createElement('div');
        yearItem.className = 'year-item';
        yearItem.textContent = year;
        yearItem.dataset.year = year;
        
        if (year === selectedYear) {
            yearItem.classList.add('selected');
        }
        
        yearItem.addEventListener('click', () => selectYear(year));
        yearListElement.appendChild(yearItem);
    });
    
    // Anos depois (invisíveis)
    for (let i = 1; i <= extraYears; i++) {
        const yearItem = document.createElement('div');
        yearItem.className = 'year-item';
        yearItem.textContent = yearList[yearList.length - 1] - i;
        yearItem.style.opacity = '0';
        yearListElement.appendChild(yearItem);
    }
    
    yearSelector.appendChild(yearListElement);
    
    // Configurar scroll
    setupScrollBehavior(yearListElement);
}

// Configurar comportamento de scroll
function setupScrollBehavior(yearListElement) {
    let isScrolling = false;
    let scrollTimeout;
    let startY = 0;
    let isDragging = false;
    let currentY = 0;
    let velocity = 0;
    let lastY = 0;
    let lastTime = 0;
    
    // Mouse events
    yearSelector.addEventListener('mousedown', (e) => {
        startY = e.clientY;
        isDragging = true;
        yearListElement.style.transition = 'none';
        yearSelector.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaY = e.clientY - startY;
        const currentScroll = yearSelector.scrollTop - deltaY;
        yearSelector.scrollTop = currentScroll;
        startY = e.clientY;
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            yearSelector.style.cursor = 'grab';
            snapToNearestYear(yearListElement);
        }
    });
    
    // Touch events para mobile
    yearSelector.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        currentY = startY;
        isDragging = true;
        lastY = startY;
        lastTime = Date.now();
        yearListElement.style.transition = 'none';
        e.preventDefault();
    });
    
    yearSelector.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        const currentScroll = yearSelector.scrollTop - deltaY;
        yearSelector.scrollTop = currentScroll;
        startY = currentY;
        
        // Calcular velocidade
        const now = Date.now();
        const timeDelta = now - lastTime;
        if (timeDelta > 0) {
            velocity = (currentY - lastY) / timeDelta;
        }
        lastY = currentY;
        lastTime = now;
        
        e.preventDefault();
    });
    
    yearSelector.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;
            
            // Aplicar momentum se houver velocidade
            if (Math.abs(velocity) > 0.5) {
                const momentum = velocity * 100;
                const targetScroll = yearSelector.scrollTop - momentum;
                yearSelector.scrollTop = targetScroll;
            }
            
            setTimeout(() => {
                snapToNearestYear(yearListElement);
            }, 100);
        }
    });
    
    // Scroll events
    yearSelector.addEventListener('scroll', () => {
        if (!isScrolling) {
            isScrolling = true;
            yearListElement.style.transition = 'none';
        }
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            snapToNearestYear(yearListElement);
            isScrolling = false;
        }, 150);
    });
    
    // Adicionar cursor grab
    yearSelector.style.cursor = 'grab';
}

// Alinhar ao ano mais próximo
function snapToNearestYear(yearListElement) {
    const itemHeight = 40;
    const scrollTop = yearSelector.scrollTop;
    const selectedIndex = Math.round(scrollTop / itemHeight);
    
    // Considerar os anos extras
    const extraYears = 5;
    const actualIndex = selectedIndex - extraYears;
    
    if (actualIndex >= 0 && actualIndex < yearList.length) {
        const newYear = yearList[actualIndex];
        selectYear(newYear);
        
        // Scroll suave para o item selecionado
        yearListElement.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        yearSelector.scrollTop = selectedIndex * itemHeight;
    }
}

// Selecionar ano
function selectYear(year) {
    selectedYear = year;
    yearDisplay.textContent = year;
    
    // Atualizar seleção visual
    const yearItems = yearSelector.querySelectorAll('.year-item');
    yearItems.forEach(item => {
        item.classList.remove('selected');
        if (parseInt(item.dataset.year) === year) {
            item.classList.add('selected');
        }
    });
    
    updateResult();
}

// Atualizar resultado
function updateResult() {
    const eighteenYear = selectedYear + 18;
    resultYear.textContent = eighteenYear;
}

// Atualizar lista de anos quando o ano mudar
function updateYearList() {
    const newCurrentYear = new Date().getFullYear();
    if (newCurrentYear !== currentYear) {
        currentYear = newCurrentYear;
        selectedYear = currentYear;
        generateYearList();
        createYearSelector();
        updateResult();
    }
}

// Verificar mudança de ano a cada minuto
setInterval(updateYearList, 60000);