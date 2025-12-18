(function(window, document) {
  'use strict';

  const app = window.__app || {};

  const config = {
    animationDuration: 600,
    animationEasing: 'ease-in-out',
    scrollOffset: 100,
    debounceDelay: 150,
    throttleDelay: 100
  };

  const utils = {
    debounce: function(func, wait) {
      let timeout;
      return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
      };
    },

    throttle: function(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => { inThrottle = false; }, limit);
        }
      };
    },

    escapeHtml: function(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, m => map[m]);
    },

    getHeaderHeight: function() {
      const header = document.querySelector('.l-header, header, .navbar');
      return header ? header.offsetHeight : 80;
    },

    isReducedMotion: function() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  };

  const animations = {
    init: function() {
      this.initScrollAnimations();
      this.initHoverEffects();
      this.initRippleEffect();
      this.initCountUp();
      this.initImageAnimations();
    },

    initScrollAnimations: function() {
      if (utils.isReducedMotion()) return;

      const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      const elements = document.querySelectorAll('.card, .feature-card, .animal-card, .accordion-item, .breadcrumb, footer ul li');
      
      elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity ${config.animationDuration}ms ${config.animationEasing}, transform ${config.animationDuration}ms ${config.animationEasing}`;
        el.style.transitionDelay = `${index * 50}ms`;
        observer.observe(el);
      });
    },

    initHoverEffects: function() {
      if (utils.isReducedMotion()) return;

      const buttons = document.querySelectorAll('.btn, .c-button, a.nav-link, a.text-decoration-none');
      
      buttons.forEach(btn => {
        btn.style.transition = `all ${config.animationDuration}ms ${config.animationEasing}`;
        
        btn.addEventListener('mouseenter', function() {
          if (!this.classList.contains('btn-link-primary')) {
            this.style.transform = 'translateY(-2px)';
          }
        });

        btn.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0)';
        });
      });

      const cards = document.querySelectorAll('.card, .feature-card, .animal-card');
      cards.forEach(card => {
        card.style.transition = `all ${config.animationDuration}ms ${config.animationEasing}`;
        
        card.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-8px) scale(1.02)';
          this.style.boxShadow = 'var(--shadow-xl)';
        });

        card.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0) scale(1)';
          this.style.boxShadow = 'var(--shadow-sm)';
        });
      });
    },

    initRippleEffect: function() {
      if (utils.isReducedMotion()) return;

      const buttons = document.querySelectorAll('.btn-primary, .btn-cta, .btn-dark, .btn-light, .c-button--primary');
      
      buttons.forEach(button => {
        button.style.position = 'relative';
        button.style.overflow = 'hidden';

        button.addEventListener('click', function(e) {
          const ripple = document.createElement('span');
          const rect = this.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;

          ripple.style.width = ripple.style.height = size + 'px';
          ripple.style.left = x + 'px';
          ripple.style.top = y + 'px';
          ripple.style.position = 'absolute';
          ripple.style.borderRadius = '50%';
          ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
          ripple.style.transform = 'scale(0)';
          ripple.style.animation = 'ripple 600ms ease-out';
          ripple.style.pointerEvents = 'none';

          this.appendChild(ripple);

          setTimeout(() => ripple.remove(), 600);
        });
      });

      const style = document.createElement('style');
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    },

    initCountUp: function() {
      if (utils.isReducedMotion()) return;

      const counters = document.querySelectorAll('[data-count]');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target;
            const endValue = parseInt(target.getAttribute('data-count'), 10);
            const duration = 2000;
            const startTime = performance.now();

            const animate = (currentTime) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easeOutQuart = 1 - Math.pow(1 - progress, 4);
              const currentValue = Math.floor(easeOutQuart * endValue);

              target.textContent = currentValue.toLocaleString();

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                target.textContent = endValue.toLocaleString();
              }
            };

            requestAnimationFrame(animate);
            observer.unobserve(target);
          }
        });
      }, { threshold: 0.5 });

      counters.forEach(counter => observer.observe(counter));
    },

    initImageAnimations: function() {
      if (utils.isReducedMotion()) return;

      const images = document.querySelectorAll('img[loading="lazy"]');
      
      images.forEach(img => {
        img.style.opacity = '0';
        img.style.transform = 'scale(0.95)';
        img.style.transition = `opacity ${config.animationDuration}ms ${config.animationEasing}, transform ${config.animationDuration}ms ${config.animationEasing}`;

        img.addEventListener('load', function() {
          this.style.opacity = '1';
          this.style.transform = 'scale(1)';
        });

        if (img.complete) {
          img.style.opacity = '1';
          img.style.transform = 'scale(1)';
        }
      });
    }
  };

  const burger = {
    init: function() {
      this.nav = document.querySelector('.navbar');
      this.toggle = document.querySelector('.navbar-toggler');
      this.collapse = document.querySelector('.navbar-collapse');
      this.navLinks = document.querySelectorAll('.nav-link');

      if (!this.nav || !this.toggle || !this.collapse) return;

      this.bindEvents();
      this.setupMobileMenu();
    },

    setupMobileMenu: function() {
      this.collapse.style.height = 'calc(100vh - var(--nav-h))';
      this.collapse.style.transition = `transform ${config.animationDuration}ms ${config.animationEasing}`;
    },

    bindEvents: function() {
      this.toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMenu();
      });

      this.navLinks.forEach(link => {
        link.addEventListener('click', () => {
          this.closeMenu();
        });
      });

      document.addEventListener('click', (e) => {
        if (!this.nav.contains(e.target) && this.isOpen()) {
          this.closeMenu();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen()) {
          this.closeMenu();
          this.toggle.focus();
        }
      });

      window.addEventListener('resize', utils.throttle(() => {
        if (window.innerWidth >= 768 && this.isOpen()) {
          this.closeMenu();
        }
      }, config.throttleDelay));
    },

    isOpen: function() {
      return this.collapse.classList.contains('show');
    },

    toggleMenu: function() {
      if (this.isOpen()) {
        this.closeMenu();
      } else {
        this.openMenu();
      }
    },

    openMenu: function() {
      this.collapse.classList.add('show');
      this.toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      
      if (!utils.isReducedMotion()) {
        this.collapse.style.transform = 'translateX(0)';
      }
    },

    closeMenu: function() {
      this.collapse.classList.remove('show');
      this.toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      
      if (!utils.isReducedMotion()) {
        this.collapse.style.transform = 'translateX(100%)';
      }
    }
  };

  const smoothScroll = {
    init: function() {
      this.bindAnchors();
      this.initScrollSpy();
    },

    bindAnchors: function() {
      const anchors = document.querySelectorAll('a[href^="#"]');
      
      anchors.forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (href === '#' || href === '#!') return;

        anchor.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = href.substring(1);
          const target = document.getElementById(targetId);

          if (target) {
            const headerHeight = utils.getHeaderHeight();
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = targetPosition - headerHeight - 20;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });

            window.history.pushState(null, null, href);
          }
        });
      });
    },

    initScrollSpy: function() {
      const sections = document.querySelectorAll('[id]');
      const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

      if (sections.length === 0 || navLinks.length === 0) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              const href = link.getAttribute('href');
              if (href === `#${id}`) {
                navLinks.forEach(l => {
                  l.classList.remove('active');
                  l.removeAttribute('aria-current');
                });
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
              }
            });
          }
        });
      }, {
        rootMargin: '-100px 0px -66%',
        threshold: 0
      });

      sections.forEach(section => observer.observe(section));
    }
  };

  const forms = {
    init: function() {
      this.forms = document.querySelectorAll('form');
      this.forms.forEach(form => this.setupForm(form));
    },

    setupForm: function(form) {
      const submitBtn = form.querySelector('[type="submit"]');
      
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        this.clearErrors(form);
        
        const isValid = this.validateForm(form);
        
        if (!isValid) {
          return;
        }

        if (submitBtn) {
          this.disableButton(submitBtn);
        }

        setTimeout(() => {
          this.submitForm(form, submitBtn);
        }, 800);
      });

      this.addRealTimeValidation(form);
    },

    validateForm: function(form) {
      let isValid = true;

      const nameField = form.querySelector('#booking-name');
      if (nameField) {
        const namePattern = /^[a-zA-ZÀ-ÿs-']{2,50}$/;
        if (!namePattern.test(nameField.value.trim())) {
          this.showError(nameField, 'Please enter a valid name (2-50 characters, letters only)');
          isValid = false;
        }
      }

      const emailField = form.querySelector('#booking-email');
      if (emailField) {
        const emailPattern = /^[^s@]+@[^s@]+.[^s@]+$/;
        if (!emailPattern.test(emailField.value.trim())) {
          this.showError(emailField, 'Please enter a valid email address');
          isValid = false;
        }
      }

      const phoneField = form.querySelector('#booking-phone');
      if (phoneField) {
        const phonePattern = /^[ds+-()[]]{10,20}$/;
        if (!phonePattern.test(phoneField.value.trim())) {
          this.showError(phoneField, 'Please enter a valid phone number (10-20 digits)');
          isValid = false;
        }
      }

      const serviceField = form.querySelector('#booking-service');
      if (serviceField && !serviceField.value) {
        this.showError(serviceField, 'Please select a service');
        isValid = false;
      }

      const messageField = form.querySelector('#booking-message, textarea');
      if (messageField) {
        if (messageField.value.trim().length < 10) {
          this.showError(messageField, 'Message must be at least 10 characters long');
          isValid = false;
        }
      }

      const consentField = form.querySelector('#booking-consent');
      if (consentField && !consentField.checked) {
        this.showError(consentField, 'You must agree to the privacy policy');
        isValid = false;
      }

      const honeypot = form.querySelector('input[name="website"]');
      if (honeypot && honeypot.value) {
        isValid = false;
      }

      return isValid;
    },

    showError: function(field, message) {
      field.classList.add('is-invalid');
      
      let errorDiv = field.parentElement.querySelector('.invalid-feedback');
      if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        field.parentElement.appendChild(errorDiv);
      }
      
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';

      field.style.borderColor = 'var(--color-error)';
      
      if (!utils.isReducedMotion()) {
        field.style.animation = 'shake 0.3s ease-in-out';
      }
    },

    clearErrors: function(form) {
      const invalidFields = form.querySelectorAll('.is-invalid');
      invalidFields.forEach(field => {
        field.classList.remove('is-invalid');
        field.style.borderColor = '';
        field.style.animation = '';
      });

      const errorMessages = form.querySelectorAll('.invalid-feedback');
      errorMessages.forEach(msg => msg.style.display = 'none');
    },

    addRealTimeValidation: function(form) {
      const fields = form.querySelectorAll('input, textarea, select');
      
      fields.forEach(field => {
        field.addEventListener('blur', () => {
          if (field.value.trim()) {
            this.clearErrors(form);
            this.validateForm(form);
          }
        });
      });
    },

    disableButton: function(btn) {
      btn.disabled = true;
      btn.dataset.originalText = btn.innerHTML;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...';
      btn.style.opacity = '0.7';
      btn.style.cursor = 'not-allowed';
    },

    enableButton: function(btn) {
      btn.disabled = false;
      btn.innerHTML = btn.dataset.originalText || 'Submit';
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    },

    submitForm: function(form, submitBtn) {
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      fetch('process.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(result => {
          if (submitBtn) {
            this.enableButton(submitBtn);
          }
          
          if (result.success) {
            this.showNotification('Message sent successfully!', 'success');
            
            setTimeout(() => {
              window.location.href = 'thank_you.html';
            }, 1500);
          } else {
            this.showNotification('An error occurred. Please try again.', 'danger');
          }
        })
        .catch(error => {
          if (submitBtn) {
            this.enableButton(submitBtn);
          }
          this.showNotification('Network error. Please check your connection and try again.', 'danger');
        });
    },

    showNotification: function(message, type) {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `alert alert-${type} alert-dismissible fade show`;
      toast.setAttribute('role', 'alert');
      toast.style.cssText = 'animation: slideInRight 0.4s ease-out; box-shadow: var(--shadow-lg);';
      toast.innerHTML = `
        ${utils.escapeHtml(message)}
        <button type="button" class="btn-close" aria-label="Close"></button>
      `;

      container.appendChild(toast);

      const closeBtn = toast.querySelector('.btn-close');
      closeBtn.addEventListener('click', () => {
        toast.style.animation = 'slideOutRight 0.4s ease-out';
        setTimeout(() => toast.remove(), 400);
      });

      setTimeout(() => {
        if (toast.parentNode) {
          toast.style.animation = 'slideOutRight 0.4s ease-out';
          setTimeout(() => toast.remove(), 400);
        }
      }, 5000);

      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(400px); opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `;
      if (!document.getElementById('notification-animations')) {
        style.id = 'notification-animations';
        document.head.appendChild(style);
      }
    }
  };

  const modals = {
    init: function() {
      this.createPrivacyModal();
      this.createCookieModal();
      this.bindPrivacyLinks();
    },

    createPrivacyModal: function() {
      const privacyLinks = document.querySelectorAll('a[href*="privacy"]');
      
      privacyLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          if (link.getAttribute('href') === '#privacy-modal') {
            e.preventDefault();
            this.showModal('Privacy Policy', 'Our privacy policy content goes here...');
          }
        });
      });
    },

    createCookieModal: function() {
      const cookieBtn = document.getElementById('cookie-preferences-btn');
      
      if (cookieBtn) {
        cookieBtn.addEventListener('click', () => {
          this.showModal('Cookie Preferences', 'Manage your cookie preferences here...');
        });
      }
    },

    bindPrivacyLinks: function() {
      const links = document.querySelectorAll('a[href="#privacy-policy"], a[href*="privacy.html"]');
      
      links.forEach(link => {
        link.style.transition = `color ${config.animationDuration}ms ${config.animationEasing}`;
      });
    },

    showModal: function(title, content) {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
      `;

      const modal = document.createElement('div');
      modal.style.cssText = `
        background: var(--color-neutral-white);
        padding: var(--space-xl);
        border-radius: var(--border-radius-lg);
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: var(--shadow-xl);
        animation: scaleIn 0.3s ease-out;
      `;
      modal.innerHTML = `
        <h2 style="margin-top: 0;">${utils.escapeHtml(title)}</h2>
        <p>${utils.escapeHtml(content)}</p>
        <button class="btn btn-primary" style="margin-top: var(--space-lg);">Close</button>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      const closeBtn = modal.querySelector('button');
      const close = () => {
        overlay.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
          overlay.remove();
          document.body.style.overflow = '';
        }, 300);
      };

      closeBtn.addEventListener('click', close);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
      });

      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `;
      if (!document.getElementById('modal-animations')) {
        style.id = 'modal-animations';
        document.head.appendChild(style);
      }
    }
  };

  const scrollToTop = {
    init: function() {
      this.createButton();
      this.bindScroll();
    },

    createButton: function() {
      const btn = document.createElement('button');
      btn.innerHTML = '↑';
      btn.setAttribute('aria-label', 'Scroll to top');
      btn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--color-accent);
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all ${config.animationDuration}ms ${config.animationEasing};
        z-index: 1000;
        box-shadow: var(--shadow-lg);
      `;

      btn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });

      btn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = 'var(--shadow-xl)';
      });

      btn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = 'var(--shadow-lg)';
      });

      document.body.appendChild(btn);
      this.button = btn;
    },

    bindScroll: function() {
      const toggleButton = utils.throttle(() => {
        if (window.pageYOffset > 300) {
          this.button.style.opacity = '1';
          this.button.style.visibility = 'visible';
        } else {
          this.button.style.opacity = '0';
          this.button.style.visibility = 'hidden';
        }
      }, config.throttleDelay);

      window.addEventListener('scroll', toggleButton, { passive: true });
    }
  };

  const activeMenu = {
    init: function() {
      const navLinks = document.querySelectorAll('.nav-link');
      const currentPath = window.location.pathname;

      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        if (currentPath === '/' || currentPath === '/index.html' || currentPath === '') {
          if (href === '/' || href === '/index.html' || href === '') {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
          }
        } else if (href && currentPath.includes(href) && href !== '/') {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      });
    }
  };

  const lazyImages = {
    init: function() {
      const images = document.querySelectorAll('img:not([loading])');
      
      images.forEach(img => {
        if (!img.classList.contains('c-logo__img') && !img.hasAttribute('data-critical')) {
          img.setAttribute('loading', 'lazy');
        }

        img.addEventListener('error', function() {
          this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle" fill="%23999" font-family="sans-serif" font-size="16"%3EImage not found%3C/text%3E%3C/svg%3E';
          this.style.objectFit = 'contain';
        });
      });
    }
  };

  function init() {
    animations.init();
    burger.init();
    smoothScroll.init();
    forms.init();
    modals.init();
    scrollToTop.init();
    activeMenu.init();
    lazyImages.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.__app = app;

})(window, document);
