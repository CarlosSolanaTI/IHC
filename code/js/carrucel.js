document.addEventListener('DOMContentLoaded', () => {
    let carouselContainer, carouselSlide, prevBtn, nextBtn, cards;
    let cardWidth, currentPosition = 0, totalCards, cardsVisible;
    let autoPlayInterval;
    const autoPlayDelay = 5000; // 5 segundos

    const calculateDimensions = () => {
        if (!carouselContainer) return;
        
        const containerWidth = carouselContainer.offsetWidth;
        cardsVisible = Math.floor(containerWidth / 300);
        cardWidth = (containerWidth / cardsVisible) - 30; // Considerar márgenes
    };

    const initCarousel = () => {
        carouselContainer = document.querySelector('.carousel-container');
        if (!carouselContainer || carouselContainer.offsetWidth === 0) return;
        
        carouselSlide = carouselContainer.querySelector('.carousel-slide');
        prevBtn = carouselContainer.querySelector('.prev-btn');
        nextBtn = carouselContainer.querySelector('.next-btn');
        cards = carouselContainer.querySelectorAll('.destino-card');
        
        totalCards = cards.length;
        calculateDimensions();
        
        // Aplicar estilos
        cards.forEach(card => {
            card.style.flex = `0 0 ${cardWidth}px`;
            card.style.margin = '0 15px';
        });
        
        carouselSlide.style.width = `${(cardWidth + 30) * totalCards}px`;
        updateButtons();
        
        // Iniciar autoplay
        startAutoPlay();
    };

    const moveCarousel = (direction) => {
        clearInterval(autoPlayInterval);
        calculateDimensions();
        const maxPosition = (totalCards - cardsVisible) * (cardWidth + 30);
        
        if (direction === 'next') {
            currentPosition = Math.min(currentPosition + ((cardWidth + 30) * cardsVisible), maxPosition);
        } else {
            currentPosition = Math.max(currentPosition - ((cardWidth + 30) * cardsVisible), 0);
        }
        
        carouselSlide.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        carouselSlide.style.transform = `translateX(-${currentPosition}px)`;
        updateButtons();
        startAutoPlay();
    };

    const updateButtons = () => {
        const maxPosition = (totalCards - cardsVisible) * (cardWidth + 30);
        prevBtn.style.display = currentPosition > 0 ? 'block' : 'none';
        nextBtn.style.display = currentPosition < maxPosition ? 'block' : 'none';
    };

    const startAutoPlay = () => {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(() => {
            if (currentPosition < (totalCards - cardsVisible) * (cardWidth + 30)) {
                moveCarousel('next');
            } else {
                currentPosition = -((cardWidth + 30) * cardsVisible);
                carouselSlide.style.transition = 'none';
                carouselSlide.style.transform = `translateX(${currentPosition}px)`;
                setTimeout(() => {
                    carouselSlide.style.transition = 'transform 0.5s ease';
                    moveCarousel('next');
                }, 50);
            }
        }, autoPlayDelay);
    };

    // Event Listeners
    const addEventListeners = () => {
        prevBtn.addEventListener('click', () => moveCarousel('prev'));
        nextBtn.addEventListener('click', () => moveCarousel('next'));
        
        // Pausar autoplay al interactuar
        carouselContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
        carouselContainer.addEventListener('mouseleave', startAutoPlay);
    };

    // Manejar redimensionamiento
    const handleResize = () => {
        calculateDimensions();
        carouselSlide.style.transition = 'none';
        carouselSlide.style.transform = `translateX(-${currentPosition}px)`;
        setTimeout(() => carouselSlide.style.transition = '', 50);
    };

    // Inicialización completa
    const init = () => {
        initCarousel();
        addEventListeners();
        window.addEventListener('resize', handleResize);
    };

    // Observador para sección activa
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.attributeName === 'class') {
                initCarousel();
            }
        });
    });

    const destinosSection = document.getElementById('destinos');
    if (destinosSection) {
        observer.observe(destinosSection, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    init();
});