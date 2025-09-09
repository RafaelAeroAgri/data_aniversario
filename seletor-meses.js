// Configurações globais
const monthSelect = document.getElementById('monthSelect');
const resultSection = document.getElementById('resultSection');
const month1 = document.getElementById('month1');
const month2 = document.getElementById('month2');
const month3 = document.getElementById('month3');
const selectedMonth = document.getElementById('selectedMonth');

// Nomes dos meses
const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    monthSelect.addEventListener('change', handleMonthSelection);
}

// Lidar com seleção de mês
function handleMonthSelection(event) {
    const selectedMonthNumber = parseInt(event.target.value);
    
    if (selectedMonthNumber) {
        const previousMonths = getPreviousMonths(selectedMonthNumber);
        displayPreviousMonths(previousMonths, selectedMonthNumber);
    } else {
        hideResult();
    }
}

// Obter os 3 meses anteriores
function getPreviousMonths(selectedMonth) {
    const months = [];
    
    for (let i = 3; i >= 1; i--) {
        let monthNumber = selectedMonth - i;
        
        // Ajustar para o ano anterior se necessário
        if (monthNumber <= 0) {
            monthNumber += 12;
        }
        
        months.push({
            number: monthNumber,
            name: monthNames[monthNumber - 1]
        });
    }
    
    return months;
}

// Exibir os meses anteriores
function displayPreviousMonths(months, selectedMonthNumber) {
    // Atualizar os elementos
    updateMonthItem(month1, months[0]);
    updateMonthItem(month2, months[1]);
    updateMonthItem(month3, months[2]);
    
    // Atualizar o mês selecionado
    const selectedMonthData = {
        number: selectedMonthNumber,
        name: monthNames[selectedMonthNumber - 1]
    };
    updateMonthItem(selectedMonth, selectedMonthData);
    
    // Mostrar resultado
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
    
    // Animação dos itens
    animateMonthItems();
}

// Atualizar item do mês
function updateMonthItem(element, month) {
    const nameElement = element.querySelector('.month-name');
    const numberElement = element.querySelector('.month-number');
    
    nameElement.textContent = month.name;
    numberElement.textContent = month.number;
}

// Esconder resultado
function hideResult() {
    resultSection.style.display = 'none';
}

// Animar itens dos meses
function animateMonthItems() {
    const items = [month1, month2, month3, selectedMonth];
    
    items.forEach((item, index) => {
        // Resetar animação
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        // Aplicar animação com delay
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease-out';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 150);
    });
}
