class NavManager {
    constructor(isFavoritosPage = false) {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('.section');
        this.searchInput = document.getElementById('homeSearch');
        this.isFavoritosPage = isFavoritosPage;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateFavCounter();
        if(!this.isFavoritosPage) this.setInitialState(this.getCurrentSection());
        this.setupStorageListener();
    }

    setupEventListeners() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });
        
        if(!this.isFavoritosPage) {
            window.addEventListener('hashchange', () => this.updateActiveState());
        }
    }

    updateFavCounter() {
        const favoritos = JSON.parse(localStorage.getItem('favorites')) || [];
        document.querySelectorAll('.fav-counter').forEach(counter => {
            counter.textContent = favoritos.length;
        });
    }

    handleNavClick(e) {
        const href = e.target.getAttribute('href');
        
        if (href.includes('favoritos.html')) {
            e.preventDefault();
            window.location.href = href;
            return;
        }
        
        if (!href.includes('.html')) {
            e.preventDefault();
            const targetId = href.split('#')[1];
            this.navigateToSection(targetId);
        }
    }
    getCurrentSection() {
        const hash = window.location.hash.substring(1);
        return hash.split('?')[0] || 'home';
    }

    setInitialState(sectionId) {
        this.sections.forEach(section => {
            section.style.transition = 'none';
            section.style.opacity = '0';
            section.style.visibility = 'hidden';
            section.classList.remove('active');
        });

        setTimeout(() => {
            this.setActiveSection(sectionId);
            this.sections.forEach(section => {
                section.style.transition = '';
            });
        }, 50);
    }

    handleNavClick(e) {
        const href = e.target.getAttribute('href');
        
        // Si es un enlace externo (.html), permitir comportamiento normal
        if (href.includes('.html')) {
            return true;
        }

        e.preventDefault();
        const targetId = href.split('#')[1];
        this.navigateToSection(targetId);
    }

    navigateToSection(sectionId, searchTerm = '') {
        const hash = searchTerm ? `${sectionId}?search=${encodeURIComponent(searchTerm)}` : sectionId;
        window.location.hash = hash;
    }

    updateActiveState() {
        const [sectionId, queryParams] = window.location.hash.substring(1).split('?');
        this.setActiveSection(sectionId || 'home');
        
        if (sectionId === 'destinos') {
            const searchTerm = new URLSearchParams(queryParams).get('search') || '';
            this.searchInput.value = decodeURIComponent(searchTerm);
            this.filterDestinations(searchTerm);
        }
    }

    setActiveSection(sectionId) {
        const currentActive = document.querySelector('.section.active');
        if (currentActive) {
            currentActive.style.opacity = '0';
            currentActive.style.visibility = 'hidden';
            currentActive.classList.remove('active');
        }

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            requestAnimationFrame(() => {
                targetSection.classList.add('active');
                targetSection.style.opacity = '1';
                targetSection.style.visibility = 'visible';
                this.scrollToSection(targetSection);
                this.handleDynamicContent(sectionId);
            });
        }

        this.updateNavIndicator(sectionId);
    }

    handleSearch() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        this.navigateToSection('destinos', searchTerm);
    }

    filterDestinations(searchTerm) {
        const cards = document.querySelectorAll('.destino-card');
        let hasMatches = false;
        const searchQuery = searchTerm.toLowerCase();

        cards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('.destino-desc').textContent.toLowerCase();
            const tags = Array.from(card.querySelectorAll('.badge')).map(badge => badge.textContent.toLowerCase());
            
            const match = title.includes(searchQuery) || 
                         description.includes(searchQuery) || 
                         tags.some(tag => tag.includes(searchQuery));

            card.style.display = match ? 'block' : 'none';
            card.style.opacity = match ? '1' : '0';
            card.style.transform = match ? 'translateY(0)' : 'translateY(20px)';
            if (match) hasMatches = true;
        });

        this.showNoResultsMessage(hasMatches, searchTerm);
    }

    showNoResultsMessage(hasMatches, searchTerm) {
        let messageElement = document.getElementById('noResults');
        
        if (!hasMatches && searchTerm) {
            if (!messageElement) {
                messageElement = document.createElement('div');
                messageElement.id = 'noResults';
                messageElement.innerHTML = `
                    <p class="no-results">😞 No encontramos resultados para "${searchTerm}"</p>
                    <button class="clear-search" onclick="navManager.clearSearch()">
                        Mostrar todos los destinos
                    </button>
                `;
                document.querySelector('#destinos .carousel-container').after(messageElement);
            }
        } else if (messageElement) {
            messageElement.remove();
        }
    }

    clearSearch() {
        this.searchInput.value = '';
        this.navigateToSection('destinos');
    }

    updateNavIndicator(sectionId) {
        this.navLinks.forEach(link => {
            link.parentElement.classList.toggle('active', 
                link.getAttribute('href').includes(`#${sectionId}`)
            );
        });
    }

    scrollToSection(section) {
        const targetPosition = section.offsetTop - 100;
        if (Math.abs(window.pageYOffset - targetPosition) > 100) {
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        } else {
            window.scrollTo(0, targetPosition);
        }
    }

    handleDynamicContent(sectionId) {
        if (sectionId === 'destinos') {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
                if (typeof initCarousel === 'function') initCarousel();
            }, 300);
        }
    }

    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'favorites') {
                this.filterDestinations(this.searchInput.value);
            }
        });
    }
}

// Funcionalidades Globales
window.navigateToDestinos = () => {
    const searchTerm = document.getElementById('homeSearch').value.trim();
    window.navManager.navigateToSection('destinos', searchTerm);
};

window.searchDestination = (term) => {
    window.navManager.searchInput.value = term;
    window.navManager.handleSearch();
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    window.navManager = new NavManager();
    document.body.style.visibility = 'hidden';
    
    setTimeout(() => {
        document.body.style.visibility = 'visible';
        
        const params = new URLSearchParams(window.location.hash.split('?')[1]);
        if (params.has('search')) {
            navManager.filterDestinations(params.get('search'));
        }
        
        if (typeof initCarousel === 'function') {
            initCarousel();
        }
    }, 100);
});

// Función de Carrusel (carrucel.js)
function initCarousel() {
    const container = document.querySelector('.carousel-container');
    if (!container) return;

    let currentIndex = 0;
    const cards = container.querySelectorAll('.destino-card');
    const cardCount = cards.length;
    const cardWidth = cards[0].offsetWidth + 30;

    function updateCarousel() {
        container.querySelector('.carousel-slide').style.transform = 
            `translateX(-${currentIndex * cardWidth}px)`;
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % (cardCount - 2);
        updateCarousel();
    }

    function prevSlide() {
        currentIndex = Math.max(0, currentIndex - 1);
        updateCarousel();
    }

    container.querySelector('.next-btn').addEventListener('click', nextSlide);
    container.querySelector('.prev-btn').addEventListener('click', prevSlide);

    // Autoplay
    let autoplay = setInterval(nextSlide, 5000);
    
    container.addEventListener('mouseenter', () => clearInterval(autoplay));
    container.addEventListener('mouseleave', () => 
        autoplay = setInterval(nextSlide, 5000));
}