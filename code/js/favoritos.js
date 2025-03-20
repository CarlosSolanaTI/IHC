class Favoritos {
    constructor() {
        this.favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
        this.counterElements = document.querySelectorAll('.fav-counter');
        this.init();
    }

    init() {
        this.actualizarContador();
        this.setupEventListeners();
        this.actualizarBotones();
    }

    setupEventListeners() {
        // Event delegation para botones dinámicos
        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('.favorite-btn');
            if (btn) this.handleFavoriteClick(btn);
        });
    }

    handleFavoriteClick(btn) {
        const destino = this.getDestinoData(btn);
        this.toggleFavorito(destino);
        this.actualizarIcono(btn);
    }

    getDestinoData(btn) {
        const card = btn.closest('.destino-card');
        try {
            return {
                id: card?.dataset?.destino || '',
                nombre: card?.querySelector('h3')?.textContent || 'Destino desconocido',
                precio: card?.querySelector('.destino-meta span:first-child')?.textContent || 'Consultar precio',
                duracion: card?.querySelector('.destino-meta span:nth-child(2)')?.textContent || 'Duración no especificada',
                imagen: card?.querySelector('img')?.src || '',
                tags: Array.from(card?.querySelectorAll('.badge') || []).map(badge => badge.textContent),
                added: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error obteniendo datos del destino:', error);
            return null;
        }
    }

    actualizarBotones() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const destino = this.getDestinoData(btn);
            if (!destino) return;
            
            btn.classList.toggle('active', this.isFavorito(destino.id));
            this.actualizarIcono(btn);
        });
    }

    isFavorito(id) {
        return this.favoritos.some(item => item.id === id);
    }

    toggleFavorito(destino) {
        if (!destino) return;

        const index = this.favoritos.findIndex(item => item.id === destino.id);
        
        if (index === -1) {
            this.favoritos.push(destino);
            Notificaciones.mostrar(`❤️ ${destino.nombre} añadido a favoritos!`);
        } else {
            this.favoritos.splice(index, 1);
            Notificaciones.mostrar(`💔 ${destino.nombre} eliminado de favoritos!`);
        }

        this.guardarLocalStorage();
        this.actualizarContador();
        this.dispatchUpdateEvent(); // Notificar a otros componentes
    }

    actualizarIcono(btn) {
        const icon = btn.querySelector('i');
        if (!icon) return;

        const isActive = btn.classList.contains('active');
        icon.classList.replace(isActive ? 'fa-regular' : 'fa-solid', 
                             isActive ? 'fa-solid' : 'fa-regular');
    }

    guardarLocalStorage() {
        try {
            localStorage.setItem('favoritos', JSON.stringify(this.favoritos));
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
            Notificaciones.mostrar('❌ Error guardando favoritos');
        }
    }

    actualizarContador() {
        this.counterElements.forEach(counter => {
            counter.textContent = this.favoritos.length;
        });
    }

    dispatchUpdateEvent() {
        const event = new CustomEvent('favoritosUpdated', {
            detail: { count: this.favoritos.length }
        });
        document.dispatchEvent(event);
    }
}

// Inicialización condicional
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.favorite-btn')) {
        new Favoritos();
    }
});