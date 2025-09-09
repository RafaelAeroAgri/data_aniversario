// Configurações globais
const birthYearInput = document.getElementById('birthYear');
const resultSection = document.getElementById('resultSection');
const birthYearDisplay = document.getElementById('birthYearDisplay');
const eighteenYearDisplay = document.getElementById('eighteenYearDisplay');
const resultYear = document.getElementById('resultYear');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    birthYearInput.addEventListener('input', handleYearInput);
    birthYearInput.addEventListener('change', handleYearInput);
}

// Lidar com entrada de ano
function handleYearInput(event) {
    const year = parseInt(event.target.value);
    
    if (year && year >= 1900 && year <= 2100) {
        calculateEighteenYears(year);
    } else if (year && (year < 1900 || year > 2100)) {
        showNotification('Por favor, insira um ano entre 1900 e 2100', 'error');
        hideResult();
    } else {
        hideResult();
    }
}

// Calcular quando terá 18 anos
function calculateEighteenYears(birthYear) {
    const eighteenYear = birthYear + 18;
    
    // Atualizar displays
    birthYearDisplay.textContent = birthYear;
    eighteenYearDisplay.textContent = eighteenYear;
    resultYear.textContent = eighteenYear;
    
    // Mostrar resultado
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
    
    // Animação dos valores
    animateValues();
}

// Esconder resultado
function hideResult() {
    resultSection.style.display = 'none';
}

// Animar valores
function animateValues() {
    const values = [birthYearDisplay, eighteenYearDisplay];
    
    values.forEach((element, index) => {
        // Resetar animação
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        // Aplicar animação com delay
        setTimeout(() => {
            element.style.transition = 'all 0.5s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    // Remover notificação existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos da notificação
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: '1001',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        animation: 'slideDown 0.3s ease-out'
    });
    
    // Adicionar animação CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Adicionar animação de saída
const exitStyle = document.createElement('style');
exitStyle.textContent = `
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(exitStyle);
