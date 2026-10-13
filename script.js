/* ================================================
   MEEM Website - JavaScript
   Modern Energy Equipment Manufacturing Co., Ltd.
   ================================================ */

document.addEventListener('DOMContentLoaded', function () {

    // ==================== Header Scroll Effect ====================
    const header = document.getElementById('mainHeader');
    const topBarHeight = 32; // matches .top-bar height

    function handleScroll() {
        if (window.scrollY > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // run on load


    // ==================== Mobile Navigation Toggle ====================
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
            // Animate hamburger
            const spans = mobileToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });

        // Mobile dropdown toggles
        const dropdowns = navMenu.querySelectorAll('.dropdown');
        dropdowns.forEach(function (drop) {
            drop.querySelector('a').addEventListener('click', function (e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    drop.classList.toggle('active');
                }
            });
        });

        // Close menu when clicking a link (non-dropdown)
        const navLinks = navMenu.querySelectorAll('li:not(.dropdown) > a');
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 768) {
                    navMenu.classList.remove('active');
                    mobileToggle.classList.remove('active');
                    const spans = mobileToggle.querySelectorAll('span');
                    spans.forEach(function (s) { s.style.transform = ''; s.style.opacity = ''; });
                }
            });
        });
    }


    // ==================== Active Nav Link Highlighting ====================
    const sections = document.querySelectorAll('section[id]');
    const navLinks_all = document.querySelectorAll('.nav-menu > li > a:not(.btn-nav-contact)');

    function highlightNav() {
        var scrollPos = window.scrollY + 120;

        sections.forEach(function (section) {
            var sectionTop = section.offsetTop;
            var sectionHeight = section.offsetHeight;
            var sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks_all.forEach(function (link) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId || link.getAttribute('href') === '#' + sectionId + '-intro') {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNav);


    // ==================== Back to Top Button ====================
    var backToTop = document.getElementById('backToTop');

    if (backToTop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 400) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // ==================== Counter Animation (About Stats) ====================
    var statNumbers = document.querySelectorAll('.stat-number[data-count]');

    if (statNumbers.length > 0) {
        var hasAnimated = false;

        function animateCounters() {
            if (hasAnimated) return;

            var statsSection = document.querySelector('.about-stats');
            if (!statsSection) return;

            var rect = statsSection.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                hasAnimated = true;
                statNumbers.forEach(function (stat) {
                    var target = parseInt(stat.getAttribute('data-count'));
                    var current = 0;
                    var increment = Math.ceil(target / 60);
                    var duration = 1500; // ms
                    var stepTime = duration / (target / increment);

                    function updateCounter() {
                        current += increment;
                        if (current >= target) {
                            stat.textContent = target + '+';
                        } else {
                            stat.textContent = current + '+';
                            setTimeout(updateCounter, stepTime);
                        }
                    }

                    updateCounter();
                });
            }
        }

        window.addEventListener('scroll', animateCounters);
        animateCounters(); // check on load
    }


    // ==================== Smooth Scroll for Anchor Links ====================
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;

            var targetEl = document.querySelector(targetId);
            if (targetEl) {
                //e.preventDefault();
                var headerOffset = header.classList.contains('scrolled') ? 75 : 107; // header height
                var elementPosition = targetEl.getBoundingClientRect().top;
                var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });


    // ==================== Simple Fade-In Animation on Scroll ====================
    var animateElements = document.querySelectorAll(
        '.product-card, .capability-item, .contact-card, .about-content, .image-frame'
    );

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        animateElements.forEach(function (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(25px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }


    // ==================== Contact Form Basic Validation ====================
    var contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var nameInput = contactForm.querySelector('input[name="name"]');
            var emailInput = contactForm.querySelector('input[name="email"]');
            var messageInput = contactForm.querySelector('textarea[name="message"]');

            // Basic validation
            if (!nameInput.value.trim()) {
                alert('Please enter your name.');
                nameInput.focus();
                return;
            }

            if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
                alert('Please enter a valid email address.');
                emailInput.focus();
                return;
            }

            if (!messageInput.value.trim()) {
                alert('Please enter your message.');
                messageInput.focus();
                return;
            }

            // Success feedback (in production, send to backend)
            alert('Thank you for your message! We will get back to you shortly.');
            contactForm.reset();
            contactForm.submit();
        });
    }

    function isValidEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

});
