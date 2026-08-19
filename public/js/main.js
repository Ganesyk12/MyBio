/**
* Template Name: EasyFolio
* Template URL: https://bootstrapmade.com/easyfolio-bootstrap-portfolio-template/
* Updated: Feb 21 2025 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  if (scrollTop) {
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.lenis) {
        window.lenis.scrollTo(0);
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  }

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function(direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Frequently Asked Questions Toggle
   */
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((faqItem) => {
    faqItem.addEventListener('click', () => {
      faqItem.parentNode.classList.toggle('faq-active');
    });
  });

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          const targetOffset = section.offsetTop - parseInt(scrollMarginTop);
          if (window.lenis) {
            window.lenis.scrollTo(targetOffset);
          } else {
            window.scrollTo({
              top: targetOffset,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy using IntersectionObserver
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function initScrollspy() {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // Adjust to trigger when section is in middle-top
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navmenulinks.forEach(link => {
            if (link.hash === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    // Observe all sections that have an ID corresponding to a nav link
    navmenulinks.forEach(link => {
      if (!link.hash || link.hash === '#') return;
      const section = document.querySelector(link.hash);
      if (section) observer.observe(section);
    });
  }

  window.addEventListener('load', initScrollspy);

  /**
   * Initialize Lenis smooth scroll
   */
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Store globally so other scripts (like ajax-navigation) can access it
    window.lenis = lenis;

    // Smooth scroll for hash links on the same page
    document.querySelectorAll('a[href*="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        const hashIndex = href.indexOf('#');
        if (hashIndex !== -1) {
          const hash = href.substring(hashIndex);
          const target = document.querySelector(hash);
          if (target) {
            const pathPart = href.substring(0, hashIndex);
            // If the link points to the current page (same pathname or empty path before #)
            if (pathPart === '' || pathPart === '/' || window.location.pathname === pathPart) {
              e.preventDefault();
              lenis.scrollTo(target);
              history.pushState(null, null, href);
            }
          }
        }
      });
    });
  }

  /**
   * Interactive Custom Cursor Follower
   */
  const cursorDot = document.querySelector('.custom-cursor-dot');
  const cursorFollower = document.querySelector('.custom-cursor-follower');

  if (cursorDot && cursorFollower) {
    let mouseX = 0, mouseY = 0; // Current mouse position
    let followerX = 0, followerY = 0; // Current follower position
    let isHidden = true;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (isHidden) {
        isHidden = false;
        cursorDot.style.opacity = '1';
        cursorFollower.style.opacity = '1';
        followerX = mouseX;
        followerY = mouseY;
      }

      // Immediately move the dot to the mouse position
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    let currentAngle = 0;

    // Lerp animation for follower
    function animateFollower() {
      const diffX = mouseX - followerX;
      const diffY = mouseY - followerY;
      const distance = Math.sqrt(diffX * diffX + diffY * diffY);

      // Lerp formula: current = current + (target - current) * speed
      followerX += diffX * 0.12;
      followerY += diffY * 0.12;

      cursorFollower.style.left = followerX + 'px';
      cursorFollower.style.top = followerY + 'px';

      // Control rotation and chomping animation
      if (distance > 3) {
        cursorFollower.style.animationPlayState = 'running';
        const targetAngle = Math.atan2(diffY, diffX) * (180 / Math.PI);
        currentAngle = targetAngle;
        cursorFollower.style.transform = `translate(-50%, -50%) rotate(${currentAngle}deg)`;
      } else {
        cursorFollower.style.animationPlayState = 'paused';
        cursorFollower.style.transform = `translate(-50%, -50%) rotate(${currentAngle}deg)`;
      }

      requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Mouse leave / enter window
    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorFollower.style.opacity = '0';
      isHidden = true;
    });

    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1';
      cursorFollower.style.opacity = '1';
      isHidden = false;
    });

    // Hover state detection
    const clickableElements = 'a, button, .btn, .portfolio-item, .skill-badge-pro, .skill-box, .mobile-nav-toggle, input, textarea, select, .glightbox, .preview-link';
    
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(clickableElements)) {
        document.body.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (!e.target.closest(clickableElements)) {
        document.body.classList.remove('cursor-hover');
      }
    });
  }

  /**
   * Initialize Portfolio Slider/Carousel (Swiper)
   */
  function initPortfolioSlider() {
    const swiperElement = document.querySelector('.portfolio-swiper');
    if (!swiperElement) return;

    // Initialize Swiper
    const swiper = new Swiper(swiperElement, {
      slidesPerView: 1,
      spaceBetween: 25,
      grabCursor: true,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true,
      },
      navigation: {
        nextEl: '.slider-next',
        prevEl: '.slider-prev',
      },
      breakpoints: {
        576: {
          slidesPerView: 1.5,
        },
        768: {
          slidesPerView: 2,
        },
        992: {
          slidesPerView: 3,
        }
      }
    });

    // Filter functionality
    const filters = document.querySelectorAll('.portfolio-filters li');
    const slides = document.querySelectorAll('.portfolio-slide-item');

    filters.forEach(filter => {
      // Clone filter to reset any duplicate listeners in case of AJAX re-inits
      const newFilter = filter.cloneNode(true);
      filter.parentNode.replaceChild(newFilter, filter);

      newFilter.addEventListener('click', function() {
        // Toggle active class on filters
        document.querySelectorAll('.portfolio-filters li').forEach(f => f.classList.remove('filter-active'));
        this.classList.add('filter-active');

        const filterVal = this.getAttribute('data-filter');

        // Fade out slides
        swiperElement.style.opacity = '0';
        
        setTimeout(() => {
          slides.forEach(slide => {
            const type = slide.getAttribute('data-type');
            
            if (filterVal === '*' || filterVal === `.filter-${type}`) {
              slide.style.display = '';
              slide.classList.add('swiper-slide');
            } else {
              slide.style.display = 'none';
              slide.classList.remove('swiper-slide');
            }
          });

          // Update Swiper layout and slide calculation, then return to slide 1
          swiper.update();
          swiper.slideTo(0, 0);
          
          // Fade in back
          swiperElement.style.opacity = '1';
        }, 300);
      });
    });
  }

  // Expose globally and listen to load
  window.initPortfolioSlider = initPortfolioSlider;
  window.addEventListener('load', initPortfolioSlider);

})();