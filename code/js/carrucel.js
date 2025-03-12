document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.querySelector('.carousel-container');
    const carouselSlide = document.querySelector('.carousel-slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    let currentIndex = 0; // Índice del destino visible
    const totalDestinos = document.querySelectorAll('.destino-card').length;
    const slideWidth = carouselContainer.offsetWidth;

    // Ajustar el ancho del contenedor del slide dinámicamente
    function setSlideWidth() {
        const totalWidth = totalDestinos * slideWidth;
        carouselSlide.style.width = `${totalWidth}px`;
    }
    setSlideWidth();

    // Mostrar el siguiente destino
    function moveToNext() {
        if (currentIndex < totalDestinos - 1) {
            currentIndex++;
            updateCarouselPosition();
        } else {
            currentIndex = 0; // Volver al inicio
            updateCarouselPosition();
        }
    }

    // Mostrar el destino anterior
    function moveToPrev() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarouselPosition();
        } else {
            currentIndex = totalDestinos - 1; // Ir al último destino
            updateCarouselPosition();
        }
    }

    // Actualizar la posición del carrusel
    function updateCarouselPosition() {
        const offset = -currentIndex * slideWidth;
        carouselSlide.style.transform = `translateX(${offset}px)`;
    }

    // Manejar el redimensionamiento de la ventana
    window.addEventListener('resize', () => {
        const newSlideWidth = carouselContainer.offsetWidth;
        if (newSlideWidth !== slideWidth) {
            setSlideWidth();
            updateCarouselPosition();
        }
    });

    // Eventos de clic para los botones de navegación
    nextBtn.addEventListener('click', moveToNext);
    prevBtn.addEventListener('click', moveToPrev);
});
