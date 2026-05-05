


/* Source: index.html */
try {

/* * =========================================
     * CAROUSEL IMAGE CONFIGURATION
     * =========================================
     * Add or remove image links here. 
     * The code will automatically create slides for them
     * and crop them to fit (object-fit: cover).
     */
    const carouselImages = [
        "https://images.pexels.com/photos/14553706/pexels-photo-14553706.jpeg",
        "https://images.pexels.com/photos/15109652/pexels-photo-15109652.jpeg",
        "https://images.pexels.com/photos/159304/network-cable-ethernet-computer-159304.jpeg"
    ];

    /* ================= NAVBAR SCROLL LOGIC ================= */
    (() => {
        const navbar = document.getElementById("navbar");
        let lastY = window.scrollY;
        let ticking = false;
        const THRESH = 10;

        function update() {
            const y = window.scrollY;
            const diff = y - lastY;

            // Always show if near top
            if (y <= 10) {
                navbar.classList.remove("isHidden");
            } 
            // Hide if scrolling down significantly
            else if (diff > THRESH) {
                navbar.classList.add("isHidden");
            } 
            // Show if scrolling up significantly
            else if (diff < -THRESH) {
                navbar.classList.remove("isHidden");
            }

            lastY = y;
            ticking = false;
        }

        window.addEventListener("scroll", () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
    })();

    /* ================= MOBILE MENU LOGIC ================= */
    (() => {
        const hamburger = document.getElementById("hamburger");
        const navLinks = document.getElementById("navLinks");
        const navbar = document.getElementById("navbar");
        
        // toggle main menu
        hamburger.addEventListener("click", (e) => {
            e.stopPropagation();
            const isActive = hamburger.classList.toggle("active");
            navLinks.classList.toggle("active");
            hamburger.setAttribute("aria-expanded", isActive);
        });

        // Close menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!navbar.contains(e.target) && navLinks.classList.contains("active")) {
                hamburger.classList.remove("active");
                navLinks.classList.remove("active");
                hamburger.setAttribute("aria-expanded", false);
            }
        });

        // ================= DROPDOWN HANDLING ================= //
        
        // 1. Handle Top-Level Dropdowns (Services)
        const dropdownToggles = document.querySelectorAll('.hasDropdown > .navLinkBtn');
        
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                // Only intercept click on mobile (< 640px)
                if (window.innerWidth <= 640) {
                    e.preventDefault(); // Prevent navigation/hash jump
                    const parent = toggle.parentElement;
                    
                    // Close other open dropdowns (optional - accordion style)
                    document.querySelectorAll('.navItem.hasDropdown.open').forEach(item => {
                        if (item !== parent) item.classList.remove('open');
                    });

                    parent.classList.toggle('open');
                }
            });
        });

        // 2. Handle Nested Submenus (Marketing -> SEO)
        const subMenuToggles = document.querySelectorAll('.hasSubmenu > .mainBtn');
        
        subMenuToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                // Intercept clicks on both mobile and desktop (since this is a button, not a link)
                // If it were a link, we'd check window width like above
                e.preventDefault();
                e.stopPropagation(); // Prevent bubbling to parent dropdown
                
                const parent = toggle.parentElement;
                parent.classList.toggle('open');
            });
        });

    })();

    /* ================= CAROUSEL LOGIC ================= */
    (() => {
        const container = document.getElementById('carouselContainer');
        const intervalTime = 5000; // 5 seconds
        let slides = [];
        let currentSlide = 0;

        // 1. Initialize Slides from Config Array
        function initCarousel() {
            // Clear any existing slides (except overlay/content which are separate or we append)
            // Note: overlay/content are already in HTML, we just want to append slides.
            
            carouselImages.forEach((url, index) => {
                const slideDiv = document.createElement('div');
                slideDiv.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
                
                const img = document.createElement('img');
                img.src = url;
                img.alt = "Slide Image"; // Decorative background
                
                slideDiv.appendChild(img);
                container.appendChild(slideDiv);
            });

            // Get references to the newly created slides
            slides = document.querySelectorAll('.carousel-slide');
        }

        // 2. Start Animation Loop
        function nextSlide() {
            if (slides.length === 0) return;

            // Remove active class from current
            slides[currentSlide].classList.remove('active');
            
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (carouselImages.length > 0) {
            initCarousel();
            if (!prefersReducedMotion) {
                setInterval(nextSlide, intervalTime);
            }
        }
    })();

    /* ================= REVIEWS AUTO-SCROLL (grab to drag) ================= */
    (() => {
        const viewport = document.getElementById('reviewsViewport');
        const track = document.getElementById('reviewsTrack');
        if (!viewport || !track) return;

        const CARD_WIDTH = 350;
        const GAP = 30;
        const STEP = CARD_WIDTH + GAP;
        const CARDS_PER_SET = 5;
        const SET_WIDTH = CARDS_PER_SET * STEP;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const SPEED = 45;

        let position = 0;
        let dragging = false;
        let dragStartX = 0;
        let dragStartPosition = 0;
        let rafId = null;
        let lastTime = 0;

        function wrapPosition(p) {
            while (p >= SET_WIDTH) p -= SET_WIDTH;
            while (p < 0) p += SET_WIDTH;
            return p;
        }

        function setTrackPosition(px) {
            track.style.transform = `translateX(-${px}px)`;
        }

        function tick(now) {
            if (!lastTime) lastTime = now;
            const dt = (now - lastTime) / 1000;
            lastTime = now;
            if (!dragging && !prefersReducedMotion) {
                position += SPEED * dt;
                if (position >= SET_WIDTH) position -= SET_WIDTH;
                setTrackPosition(position);
            }
            rafId = requestAnimationFrame(tick);
        }

        function onPointerDown(e) {
            if (e.button !== 0 && e.type === 'mousedown') return;
            dragging = true;
            track.classList.add('is-dragging');
            dragStartX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
            dragStartPosition = position;
            viewport.setPointerCapture?.(e.pointerId);
            e.preventDefault();
        }

        function onPointerMove(e) {
            if (!dragging) return;
            const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
            position = dragStartPosition + (dragStartX - clientX);
            setTrackPosition(position);
        }

        function onPointerUp(e) {
            if (e.type === 'mouseup' && e.button !== 0) return;
            dragging = false;
            track.classList.remove('is-dragging');
            position = wrapPosition(position);
            setTrackPosition(position);
            viewport.releasePointerCapture?.(e.pointerId);
        }

        viewport.addEventListener('pointerdown', onPointerDown, { passive: false });
        viewport.addEventListener('pointermove', onPointerMove, { passive: true });
        viewport.addEventListener('pointerup', onPointerUp, { passive: true });
        viewport.addEventListener('pointerleave', onPointerUp, { passive: true });
        viewport.addEventListener('pointercancel', onPointerUp, { passive: true });

        setTrackPosition(0);
        rafId = requestAnimationFrame(tick);
    })();

    /* ================= SCROLL ANIMATIONS ================= */
    (() => {
        const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    })();

} catch (e) { console.warn('Ignored error in script block from index.html:', e); }


/* Source: about.html */
try {

/* ================= NAVBAR SCROLL LOGIC ================= */
    (() => {
        const navbar = document.getElementById("navbar");
        let lastY = window.scrollY;
        let ticking = false;
        const THRESH = 10;

        function update() {
            const y = window.scrollY;
            const diff = y - lastY;

            // Always show if near top
            if (y <= 10) {
                navbar.classList.remove("isHidden");
            } 
            // Hide if scrolling down significantly
            else if (diff > THRESH) {
                navbar.classList.add("isHidden");
            } 
            // Show if scrolling up significantly
            else if (diff < -THRESH) {
                navbar.classList.remove("isHidden");
            }

            lastY = y;
            ticking = false;
        }

        window.addEventListener("scroll", () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
    })();

    /* ================= MOBILE MENU LOGIC ================= */
    (() => {
        const hamburger = document.getElementById("hamburger");
        const navLinks = document.getElementById("navLinks");
        const navbar = document.getElementById("navbar");
        
        // toggle main menu
        hamburger.addEventListener("click", (e) => {
            e.stopPropagation();
            const isActive = hamburger.classList.toggle("active");
            navLinks.classList.toggle("active");
            hamburger.setAttribute("aria-expanded", isActive);
        });

        // Close menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!navbar.contains(e.target) && navLinks.classList.contains("active")) {
                hamburger.classList.remove("active");
                navLinks.classList.remove("active");
                hamburger.setAttribute("aria-expanded", false);
            }
        });

        // ================= DROPDOWN HANDLING ================= //
        
        // 1. Handle Top-Level Dropdowns (Services)
        const dropdownToggles = document.querySelectorAll('.hasDropdown > .navLinkBtn');
        
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                // Only intercept click on mobile (< 640px)
                if (window.innerWidth <= 640) {
                    e.preventDefault(); // Prevent navigation/hash jump
                    const parent = toggle.parentElement;
                    
                    // Close other open dropdowns
                    document.querySelectorAll('.navItem.hasDropdown.open').forEach(item => {
                        if (item !== parent) item.classList.remove('open');
                    });

                    parent.classList.toggle('open');
                }
            });
        });

        // 2. Handle Nested Submenus
        const subMenuToggles = document.querySelectorAll('.hasSubmenu > .mainBtn');
        
        subMenuToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent bubbling to parent dropdown
                
                const parent = toggle.parentElement;
                parent.classList.toggle('open');
            });
        });

    })();

    /* ================= SCROLL ANIMATIONS & COUNTERS ================= */
    (() => {
        const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    
                    // Trigger counters if this element has them
                    const counters = entry.target.querySelectorAll('.stat-num');
                    counters.forEach(counter => {
                        if (!counter.classList.contains('counted')) {
                            counter.classList.add('counted');
                            const target = +counter.getAttribute('data-target');
                            const duration = 2000;
                            const step = target / (duration / 16);
                            let current = 0;
                            
                            const updateCounter = () => {
                                current += step;
                                if (current < target) {
                                    counter.innerText = Math.ceil(current);
                                    requestAnimationFrame(updateCounter);
                                } else {
                                    counter.innerText = target;
                                }
                            };
                            updateCounter();
                        }
                    });
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    })();

} catch (e) { console.warn('Ignored error in script block from about.html:', e); }


/* Source: contact.html */
try {

/* ================= NAVBAR LOGIC ================= */
    (() => {
        const navbar = document.getElementById("navbar");
        let lastY = window.scrollY;
        let ticking = false;
        const THRESH = 10;

        function update() {
            const y = window.scrollY;
            const diff = y - lastY;
            if (y <= 10) navbar.classList.remove("isHidden");
            else if (diff > 10) navbar.classList.add("isHidden");
            else if (diff < -10) navbar.classList.remove("isHidden");
            lastY = y;
            ticking = false;
        }

        window.addEventListener("scroll", () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
    })();

    /* ================= MOBILE MENU LOGIC ================= */
    (() => {
        const hamburger = document.getElementById("hamburger");
        const navLinks = document.getElementById("navLinks");
        const navbar = document.getElementById("navbar");
        
        hamburger.addEventListener("click", (e) => {
            e.stopPropagation();
            const isActive = hamburger.classList.toggle("active");
            navLinks.classList.toggle("active");
            hamburger.setAttribute("aria-expanded", isActive);
        });

        document.addEventListener("click", (e) => {
            if (!navbar.contains(e.target) && navLinks.classList.contains("active")) {
                hamburger.classList.remove("active");
                navLinks.classList.remove("active");
                hamburger.setAttribute("aria-expanded", false);
            }
        });

        // 1. Handle Top-Level Dropdowns
        document.querySelectorAll('.hasDropdown > .navLinkBtn').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 640) {
                    e.preventDefault();
                    const parent = toggle.parentElement;
                    document.querySelectorAll('.navItem.hasDropdown.open').forEach(item => {
                        if (item !== parent) item.classList.remove('open');
                    });
                    parent.classList.toggle('open');
                }
            });
        });

        // 2. Handle Nested Submenus
        document.querySelectorAll('.hasSubmenu > .mainBtn').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const parent = toggle.parentElement;
                parent.classList.toggle('open');
            });
        });
    })();

} catch (e) { console.warn('Ignored error in script block from contact.html:', e); }


/* Source: services.html */
try {

// --- SERVICE DATA CONSOLIDATION ---
    const serviceData = {
        'web-development': {
            category: 'Digital Services',
            title: 'Web Development',
            tags: ['Discovery & UX', 'Responsive Build', 'CMS & Integrations'],
            desc: 'We build professional websites and custom web solutions that help businesses present their brand clearly, convert more visitors, and support day-to-day operations with reliable performance.',
            keyPoints: [
                'Clear planning around user experience and calls to action.',
                'Mobile-friendly builds with strong performance and accessibility.',
                'Support for forms, content management, and integrations.'
            ],
            highlights: [
                { label: 'Project Types', val: 'Business websites, landing pages, and custom portals', desc: 'Designed to look credible and guide visitors toward the right next step.' },
                { label: 'Business Focus', val: 'Lead generation, trust, and usability', desc: 'We keep the build practical and aligned with your operations.' }
            ],
            included: ['Discovery & planning', 'Custom layouts', 'Basic SEO & Analytics'],
            extraLabel: 'Best Fit For',
            extraList: ['Outdated online presences', 'Teams needing more than a basic builder', 'Scalable growth sites'],
            ctaTitle: 'Planning a new website?',
            ctaDesc: 'We can help you scope the right structure and features before dev begins.'
        },
        'infrastructure-hosting': {
            category: 'Digital Services',
            title: 'Infrastructure Hosting',
            tags: ['Managed Environments', 'Monitoring & Backups', 'Scalable Capacity'],
            desc: 'Managed hosting solutions for websites and business systems that need dependable uptime and clear oversight.',
            keyPoints: [
                'Hosting aligned to your workload and security needs.',
                'Ongoing monitoring and update planning.',
                'Professional support for migrations and performance tuning.'
            ],
            highlights: [
                { label: 'Coverage', val: 'Managed hosting, migrations, and ongoing oversight', desc: 'Focused on resilience and change control.' },
                { label: 'Priority', val: 'Availability, recovery readiness, and predictable performance', desc: 'Ready for future growth.' }
            ],
            included: ['Provisioning & deployment', 'Backup scheduling', 'Hardening'],
            extraLabel: 'Ideal For',
            extraList: ['Businesses needing more oversight', 'Internal tools & client platforms', 'Teams needing clear accountability'],
            ctaTitle: 'Need dependable hosting?',
            ctaDesc: 'We can review your current environment and recommend a migration path.'
        },
        'server-configuration': {
            category: 'Digital Services',
            title: 'Server Configuration',
            tags: ['Windows & Linux', 'Security Hardening', 'Documentation'],
            desc: 'Configuring servers for stable operations, secure access, and dependable performance across on-prem or cloud.',
            keyPoints: [
                'Role-based configuration for file services and workloads.',
                'Attention to patching and access control.',
                'Clear documentation for long-term maintenance.'
            ],
            highlights: [
                { label: 'Scope', val: 'Server builds, roles, policies, and remote admin', desc: 'Practical systems easier to support after deployment.' },
                { label: 'Outcome', val: 'Stable infrastructure with clear guidance', desc: 'Keeping the environment manageable afterward.' }
            ],
            included: ['Deployment & service validation', 'Security policy setup', 'Virtualization support'],
            extraLabel: 'Best Fit For',
            extraList: ['First-time server environments', 'Cleaning up aging infrastructure', 'Teams needing dependable configurations'],
            ctaTitle: 'Need a server configured?',
            ctaDesc: 'We help plan, deploy, or clean up server environments that are built to last.'
        },
        'pc-building': {
            category: 'Residential Services',
            title: 'PC Planning & Building',
            tags: ['Workload-Based Design', 'Component Selection', 'Burn-In Testing'],
            desc: 'Custom PC design based on actual usage�gaming, business productivity, or high-performance workstations.',
            keyPoints: [
                'Parts selected for budget, workload, and reliability.',
                'Professional assembly with cable management.',
                'Validation and burn-in testing before delivery.'
            ],
            highlights: [
                { label: 'Build Types', val: 'Office systems, gaming PCs, and workstations', desc: 'Planned around the actual applications you use.' },
                { label: 'Finish', val: 'Clean assembly and ready-to-use delivery', desc: 'Professionally put together from day one.' }
            ],
            included: ['Consultation on budget/workload', 'Assembly & Thermal testing', 'OS Setup & Validation'],
            extraLabel: 'Best Fit For',
            extraList: ['Users avoiding pre-built compromises', 'Specific tasks like editing or AI', 'Users needing expert guidance'],
            ctaTitle: 'Need a custom system?',
            ctaDesc: 'Plan the right PC before spending on parts that don\'t match your needs.'
        },
        'hardware-support': {
            category: 'Residential Services',
            title: 'Hardware Support & Repair',
            tags: ['Diagnostics', 'Component Replacement', 'Preventive Care'],
            desc: 'Resolving hardware problems for desktops, laptops, and storage with practical repair recommendations.',
            keyPoints: [
                'Structured troubleshooting to find the root cause.',
                'Repair vs. Replacement guidance based on value.',
                'Careful handling for data protection.'
            ],
            highlights: [
                { label: 'Service Scope', val: 'Diagnostics, replacement, and restoration', desc: 'Determining what deliver the best outcome.' },
                { label: 'Goal', val: 'Extend equipment life where practical', desc: 'The right fix for the situation, not just a sale.' }
            ],
            included: ['Diagnostics for memory/cooling/power', 'Component replacement', 'Post-repair validation'],
            extraLabel: 'Common Issues',
            extraList: ['Systems that overheat or fail to boot', 'Damaged ports or storage faults', 'Aging equipment assessments'],
            ctaTitle: 'System failing or slowing down?',
            ctaDesc: 'Assess the issue and decide if repair or upgrade makes sense.'
        },
        'software-support': {
            category: 'Residential Services',
            title: 'Software Support',
            tags: ['Installation & Setup', 'Troubleshooting', 'User Guidance'],
            desc: 'Assistance with productivity tools, security apps, and business programs to reduce frustration and conflicts.',
            keyPoints: [
                'Support for setup, config, updates, and licensing.',
                'Troubleshooting for crashes and conflicts.',
                'Practical guidance for effective software use.'
            ],
            highlights: [
                { label: 'Support Areas', val: 'Productivity, security, email, and business apps', desc: 'Focusing on apps that need to work properly for real users.' },
                { label: 'Outcome', val: 'Stable systems and confident users', desc: 'Reducing recurring issues through better config.' }
            ],
            included: ['Profile configuration', 'Resolution of conflicts', 'Maintenance guidance'],
            extraLabel: 'Best Fit For',
            extraList: ['Correct config without trial & error', 'Onboarding new applications', 'Repeated issues that basic steps didn\'t fix'],
            ctaTitle: 'Software not behaving?',
            ctaDesc: 'We can install, configure, or troubleshoot the apps your work depends on.'
        },
        'enterprise-networking': {
            category: 'Networking',
            title: 'Enterprise Networking',
            tags: ['Network Design', 'Secure Access', 'Ongoing Reliability'],
            desc: 'Business networking environments supporting staff, devices, and cloud services with performance and stability.',
            keyPoints: [
                'Business-focused planning for offices and multi-user growth.',
                'Traffic flow and firewall alignment.',
                'Emphasis on long-term maintainability.'
            ],
            highlights: [
                { label: 'Coverage', val: 'Switching, wireless, and firewall planning', desc: 'Supporting how users and services interact.' },
                { label: 'Value', val: 'Reliable connectivity for critical systems', desc: 'Reducing daily friction and enabling growth.' }
            ],
            included: ['Switching & Routing design', 'Segmentation', 'Support for cable runs'],
            extraLabel: 'Ideal Environments',
            extraList: ['Offices with shared resources', 'Growth-oriented businesses', 'Modernizing undocumented networks'],
            ctaTitle: 'Need a stronger network?',
            ctaDesc: 'Assessment and delivery of a network that performs more reliably.'
        },
        'home-networking': {
            category: 'Networking',
            title: 'Home Networking',
            tags: ['Wi-Fi Coverage', 'Smart Home Support', 'Performance Tuning'],
            desc: 'Improving home networking for streaming, work-from-home, gaming, and smart devices.',
            keyPoints: [
                'Solutions for dead zones and weak Wi-Fi.',
                'Mesh system and access point placement.',
                'Wired backhaul options for stability.'
            ],
            highlights: [
                { label: 'Improvements', val: 'Coverage and device stability', desc: 'Consistency where you actually use it.' },
                { label: 'Support', val: 'Mesh, security, and smart home', desc: 'Entertainment without daily frustration.' }
            ],
            included: ['Device load assessment', 'Mesh configuration', 'Security setup'],
            extraLabel: 'Best Fit For',
            extraList: ['Multi-floor homes with weak signal', 'Balancing streaming and work traffic', 'Guidance instead of guessing at hardware'],
            ctaTitle: 'Tired of weak Wi-Fi?',
            ctaDesc: 'Help improve performance throughout the home with practical changes.'
        },
        'voip-setup': {
            category: 'Networking',
            title: 'VoIP Setup & Installation',
            tags: ['Voice Systems', 'Call Routing', 'Network Readiness'],
            desc: 'Modernizing business phone service with VoIP to improve call handling and support hybrid work.',
            keyPoints: [
                'Extensions, handsets, and call flow design.',
                'Attention to voice quality and latency.',
                'Low-disruption transition planning.'
            ],
            highlights: [
                { label: 'Setup', val: 'Handsets, voicemail, and auto attendants', desc: 'Shaping a professional ??????? phone experience.' },
                { label: 'Outcome', val: 'Clearer communication with less friction', desc: 'Making day-to-day talk easier for staff and clients.' }
            ],
            included: ['Call flow structure', 'Voicemail setup', 'Readiness audit'],
            extraLabel: 'Best Fit For',
            extraList: ['Replacing traditional analog lines', 'Teams needing remote work flexibility', 'Polished client communication'],
            ctaTitle: 'Upgrading your phone system?',
            ctaDesc: 'Plan a VoIP setup that is clear, professional, and easier to manage.'
        }
    };

    window.openPanel = function(id) {
        const data = serviceData[id];
        if (!data) return;
        history.replaceState(null, '', '?open=' + id);
        const content = `
            <div class="panel-category">${data.category}</div>
            <h2 class="panel-title">${data.title}</h2>
            <div class="panel-tags">
                ${data.tags.map(t => `<span class="panel-tag">${t}</span>`).join('')}
            </div>
            <p class="panel-desc">${data.desc}</p>
            <ul class="panel-list">
                ${data.keyPoints.map(p => `<li>${p}</li>`).join('')}
            </ul>
            
            <div class="panel-highlight-grid">
                ${data.highlights.map(h => `
                    <div class="panel-highlight">
                        <span class="panel-highlight-label">${h.label}</span>
                        <strong class="panel-highlight-value">${h.val}</strong>
                        <p class="panel-highlight-desc">${h.desc}</p>
                    </div>
                `).join('')}
            </div>

            <h3 class="panel-section-title">What's Included</h3>
            <ul class="panel-list">
                ${data.included.map(i => `<li>${i}</li>`).join('')}
            </ul>

            <h3 class="panel-section-title">${data.extraLabel}</h3>
            <ul class="panel-list">
                ${data.extraList.map(e => `<li>${e}</li>`).join('')}
            </ul>

            <div class="panel-cta-box">
                <h4>${data.ctaTitle}</h4>
                <p>${data.ctaDesc}</p>
                <a href="../../pages/company/contact.html" class="primary-btn">Contact Us</a>
            </div>
        `;
        document.getElementById('panel-content').innerHTML = content;
        document.getElementById('service-panel').classList.add('active');
        document.getElementById('panel-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    window.closePanel = function() {
        document.getElementById('service-panel').classList.remove('active');
        document.getElementById('panel-overlay').classList.remove('active');
        document.body.style.overflow = 'auto';
        history.replaceState(null, '', window.location.pathname);
    }

    // Auto-open panel from URL param (e.g. services.html?open=web-development)
    // Delay 1s so the page has time to render before the panel slides in
    const _autoOpen = new URLSearchParams(window.location.search).get('open');
    if (_autoOpen && serviceData[_autoOpen]) setTimeout(() => openPanel(_autoOpen), 1000);

    // --- ANIMATIONS & NAVBAR LOGIC ---
    /* ================= NAVBAR SCROLL LOGIC ================= */
    (() => {
        const navbar = document.getElementById("navbar");
        let lastY = window.scrollY;
        let ticking = false;
        const THRESH = 10;

        function update() {
            const y = window.scrollY;
            const diff = y - lastY;
            if (y <= 10) {
                navbar.classList.remove("isHidden");
            } else if (diff > THRESH) {
                navbar.classList.add("isHidden");
            } else if (diff < -THRESH) {
                navbar.classList.remove("isHidden");
            }
            lastY = y;
            ticking = false;
        }

        window.addEventListener("scroll", () => {
            if (!ticking) { requestAnimationFrame(update); ticking = true; }
        }, { passive: true });
    })();

    /* ================= MOBILE MENU LOGIC ================= */
    (() => {
        const hamburger = document.getElementById("hamburger");
        const navLinks = document.getElementById("navLinks");
        const navbar = document.getElementById("navbar");

        hamburger.addEventListener("click", (e) => {
            e.stopPropagation();
            const isActive = hamburger.classList.toggle("active");
            navLinks.classList.toggle("active");
            hamburger.setAttribute("aria-expanded", isActive);
        });

        document.addEventListener("click", (e) => {
            if (!navbar.contains(e.target) && navLinks.classList.contains("active")) {
                hamburger.classList.remove("active");
                navLinks.classList.remove("active");
                hamburger.setAttribute("aria-expanded", false);
            }
        });

        const dropdownToggles = document.querySelectorAll('.hasDropdown > .navLinkBtn');
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 640) {
                    e.preventDefault();
                    const parent = toggle.parentElement;
                    document.querySelectorAll('.navItem.hasDropdown.open').forEach(item => {
                        if (item !== parent) item.classList.remove('open');
                    });
                    parent.classList.toggle('open');
                }
            });
        });

        const subMenuToggles = document.querySelectorAll('.hasSubmenu > .mainBtn');
        subMenuToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const parent = toggle.parentElement;
                parent.classList.toggle('open');
            });
        });
    })();

    /* ================= SCROLL ANIMATIONS ================= */
    (() => {
        const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    })();

} catch (e) { console.warn('Ignored error in script block from services.html:', e); }
