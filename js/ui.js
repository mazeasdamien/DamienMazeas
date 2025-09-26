import { portfolioData } from '../data/portfolio.js';

const filterContainer = document.getElementById('filter-container');
const portfolioGrid = document.getElementById('portfolio-grid');
const backgroundContainer = document.getElementById('background-container');
const profilePicContainer = document.querySelector('.profile-picture-container');
const sortToggleButton = document.getElementById('sort-toggle-btn');
let currentSortOrder = 'newest';

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.remove('reveal');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

const filterColors = {
    all: { hex: '#34D399', rgb: '52, 211, 153', nonPastelHex: '#10B981', palette: ['#065F46', '#047857', '#059669', '#34D399'] },
    publication: { hex: '#7DD3FC', rgb: '125, 211, 252', nonPastelHex: '#38BDF8', palette: ['#0369A1', '#0284C7', '#0EA5E9', '#7DD3FC'] },
    employment: { hex: '#FB923C', rgb: '251, 146, 60', nonPastelHex: '#F97316', palette: ['#9A3412', '#C2410C', '#EA580C', '#FB923C'] },
    degree: { hex: '#A78BFA', rgb: '167, 139, 250', nonPastelHex: '#8B5CF6', palette: ['#5B21B6', '#6D28D9', '#7C3AED', '#A78BFA'] },
    teaching: { hex: '#FB7185', rgb: '251, 113, 133', nonPastelHex: '#F43F5E', palette: ['#9F1239', '#BE123C', '#E11D48', '#FB7185'] },
    certification: { hex: '#2DD4BF', rgb: '45, 212, 191', nonPastelHex: '#14B8A6', palette: ['#115E59', '#0D9488', '#0F766E', '#2DD4BF'] },
    'side-projects': { hex: '#E879F9', rgb: '232, 121, 249', nonPastelHex: '#D946EF', palette: ['#86198F', '#A21CAF', '#C026D3', '#E879F9'] },
    logic: { hex: '#94A3B8', rgb: '148, 163, 184', nonPastelHex: '#64748B', palette: ['#334155', '#475569', '#64748B', '#94A3B8'] }
};

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

function updateTheme(filterName = 'all') {
    const filterData = filterColors[filterName];
    const colors = filterData.palette;
    backgroundContainer.style.setProperty('--gradient-1', colors[0]);
    backgroundContainer.style.setProperty('--gradient-2', colors[1]);
    backgroundContainer.style.setProperty('--gradient-3', colors[2]);
    backgroundContainer.style.setProperty('--gradient-4', colors[3]);
    const glowRgb = hexToRgb(filterData.nonPastelHex);
    if (glowRgb) {
        profilePicContainer.style.setProperty('--glow-color', glowRgb);
    }
}

function applyFilterColorToCards() {
    document.querySelectorAll('.portfolio-item').forEach(item => {
        const category = item.dataset.category;
        const card = item.querySelector('.portfolio-card');
        if (category && filterColors[category] && card) {
            const rgb = filterColors[category].rgb;
            card.style.setProperty('--item-color', `rgba(${rgb}, 0.8)`);
            card.style.setProperty('--item-glow-color', `rgba(${rgb}, 0.15)`);
        }
    });
}

function filterAndObserve(filter = 'all') {
    const items = document.querySelectorAll('.portfolio-item');
    items.forEach(item => {
        const categories = item.dataset.category.split(' ');
        let shouldShow = categories.includes('side-projects') ? (filter === 'side-projects') : (filter === 'all' || categories.includes(filter));

        if (shouldShow) {
            item.style.display = 'block';
            item.classList.add('reveal');
            observer.observe(item);
        } else {
            item.style.display = 'none';
            observer.unobserve(item);
        }
    });
}

function renderPortfolio(sortOrder) {
    const sortedData = [...portfolioData];
    if (sortOrder === 'newest') {
        sortedData.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
        sortedData.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    const currentFilter = filterContainer ? filterContainer.querySelector('.active').dataset.filter : 'all';
    const gridHTML = sortedData.map(item => {
        let content;
        const isVideoProject = item.subtitle?.includes('YouTube');
        const isOtherClickableProject = item.url && !isVideoProject;

        let itemWrapperStart;
        let itemWrapperEnd;

        if (isVideoProject) {
            itemWrapperStart = `<div class="block h-full cursor-pointer video-popup-trigger" data-video-src="${item.url}">`;
            itemWrapperEnd = '</div>';
        } else if (isOtherClickableProject) {
            itemWrapperStart = `<a href="${item.url}" target="_blank" class="block h-full">`;
            itemWrapperEnd = '</a>';
        } else {
            itemWrapperStart = `<div class="h-full">`;
            itemWrapperEnd = '</div>';
        }

        const categoryName = item.category.replace('-', ' ').toUpperCase();
        const categoryTag = (item.category === 'side-projects') ? '' : `<div class="absolute top-2 right-3 text-xs uppercase tracking-wider bg-black/20 text-white/70 px-2 py-1 rounded-full">${categoryName}</div>`;

        const displayDate = item.displayDate;
        const periodHtml = item.period ? `<p class="text-sm uppercase tracking-wider mb-1">${item.period}</p>` : '';

        switch (item.category) {
            case 'publication':
                content = `<div class="px-4 pb-4 pt-12 flex flex-col justify-center flex-grow">${periodHtml}<h3 class="font-bold text-lg">${item.title}</h3><p class="text-sm mt-2">${item.authors}</p></div>`;
                break;
            case 'teaching':
                content = `<div class="px-4 pb-4 pt-12 w-full flex flex-col justify-center flex-grow"><h3 class="font-bold text-lg">${item.title}</h3>${periodHtml}<p class="text-sm mt-2">${item.description}</p></div>`;
                break;
            case 'employment':
            case 'degree':
            case 'certification':
                 content = `<div class="flex flex-col sm:flex-row h-full"><div class="w-full sm:w-24 flex items-center justify-center p-4"><img src="${item.logo}" alt="${item.title} Logo" class="object-contain h-24" loading="lazy"></div><div class="px-4 pb-4 pt-12 sm:pt-12 flex flex-col justify-center flex-grow"><h3 class="font-bold text-lg">${item.title}</h3>${periodHtml}<p class="text-sm mt-1">${item.description}</p></div></div>`;
                break;
            case 'side-projects':
                if (isVideoProject) {
content = `<div class="relative h-full flex items-center justify-center py-12 px-4"><div class="text-center transition-opacity group-hover:opacity-20"><h3 class="font-bold text-lg">${item.title}</h3></div><div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"><div class="transform scale-75 group-hover:scale-100 transition-transform duration-300"><svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-white" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" /></svg></div></div></div>`;                        } else {
                    let iconHtml;
                    if (item.icon === 'svg_article') {
                       iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`;
                    } else {
                       iconHtml = `<img src="${item.icon}" class="h-8 w-8" loading="lazy">`;
                    }
                    content = `<div class="flex items-center h-full px-4 pb-4 pt-12"><div class="w-16 flex-shrink-0 flex items-center justify-center">${iconHtml}</div><div class="flex-grow"><h3 class="font-bold text-lg">${item.title}</h3><p class="text-sm">${item.subtitle}</p></div></div>`;
                }
                break;
            default:
                content = `<div class="px-4 pb-4 pt-12 flex-grow"><h3 class="font-bold text-lg">${item.title}</h3></div>`;
        }

        return `<div class="portfolio-item" data-category="${item.category}">${itemWrapperStart}<div class="portfolio-card glassy-effect rounded-2xl overflow-hidden shadow-md h-full flex flex-col group">${categoryTag}<div class="absolute top-2 left-3 text-xs font-bold tracking-wider bg-black/20 text-white/70 px-2 py-1 rounded-full z-10">${displayDate}</div>${content}</div>${itemWrapperEnd}</div>`;
    }).join('');

    portfolioGrid.innerHTML = gridHTML;
    applyFilterColorToCards();
    filterAndObserve(currentFilter);
}

function setupEventListeners() {
    const filterButtons = filterContainer ? filterContainer.querySelectorAll('.filter-btn') : [];

    filterButtons.forEach(btn => {
        const filter = btn.dataset.filter;
        if (filter && filterColors[filter]) {
            btn.style.setProperty('--filter-color', filterColors[filter].hex);
            btn.style.setProperty('--filter-color-rgb', filterColors[filter].rgb);
            btn.style.setProperty('--filter-color-active', filterColors[filter].nonPastelHex);
        }
    });

    if (sortToggleButton) { sortToggleButton.textContent = 'Sorted by: Newest'; }

    if (portfolioGrid) {
        portfolioGrid.addEventListener('mousemove', e => {
            const card = e.target.closest('.portfolio-card');
            if (card) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--x', `${x}px`);
                card.style.setProperty('--y', `${y}px`);
            }
        });
    }

    const videoModal = document.getElementById('video-modal');
    const modalVideoPlayer = document.getElementById('modal-video-player');
    const closeModalBtn = document.getElementById('close-modal-btn');

    if (videoModal && modalVideoPlayer && closeModalBtn) {
        portfolioGrid.addEventListener('click', (e) => {
            const trigger = e.target.closest('.video-popup-trigger');
            if (trigger) {
                const videoSrc = trigger.dataset.videoSrc;
                if (videoSrc) {
                    modalVideoPlayer.src = videoSrc;
                    videoModal.classList.remove('hidden');
                    videoModal.classList.add('flex');
                }
            }
        });

        const closeModal = () => {
            modalVideoPlayer.pause();
            modalVideoPlayer.src = '';
            videoModal.classList.add('hidden');
            videoModal.classList.remove('flex');
        };

        closeModalBtn.addEventListener('click', closeModal);
        videoModal.addEventListener('click', (e) => { if (e.target === videoModal) { closeModal(); } });
    }

    if (filterContainer) {
        filterContainer.addEventListener('click', (event) => {
            const targetButton = event.target.closest('.filter-btn');
            if (targetButton) {
                filterContainer.querySelector('.active').classList.remove('active');
                targetButton.classList.add('active');
                const filter = targetButton.dataset.filter;
                updateTheme(filter);
                filterAndObserve(filter);
                window.dispatchEvent(new CustomEvent('themeUpdated'));
            }
        });
    }

    if (sortToggleButton) {
        sortToggleButton.addEventListener('click', () => {
            if (currentSortOrder === 'newest') {
                currentSortOrder = 'oldest';
                sortToggleButton.textContent = 'Sorted by: Oldest';
            } else {
                currentSortOrder = 'newest';
                sortToggleButton.textContent = 'Sorted by: Newest';
            }
            renderPortfolio(currentSortOrder);
        });
    }
}

export function initUI() {
    if (document.body.id === 'home-page') {
        renderPortfolio(currentSortOrder);
        updateTheme('all');
        setupEventListeners();
    }
}