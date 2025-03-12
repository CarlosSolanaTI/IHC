const travelChatbot = {
    currentStep: null,
    bookingData: {},
    conversationContext: null,
    inactivityTimer: null,
    elements: {},

    // Inicialización
    init() {
        this.cacheElements();
        if (this.elementsValid()) {
            this.setupEventListeners();
            this.showWelcomeMessage();
            this.setupInactivityTimer();
        } else {
            console.error('Error: Elementos del chatbot no encontrados');
        }
    },

    // Cachear elementos del DOM
    cacheElements() {
        this.elements = {
            container: document.querySelector('.chatbot-container'),
            toggleBtn: document.querySelector('.chat-toggle'),
            closeBtn: document.querySelector('.close-chat'),
            messages: document.querySelector('.chatbot-messages'),
            input: document.querySelector('.chatbot-input input'),
            sendBtn: document.querySelector('.send-btn')
        };
    },

    // Verificar elementos
    elementsValid() {
        return Object.values(this.elements).every(el => el !== null);
    },

    // Configurar event listeners
    setupEventListeners() {
        const { toggleBtn, closeBtn, sendBtn, input } = this.elements;
        toggleBtn.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.toggleChat());
        sendBtn.addEventListener('click', () => this.handleUserInput());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserInput();
        });
    },

    // Mostrar/ocultar chat
    toggleChat() {
        const { container, input } = this.elements;
        container.classList.toggle('active');
        if (container.classList.contains('active')) {
            input.focus();
            this.scrollToBottom();
        }
    },

    // Manejar entrada del usuario
    handleUserInput() {
        const message = this.elements.input.value.trim();
        if (message) {
            this.displayMessage(message, 'user');
            this.processMessage(message);
            this.resetInput();
            this.resetInactivityTimer();
        }
    },

    // Procesar mensaje
    async processMessage(message) {
        if (this.conversationContext) {
            this.handleContextualFlow(message);
            return;
        }

        if (this.currentStep) {
            this.handleBookingFlow(message);
            return;
        }

        const intent = await this.detectIntent(message);
        this.handleIntent(intent);
    },

    // Detectar intención
    async detectIntent(message) {
        const intents = {
            greeting: ['hola', 'buenos días', 'buenas tardes', 'hi', 'hello'],
            booking: ['reservar', 'reserva', 'viaje', 'vuelo', 'hotel'],
            destinations: ['destinos', 'lugares', 'recomendaciones'],
            offers: ['ofertas', 'promociones', 'descuentos'],
            help: ['ayuda', 'asistencia', 'soporte'],
            requirements: ['visa', 'requisitos', 'documentos'],
            confirmation: ['si', 'sí', 'confirmar'],
            negation: ['no', 'cancelar', 'negar']
        };

        const cleanMsg = message.toLowerCase();
        for (const [intent, keywords] of Object.entries(intents)) {
            if (keywords.some(keyword => cleanMsg.includes(keyword))) {
                return intent;
            }
        }
        return 'unknown';
    },

    // Manejar intención detectada
    handleIntent(intent) {
        const responseStrategies = {
            greeting: () => this.showGreeting(),
            booking: () => this.startBookingProcess(),
            destinations: () => this.showDestinationOptions(),
            offers: () => this.showCurrentOffers(),
            help: () => this.showHelpOptions(),
            requirements: () => this.showTravelRequirements(),
            confirmation: () => this.handlePositiveConfirmation(),
            negation: () => this.handleNegativeResponse(),
            unknown: () => this.showDefaultOptions()
        };

        (responseStrategies[intent] || responseStrategies.unknown)();
    },

    // Flujos conversacionales
    showGreeting() {
        this.displayMessage('¡Hola! Soy tu asistente de viajes virtual ✈️ ¿En qué puedo ayudarte hoy?', 'bot', [
            '📅 Hacer reserva',
            '🌍 Ver destinos',
            '🎉 Ofertas especiales'
        ]);
    },

    startBookingProcess() {
        this.currentStep = 'destination';
        this.bookingData = {};
        this.displayMessage('¡Empecemos con tu reserva! 🛫 ¿Cuál es tu destino principal?', 'bot');
        this.showQuickSuggestions(['París', 'Tokio', 'Nueva York', 'Roma', 'Bali']);
    },

    showDestinationOptions() {
        this.displayMessage('🏖️ Destinos más populares este mes:', 'bot', [
            '📍 París desde $999',
            '📍 Tokio desde $1499',
            '📍 Nueva York desde $799',
            '📍 Roma desde $1099'
        ]);
    },

    showCurrentOffers() {
        this.displayMessage('🎁 Ofertas exclusivas:', 'bot', [
            '✈️ Paquete Europa $1999',
            '🏨 Todo incluido Caribe $1500',
            '🚗 Aventura en Costa Rica $899'
        ]);
    },

    showTravelRequirements() {
        this.displayMessage('🛂 Requisitos de viaje:', 'bot', [
            'EEUU: Visa ESTA',
            'Europa: Visa Schengen',
            'Canadá: eTA'
        ]);
    },

    showHelpOptions() {
        this.displayMessage('ℹ️ ¿Cómo puedo ayudarte?', 'bot', [
            'Reservar vuelo',
            'Información de destinos',
            'Cancelar reserva'
        ]);
    },

    handlePositiveConfirmation() {
        this.displayMessage('✅ Confirmación recibida. Procesando tu solicitud...', 'bot');
        // Lógica adicional de confirmación
    },

    handleNegativeResponse() {
        this.displayMessage('⚠️ Operación cancelada. ¿Qué te gustaría hacer ahora?', 'bot', [
            'Nueva reserva',
            'Ver destinos',
            'Volver al inicio'
        ]);
    },

    showDefaultOptions() {
        this.displayMessage('¿Necesitas ayuda con reservas, destinos o información de viajes?', 'bot', [
            '📅 Reservaciones',
            '🌍 Destinos populares',
            '🛂 Requisitos de viaje'
        ]);
    },

    // Flujo de reserva
    handleBookingFlow(message) {
        const bookingSteps = {
            destination: () => this.processDestination(message),
            dates: () => this.processTravelDates(message),
            travelers: () => this.processTravelers(message),
            accommodation: () => this.processAccommodation(message),
            confirmation: () => this.processConfirmation(message)
        };

        bookingSteps[this.currentStep]?.();
    },

    processDestination(message) {
        const destination = this.sanitizeInput(message);
        
        if (this.isValidDestination(destination)) {
            this.bookingData.destination = destination;
            this.currentStep = 'dates';
            this.displayMessage(`🗓️ ¿Para qué fechas necesitas el viaje a ${destination}? (Formato: DD/MM/AAAA - DD/MM/AAAA)`, 'bot');
            this.showDateExamples();
        } else {
            this.handleInvalidDestination(message);
        }
    },

    processTravelDates(message) {
        if (this.validateDateFormat(message)) {
            this.bookingData.dates = message;
            this.currentStep = 'travelers';
            this.displayMessage('👥 ¿Cuántos viajeros serán? (Ejemplo: 2 adultos, 1 niño)', 'bot');
        } else {
            this.showInputError('dates');
        }
    },

    processTravelers(message) {
        if (this.validateTravelersFormat(message)) {
            this.bookingData.travelers = message;
            this.currentStep = 'accommodation';
            this.displayMessage('🏨 ¿Qué tipo de alojamiento prefieres?', 'bot', [
                'Hotel Estándar',
                'Hotel 5 Estrellas',
                'Airbnb',
                'Hostal'
            ]);
        } else {
            this.showInputError('travelers');
        }
    },

    processAccommodation(message) {
        this.bookingData.accommodation = message;
        this.currentStep = 'confirmation';
        this.displayMessage('✅ ¿Deseas agregar transporte aéreo a tu reserva?', 'bot', [
            'Sí, agregar vuelos',
            'Solo alojamiento',
            'Ya tengo transporte'
        ]);
    },

    processConfirmation(message) {
        if (this.isConfirmation(message)) {
            this.conversationContext = 'awaiting_confirmation';
            this.displayBookingSummary();
        } else {
            this.handleModificationRequest();
        }
    },

    // Métodos auxiliares
    displayBookingSummary() {
        const summary = `
            📋 Resumen de reserva:
            Destino: ${this.bookingData.destination}
            Fechas: ${this.bookingData.dates}
            Viajeros: ${this.bookingData.travelers}
            Alojamiento: ${this.bookingData.accommodation}
        `;
        this.displayMessage(summary, 'bot');
        this.displayMessage('¿Confirmas que todos los datos son correctos?', 'bot', [
            '✅ Confirmar reserva',
            '✏️ Modificar datos',
            '❌ Cancelar'
        ]);
    },

    sanitizeInput(text) {
        return text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').trim();
    },

    isValidDestination(destination) {
        const validDestinations = ['parís', 'tokio', 'nueva york', 'roma', 'bali'];
        return validDestinations.includes(destination.toLowerCase());
    },

    validateDateFormat(dates) {
        const regex = /^\d{2}\/\d{2}\/\d{4} - \d{2}\/\d{2}\/\d{4}$/;
        return regex.test(dates);
    },

    validateTravelersFormat(travelers) {
        const regex = /(\d+)\s*(adulto|adultos|niño|niños)/gi;
        return regex.test(travelers);
    },

    isConfirmation(message) {
        return ['si', 'sí', 'confirmar'].includes(message.toLowerCase());
    },

    handleInvalidDestination(message) {
        const suggestions = this.getSimilarDestinations(message);
        if (suggestions.length > 0) {
            this.displayMessage(`¿Quizás quisiste decir: ${suggestions.join(', ')}?`, 'bot');
            this.showQuickSuggestions(suggestions);
        } else {
            this.displayMessage('Destino no encontrado. Estos son nuestros destinos disponibles:', 'bot');
            this.showDestinationOptions();
        }
    },

    getSimilarDestinations(input) {
        const destinations = ['París', 'Tokio', 'Nueva York', 'Roma', 'Bali'];
        const cleanInput = input.toLowerCase();
        return destinations.filter(d => d.toLowerCase().includes(cleanInput));
    },

    showInputError(type) {
        const errorMessages = {
            dates: {
                text: 'Formato de fecha incorrecto. Ejemplos válidos:',
                examples: ['15/10/2024 - 25/10/2024', '01/12/2024 - 10/12/2024']
            },
            travelers: {
                text: 'Formato inválido. Por favor usa:',
                examples: ['2 adultos', '1 adulto y 2 niños', '3 personas']
            }
        };

        const error = errorMessages[type];
        const message = `
            ❌ ${error.text}<br>
            ${error.examples.map(ex => `• ${ex}`).join('<br>')}
        `;
        this.displayMessage(message, 'bot');
    },

    showQuickSuggestions(options) {
        const buttons = options.map(option => 
            `<button class="suggestion-btn">${option}</button>`
        ).join('');
        
        this.displayMessage(
            `<div class="suggestions">${buttons}</div>`,
            'bot'
        );
        
        // Agregar event listeners a los botones
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.input.value = btn.textContent;
                this.handleUserInput();
            });
        });
    },

    displayMessage(text, sender, options) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.innerHTML = text;
        
        if (options) {
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'options';
            options.forEach(option => {
                const button = document.createElement('button');
                button.textContent = option;
                button.className = 'option-btn';
                button.addEventListener('click', () => this.selectOption(option));
                optionsDiv.appendChild(button);
            });
            messageDiv.appendChild(optionsDiv);
        }

        this.elements.messages.appendChild(messageDiv);
        this.scrollToBottom();
    },

    selectOption(option) {
        this.elements.input.value = option;
        this.handleUserInput();
    },

    resetInput() {
        this.elements.input.value = '';
    },

    scrollToBottom() {
        this.elements.messages.scrollTo({
            top: this.elements.messages.scrollHeight,
            behavior: 'smooth'
        });
    },

    setupInactivityTimer() {
        this.resetInactivityTimer();
        window.addEventListener('mousemove', () => this.resetInactivityTimer());
        window.addEventListener('keypress', () => this.resetInactivityTimer());
    },

    resetInactivityTimer() {
        clearTimeout(this.inactivityTimer);
        this.inactivityTimer = setTimeout(() => {
            this.displayMessage('⏳ ¿Sigues ahí? Si necesitas ayuda, escribe tu consulta.', 'bot');
        }, 300000); // 5 minutos de inactividad
    },

    showWelcomeMessage() {
        setTimeout(() => {
            this.displayMessage('¡Bienvenido a Travel Assistant! 🌎 ¿En qué puedo ayudarte hoy?', 'bot', [
                '📅 Hacer reserva',
                '🌍 Ver destinos',
                '🛂 Requisitos de viaje'
            ]);
        }, 1000);
    }
};

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => travelChatbot.init());