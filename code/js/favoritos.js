class Favoritos {
    constructor() {
        this.buttons = document.querySelectorAll('.favorito-btn');
        this.init();
    }

    init() {
        this.buttons.forEach(btn => {
            btn.addEventListener('click', () => this.toggleFavorito(btn));
        });
    }

    toggleFavorito(btn) {
        btn.classList.toggle('active');
        btn.querySelector('i').classList.toggle('fa-solid');
        
        const destino = btn.closest('.destino-card').querySelector('h3').textContent;
        const action = btn.classList.contains('active') ? 'añadido a' : 'eliminado de';
        Notificaciones.mostrar(`¡${destino} ${action} favoritos!`);
    }
}

// Inicializar sistema de favoritos
document.addEventListener('DOMContentLoaded', () => new Favoritos());