class FavoritosPage {
    constructor() {
        this.grid = document.querySelector('.favoritos-grid');
        this.sortSelect = document.querySelector('#sortBy');
        this.searchInput = document.querySelector('#searchFavoritos');
        this.tagFilter = document.querySelector('.tag-filter');
        this.favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
        
        this.init();
    }

    init() {
        this.sanitizeData();
        this.renderFavoritos();
        this.addEventListeners();
        this.createTagFilter();
    }

    sanitizeData() {
        this.favoritos = this.favoritos.map(destino => ({
            ...destino,
            tags: destino.tags || [],
            duracion: destino.duracion || 'No especificado',
            precio: destino.precio || 'Consultar precio'
        }));
    }

    renderFavoritos() {
        this.grid.innerHTML = '';
        
        if (this.favoritos.length === 0) {
            document.querySelector('.empty-state').style.display = 'block';
            return;
        }
        
        document.querySelector('.empty-state').style.display = 'none';
        
        this.favoritos.forEach(destino => {
            const card = this.createCard(destino);
            this.grid.appendChild(card);
        });
    }

    createCard(destino) {
        const card = document.createElement('article');
        card.className = 'favorito-card';
        card.innerHTML = `
            <div class="card-header">
                <img src="${destino.imagen}" alt="${destino.nombre}" loading="lazy">
                ${this.renderBadges(destino.tags)}
            </div>
            <div class="card-content">
                <h3>${destino.nombre}</h3>
                ${this.renderMeta(destino)}
                ${this.renderActions(destino.id)}
            </div>
        `;
        return card;
    }

    renderBadges(tags) {
        if (!tags || tags.length === 0) return '';
        return `
            <div class="badge-container">
                ${tags.map(tag => `
                    <span class="favorito-badge ${this.getBadgeClass(tag)}">${tag}</span>
                `).join('')}
            </div>
        `;
    }

    renderMeta(destino) {
        return `
            <div class="destino-meta">
                <span><i class="fas fa-coins"></i> ${destino.precio}</span>
                <span><i class="fas fa-clock"></i> ${destino.duracion}</span>
            </div>
        `;
    }

    renderActions(id) {
        return `
            <div class="card-actions">
                <button class="btn-remove" data-id="${id}">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
                <button class="btn-compare" data-id="${id}">
                    <i class="fas fa-balance-scale"></i> Comparar
                </button>
            </div>
        `;
    }

    getBadgeClass(tag) {
        const badgeClasses = {
            'Más Popular': 'badge-popular',
            '30% OFF': 'badge-oferta',
            'Nuevo': 'badge-nuevo',
            'Cultural': 'badge-cultural',
            'Exótico': 'badge-exotico',
            'Aventura': 'badge-aventura'
        };
        return badgeClasses[tag] || 'badge-default';
    }

    addEventListeners() {
        this.sortSelect.addEventListener('change', () => this.sortFavoritos());
        this.searchInput.addEventListener('input', () => this.filterFavoritos());
        this.grid.addEventListener('click', (e) => this.handleCardActions(e));
    }

    sortFavoritos() {
        const sortBy = this.sortSelect.value;
        
        const sortFunctions = {
            price: (a, b) => this.extractPrice(a) - this.extractPrice(b),
            duration: (a, b) => this.extractDuration(a) - this.extractDuration(b),
            recent: (a, b) => new Date(b.added) - new Date(a.added)
        };

        this.favoritos.sort(sortFunctions[sortBy] || sortFunctions.recent);
        this.renderFavoritos();
    }

    extractPrice(destino) {
        const priceString = destino.precio.replace(/[^\d]/g, '');
        return parseInt(priceString) || 0;
    }

    extractDuration(destino) {
        const durationMatch = destino.duracion.match(/\d+/);
        return durationMatch ? parseInt(durationMatch[0]) : 0;
    }

    filterFavoritos() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const filtered = this.favoritos.filter(destino => 
            destino.nombre.toLowerCase().includes(searchTerm) ||
            (destino.tags || []).some(tag => tag.toLowerCase().includes(searchTerm))
        );
        this.renderFiltered(filtered);
    }

    createTagFilter() {
        const tags = [...new Set(this.favoritos.flatMap(d => d.tags || []))];
        this.tagFilter.innerHTML = tags.map(tag => `
            <button class="tag-filter-btn" data-tag="${tag}">${tag}</button>
        `).join('');
        
        this.tagFilter.querySelectorAll('.tag-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => this.filterByTag(btn.dataset.tag));
        });
    }

    filterByTag(tag) {
        const filtered = this.favoritos.filter(d => (d.tags || []).includes(tag));
        this.renderFiltered(filtered);
    }

    renderFiltered(filtered) {
        this.grid.innerHTML = '';
        filtered.forEach(d => this.grid.appendChild(this.createCard(d)));
    }

    handleCardActions(e) {
        if (e.target.closest('.btn-remove')) {
            const id = e.target.closest('button').dataset.id;
            this.removeFavorito(id);
        }
        
        if (e.target.closest('.btn-compare')) {
            this.handleCompare(e.target.closest('button').dataset.id);
        }
    }

    removeFavorito(id) {
        this.favoritos = this.favoritos.filter(d => d.id !== id);
        localStorage.setItem('favoritos', JSON.stringify(this.favoritos));
        this.renderFavoritos();
        Notificaciones.mostrar(`Destino eliminado de favoritos 💔`);
    }

    handleCompare(id) {
        // Implementar lógica de comparación aquí
        console.log('Comparando destino:', id);
    }
}

document.addEventListener('DOMContentLoaded', () => new FavoritosPage());