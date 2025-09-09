// Configurações globais
let recognition = null;
let isRecording = false;
let birthDate = null;
let currentDate = null;

// Elementos DOM
const birthDateInput = document.getElementById('birthDate');
const currentDateInput = document.getElementById('currentDate');
const voiceBtn = document.getElementById('voiceBtn');
const voiceText = document.getElementById('voiceText');
const resetBtn = document.getElementById('resetBtn');
const resultSection = document.getElementById('resultSection');
const voiceStatus = document.getElementById('voiceStatus');
const yearsDisplay = document.getElementById('years');
const monthsDisplay = document.getElementById('months');
const daysDisplay = document.getElementById('days');
const totalDaysDisplay = document.getElementById('totalDays');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupVoiceRecognition();
});

// Configurar data atual como padrão
function initializeApp() {
    // Deixar ambos os campos vazios
    birthDateInput.value = '';
    currentDateInput.value = '';
    birthDate = null;
    currentDate = null;
}

// Configurar event listeners
function setupEventListeners() {
    birthDateInput.addEventListener('input', handleBirthDateInput);
    currentDateInput.addEventListener('input', handleCurrentDateInput);
    voiceBtn.addEventListener('click', toggleVoiceRecording);
    resetBtn.addEventListener('click', resetCalculator);
}

// Configurar reconhecimento de voz
function setupVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        recognition.continuous = true; // Mudado para true para permitir pausas
        recognition.interimResults = true; // Mudado para true para capturar resultados parciais
        recognition.lang = 'pt-BR';
        recognition.maxAlternatives = 1;
        
        // Configurar timeout personalizado
        let silenceTimer = null;
        let lastResultTime = Date.now();
        
        recognition.onstart = function() {
            isRecording = true;
            showVoiceStatus();
            updateVoiceButton();
            lastResultTime = Date.now();
        };
        
        recognition.onresult = function(event) {
            lastResultTime = Date.now();
            
            // Limpar timer anterior
            if (silenceTimer) {
                clearTimeout(silenceTimer);
            }
            
            // Verificar se há resultado final
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // Se há resultado final, processar
            if (finalTranscript) {
                processVoiceInput(finalTranscript.toLowerCase());
            }
            
            // Configurar timer para aguardar mais silêncio (5 segundos)
            silenceTimer = setTimeout(() => {
                if (isRecording) {
                    recognition.stop();
                }
            }, 5000);
        };
        
        recognition.onerror = function(event) {
            console.error('Erro no reconhecimento de voz:', event.error);
            hideVoiceStatus();
            updateVoiceButton();
            showNotification('Erro no reconhecimento de voz. Tente novamente.', 'error');
            if (silenceTimer) {
                clearTimeout(silenceTimer);
            }
        };
        
        recognition.onend = function() {
            isRecording = false;
            hideVoiceStatus();
            updateVoiceButton();
            if (silenceTimer) {
                clearTimeout(silenceTimer);
            }
        };
    } else {
        voiceBtn.style.display = 'none';
        console.warn('Reconhecimento de voz não suportado neste navegador');
    }
}

// Alternar gravação de voz
function toggleVoiceRecording() {
    if (!recognition) {
        showNotification('Reconhecimento de voz não disponível', 'error');
        return;
    }
    
    if (isRecording) {
        recognition.stop();
    } else {
        recognition.start();
    }
}

// Resetar calculadora
function resetCalculator() {
    // Limpar campos de entrada
    birthDateInput.value = '';
    currentDateInput.value = '';
    
    // Limpar variáveis
    birthDate = null;
    currentDate = null;
    
    // Esconder resultado
    resultSection.style.display = 'none';
    
    // Parar gravação se estiver ativa
    if (isRecording && recognition) {
        recognition.stop();
    }
    
    // Mostrar notificação
    showNotification('Calculadora resetada!', 'info');
    
    // Focar no primeiro campo
    birthDateInput.focus();
}

// Processar entrada de voz
function processVoiceInput(transcript) {
    console.log('Transcrição:', transcript);
    
    try {
        const dates = extractDatesFromTranscript(transcript);
        
        if (dates.length === 2) {
            // Duas datas encontradas - ordenar automaticamente
            const sortedDates = dates.sort((a, b) => a - b);
            birthDate = sortedDates[0];
            currentDate = sortedDates[1];
            
            birthDateInput.value = formatDateToDDMMYYYY(birthDate);
            currentDateInput.value = formatDateToDDMMYYYY(currentDate);
            
            showNotification('Duas datas reconhecidas e ordenadas automaticamente!', 'success');
            calculateAndDisplayAge();
        } else if (dates.length === 1) {
            // Uma data encontrada - preencher no primeiro campo vazio
            const date = dates[0];
            
            if (!birthDate) {
                // Primeiro campo vazio - preencher data de nascimento
                birthDate = date;
                birthDateInput.value = formatDateToDDMMYYYY(birthDate);
                showNotification('Primeira data reconhecida! Fale a segunda data.', 'info');
                
                // Se já temos data atual, calcular
                if (currentDate) {
                    calculateAndDisplayAge();
                }
            } else if (!currentDate) {
                // Segundo campo vazio - preencher data atual
                currentDate = date;
                currentDateInput.value = formatDateToDDMMYYYY(currentDate);
                showNotification('Segunda data reconhecida!', 'success');
                
                // Calcular idade
                calculateAndDisplayAge();
            } else {
                // Ambos campos preenchidos - substituir a mais recente
                if (date > birthDate) {
                    currentDate = date;
                    currentDateInput.value = formatDateToDDMMYYYY(currentDate);
                    showNotification('Data atual atualizada!', 'info');
                } else {
                    birthDate = date;
                    birthDateInput.value = formatDateToDDMMYYYY(birthDate);
                    showNotification('Data de nascimento atualizada!', 'info');
                }
                calculateAndDisplayAge();
            }
        } else {
            showNotification('Não foi possível entender a data. Tente falar: "15/01/1990" ou "15 de janeiro de 1990"', 'error');
        }
    } catch (error) {
        console.error('Erro ao processar entrada de voz:', error);
        showNotification('Erro ao processar a data falada.', 'error');
    }
}

// Extrair datas da transcrição
function extractDatesFromTranscript(transcript) {
    const normalized = transcript
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    
    const dates = [];
    
    // Padrões para encontrar datas
    const patterns = [
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/g,
        /(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/g
    ];
    
    for (const pattern of patterns) {
        const matches = [...normalized.matchAll(pattern)];
        
        for (const match of matches) {
            const date = parseDateFromMatch(match, pattern);
            if (date) {
                dates.push(date);
            }
        }
    }
    
    return dates;
}

// Converter match em data
function parseDateFromMatch(match, pattern) {
    if (pattern.source.includes('/')) {
        // Formato dd/mm/aaaa
        const day = parseInt(match[1]);
        const month = parseInt(match[2]);
        const year = parseInt(match[3]);
        
        if (isValidDate(day, month, year)) {
            return new Date(year, month - 1, day);
        }
    } else {
        // Formato com nome do mês
        const day = parseInt(match[1]);
        const month = parseMonthName(match[2]);
        const year = parseInt(match[3]);
        
        if (isValidDate(day, month, year)) {
            return new Date(year, month - 1, day);
        }
    }
    
    return null;
}

// Converter nome do mês para número
function parseMonthName(monthName) {
    const months = {
        'janeiro': 1, 'fevereiro': 2, 'marco': 3, 'abril': 4,
        'maio': 5, 'junho': 6, 'julho': 7, 'agosto': 8,
        'setembro': 9, 'outubro': 10, 'novembro': 11, 'dezembro': 12
    };
    
    return months[monthName] || 0;
}

// Validar se a data é válida
function isValidDate(day, month, year) {
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
        return false;
    }
    
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
}

// Formatar data para dd/mm/aaaa
function formatDateToDDMMYYYY(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Converter dd/mm/aaaa para Date
function parseDDMMYYYY(dateString) {
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    
    if (!isValidDate(day, month, year)) return null;
    
    return new Date(year, month - 1, day);
}

// Lidar com entrada de data de nascimento
function handleBirthDateInput(event) {
    const value = event.target.value;
    
    // Aplicar máscara dd/mm/aaaa
    const maskedValue = applyDateMask(value);
    event.target.value = maskedValue;
    
    if (maskedValue.length === 10) {
        const date = parseDDMMYYYY(maskedValue);
        if (date) {
            birthDate = date;
            calculateAndDisplayAge();
        } else {
            showNotification('Data de nascimento inválida', 'error');
        }
    }
}

// Lidar com entrada de data atual
function handleCurrentDateInput(event) {
    const value = event.target.value;
    
    // Aplicar máscara dd/mm/aaaa
    const maskedValue = applyDateMask(value);
    event.target.value = maskedValue;
    
    if (maskedValue.length === 10) {
        const date = parseDDMMYYYY(maskedValue);
        if (date) {
            currentDate = date;
            calculateAndDisplayAge();
        } else {
            showNotification('Data atual inválida', 'error');
        }
    }
}

// Aplicar máscara de data
function applyDateMask(value) {
    // Remover caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplicar máscara dd/mm/aaaa
    if (numbers.length <= 2) {
        return numbers;
    } else if (numbers.length <= 4) {
        return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
        return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
}

// Calcular e exibir idade
function calculateAndDisplayAge() {
    if (!birthDate || !currentDate) return;
    
    if (birthDate >= currentDate) {
        showNotification('A data de nascimento deve ser anterior à data atual.', 'error');
        return;
    }
    
    const age = calculateAgeDifference(birthDate, currentDate);
    displayResult(age);
}

// Calcular diferença entre datas
function calculateAgeDifference(birthDate, currentDate) {
    let years = currentDate.getFullYear() - birthDate.getFullYear();
    let months = currentDate.getMonth() - birthDate.getMonth();
    let days = currentDate.getDate() - birthDate.getDate();
    
    // Ajustar se o dia atual é menor que o dia de nascimento
    if (days < 0) {
        months--;
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        days += lastMonth.getDate();
    }
    
    // Ajustar se o mês atual é menor que o mês de nascimento
    if (months < 0) {
        years--;
        months += 12;
    }
    
    // Calcular total de dias
    const timeDiff = currentDate.getTime() - birthDate.getTime();
    const totalDays = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    return {
        years,
        months,
        days,
        totalDays
    };
}

// Exibir resultado
function displayResult(age) {
    yearsDisplay.textContent = age.years;
    monthsDisplay.textContent = age.months;
    daysDisplay.textContent = age.days;
    totalDaysDisplay.textContent = age.totalDays.toLocaleString('pt-BR');
    
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
    
    // Animação dos números
    animateNumbers();
}

// Animar números do resultado
function animateNumbers() {
    const numbers = [yearsDisplay, monthsDisplay, daysDisplay];
    
    numbers.forEach((element) => {
        const finalValue = parseInt(element.textContent);
        let currentValue = 0;
        const increment = finalValue / 30;
        
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                element.textContent = finalValue;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(currentValue);
            }
        }, 50);
    });
}

// Atualizar botão de voz
function updateVoiceButton() {
    if (isRecording) {
        voiceBtn.classList.add('recording');
        voiceText.textContent = 'Parar Gravação';
    } else {
        voiceBtn.classList.remove('recording');
        voiceText.textContent = 'Falar Datas';
    }
}

// Mostrar status de voz
function showVoiceStatus() {
    voiceStatus.style.display = 'block';
}

// Esconder status de voz
function hideVoiceStatus() {
    voiceStatus.style.display = 'none';
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