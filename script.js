document.addEventListener('DOMContentLoaded', () => {
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');
    const interactiveElements = document.querySelectorAll('a, button, .cursor-pointer');

    if (document.body.id === 'home-page') {
        const filterContainer = document.getElementById('filter-container');
        const portfolioGrid = document.getElementById('portfolio-grid');
        const backgroundContainer = document.getElementById('background-container');
        const cursorBlob = document.getElementById('cursor-blob');
        const profilePicContainer = document.querySelector('.profile-picture-container');
        const filterButtons = filterContainer ? filterContainer.querySelectorAll('.filter-btn') : [];
        const sortToggleButton = document.getElementById('sort-toggle-btn');
        let currentSortOrder = 'newest';
        let currentPalette = ['#065F46', '#047857', '#059669', '#34D399'];

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
        
        function updateDotsColor(filterName) {
            if (filterColors[filterName] && filterColors[filterName].palette) {
                currentPalette = filterColors[filterName].palette;
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
            const portfolioData = [
                { category: 'publication', date: '2025-04-01', displayDate: 'APR 2025', url: 'pdfs/paper5.pdf', period: '<span class="normal-case">In MDPI Virtual Worlds</span>', title: 'Study of Visualization Modalities on Industrial Robot Teleoperation for Inspection in a Virtual Co-Existence Space', authors: '<span class="highlight-name">D Mazeas</span>, B Namoano' },
                { category: 'teaching', date: '2025-02-01', displayDate: '2025', title: 'AI3153 Human-Computer Interaction', period: 'BNBU (UNDERGRADUATES)', description: 'Syllabus Creator and Instructor for a class of 63 students.' },
                { category: 'teaching', date: '2025-01-01', displayDate: '2024-2025', title: 'GTSC2093 IT for Success in Everyday Life and Work', period: 'BNBU (UNDERGRADUATES)', description: 'Instructor for a class of 80 students.' },
                { category: 'teaching', date: '2025-02-01', displayDate: '2025', title: 'GCAP3123 Computer Technology and AI Project', period: 'BNBU (UNDERGRADUATES)', description: 'Instructor for a project-based class of 50 students.' },
                { category: 'employment', date: '2024-09-18', displayDate: '2024-2025', logo: 'images/logos/bnbu.png', title: 'Assistant Professor', period: 'BNBU (Zhuhai, China) | 10 Months', description: 'Conducted undergraduate lecturing and mentoring in HCI and XR.' },
                { category: 'publication', date: '2024-08-01', displayDate: 'OCT 2024', url: 'pdfs/paper4.pdf', period: '<span class="normal-case">In CIRP Design Conference</span>', title: 'Designing Immersive Tools for Expert and Worker Remote Collaboration', authors: 'SCM Galvis*, <span class="highlight-name">D Mazeas</span>*, F Noel, JA Erkoyuncu (*Equal contribution)' },
                { category: 'publication', date: '2024-04-01', displayDate: 'APR 2024', url: 'https://dspace.lib.cranfield.ac.uk/items/3d611b76-5604-4269-bd2b-e03835fcaad4', period: '<span class="normal-case">PhD Thesis</span>', title: 'Key principles for assessing and implementing remote inspection with telexistence capability', authors: '<span class="highlight-name">Damien Mazeas</span>' },
                { category: 'degree', date: '2024-04-01', displayDate: 'APR 2024', logo: 'images/logos/cranfield.webp', title: 'PhD in Human-Computer Interaction', description: 'Cranfield University (UK) - Centre for Digital and Design Engineering' },
                { category: 'employment', date: '2023-08-01', displayDate: '2023-2024', logo: 'images/logos/cnrs.png', title: 'Research Fellow', period: 'CNRS@CREATE (Singapore) | 1 Year', description: 'Studied how viewpoints shaped virtual navigation.' },
                { category: 'publication', date: '2023-05-01', displayDate: 'MAY 2023', url: 'pdfs/paper3.pdf', period: '<span class="normal-case">In IEEE VRW</span>', title: 'Telexistence-based remote maintenance for marine engineers', authors: '<span class="highlight-name">D Mazeas</span>, JA Erkoyuncu, F Noel' },
                { category: 'employment', date: '2023-02-01', displayDate: '2023', logo: 'images/logos/gscop.jpg', title: 'Visiting PhD Student', period: 'G-SCOP LAB (Grenoble, France) | 6 Months', description: 'Designed a framework for expert-worker virtual reality remote collaboration.' },
                { category: 'publication', date: '2023-02-01', displayDate: 'FEB 2023', url: 'pdfs/paper2.pdf', period: '<span class="normal-case">In IFIP PLM</span>', title: 'A telexistence interface for remote control of a physical industrial robot via data distribution service', authors: '<span class="highlight-name">D Mazeas</span>, JA Erkoyuncu, F Noel' },
                { category: 'side-projects', date: '2023-11-01', displayDate: '2023', url: 'ur16e.html', icon: 'images/social/Octicons-mark-github.svg.png', title: 'Universal Robots 16e inverse kinematics in Unity3D', subtitle: 'GitHub Project' },
                { category: 'side-projects', date: '2022-10-01', displayDate: '2022', url: 'https://youtu.be/3zTs_7LXH3Y', icon: 'images/social/Youtube_logo.png', title: 'Linking FANUC Roboguide software with Unity 3D', subtitle: 'YouTube Demo' },
                { category: 'side-projects', date: '2022-09-01', displayDate: '2022', url: 'https://youtu.be/SFfLPbs-ws', icon: 'images/social/Youtube_logo.png', title: 'Pick and place programmed with a FANUC robot', subtitle: 'YouTube Demo' },
                { category: 'side-projects', date: '2022-08-01', displayDate: '2022', url: 'https://youtu.be/m4l9wxIvU98', icon: 'images/social/Youtube_logo.png', title: 'Remote control of a TurtleBot2 with the HoloLens 2', subtitle: 'YouTube Demo' },
                { category: 'side-projects', date: '2022-07-01', displayDate: '2021', url: 'https://www.maintenanceandengineering.com/2021/06/16/emerging-technologies-to-support-asset-management/', icon: 'svg_article', title: 'Emerging tech to support asset management', subtitle: 'Technical Article' },
                { category: 'side-projects', date: '2022-06-01', displayDate: '2022', url: 'https://youtu.be/x-0PAZydMrk?si=yNJKiUbViiESZV_v', icon: 'images/social/Youtube_logo.png', title: 'Visualization of an injection moulding in VR', subtitle: 'YouTube Demo' },
                { category: 'side-projects', date: '2022-05-01', displayDate: '2022', url: 'https://youtu.be/Zn1bKinud8s?si=my8Fv56XyIeIKABA', icon: 'images/social/Youtube_logo.png', title: 'Training procedure for starting a production line in VR', subtitle: 'YouTube Demo' },
                { category: 'certification', date: '2021-09-01', displayDate: 'SEP 2021', logo: 'images/logos/fanuc.png', title: 'Standard Teach Pendant Programming', description: 'FANUC' },
                { category: 'publication', date: '2020-06-01', displayDate: 'JUN 2020', url: 'pdfs/paper1.pdf', period: '<span class="normal-case">In DESIGN conference</span>', title: 'IMPRO: Immersive prototyping in virtual environments for industrial designers', authors: 'S Stadler, H Cornet, <span class="highlight-name">D Mazeas*</span>, JR Chardonnet, F Frenkler (*App development, experiment design, data collection, and analysis)' },
                { category: 'employment', date: '2020-01-01', displayDate: '2020', logo: 'images/logos/safran.png', title: 'Solutions Engineer', period: 'SAFRAN (Gloucester, UK) | 6 Months', description: 'Assisted with the implementation of augmented reality solutions for maintenance.' },
                { category: 'employment', date: '2019-10-01', displayDate: '2019-2020', logo: 'images/logos/sec.png', title: 'Freelance', period: 'SINGAPORE-ETH CENTRE (Remote) | 4 Months', description: 'Developed Unity 3D applications to study human navigation in isolation.' },
                { category: 'degree', date: '2019-09-01', displayDate: 'SEP 2019', logo: 'images/logos/artsetmetiers.svg', title: "Master's degree in Digital Engineering", description: 'Arts et Metiers (France) - Institute Image' },
                { category: 'employment', date: '2019-04-01', displayDate: '2019', logo: 'images/logos/tumcreate.png', title: 'Research Assistant', period: 'TUMCREATE (Singapore) | 6 Months', description: 'Studied the use of virtual reality for industrial designers.' },
                { category: 'employment', date: '2018-09-01', displayDate: '2018', logo: 'images/logos/orano.svg', title: 'Virtual Reality Intern', period: 'ORANO (Cherbourg, France) | 6 Months', description: 'Prepared project reviews for the design office.' },
                { category: 'degree', date: '2017-07-01', displayDate: 'JUL 2017', logo: 'images/logos/poitiers.png', title: "Professional Bachelor's degree in Industrial Design", description: 'University of Poitiers (France)' },
                { category: 'employment', date: '2017-04-01', displayDate: '2017', logo: 'images/logos/vernetdray.png', title: 'SolidWorks Intern', period: 'VERNET DRAY (Lyon, France) | 4 Months', description: 'Modeled jewelry and created technical drawings on SolidWorks.' },
                { category: 'degree', date: '2016-06-01', displayDate: 'JUN 2016', logo: 'images/logos/tours.png', title: "Associate's degree in Materials Engineering", description: 'University of Tours (France)' },
                { category: 'employment', date: '2016-04-01', displayDate: '2016', logo: 'images/logos/europoly.png', title: 'Methods Intern', period: 'EUROPOLY (Lyon, France) | 3 Months', description: 'Programmed a 3-axis CNC on Autodesk ArtCAM and produced technical drawings.' }
            ];
            
            if (sortOrder === 'newest') {
                portfolioData.sort((a, b) => new Date(b.date) - new Date(a.date));
            } else {
                portfolioData.sort((a, b) => new Date(a.date) - new Date(b.date));
            }

            const currentFilter = filterContainer ? filterContainer.querySelector('.active').dataset.filter : 'all';
            const gridHTML = portfolioData.map(item => {
                let content;
                const isClickable = item.url;
                const itemWrapperStart = isClickable ? `<a href="${item.url}" target="_blank" class="block h-full">` : '<div class="h-full">';
                const itemWrapperEnd = isClickable ? '</a>' : '</div>';
                
                const categoryName = item.category.replace('-', ' ').toUpperCase();
                const categoryTag = (item.category === 'side-projects') ? '' : `<div class="absolute top-2 right-3 text-xs uppercase tracking-wider bg-black/20 text-white/70 px-2 py-1 rounded-full">${categoryName}</div>`;
                
                const displayDate = item.displayDate;

                const periodHtml = item.period ? `<p class="text-sm uppercase tracking-wider mb-1">${item.period}</p>` : '';

                switch (item.category) {
                    case 'publication':
                        content = `
                            <div class="px-4 pb-4 pt-12 flex flex-col justify-center flex-grow">
                                ${periodHtml}
                                <h3 class="font-bold text-lg">${item.title}</h3>
                                <p class="text-sm mt-2">${item.authors}</p>
                            </div>`;
                        break;
                    case 'teaching':
                        content = `
                            <div class="px-4 pb-4 pt-12 w-full flex flex-col justify-center flex-grow">
                                <h3 class="font-bold text-lg">${item.title}</h3>
                                ${periodHtml}
                                <p class="text-sm mt-2">${item.description}</p>
                            </div>`;
                        break;
                    case 'employment':
                    case 'degree':
                    case 'certification':
                         content = `
                            <div class="flex flex-col sm:flex-row h-full">
                                <div class="w-full sm:w-24 flex items-center justify-center p-4">
                                    <img src="${item.logo}" alt="${item.title} Logo" class="object-contain h-24" loading="lazy">
                                </div>
                                <div class="px-4 pb-4 pt-12 sm:pt-12 flex flex-col justify-center flex-grow">
                                    <h3 class="font-bold text-lg">${item.title}</h3>
                                    ${periodHtml}
                                    <p class="text-sm mt-1">${item.description}</p>
                                </div>
                            </div>`;
                        break;
                    case 'side-projects':
                        const iconHtml = item.icon === 'svg_article'
                            ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`
                            : `<img src="${item.icon}" class="${item.subtitle.includes('YouTube') ? 'h-6' : 'h-8 w-8'}" loading="lazy">`;
                        
                        content = `
                             <div class="flex items-center h-full px-4 pb-4 pt-12">
                                 <div class="w-16 flex-shrink-0 flex items-center justify-center">${iconHtml}</div>
                                 <div class="flex-grow">
                                     <h3 class="font-bold text-lg">${item.title}</h3>
                                     <p class="text-sm">${item.subtitle}</p>
                                 </div>
                             </div>`;
                        break;
                    default:
                        content = `<div class="px-4 pb-4 pt-12 flex-grow"><h3 class="font-bold text-lg">${item.title}</h3></div>`;
                }

                return `
                    <div class="portfolio-item" data-category="${item.category}">
                        ${itemWrapperStart}
                            <div class="portfolio-card glassy-effect rounded-2xl overflow-hidden shadow-md h-full">
                                <div class="absolute top-2 left-3 text-xs font-bold tracking-wider bg-black/20 text-white/70 px-2 py-1 rounded-full">${displayDate}</div>
                                ${categoryTag}
                                ${content}
                            </div>
                        ${itemWrapperEnd}
                    </div>`;

            }).join('');

            portfolioGrid.innerHTML = gridHTML;
            applyFilterColorToCards();
            filterAndObserve(currentFilter);
        }
        

        filterButtons.forEach(btn => {
            const filter = btn.dataset.filter;
            if (filter && filterColors[filter]) {
                btn.style.setProperty('--filter-color', filterColors[filter].hex);
                btn.style.setProperty('--filter-color-rgb', filterColors[filter].rgb);
                btn.style.setProperty('--filter-color-active', filterColors[filter].nonPastelHex);
            }
        });

        if (sortToggleButton) {
            sortToggleButton.textContent = 'Sorted by: Newest';
        }

        renderPortfolio(currentSortOrder);
        updateTheme('all');
        updateDotsColor('all');

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

        window.addEventListener('mousemove', e => {
            cursorBlob.animate({
                left: `${e.clientX}px`,
                top: `${e.clientY}px`
            }, {
                duration: 2000,
                fill: "forwards"
            });
        });

        window.addEventListener('click', e => {
            const colorBlobs = document.querySelectorAll('.blob:not(#cursor-blob)');
            colorBlobs.forEach(blob => {
                const rect = blob.getBoundingClientRect();
                const blobX = rect.left + rect.width / 2;
                const blobY = rect.top + rect.height / 2;
                const angle = Math.atan2(blobY - e.clientY, blobX - e.clientX);
                const force = 100;
                const translateX = Math.cos(angle) * force;
                const translateY = Math.sin(angle) * force;
                const currentTransform = window.getComputedStyle(blob).transform;
                const newTransform = currentTransform === 'none' ? `translate(${translateX}px, ${translateY}px)` : `${currentTransform} translate(${translateX}px, ${translateY}px)`;
                blob.style.transform = newTransform;
                setTimeout(() => {
                    blob.style.transform = '';
                }, 500);
            });
        });

        if (filterContainer) {
            filterContainer.addEventListener('click', (event) => {
                const targetButton = event.target.closest('.filter-btn');
                if (targetButton) {
                    filterContainer.querySelector('.active').classList.remove('active');
                    targetButton.classList.add('active');
                    const filter = targetButton.dataset.filter;
                    updateTheme(filter);
                    filterAndObserve(filter);
                    updateDotsColor(filter);
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

    if (document.body.id === 'contact-page' || document.body.id === 'home-page') {
        const canvas = document.getElementById('constellation-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            let dots = [];
            const mouse = { x: null, y: null };
            const dotConnectionDistance = 100;
            const baseDotDensity = 1000;
            const persistentDots = new Set();
            
            function resizeCanvas() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                createDots();
            }

            function createDots() {
                dots = [];
                const dotCount = Math.floor((canvas.width * canvas.height) / baseDotDensity);
                for (let i = 0; i < dotCount; i++) {
                    dots.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        hue: Math.floor(Math.random() * 360),
                        size: Math.random() * 2 + 1,
                        speedX: (Math.random() - 0.5) * 0.5,
                        speedY: (Math.random() - 0.5) * 0.5
                    });
                }
            }

            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const nearbyDots = [];
                const allVisibleDots = new Set(persistentDots);
                const blobElements = document.querySelectorAll('.blob:not(#cursor-blob)');
                const blobRects = Array.from(blobElements).map(el => el.getBoundingClientRect());
                const isHomePage = document.body.id === 'home-page';

                for (const dot of dots) {
                    dot.x += dot.speedX;
                    dot.y += dot.speedY;

                    if (dot.x < 0) dot.x = canvas.width;
                    if (dot.x > canvas.width) dot.x = 0;
                    if (dot.y < 0) dot.y = canvas.height;
                    if (dot.y > canvas.height) dot.y = 0;

                    let blobProximityOpacity = 1;
                    if (isHomePage) {
                        for (const rect of blobRects) {
                            const distX = dot.x - (rect.left + rect.width / 2);
                            const distY = dot.y - (rect.top + rect.height / 2);
                            const distToBlob = Math.hypot(distX, distY);
                            const fadeRadius = Math.max(rect.width, rect.height) / 1.5;
                            if (distToBlob < fadeRadius) {
                                blobProximityOpacity = Math.min(blobProximityOpacity, distToBlob / fadeRadius);
                            }
                        }
                    }

                    let isNearby = false;
                    let mouseProximityOpacity = 0;
                    if (mouse.x !== null) {
                        const distMouse = Math.hypot(mouse.x - dot.x, mouse.y - dot.y);
                        if (distMouse < dotConnectionDistance) {
                            isNearby = true;
                            nearbyDots.push(dot);
                            allVisibleDots.add(dot);
                            mouseProximityOpacity = 1 - (distMouse / dotConnectionDistance);
                        }
                    }

                    if (persistentDots.has(dot) || isNearby) {
                        const finalOpacity = (mouseProximityOpacity > 0 ? mouseProximityOpacity : 0.3) * blobProximityOpacity;
                        ctx.beginPath();
                        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
                        ctx.fillStyle = `hsla(${dot.hue}, 80%, 70%, ${finalOpacity})`;
                        ctx.fill();
                    }
                }

                nearbyDots.forEach(dot => {
                    const distMouse = Math.hypot(mouse.x - dot.x, mouse.y - dot.y);
                    const opacity = 1 - (distMouse / dotConnectionDistance);
                    ctx.beginPath();
                    ctx.moveTo(dot.x, dot.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `hsla(${dot.hue}, 80%, 70%, ${opacity * 0.6})`;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                });

                const visibleDotsArray = Array.from(allVisibleDots);
                for (let i = 0; i < visibleDotsArray.length; i++) {
                    for (let j = i + 1; j < visibleDotsArray.length; j++) {
                        const dot1 = visibleDotsArray[i];
                        const dot2 = visibleDotsArray[j];
                        const dist = Math.hypot(dot1.x - dot2.x, dot1.y - dot2.y);
                        if (dist < dotConnectionDistance) {
                            const opacity = 1 - (dist / dotConnectionDistance);
                            ctx.beginPath();
                            ctx.moveTo(dot1.x, dot1.y);
                            ctx.lineTo(dot2.x, dot2.y);
                            ctx.strokeStyle = `hsla(${dot1.hue}, 80%, 70%, ${opacity * 0.2})`;
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                    }
                }
                requestAnimationFrame(animate);
            }

            resizeCanvas();
            animate();
            window.addEventListener('resize', resizeCanvas);
            window.addEventListener('mousemove', e => {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
            });

            window.addEventListener('click', e => {
                const dotsToMakePersistent = dots.filter(dot => {
                    const dist = Math.hypot(e.clientX - dot.x, e.clientY - dot.y);
                    return dist < dotConnectionDistance;
                });
                dotsToMakePersistent.forEach(dot => persistentDots.add(dot));
            });
        }
    }

    window.addEventListener('mousemove', e => {
        if (cursorDot) {
            cursorDot.style.left = `${e.clientX}px`;
            cursorDot.style.top = `${e.clientY}px`;
        }
        if (cursorOutline) {
            cursorOutline.animate({
                left: `${e.clientX}px`,
                top: `${e.clientY}px`
            }, {
                duration: 500,
                fill: "forwards"
            });
        }

        interactiveElements.forEach(el => {
            if (el.classList.contains('filter-btn') || el.classList.contains('header-btn') || el.classList.contains('social-bubble')) {
                const rect = el.getBoundingClientRect();
                el.style.setProperty('--x', `${e.clientX - rect.left}px`);
                el.style.setProperty('--y', `${e.clientY - rect.top}px`);
            }
        });
    });

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (cursorOutline) cursorOutline.classList.add('grow');
        });
        el.addEventListener('mouseleave', () => {
            if (cursorOutline) cursorOutline.classList.remove('grow');
        });
    });
});