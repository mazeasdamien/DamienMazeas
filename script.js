document.addEventListener('DOMContentLoaded', () => {
    // --- Global Custom Cursor Elements ---
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');

    // --- Global Interactive Elements for Cursor Interaction ---
    const interactiveElements = document.querySelectorAll('a, button, .cursor-pointer');

    // --- Page-Specific Logic ---

    // Home Page Logic
    if (document.body.id === 'home-page') {
        const filterContainer = document.getElementById('filter-container');
        const portfolioGrid = document.getElementById('portfolio-grid');
        const backgroundContainer = document.getElementById('background-container');
        const cursorBlob = document.getElementById('cursor-blob');
        const profilePicContainer = document.querySelector('.profile-picture-container');
        const filterButtons = filterContainer ? filterContainer.querySelectorAll('.filter-btn') : [];
        const sortToggleButton = document.getElementById('sort-toggle-btn');
        let currentSortOrder = 'newest';

        const filterColors = {
            all: {
                hex: '#94A3B8', // Slate 400
                rgb: '148, 163, 184',
                nonPastelHex: '#475569', // Slate 600
                palette: ['#E2E8F0', '#CBD5E1', '#B9D2F8', '#C7D2FE']
            },
            publication: {
                hex: '#60A5FA', // Blue 400
                rgb: '96, 165, 250',
                nonPastelHex: '#2563EB', // Blue 600
                palette: ['#93C5FD', '#60A5FA', '#3B82F6', '#BFDBFE']
            },
            employment: {
                hex: '#FBBF24', // Amber 400
                rgb: '251, 191, 36',
                nonPastelHex: '#F59E0B', // Amber 500
                palette: ['#FCD34D', '#FBBF24', '#F59E0B', '#FEF3C7']
            },
            degree: {
                hex: '#34D399', // Emerald 400
                rgb: '52, 211, 153',
                nonPastelHex: '#10B981', // Emerald 500
                palette: ['#6EE7B7', '#34D399', '#10B981', '#D1FAE5']
            },
            teaching: {
                hex: '#F87171', // Red 400
                rgb: '248, 113, 113',
                nonPastelHex: '#EF4444', // Red 500
                palette: ['#FCA5A5', '#F87171', '#EF4444', '#FEE2E2']
            },
            certification: {
                hex: '#2DD4BF', // Teal 400
                rgb: '45, 212, 191',
                nonPastelHex: '#14B8A6', // Teal 500
                palette: ['#5EEAD4', '#2DD4BF', '#14B8A6', '#CCFBF1']
            },
            'side-projects': {
                hex: '#818CF8', // Indigo 400
                rgb: '129, 140, 248',
                nonPastelHex: '#6366F1', // Indigo 500
                palette: ['#A5B4FC', '#818CF8', '#6366F1', '#E0E7FF']
            }
        };

        // Fix: Publication images have been removed from the HTML strings
        const portfolioData = [
            { category: 'publication', date: '2025-04-01', html: `<a href="pdfs/paper5.pdf" target="_blank" class="block"><div class="portfolio-card glassy-effect rounded-2xl overflow-hidden shadow-md h-full"><div class="p-4 flex flex-col justify-center"><p class="text-sm uppercase tracking-wider mb-1">APRIL 2025, <span class="text-gray-700 normal-case">In MDPI Virtual Worlds</span></p><h3 class="font-bold text-lg">Study of Visualization Modalities on Industrial Robot Teleoperation for Inspection in a Virtual Co-Existence Space</h3><p class="text-xs text-gray-500 uppercase tracking-wider mt-2"><b>D Mazeas</b>, B Namoano</p></div></div></a>` },
            { category: 'teaching', date: '2025-02-01', html: `<div class="portfolio-card glassy-effect flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-md h-full"><div class="p-4 w-full sm:w-3/4 flex flex-col justify-center"><h3 class="font-bold text-lg">AI3153 Human-Computer Interaction</h3><p class="text-xs text-gray-500 uppercase tracking-wider">BNBU (UNDERGRADUATES), 2025</p><p class="text-sm text-gray-700 mt-2">Syllabus Creator and Instructor for a class of 63 students.</p></div><div class="flex items-center justify-center sm:w-1/4 p-4"><a href="pdfs/HCIsyllabus.pdf" target="_blank" class="filter-btn glassy-effect px-4 py-1.5 text-sm font-medium rounded-full flex-shrink-0" style="--filter-color: #FFC4C4; --filter-color-rgb: 255, 196, 196;">Syllabus & student feedback </a></div></div>` },
            { category: 'teaching', date: '2025-01-01', html: `<div class="portfolio-card glassy-effect flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-md h-full"><div class="p-4 w-full sm:w-3/4 flex flex-col justify-center"><h3 class="font-bold text-lg">GTSC2093 IT for Success in Everyday Life and Work</h3><p class="text-xs text-gray-500 uppercase tracking-wider">BNBU (UNDERGRADUATES), 2024-2025</p><p class="text-sm text-gray-700 mt-2">Instructor for a class of 80 students.</p></div></div>` },
            { category: 'teaching', date: '2025-02-01', html: `<div class="portfolio-card glassy-effect flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-md h-full"><div class="p-4 w-full sm:w-3/4 flex flex-col justify-center"><h3 class="font-bold text-lg">GCAP3123 Computer Technology and AI Project</h3><p class="text-xs text-gray-500 uppercase tracking-wider">BNBU (UNDERGRADUATES), 2025</p><p class="text-sm text-gray-700 mt-2">Instructor for a project-based class of 50 students.</p></div></div>` },
            { category: 'employment', date: '2024-09-18', html: `<div class="portfolio-card glassy-effect flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-md h-full"><div class="w-full sm:w-24 flex items-center justify-center p-4"><img src="images/logos/bnbu.png" alt="BNBU Logo" class="object-contain h-30"></div><div class="p-4 flex flex-col justify-center"><h3 class="font-bold text-lg">Assistant Professor</h3><p class="text-xs text-gray-500 uppercase tracking-wider">BNBU (Zhuhai, China) | 10 Months (2024 - 2025)</p><p class="text-sm text-gray-700 mt-2">Conducted undergraduate lecturing and mentoring in HCI and XR.</p></div></div>` },
            { category: 'publication', date: '2024-08-01', html: `<a href="pdfs/paper4.pdf" target="_blank" class="block"><div class="portfolio-card glassy-effect rounded-2xl overflow-hidden shadow-md h-full"><div class="p-4 flex flex-col justify-center"><p class="text-sm uppercase tracking-wider mb-1">OCTOBER 2024, <span class="text-gray-700 normal-case">In CIRP Design Conference</span></p><h3 class="font-bold text-lg">Designing Immersive Tools for Expert and Worker Remote Collaboration</h3><p class="text-xs text-gray-500 uppercase tracking-wider mt-2">SCM Galvis*, <b>D Mazeas</b>*, F Noel, JA Erkoyuncu (*Equal contribution)</p></div></div></a>` },
            { category: 'degree', date: '2024-04-01', html: `<div class="portfolio-card glassy-effect flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-md h-full"><div class="w-full sm:w-24 flex items-center justify-center p-4"><img src="images/logos/cranfield.webp" alt="Cranfield University Logo" class="object-contain h-20"></div><div class="p-4 flex flex-col justify-center"><p class="text-xs text-gray-500 uppercase tracking-wider">APR 2024</p><h3 class="font-bold text-lg">PhD in Human-Computer Interaction</h3><p class="text-sm text-gray-700 mt-1">Cranfield University (UK) - Centre for Digital and Design Engineering</p></div></div>` },
            { category: 'employment', date: '2023-08-01', html: `<div class="portfolio-card glassy-effect flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-md h-full"><div class="w-full sm:w-24 flex items-center justify-center p-4"><img src="images/logos/cnrs.png" alt="CNRS Logo" class="object-contain h-20"></div><div class="p-4 flex flex-col justify-center"><h3 class="font-bold text-lg">Research Fellow</h3><p class="text-xs text-gray-500 uppercase tracking-wider">CNRS@CREATE (Singapore) | 1 Year (2023 - 2024)</p><p class="text-sm text-gray-700 mt-2">Studied how viewpoints shaped virtual navigation.</p></div></div>` },
            { category: 'publication', date: '2023-05-01', html: `<a href="pdfs/paper3.pdf" target="_blank" class="block"><div class="portfolio-card glassy-effect rounded-2xl overflow-hidden shadow-md h-full"><div class="p-4 flex flex-col justify-center"><p class="text-sm uppercase tracking-wider mb-1">MAY 2023, <span class="text-gray-700 normal-case">In IEEE Conference on Virtual Reality and 3D User Interfaces Abstracts and Workshops</span></p><h3 class="font-bold text-lg">Telexistence-based remote maintenance for marine engineers</h3><p class="text-xs text-gray-500 uppercase tracking-wider mt-2"><b>D Mazeas</b>, JA Erkoyuncu, F Noel</p></div></div></a>` },
            { category: 'employment', date: '2023-02-01', html: `<div class="portfolio-card glassy-effect flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-md h-full"><div class="w-full sm:w-24 flex items-center justify-center p-4"><img src="images/logos/gscop.jpg" alt="G-SCOP Lab Logo" class="object-contain h-20"></div><div class="p-4 flex flex-col justify-center"><h3 class="font-bold text-lg">Visiting PhD Student</h3><p class="text-xs text-gray-500 uppercase tracking-wider">G-SCOP LAB (Grenoble, France) | 6 Months (2023)</p><p class="text-sm text-gray-700 mt-2">Designed a framework for expert-worker virtual reality remote collaboration.</p></div></div>` },
            { category: 'publication', date: '2023-02-01', html: `<a href="pdfs/paper2.pdf" target="_blank" class="block"><div class="portfolio-card glassy-effect rounded-2xl overflow-hidden shadow-md h-full"><div class="p-4 flex flex-col justify-center"><p class="text-sm uppercase tracking-wider mb-1">FEBRUARY 2023, <span class="text-gray-700 normal-case">In IFIP International Conference on Product Lifecycle Management</span></p><h3 class="font-bold text-lg">A telexistence interface for remote control of a physical industrial robot via data distribution service</h3><p class="text-xs text-gray-500 uppercase tracking-wider mt-2"><b>D Mazeas</b>, JA Erkoyuncu, F Noel</p></div></div></a>` },
            { category: 'side-projects', date: '2022-11-01', html: `<a href="ur16e.html" class="block"><div class="portfolio-card glassy-effect flex items-center rounded-2xl overflow-hidden shadow-md h-full p-4"><div class="w-16 flex-shrink-0 flex items-center justify-center"><img src="images/social/Octicons-mark-github.svg.png" class="h-8 w-8"></div><div class="flex-grow"><h3 class="font-bold text-lg">Universal Robots 16e inverse kinematics in Unity3D</h3><p class="text-xs text-gray-500 uppercase tracking-wider">GitHub Project</p></div></div></a>` },
            { category: 'side-projects', date: '2022-10-01', html: `<a href="https://youtu.be/3zTs_7LXH3Y" target="_blank" class="block"><div class="portfolio-card glassy-effect flex items-center rounded-2xl overflow-hidden shadow-md h-full p-4"><div class="w-16 flex-shrink-0 flex items-center justify-center"><img src="images/social/Youtube_logo.png" class="h-6"></div><div class="flex-grow"><h3 class="font-bold text-lg">Linking FANUC Roboguide software with Unity 3D</h3><p class="text-xs text-gray-500 uppercase tracking-wider">YouTube Demo</p></div></div></a>` },
            { category: 'side-projects', date: '2022-09-01', html: `<a href="https://youtu.be/SFfLPbs9-ws" target="_blank" class="block"><div class="portfolio-card glassy-effect flex items-center rounded-2xl overflow-hidden shadow-md h-full p-4"><div class="w-16 flex-shrink-0 flex items-center justify-center"><img src="images/social/Youtube_logo.png" class="h-6"></div><div class="flex-grow"><h3 class="font-bold text-lg">Pick and place programmed with a FANUC robot</h3><p class="text-xs text-gray-500 uppercase tracking-wider">YouTube Demo</p></div></div></a>` },
            { category: 'side-projects', date: '2022-08-01', html: `<a href="https://youtu.be/m4l9wxIvU98" target="_blank" class="block"><div class="portfolio-card glassy-effect flex items-center rounded-2xl overflow-hidden shadow-md h-full p-4"><div class="w-16 flex-shrink-0 flex items-center justify-center"><img src="images/social/Youtube_logo.png" class="h-6"></div><div class="flex-grow"><h3 class="font-bold text-lg">Remote control of a TurtleBot2 with the HoloLens 2</h3><p class="text-xs text-gray-500 uppercase tracking-wider">YouTube Demo</p></div></div></a>` },
            { category: 'side-projects', date: '2022-07-01', html: `<a href="https://www.maintenanceandengineering.com/2021/06/16/emerging-technologies-to-support-asset-management/" target="_blank" class="block"><div class="portfolio-card glassy-effect flex items-center rounded-2xl overflow-hidden shadow-md h-full p-4"><div class="w-16 flex-shrink-0 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div><div class="flex-grow"><h3 class="font-bold text-lg">Emerging tech to support asset management</h3><p class="text-xs text-gray-500 uppercase tracking-wider">Technical Article</p></div></div></a>` },
            { category: 'side-projects', date: '2022-06-01', html: `<a href="https://youtu.be/x-0PAZydMrk?si=yNJKiUbViiESZV_v" target="_blank" class="block"><div class="portfolio-card glassy-effect flex items-center rounded-2xl overflow-hidden shadow-md h-full p-4"><div class="w-16 flex-shrink-0 flex items-center justify-center"><img src="images/social/Youtube_logo.png" class="h-6"></div><div class="flex-grow"><h3 class="font-bold text-lg">Visualization of an injection moulding in VR</h3><p class="text-xs text-gray-500 uppercase tracking-wider">YouTube Demo</p></div></div></a>` },
            { category: 'side-projects', date: '2022-05-01', html: `<a href="https://youtu.be/Zn1bKinud8s?si=my8Fv56XyIeIKABA" target="_blank" class="block"><div class="portfolio-card glassy-effect flex items-center rounded-2xl overflow-hidden shadow-md h-full p-4"><div class="w-16 flex-shrink-0 flex items-center justify-center"><img src="images/social/Youtube_logo.png" class="h-6"></div><div class="flex-grow"><h3 class="font-bold text-lg">Training procedure for starting a production line in VR</h3><p class="text-xs text-gray-500 uppercase tracking-wider">YouTube Demo</p></div></div></a>` },
            { category: 'certification', date: '2021-09-01', html: `<div class="portfolio-card glassy-effect flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-md h-full"><div class="w-full sm:w-24 flex items-center justify-center p-4"><img src="images/logos/fanuc.png" alt="FANUC Logo" class="object-contain h-12"></div><div class="p-4 flex flex-col justify-center"><p class="text-xs text-gray-500 uppercase tracking-wider">SEP 2021</p><h3 class="font-bold text-lg">Standard Teach Pendant Programming</h3><p class="text-sm text-gray-700 mt-1">FANUC</p></div></div>` },
            { category: 'publication', date: '2020-06-01', html: `<a href="pdfs/paper1.pdf" target="_blank" class="block"><div class="portfolio-card glassy-effect rounded-2xl overflow-hidden shadow-md h-full"><div class="p-4 flex flex-col justify-center"><p class="text-sm uppercase tracking-wider mb-1">JUNE 2020, <span class="text-gray-700 normal-case">In Proceedings of the design society: DESIGN conference</span></p><h3 class="font-bold text-lg">IMPRO: Immersive prototyping in virtual environments for industrial designers</h3><p class="text-xs text-gray-500 uppercase tracking-wider mt-2">S Stadler, H Cornet, <b>D Mazeas*</b>, JR Chardonnet, F Frenkler (*App development, experiment design, data collection, and analysis)</p></div></div></a>` },
            { category: 'employment', date: '2020-01-01', html: `<div class="portfolio-card glassy-effect flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-md h-full"><div class="w-full sm:w-24 flex items-center justify-center p-4"><img src="images/logos/safran.png" alt="Safran Logo" class="object-contain h-20"></div><div class="p-4 flex flex-col justify-center"><h3 class="font-bold text-lg">Solutions Engineer</h3><p class="text-xs text-gray-500 uppercase tracking-wider">SAFRAN LANDING SYSTEMS (Gloucester, UK) | 6 Months (2020)</p><p class="text-sm text-gray-700 mt-2">Assisted with the implementation of augmented reality solutions for maintenance.</p></div></div>` },
            { category: 'employment', date: '2019-10-01', html: `<div class="portfolio-card glassy-effect flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-md h-full"><div class="w-full sm:w-24 flex items-center justify-center p-4"><img src="images/logos/sec.png" alt="SEC Logo" class="object-contain h-30"></div><div class="p-4 flex flex-col justify-center"><h3 class="font-bold text-lg">Freelance</h3><p class="text-xs text-gray-500 uppercase tracking-wider">SINGAPORE-ETH CENTRE (Remote) | 4 Months (2019 - 2020)</p><p class="text-sm text-gray-700 mt-2">Developed Unity 3D applications to study human navigation in isolation.</p></div></div>` },
            { category: 'degree', date: '2019-09-01', html: `<div class="portfolio-card glassy-effect flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-md h-full"><div class="w-full sm:w-24 flex items-center justify-center p-4"><img src="images/logos/artsetmetiers.svg" alt="Arts et Métiers Logo" class="object-contain h-30"></div><div class="p-4 flex flex-col justify-center"><p class="text-xs text-gray-500 uppercase tracking-wider">SEP 2019</p><h3 class="font-bold text-lg">Master's degree in Digital Engineering</h3><p class="text-sm text-gray-700 mt-1">Arts et Metiers (France) - Institute Image</p></div></div>` },
            { category: 'employment', date: '2019-04-01', html: `<div class="portfolio-card glassy-effect flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-md h-full"><div class="w-full sm:w-24 flex items-center justify-center p-4"><img src="images/logos/tumcreate.png" alt="TUMCREATE Logo" class="object-contain h-20"></div><div class="p-4 flex flex-col justify-center"><h3 class="font-bold text-lg">Research Assistant</h3><p class="text-xs text-gray-500 uppercase tracking-wider">TUMCREATE (Singapore) | 6 Months (2019)</p><p class="text-sm text-gray-700 mt-2">Studied the use of virtual reality for industrial designers.</p></div></div>` },
            { category: 'employment', date: '2018-09-01', html: `<div class="portfolio-card glassy-effect flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-md h-full"><div class="w-full sm:w-24 flex items-center justify-center p-4"><img src="images/logos/orano.svg" alt="Orano Logo" class="object-contain h-20"></div><div class="p-4 flex flex-col justify-center"><h3 class="font-bold text-lg">Virtual Reality Intern</h3><p class="text-xs text-gray-500 uppercase tracking-wider">ORANO (Cherbourg, France) | 6 Months (2018)</p><p class="text-sm text-gray-700 mt-2">Prepared project reviews for the design office using IC.IDO, Unity 3D, PiXYZ, SolidWorks, and Autodesk Navisworks.</p></div></div>` },
            { category: 'degree', date: '2017-07-01', html: `<div class="portfolio-card glassy-effect flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-md h-full"><div class="w-full sm:w-24 flex items-center justify-center p-4"><img src="images/logos/poitiers.png" alt="University of Poitiers Logo" class="object-contain h-20"></div><div class="p-4 flex flex-col justify-center"><p class="text-xs text-gray-500 uppercase tracking-wider">JUL 2017</p><h3 class="font-bold text-lg">Professional Bachelor's degree in Industrial Design</h3><p class="text-sm text-gray-700 mt-1">University of Poitiers (France)</p></div></div>` },
            { category: 'employment', date: '2017-04-01', html: `<div class="portfolio-card glassy-effect flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-md h-full"><div class="w-full sm:w-24 flex items-center justify-center p-4"><img src="images/logos/vernetdray.png" alt="Vernet Dray Logo" class="object-contain h-20"></div><div class="p-4 flex flex-col justify-center"><h3 class="font-bold text-lg">SolidWorks Intern</h3><p class="text-xs text-gray-500 uppercase tracking-wider">VERNET DRAY (Lyon, France) | 4 Months (2017)</p><p class="text-sm text-gray-700 mt-2">Modeled jewelry and created technical drawings on SolidWorks.</p></div></div>` },
            { category: 'degree', date: '2016-06-01', html: `<div class="portfolio-card glassy-effect flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-md h-full"><div class="w-full sm:w-24 flex items-center justify-center p-4"><img src="images/logos/tours.png" alt="University of Tours Logo" class="object-contain h-20"></div><div class="p-4 flex flex-col justify-center"><p class="text-xs text-gray-500 uppercase tracking-wider">JUN 2016</p><h3 class="font-bold text-lg">Associate's degree in Materials Engineering</h3><p class="text-sm text-gray-700 mt-1">University of Tours (France)</p></div></div>` },
            { category: 'employment', date: '2016-04-01', html: `<div class="portfolio-card glassy-effect flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-md h-full"><div class="w-full sm:w-24 flex items-center justify-center p-4"><img src="images/logos/europoly.png" alt="EUROPOLY Logo" class="object-contain h-20"></div><div class="p-4 flex flex-col justify-center"><h3 class="font-bold text-lg">Methods Intern</h3><p class="text-xs text-gray-500 uppercase tracking-wider">EUROPOLY (Lyon, France) | 3 Months (2016)</p><p class="text-sm text-gray-700 mt-2">Programmed a 3-axis CNC on Autodesk ArtCAM and produced technical drawings on SolidWorks.</p></div></div>` }
        ];

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
            const isDarkMode = document.body.classList.contains('dark');
            document.querySelectorAll('.portfolio-item').forEach(item => {
                const category = item.dataset.category;
                const card = item.querySelector('.portfolio-card');
                if (category && filterColors[category] && card) {
                    const rgb = filterColors[category].rgb;
                    const backgroundOpacity = isDarkMode ? 0.25 : 0.55;
                    const borderOpacity = isDarkMode ? 0.4 : 0.7;
                    card.style.backgroundColor = `rgba(${rgb}, ${backgroundOpacity})`;
                    card.style.borderColor = `rgba(${rgb}, ${borderOpacity})`;
                }
            });
        }

        function animateItems(filter = 'all') {
            const items = document.querySelectorAll('.portfolio-item');
            let delay = 0;
            items.forEach(item => {
                const categories = item.dataset.category.split(' ');
                let shouldShow = categories.includes('side-projects') ? (filter === 'side-projects') : (filter === 'all' || categories.includes(filter));

                if (shouldShow) {
                    item.style.display = 'block';
                    setTimeout(() => item.classList.add('is-visible'), delay);
                    delay += 50;
                } else {
                    item.classList.remove('is-visible');
                    setTimeout(() => { item.style.display = 'none'; }, 500);
                }
            });
        }

        function renderPortfolio(sortOrder) {
            if (sortOrder === 'newest') {
                portfolioData.sort((a, b) => new Date(b.date) - new Date(a.date));
            } else { // 'oldest'
                portfolioData.sort((a, b) => new Date(a.date) - new Date(b.date));
            }

            const currentFilter = filterContainer ? filterContainer.querySelector('.active').dataset.filter : 'all';
            const gridHTML = portfolioData.map(item => `<div class="portfolio-item" data-category="${item.category}">${item.html}</div>`).join('');
            portfolioGrid.innerHTML = gridHTML;
            applyFilterColorToCards();
            animateItems(currentFilter);
        }

        filterButtons.forEach(btn => {
            const filter = btn.dataset.filter;
            if (filter && filterColors[filter]) {
                btn.style.setProperty('--filter-color', filterColors[filter].hex);
                btn.style.setProperty('--filter-color-rgb', filterColors[filter].rgb);
                btn.style.setProperty('--filter-color-active', filterColors[filter].nonPastelHex);
            }
        });

        renderPortfolio(currentSortOrder);
        updateTheme('all');

        window.addEventListener('mousemove', e => {
            cursorBlob.animate({
                left: `${e.clientX}px`,
                top: `${e.clientY}px`
            }, { duration: 2000, fill: "forwards" });
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
                setTimeout(() => { blob.style.transform = ''; }, 500);
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
                    animateItems(filter);
                }
            });
        }

        if (sortToggleButton) {
            sortToggleButton.addEventListener('click', () => {
                if (currentSortOrder === 'newest') {
                    currentSortOrder = 'oldest';
                    sortToggleButton.textContent = 'Sort by Newest';
                } else {
                    currentSortOrder = 'newest';
                    sortToggleButton.textContent = 'Sort by Oldest';
                }
                renderPortfolio(currentSortOrder);
            });
        }
    }

    // Contact Page Logic
    if (document.body.id === 'contact-page') {
        const canvas = document.getElementById('constellation-canvas');
        if (canvas) { // Only run if canvas exists
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
                        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                        hue: Math.floor(Math.random() * 360), size: Math.random() * 2 + 1,
                        speedX: (Math.random() - 0.5) * 0.5, speedY: (Math.random() - 0.5) * 0.5
                    });
                }
            }

            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const nearbyDots = [];
                const allVisibleDots = new Set(persistentDots);

                for (const dot of dots) {
                    dot.x += dot.speedX; dot.y += dot.speedY;
                    if (dot.x < 0) dot.x = canvas.width; if (dot.x > canvas.width) dot.x = 0;
                    if (dot.y < 0) dot.y = canvas.height; if (dot.y > canvas.height) dot.y = 0;

                    let isNearby = false;
                    if (mouse.x !== null) {
                        const distMouse = Math.hypot(mouse.x - dot.x, mouse.y - dot.y);
                        if (distMouse < dotConnectionDistance) {
                            isNearby = true;
                            nearbyDots.push(dot);
                            allVisibleDots.add(dot);
                        }
                    }

                    if (persistentDots.has(dot) || isNearby) {
                        const opacity = isNearby ? 1 - (Math.hypot(mouse.x - dot.x, mouse.y - dot.y) / dotConnectionDistance) : 0.8;
                        ctx.beginPath();
                        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
                        ctx.fillStyle = `hsla(${dot.hue}, 80%, 70%, ${opacity})`;
                        ctx.fill();
                    }
                }

                nearbyDots.forEach(dot => {
                    const distMouse = Math.hypot(mouse.x - dot.x, mouse.y - dot.y);
                    const opacity = 1 - (distMouse / dotConnectionDistance);
                    ctx.beginPath();
                    ctx.moveTo(dot.x, dot.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `hsla(${dot.hue}, 80%, 70%, ${opacity})`;
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
                            ctx.strokeStyle = `hsla(${dot1.hue}, 80%, 70%, ${opacity * 0.6})`;
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
            window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

            window.addEventListener('click', e => {
                const dotsToMakePersistent = dots.filter(dot => {
                    const dist = Math.hypot(e.clientX - dot.x, e.clientY - dot.y);
                    return dist < dotConnectionDistance;
                });
                dotsToMakePersistent.forEach(dot => persistentDots.add(dot));
            });
        }
    }

    // --- Global Custom Cursor Logic ---
    window.addEventListener('mousemove', e => {
        if (cursorDot) {
            cursorDot.style.left = `${e.clientX}px`;
            cursorDot.style.top = `${e.clientY}px`;
        }
        if (cursorOutline) {
            cursorOutline.animate({
                left: `${e.clientX}px`,
                top: `${e.clientY}px`
            }, { duration: 500, fill: "forwards" });
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