// Configurações globais
const yearDisplay = document.getElementById('yearDisplay');
const prevYearBtn = document.getElementById('prevYearBtn');
const nextYearBtn = document.getElementById('nextYearBtn');
const resultYear = document.getElementById('resultYear');

let currentYear = new Date().getFullYear();
let selectedYear = currentYear;
let minYear = currentYear - 17; // Máximo que alguém pode não ter 18 anos
let maxYear = currentYear;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Inicializar aplicativo
function initializeApp() {
    updateYearDisplay();
    updateButtons();
    updateResult();
    
    // Event listeners
    prevYearBtn.addEventListener('click', () => changeYear(-1));
    nextYearBtn.addEventListener('click', () => changeYear(1));
    
    // Clique no ano para digitar
    yearDisplay.addEventListener('click', openYearInput);
}

// Mudar ano com setas
function changeYear(direction) {
    const newYear = selectedYear + direction;
    
    // Verificar limites
    if (newYear >= minYear && newYear <= maxYear) {
        selectedYear = newYear;
        updateYearDisplay();
        updateButtons();
        updateResult();
    }
}

// Atualizar display do ano
function updateYearDisplay() {
    yearDisplay.textContent = selectedYear;
}

// Atualizar estado dos botões
function updateButtons() {
    // Botão anterior - desabilitado se estiver no ano mínimo
    prevYearBtn.disabled = selectedYear <= minYear;
    
    // Botão próximo - desabilitado se estiver no ano máximo
    nextYearBtn.disabled = selectedYear >= maxYear;
    
    // Atualizar estilos visuais
    if (prevYearBtn.disabled) {
        prevYearBtn.style.opacity = '0.3';
        prevYearBtn.style.cursor = 'not-allowed';
    } else {
        prevYearBtn.style.opacity = '1';
        prevYearBtn.style.cursor = 'pointer';
    }
    
    if (nextYearBtn.disabled) {
        nextYearBtn.style.opacity = '0.3';
        nextYearBtn.style.cursor = 'not-allowed';
    } else {
        nextYearBtn.style.opacity = '1';
        nextYearBtn.style.cursor = 'pointer';
    }
}

// Abrir input para digitar ano
function openYearInput() {
    const currentYearText = yearDisplay.textContent;
    
    // Criar input temporário
    const input = document.createElement('input');
    input.type = 'number';
    input.value = currentYearText;
    input.min = minYear;
    input.max = maxYear;
    input.className = 'year-input';
    
    // Estilos do input
    input.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
        font-size: inherit;
        font-weight: inherit;
        color: inherit;
        text-align: center;
        outline: none;
        font-family: inherit;
    `;
    
    // Substituir display pelo input
    yearDisplay.style.display = 'none';
    yearDisplay.parentNode.insertBefore(input, yearDisplay);
    
    // Focar e selecionar texto
    input.focus();
    input.select();
    
    // Event listeners para o input
    input.addEventListener('blur', () => {
        saveYearInput(input);
    });
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveYearInput(input);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelYearInput(input);
        }
    });
    
    // Prevenir clique fora de fechar
    setTimeout(() => {
        document.addEventListener('click', function closeInput(e) {
            if (!input.contains(e.target)) {
                saveYearInput(input);
                document.removeEventListener('click', closeInput);
            }
        });
    }, 100);
}

// Salvar ano digitado
function saveYearInput(input) {
    const newYear = parseInt(input.value);
    
    // Validar ano
    if (isNaN(newYear) || newYear < minYear || newYear > maxYear) {
        // Ano inválido - restaurar valor anterior
        cancelYearInput(input);
        return;
    }
    
    // Atualizar ano selecionado
    selectedYear = newYear;
    updateYearDisplay();
    updateButtons();
    updateResult();
    
    // Remover input e restaurar display
    input.remove();
    yearDisplay.style.display = 'block';
}

// Cancelar input e restaurar display
function cancelYearInput(input) {
    input.remove();
    yearDisplay.style.display = 'block';
}

// Atualizar resultado
function updateResult() {
    const eighteenYear = selectedYear + 18;
    resultYear.textContent = eighteenYear;
}

// Atualizar limites quando o ano mudar
function updateYearLimits() {
    const newCurrentYear = new Date().getFullYear();
    if (newCurrentYear !== currentYear) {
        currentYear = newCurrentYear;
        maxYear = currentYear;
        minYear = currentYear - 17;
        
        // Ajustar ano selecionado se necessário
        if (selectedYear > maxYear) {
            selectedYear = maxYear;
        }
        
        updateYearDisplay();
        updateButtons();
        updateResult();
    }
}

// Verificar mudança de ano a cada minuto
setInterval(updateYearLimits, 60000);