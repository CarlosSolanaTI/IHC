// Navegación con feedback visual
class NavFeedback {
    constructor() {
        this.navItems = document.querySelectorAll('.main-nav li');
        this.init();
    }

    init() {
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavClick(item);
            });
        });
    }

    handleNavClick(clickedItem) {
        // Remover clase activa de todos los items
        this.navItems.forEach(item => item.classList.remove('active'));
        
        // Añadir clase activa al item clickeado
        clickedItem.classList.add('active');
        
        // Notificación
        Notificaciones.mostrar(`Navegando a: ${clickedItem.textContent.trim()}`, 'success');
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => new NavFeedback());