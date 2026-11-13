(() => {
  const header = document.getElementById('siteHeader');
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuLabel = menuToggle ? menuToggle.querySelector('.menu-label') : null;
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const page = document.body.dataset.page || 'home';
  const sectionIds = page === 'home' ? ['top', 'contact'] : [page];
  const sections = sectionIds.map((id) => document.getElementById(id));
  const desktopQuery = window.matchMedia('(min-width: 901px)');

  let menuOpen = false;
  let scrollQueued = false;

  const setMenu = (open) => {
    menuOpen = open;
    document.body.classList.toggle('menu-open', open);
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    mobileMenu.inert = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    if (menuLabel) menuLabel.textContent = open ? '关闭' : '菜单';
    if (open) {
      const firstLink = mobileMenu.querySelector('a');
      if (firstLink) window.setTimeout(() => firstLink.focus(), 80);
    }
  };

  if (mobileMenu) mobileMenu.inert = true;

  if (menuToggle) {
    menuToggle.addEventListener('click', () => setMenu(!menuOpen));
  }

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  const contactDialog = document.getElementById('contactDialog');
  const contactTriggers = Array.from(document.querySelectorAll('[data-contact-open]'));
  let lastContactTrigger = null;

  const openContact = () => {
    if (!contactDialog || contactDialog.open) return;
    if (menuOpen) setMenu(false);
    if (typeof contactDialog.showModal === 'function') {
      contactDialog.showModal();
    } else {
      contactDialog.setAttribute('open', '');
    }
    document.body.classList.add('dialog-open');
  };

  const closeContact = () => {
    if (!contactDialog) return;
    if (typeof contactDialog.close === 'function') {
      contactDialog.close();
    } else {
      contactDialog.removeAttribute('open');
    }
    document.body.classList.remove('dialog-open');
  };

  contactTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      lastContactTrigger = trigger;
      openContact();
    });
  });

  if (contactDialog) {
    contactDialog.querySelectorAll('[data-contact-close]').forEach((button) => {
      button.addEventListener('click', closeContact);
    });

    contactDialog.addEventListener('click', (event) => {
      if (event.target === contactDialog) closeContact();
    });

    contactDialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      if (!lastContactTrigger) return;
      const focusTarget = mobileMenu.contains(lastContactTrigger) ? menuToggle : lastContactTrigger;
      window.requestAnimationFrame(() => focusTarget.focus());
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuOpen) {
      setMenu(false);
      menuToggle.focus();
    }
  });

  const closeOnDesktop = (event) => {
    if (event.matches && menuOpen) setMenu(false);
  };

  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener('change', closeOnDesktop);
  } else {
    desktopQuery.addListener(closeOnDesktop);
  }

  const updateScrollState = () => {
    const y = window.scrollY || window.pageYOffset;
    header.classList.toggle('is-scrolled', y > 8);

    const marker = y + header.offsetHeight + 44;
    let current = page === 'home' ? 'top' : page;

    sections.forEach((section, index) => {
      if (section && section.offsetTop <= marker) {
        current = sectionIds[index];
      }
    });

    if (document.documentElement.scrollHeight > window.innerHeight + 120 &&
        y + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      current = sectionIds[sectionIds.length - 1];
    }

    navLinks.forEach((link) => {
      const isCurrent = link.dataset.section === current;
      link.classList.toggle('is-active', isCurrent);
      if (isCurrent) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    scrollQueued = false;
  };

  const requestScrollUpdate = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(updateScrollState);
  };

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate);
  updateScrollState();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = Array.from(document.querySelectorAll('.reveal'));

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealItems.forEach((item) => observer.observe(item));
  }
})();
