// Animaciones y validación de formularios
class Formularios {
    constructor() {
        this.form = document.querySelector('.animated-form');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.initFloatLabels();
        }
    }

    initFloatLabels() {
        document.querySelectorAll('.form-group input').forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.querySelector('label').style.color = 'var(--primary)';
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.querySelector('label').style.color = '#666';
                }
            });
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        if (this.validateForm()) {
            Notificaciones.mostrar('Formulario enviado correctamente', 'success');
            this.form.reset();
        }
    }

    validateForm() {
        let isValid = true;
        
        this.form.querySelectorAll('input').forEach(input => {
            if (!input.checkValidity()) {
                input.parentElement.classList.add('error');
                isValid = false;
            } else {
                input.parentElement.classList.remove('error');
            }
        });

        if (!isValid) {
            Notificaciones.mostrar('Por favor completa todos los campos requeridos', 'error');
        }
        
        return isValid;
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => new Formularios());