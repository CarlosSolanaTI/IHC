class NavManagerFavoritos {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateActiveState();
        this.updateFavCounter();
        this.setupStorageListener();
    }

    setupEventListeners() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });
    }

    handleNavClick(e) {
        const href = e.target.getAttribute('href');
        if (!href.includes('.html')) {
            e.preventDefault();
            window.location.href = `index.html${href}`;
        }
    }

    updateActiveState() {
        this.navLinks.forEach(link => {
            link.parentElement.classList.remove('active');
            if(link.href === window.location.href) {
                link.parentElement.classList.add('active');
            }
        });
    }

    updateFavCounter() {
        const favoritos = JSON.parse(localStorage.getItem('favorites')) || [];
        document.querySelector('.fav-counter').textContent = favoritos.length;
    }

    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'favorites') {
                this.updateFavCounter();
            }
        });
    }
}