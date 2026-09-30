(() => {
      'use strict';
      const menuButton = document.querySelector('.menu-toggle');
      const navigation = document.getElementById('main-navigation');
      function closeMenu() {
        navigation.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation menu');
        menuButton.querySelector('use').setAttribute('href', '#icon-menu');
      }
      menuButton.addEventListener('click', () => {
        const open = menuButton.getAttribute('aria-expanded') !== 'true';
        navigation.classList.toggle('is-open', open);
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
        menuButton.querySelector('use').setAttribute('href', open ? '#icon-close' : '#icon-menu');
        if (open) navigation.querySelector('a').focus();
      });
      navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

      function openPolicyFromHash() {
        const policy = document.getElementById(window.location.hash.slice(1));
        if (policy && policy.matches('details.policy-card')) policy.open = true;
      }
      openPolicyFromHash();
      window.addEventListener('hashchange', openPolicyFromHash);
      document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', () => {
          const target = document.getElementById(link.getAttribute('href').slice(1));
          if (!target) return;
          if (target.matches('details.policy-card')) {
            target.open = true;
            target.querySelector('summary').focus({ preventScroll: true });
          } else {
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
          }
        });
      });
      document.addEventListener('click', event => {
        if (!event.target.closest('.site-header')) closeMenu();
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
          closeMenu();
          menuButton.focus();
        }
      });
      window.matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);
    
      const dialog = document.getElementById('location-dialog');
      const locationButton = document.getElementById('open-location');
      const mapContainer = document.getElementById('map-container');
      const mapConsent = document.getElementById('map-consent');
      const mapControls = document.getElementById('map-controls');
      const mapStatus = document.getElementById('map-status');
      const loadMapButton = document.getElementById('load-map');
      function removeMap(restoreFocus = false) {
        mapContainer.replaceChildren();
        mapContainer.hidden = true;
        mapControls.hidden = true;
        mapConsent.hidden = false;
        mapStatus.textContent = 'Google Maps is off.';
        if (restoreFocus) loadMapButton.focus();
      }
      loadMapButton.addEventListener('click', () => {
        if (mapContainer.querySelector('iframe')) return;
        const map = document.createElement('iframe');
        map.title = 'Google Map showing El Sol Food Park, Cabuyao City, Laguna';
        map.referrerPolicy = 'no-referrer';
        map.setAttribute('allow', "geolocation 'none'; camera 'none'; microphone 'none'; payment 'none'");
        map.src = 'https://www.google.com/maps?q=El%20Sol%20Food%20Park%2C%20Cabuyao%20City%2C%20Laguna&output=embed';
        mapContainer.append(map);
        mapContainer.hidden = false;
        mapConsent.hidden = true;
        mapControls.hidden = false;
        mapStatus.textContent = 'Google Maps is enabled. If the map is unavailable, use the external directions link below.';
        document.getElementById('remove-map').focus();
      });
      document.getElementById('remove-map').addEventListener('click', () => removeMap(true));
      document.getElementById('decline-map').addEventListener('click', () => dialog.close());
      let bodyOverflow = '';
      let bodyPadding = '';
      locationButton.addEventListener('click', () => {
        bodyOverflow = document.body.style.overflow;
        bodyPadding = document.body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbarWidth}px`;
        }
        document.body.style.overflow = 'hidden';
        dialog.showModal();
      });
      dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
      // Native modal dialog behavior handles focus containment and Escape,
      // including focus inside the cross-origin map iframe.
      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
      });
      dialog.addEventListener('close', () => {
        removeMap();
        document.body.style.overflow = bodyOverflow;
        document.body.style.paddingRight = bodyPadding;
        locationButton.focus({ preventScroll: true });
      });
    
      if ('IntersectionObserver' in window) {
        const sections = document.querySelectorAll('.section-observed');
        const navLinks = document.querySelectorAll('.nav-link');
        const updateNavigation = () => {
          let currentSection = 'home';
          sections.forEach(section => {
            if (section.getBoundingClientRect().top <= 160) currentSection = section.id;
          });
          if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10) currentSection = 'connect';
          navLinks.forEach(link => {
            const active = link.getAttribute('href') === `#${currentSection}`;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        };
        let scrollPending = false;
        window.addEventListener('scroll', () => {
          if (scrollPending) return;
          scrollPending = true;
          window.requestAnimationFrame(() => { updateNavigation(); scrollPending = false; });
        }, { passive: true });
        updateNavigation();
    
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          const reveals = document.querySelectorAll('.reveal');
          const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
              }
            });
          }, { threshold: 0.08 });
          document.documentElement.classList.add('motion-ready');
          reveals.forEach(element => revealObserver.observe(element));
          // Anchor navigation and keyboard focus must always expose the target content.
          document.addEventListener('focusin', event => {
            const target = event.target.closest('.reveal');
            if (target) { target.classList.add('is-visible'); revealObserver.unobserve(target); }
          });
        }
      }
    })();
