class Notificaciones {
    static mostrar(mensaje, duracion = 3000) {
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion';
        notificacion.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${mensaje}</span>
        `;
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.remove();
        }, duracion);
    }
}