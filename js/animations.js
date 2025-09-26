const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');
const interactiveElements = document.querySelectorAll('a, button, .cursor-pointer');
const backgroundContainer = document.getElementById('background-container');
const cursorBlob = document.getElementById('cursor-blob');

function initCursor() {
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
}

function initBlobs() {
    window.addEventListener('mousemove', e => {
        if (cursorBlob) {
            cursorBlob.animate({ left: `${e.clientX}px`, top: `${e.clientY}px` }, { duration: 2000, fill: "forwards" });
        }
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
}

function initConstellation() {
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

                if (persistentDots.has(dot) || isNearby) {
                    const finalOpacity = (mouseProximityOpacity > 0 ? mouseProximityOpacity : 0.3) * blobProximityOpacity;
                    ctx.beginPath();
                    ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${dot.hue}, 80%, 70%, ${finalOpacity})`;
                    ctx.fill();
                }
            }

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

export function initAnimations() {
    if (document.body.id === 'home-page') {
        initCursor();
        initBlobs();
        initConstellation();
    }
}