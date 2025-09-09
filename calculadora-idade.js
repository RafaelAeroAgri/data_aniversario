// Configurações globais
let recognition = null;
let isRecording = false;
let birthDate = null;
let currentDate = null;
let isWaitingForNext = false;

// Elementos DOM
const birthDateInput = document.getElementById('birthDate');
const currentDateInput = document.getElementById('currentDate');
const voiceBtn = document.getElementById('voiceBtn');
const voiceText = document.getElementById('voiceText');
const resetBtn = document.getElementById('resetBtn');
const resetBirthBtn = document.getElementById('resetBirthBtn');
const resetCurrentBtn = document.getElementById('resetCurrentBtn');
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
    isWaitingForNext = false;
    updateVoiceButton();
}

// Configurar event listeners
function setupEventListeners() {
    birthDateInput.addEventListener('input', handleBirthDateInput);
    currentDateInput.addEventListener('input', handleCurrentDateInput);
    voiceBtn.addEventListener('click', toggleVoiceRecording);
    resetBtn.addEventListener('click', resetCalculator);
    resetBirthBtn.addEventListener('click', () => resetField('birth'));
    resetCurrentBtn.addEventListener('click', () => resetField('current'));
}

// Configurar reconhecimento de voz
function setupVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'pt-BR';
        
        recognition.onstart = function() {
            isRecording = true;
            updateVoiceButton();
            showNotification(`Gravando... Fale a ${currentRecordingStep === 'birth' ? 'data de nascimento' : 'data atual'}`, 'info');
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            processVoiceInput(transcript);
        };
        
        recognition.onerror = function(event) {
            console.error('Erro no reconhecimento:', event.error);
            isRecording = false;
            isWaitingForNext = false;
            updateVoiceButton();
            showNotification('Erro no reconhecimento de voz', 'error');
        };
        
        recognition.onend = function() {
            isRecording = false;
            updateVoiceButton();
        };
    } else {
        showNotification('Reconhecimento de voz não suportado neste navegador', 'error');
    }
}

// Atualizar botão de voz
function updateVoiceButton() {
    if (isRecording) {
        voiceBtn.classList.add('recording');
        voiceBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            Gravando...
        `;
    } else if (isWaitingForNext) {
        voiceBtn.classList.add('waiting');
        voiceBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
            </svg>
            Aguarde...
        `;
    } else {
        voiceBtn.classList.remove('recording', 'waiting');
        voiceBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            Falar Data
        `;
    }
}

// Alternar gravação de voz
function toggleVoiceRecording() {
    if (isWaitingForNext) {
        showNotification('Aguarde o processamento da data anterior', 'info');
        return;
    }
    
    if (isRecording && recognition) {
        recognition.stop();
    } else {
        recognition.start();
    }
}

// Processar entrada de voz
function processVoiceInput(transcript) {
    console.log('Transcrição:', transcript);
    
    try {
        const dates = extractDatesFromTranscript(transcript);
        
        if (dates.length === 1) {
            const date = dates[0];
            
            // Determinar onde colocar a data baseado na prioridade
            if (!birthDate && !currentDate) {
                // Ambos vazios - sempre começar pela data de nascimento
                birthDate = date;
                birthDateInput.value = formatDateToDDMMYYYY(birthDate);
                showNotification('Data de nascimento reconhecida!', 'success');
                
                // Aguardar e preparar para próxima data
                isWaitingForNext = true;
                updateVoiceButton();
                
                setTimeout(() => {
                    isWaitingForNext = false;
                    updateVoiceButton();
                    showNotification('Agora fale a data atual', 'info');
                }, 2000);
                
            } else if (!birthDate) {
                // Só data de nascimento vazia
                birthDate = date;
                birthDateInput.value = formatDateToDDMMYYYY(birthDate);
                showNotification('Data de nascimento reconhecida!', 'success');
                
                // Se já tem data atual, calcular
                if (currentDate) {
                    calculateAndDisplayAge();
                }
                
            } else if (!currentDate) {
                // Só data atual vazia
                currentDate = date;
                currentDateInput.value = formatDateToDDMMYYYY(currentDate);
                showNotification('Data atual reconhecida!', 'success');
                
                // Calcular idade
                calculateAndDisplayAge();
                
            } else {
                // Ambas preenchidas - substituir a mais recente baseado na data falada
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
            
            // Verificar se precisa inverter as datas
            if (birthDate && currentDate && birthDate > currentDate) {
                // Inverter as datas
                const tempDate = birthDate;
                const tempInput = birthDateInput.value;
                
                birthDate = currentDate;
                currentDate = tempDate;
                birthDateInput.value = currentDateInput.value;
                currentDateInput.value = tempInput;
                
                showNotification('Datas invertidas automaticamente!', 'info');
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
    
    // Padrões para datas no formato dd/mm/aaaa
    const datePattern = /(\d{1,2})\/(\d{1,2})\/(\d{4})/g;
    let match;
    
    while ((match = datePattern.exec(normalized)) !== null) {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]);
        const year = parseInt(match[3]);
        
        if (isValidDate(day, month, year)) {
            dates.push(new Date(year, month - 1, day));
        }
    }
    
    // Padrões para datas faladas (ex: "15 de janeiro de 1990")
    const monthNames = {
        'janeiro': 1, 'fevereiro': 2, 'marco': 3, 'abril': 4,
        'maio': 5, 'junho': 6, 'julho': 7, 'agosto': 8,
        'setembro': 9, 'outubro': 10, 'novembro': 11, 'dezembro': 12
    };
    
    const spokenDatePattern = /(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/g;
    
    while ((match = spokenDatePattern.exec(normalized)) !== null) {
        const day = parseInt(match[1]);
        const monthName = match[2];
        const year = parseInt(match[3]);
        
        if (monthNames[monthName]) {
            const month = monthNames[monthName];
            if (isValidDate(day, month, year)) {
                dates.push(new Date(year, month - 1, day));
            }
        }
    }
    
    return dates;
}

// Validar data
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

// Lidar com entrada de data de nascimento
function handleBirthDateInput(event) {
    const value = event.target.value;
    if (value.length === 10) {
        const date = parseDateInput(value);
        if (date) {
            birthDate = date;
            if (currentDate) {
                calculateAndDisplayAge();
            }
        }
    } else {
        birthDate = null;
        resultSection.style.display = 'none';
    }
}

// Lidar com entrada de data atual
function handleCurrentDateInput(event) {
    const value = event.target.value;
    if (value.length === 10) {
        const date = parseDateInput(value);
        if (date) {
            currentDate = date;
            if (birthDate) {
                calculateAndDisplayAge();
            }
        }
    } else {
        currentDate = null;
        resultSection.style.display = 'none';
    }
}

// Parsear entrada de data
function parseDateInput(value) {
    const parts = value.split('/');
    if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        
        if (isValidDate(day, month, year)) {
            return new Date(year, month - 1, day);
        }
    }
    return null;
}

// Calcular e exibir idade
function calculateAndDisplayAge() {
    if (!birthDate || !currentDate) return;
    
    const ageDifference = calculateAgeDifference(birthDate, currentDate);
    
    yearsDisplay.textContent = ageDifference.years;
    monthsDisplay.textContent = ageDifference.months;
    daysDisplay.textContent = ageDifference.days;
    totalDaysDisplay.textContent = ageDifference.totalDays;
    
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
    
    animateValues();
}

// Calcular diferença de idade
function calculateAgeDifference(birthDate, currentDate) {
    let years = currentDate.getFullYear() - birthDate.getFullYear();
    let months = currentDate.getMonth() - birthDate.getMonth();
    let days = currentDate.getDate() - birthDate.getDate();
    
    if (days < 0) {
        months--;
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        days += lastMonth.getDate();
    }
    
    if (months < 0) {
        years--;
        months += 12;
    }
    
    const totalDays = Math.floor((currentDate - birthDate) / (1000 * 60 * 60 * 24));
    
    return { years, months, days, totalDays };
}

// Animar valores
function animateValues() {
    const values = [yearsDisplay, monthsDisplay, daysDisplay];
    
    values.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.5s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// Resetar calculadora
function resetCalculator() {
    birthDateInput.value = '';
    currentDateInput.value = '';
    birthDate = null;
    currentDate = null;
    isWaitingForNext = false;
    resultSection.style.display = 'none';
    
    if (isRecording && recognition) {
        recognition.stop();
    }
    
    updateVoiceButton();
    showNotification('Calculadora resetada!', 'info');
    birthDateInput.focus();
}

// Resetar campo específico
function resetField(field) {
    if (field === 'birth') {
        birthDateInput.value = '';
        birthDate = null;
        isWaitingForNext = false;
        showNotification('Data de nascimento limpa!', 'info');
    } else if (field === 'current') {
        currentDateInput.value = '';
        currentDate = null;
        showNotification('Data atual limpa!', 'info');
    }
    
    updateVoiceButton();
    
    if (birthDate && currentDate) {
        calculateAndDisplayAge();
    } else {
        resultSection.style.display = 'none';
    }
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}