/* =========================================================
   SAiMON VISION — Home — funcionalidad interactiva
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) { try { window.lucide.createIcons(); } catch (e) {} }

  /* ---------- barra de progreso de scroll ---------- */
  (function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    function update() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = Math.min(100, pct).toFixed(2) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  })();

  /* ---------- word-by-word reveal (hero title + cualquier [data-word-reveal]) ---------- */
  function applyWordReveal(el, { threshold = 0.12, fallbackMs = 0 } = {}) {
    if (!el) return;
    const rawHtml = el.innerHTML;
    const lines   = rawHtml.split(/<br\s*\/?>/i);
    let wordIndex = 0;

    el.innerHTML = lines.map((line, li) => {
      const words   = line.trim().split(/\s+/);
      const wrapped = words.map(word => {
        const span = `<span class="title-word" style="--wi:${wordIndex}"><span class="title-word-inner">${word}</span></span>`;
        wordIndex++;
        return span;
      }).join(' ');
      return li < lines.length - 1 ? wrapped + '<br>' : wrapped;
    }).join('');

    el.classList.remove('reveal', 'reveal-d1', 'reveal-d2', 'reveal-d3');

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('words-visible'); io.disconnect(); }
    }, { threshold });
    io.observe(el);

    if (fallbackMs) setTimeout(() => el.classList.add('words-visible'), fallbackMs);
  }

  // Hero titles (ya visibles al cargar → fallback rápido)
  applyWordReveal(document.querySelector('.hero__title'), { fallbackMs: 600 });
  applyWordReveal(document.querySelector('.nos-hero__title'), { fallbackMs: 600 });
  applyWordReveal(document.querySelector('.ps-hero__title'), { fallbackMs: 600 });
  applyWordReveal(document.querySelector('.v-hero__title'), { fallbackMs: 600 });
  applyWordReveal(document.querySelector('.rb-hero__title'), { fallbackMs: 600 });
  applyWordReveal(document.querySelector('.an-hero__title'), { fallbackMs: 600 });

  // Títulos con data-word-reveal (activados por scroll)
  document.querySelectorAll('[data-word-reveal]').forEach(el => {
    if (el.classList.contains('nos-hero__title')) return;
    if (el.classList.contains('ps-hero__title')) return;
    if (el.classList.contains('v-hero__title')) return;
    if (el.classList.contains('rb-hero__title')) return;
    if (el.classList.contains('an-hero__title')) return;
    applyWordReveal(el);
  });

  /* ---------- hero cards: stagger al cargar ---------- */
  (function initHeroCardsStagger() {
    const cards = document.querySelector('[data-cards-stagger]');
    if (!cards) return;
    // Activar tras un breve delay para que la página haya pintado
    setTimeout(() => cards.classList.add('cards-active'), 300);
  })();

  /* ---------- hero cards: carrusel mobile ---------- */
  (function initHeroCarousel() {
    const track = document.querySelector('[data-hero-track]');
    const carousel = track && track.closest('.hero__carousel');
    if (!track || !carousel) return;

    const cards = [...track.querySelectorAll('.hero-card')];
    const prevBtn = carousel.querySelector('[data-hero-prev]');
    const nextBtn = carousel.querySelector('[data-hero-next]');
    const dotsWrap = carousel.querySelector('[data-hero-dots]');
    if (!cards.length || !prevBtn || !nextBtn || !dotsWrap) return;

    let index = 0;

    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'hero__carousel-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    const dots = [...dotsWrap.querySelectorAll('.hero__carousel-dot')];

    function goTo(i) {
      index = Math.max(0, Math.min(i, cards.length - 1));
      const card = cards[index];
      track.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
      dots.forEach((d, di) => d.classList.toggle('is-active', di === index));
    }

    prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn.addEventListener('click', () => goTo(index + 1));

    let scrollTimer;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const center = track.scrollLeft + track.clientWidth / 2;
        let nearest = 0;
        let nearestDist = Infinity;
        cards.forEach((card, i) => {
          const mid = card.offsetLeft + card.offsetWidth / 2;
          const dist = Math.abs(mid - center);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearest = i;
          }
        });
        index = nearest;
        dots.forEach((d, di) => d.classList.toggle('is-active', di === index));
      }, 60);
    }, { passive: true });

    if (typeof lucide !== 'undefined') lucide.createIcons();
  })();

  /* ---------- contadores animados ---------- */
  (function initCounters() {
    const els = document.querySelectorAll('[data-counter]');
    if (!els.length) return;

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function animateCounter(el) {
      const target   = parseFloat(el.getAttribute('data-counter'));
      const prefix   = el.getAttribute('data-counter-prefix')  || '';
      const suffix   = el.getAttribute('data-counter-suffix')  || '';
      const duration = 2000;
      const start    = performance.now();

      el.classList.add('counting');

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const value    = Math.floor(easeOutCubic(progress) * target);
        el.textContent = prefix + value.toLocaleString('es-MX') + suffix;
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = prefix + target.toLocaleString('es-MX') + suffix;
          el.classList.remove('counting');
        }
      }
      requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    els.forEach(el => io.observe(el));
  })();

  /* ---------- header: smart scroll (hide↓ / float pill↑) ---------- */
  const header = document.querySelector('.header');
  const navLinks = [...document.querySelectorAll('.header__nav a[href^="#"]')].filter(a => a.getAttribute('href').length > 1);
  const sections = navLinks.map(a => { try { return document.querySelector(a.getAttribute('href')); } catch(e) { return null; } }).filter(Boolean);

  let lastScrollY  = window.scrollY;
  let ticking      = false;

  const FLOAT_START = 80;   // px: a partir de aquí → pill flotante visible

  // HIDE_START = borde inferior del bloque de stats (188 / 22M+ / 340+)
  // Se recalcula al resize para que funcione en cualquier resolución
  let HIDE_START = 480;
  function calcHideStart() {
    const stats = document.querySelector('.stats');
    if (stats) {
      HIDE_START = stats.getBoundingClientRect().bottom + window.scrollY + 40;
    }
  }
  calcHideStart();
  window.addEventListener('resize', calcHideStart);

  function updateHeader() {
    const y         = window.scrollY;
    const delta     = y - lastScrollY;
    const goingDown = delta > 2;
    const goingUp   = delta < -2;
    const isMobile  = window.matchMedia('(max-width: 1080px)').matches;

    // active nav link
    let activeIdx = 0;
    sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= 80) activeIdx = i; });
    navLinks.forEach((a, i) => a.classList.toggle('is-active', i === activeIdx));

    // En mobile el header (hamburguesa) nunca se oculta
    if (isMobile) {
      header.classList.remove('header--hidden', 'header--floating');
      if (y <= FLOAT_START) {
        header.classList.remove('header--scrolled');
      } else {
        header.classList.add('header--scrolled');
      }
      lastScrollY = y;
      ticking = false;
      return;
    }

    if (y <= FLOAT_START) {
      // FASE 1 — al tope: header normal
      header.classList.remove('header--scrolled', 'header--hidden', 'header--floating');

    } else if (y > FLOAT_START && y <= HIDE_START) {
      // FASE 2 — zona media: pill flotante siempre visible
      header.classList.remove('header--hidden');
      header.classList.add('header--floating', 'header--scrolled');

    } else {
      // FASE 3 — zona profunda (> HIDE_START)
      if (goingDown) {
        // scroll↓: ocultar pill
        header.classList.add('header--hidden');
        header.classList.remove('header--floating');
      } else if (goingUp) {
        // scroll↑: reaparece como pill
        header.classList.remove('header--hidden');
        header.classList.add('header--floating', 'header--scrolled');
      }
    }

    lastScrollY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateHeader); ticking = true; }
  }, { passive: true });
  updateHeader();

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }
  // safety: nothing should stay invisible
  setTimeout(() => revealEls.forEach((el) => el.classList.add('visible')), 1600);

  /* ---------- parallax suavizado con lerp ---------- */
  const parallaxEls = [...document.querySelectorAll('[data-parallax]')].map((el) => ({
    el,
    s:       parseFloat(el.getAttribute('data-parallax')) || 0,
    current: 0,
    target:  0,
  }));

  function calcParallaxTarget(el, s) {
    const r   = el.getBoundingClientRect();
    const off = r.top + r.height / 2 - window.innerHeight / 2;
    return -off * s;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  let rafId = null;
  function parallaxLoop() {
    let needsUpdate = false;
    parallaxEls.forEach(item => {
      item.target  = calcParallaxTarget(item.el, item.s);
      item.current = lerp(item.current, item.target, 0.09);
      if (Math.abs(item.current - item.target) > 0.05) needsUpdate = true;
      const scale = (1 + Math.abs(item.s) * 0.9).toFixed(3);
      item.el.style.transform = `translate3d(0,${item.current.toFixed(2)}px,0) scale(${scale})`;
    });
    rafId = requestAnimationFrame(parallaxLoop);
  }
  parallaxLoop();

  /* ---------- ecosistema tecnológico: sticky scroll storytelling ---------- */
  (function initEcoScrollStory() {
    const track = document.querySelector('[data-eco-scroll-track]');
    if (!track) return;

    const panels  = [...track.querySelectorAll('[data-eco-panel]')];
    const dots    = [...track.querySelectorAll('[data-eco-dot]')];
    const fillEl  = track.querySelector('[data-eco-fill]');
    const STEPS   = panels.length;
    let currentStep = -1;

    function activate(step) {
      if (step === currentStep) return;
      currentStep = step;

      panels.forEach((el, i) => el.classList.toggle('is-active', i === step));

      dots.forEach((el, i) => {
        el.classList.toggle('is-active', i === step);
        el.classList.toggle('is-passed', i < step);
      });

      if (fillEl) fillEl.style.width = (STEPS > 1 ? (step / (STEPS - 1)) * 100 : 100).toFixed(1) + '%';

      panels.forEach((panel, i) => {
        const videos = panel.querySelectorAll('video');
        videos.forEach(v => {
          if (i === step) { v.play().catch(() => {}); }
          else { v.pause(); }
        });
      });
    }

    function onScroll() {
      const rect       = track.getBoundingClientRect();
      const scrolled   = -rect.top;
      const scrollable = track.offsetHeight - window.innerHeight;

      if (scrolled <= 0)          { activate(0);         return; }
      if (scrolled >= scrollable) { activate(STEPS - 1); return; }

      const step = Math.min(STEPS - 1, Math.floor((scrolled / scrollable) * STEPS));
      activate(step);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Click en dot → scroll suave al paso correspondiente
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        const scrollable = track.offsetHeight - window.innerHeight;
        const trackTop   = track.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: trackTop + (idx / STEPS) * scrollable, behavior: 'smooth' });
      });
    });
  })();

  /* ---------- generic autoplay carousel (text + progress bar + optional bg) ---------- */
  function initTextCarousel({ rootSelector, items, intervalMs }) {
    const root = document.querySelector(rootSelector);
    if (!root) return;
    const titleEl = root.querySelector('[data-carousel-title]');
    const bodyEl  = root.querySelector('[data-carousel-body]');
    const countEl = root.querySelector('[data-carousel-count]');
    const fillEl  = root.querySelector('[data-carousel-fill]');
    const prevBtn = root.querySelector('[data-carousel-prev]');
    const nextBtn = root.querySelector('[data-carousel-next]');
    const dotsWrap = root.querySelector('[data-carousel-dots]');

    // Busca fondo dinámico vinculado por el mismo nombre de carrusel
    const carouselName = root.getAttribute('data-carousel');
    const bgStack = document.querySelector(`[data-carousel-bg="${carouselName}"]`);
    const bgSlides = bgStack ? [...bgStack.querySelectorAll('.split-panel__bg-slide')] : [];

    let dots = [];
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      items.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'robotica__dot';
        dot.setAttribute('aria-label', 'Sub-sector ' + (idx + 1));
        dotsWrap.appendChild(dot);
      });
      dots = [...dotsWrap.querySelectorAll('.robotica__dot')];
    }

    let i = 0;
    let iv = null;

    function render() {
      const item = items[i];
      titleEl.textContent = item.name;
      bodyEl.textContent  = item.body;
      countEl.textContent = `${i + 1} / ${items.length}`;
      fillEl.style.width  = `${((i + 1) / items.length) * 100}%`;
      bgSlides.forEach((el, idx) => el.classList.toggle('is-active', idx === i));
      dots.forEach((el, idx) => el.classList.toggle('is-active', idx === i));
    }

    function go(newIndex) {
      i = ((newIndex % items.length) + items.length) % items.length;
      render();
    }

    function startAutoplay() {
      clearInterval(iv);
      iv = setInterval(() => go(i + 1), intervalMs);
    }

    function restart(newIndex) {
      go(newIndex);
      startAutoplay();
    }

    dots.forEach((dot, idx) => dot.addEventListener('click', () => restart(idx)));
    prevBtn && prevBtn.addEventListener('click', () => restart(i - 1));
    nextBtn && nextBtn.addEventListener('click', () => restart(i + 1));

    render();
    startAutoplay();
  }

  initTextCarousel({
    rootSelector: '[data-carousel="soluciones"]',
    intervalMs: 8500,
    items: document.documentElement.lang === 'en' ? [
      { name: 'Physical Security', body: 'Intelligent video surveillance, access control and perimeter protection with proactive AI detection to safeguard people and assets.' },
      { name: 'Data Intelligence', body: 'Business Intelligence that turns every event into actionable metrics: foot traffic, dwell-time and loss prevention, in real time.' },
      { name: 'Technology Management', body: 'Integration of different technologies to improve the performance of real time crime center infrastructure, orchestrating sensors like robotics, drones, license plate readers, cameras and dispatch processes to perform as a single system.' }
    ] : [
      { name: 'Seguridad física', body: 'Videovigilancia inteligente, control de accesos y protección perimetral con detección proactiva por IA para resguardar personas y activos.' },
      { name: 'Inteligencia de datos', body: 'Analítica de Datos que convierte cada evento en métricas accionables: afluencia, dwell-time y mermas evitadas, en tiempo real.' },
      { name: 'Gestión tecnológica', body: 'Integración de distintas tecnologías para mejorar el desempeño de la infraestructura de centros de crimen en tiempo real, orquestando sensores como robótica, drones, lectores de placas, cámaras y procesos de despacho para operar como un solo sistema.' }
    ]
  });

  initTextCarousel({
    rootSelector: '[data-carousel="privado"]',
    intervalMs: 9500,
    items: document.documentElement.lang === 'en' ? [
      { name: 'Corporate', body: 'Comprehensive corporate security: access control, intelligent video surveillance and continuous facility monitoring.' },
      { name: 'Residential', body: 'Intelligent residential management with proactive detection and coordinated response for developments and condominiums.' },
      { name: 'Industrial', body: 'Industrial monitoring and applied robotics to protect plants, warehouses and production lines.' }
    ] : [
      { name: 'Empresas', body: 'Seguridad corporativa integral: control de accesos, videovigilancia inteligente y monitoreo continuo de instalaciones.' },
      { name: 'Residencial', body: 'Gestión residencial inteligente con detección proactiva y respuesta coordinada para fraccionamientos y condominios.' },
      { name: 'Industria', body: 'Monitoreo industrial y robótica aplicada para proteger plantas, almacenes y líneas de producción.' }
    ]
  });

  initTextCarousel({
    rootSelector: '[data-carousel="gobierno"]',
    intervalMs: 9500,
    items: document.documentElement.lang === 'en' ? [
      { name: 'Public Safety', body: 'Video surveillance and intelligence platforms to improve prevention and response capabilities through unmatched exploitation tools.' },
      { name: 'Municipalities', body: 'Municipal technology infrastructure integrated with Real Time Crime Centers for safer urban management.' },
      { name: 'Urban Mobility & Penitentiary', body: 'Monitoring systems for urban mobility and security in penitentiary facilities.' }
    ] : [
      { name: 'Seguridad pública', body: 'Plataformas de videovigilancia e inteligencia para mejorar las capacidades de prevención y respuesta mediante herramientas de explotación sin igual.' },
      { name: 'Municipios', body: 'Infraestructura tecnológica municipal integrada a centros de comando para una gestión urbana más segura.' },
      { name: 'Movilidad urbana y penitenciario', body: 'Sistemas de monitoreo para movilidad urbana y seguridad en instalaciones penitenciarias.' }
    ]
  });

  initTextCarousel({
    rootSelector: '[data-carousel="rb-deploy"]',
    intervalMs: 4200,
    items: document.documentElement.lang === 'en' ? [
      { name: 'Assessment', body: 'We evaluate your operation to identify where robotics can create the most impact.' },
      { name: 'Integration', body: 'We design the right model integration into your existing workflows and infrastructure.' },
      { name: 'Go-live', body: 'We train your team and support deployment until the fleet is running at full capacity.' }
    ] : [
      { name: 'Evaluación', body: 'Analizamos tu operación para identificar dónde la robótica genera mayor impacto.' },
      { name: 'Integración', body: 'Diseñamos la integración del modelo correcto a tus flujos e infraestructura existentes.' },
      { name: 'Puesta en marcha', body: 'Capacitamos a tu equipo y acompañamos el go-live hasta que la flota opere a capacidad.' }
    ]
  });

  initTextCarousel({
    rootSelector: '[data-carousel="rb-iq"]',
    intervalMs: 4200,
    items: document.documentElement.lang === 'en' ? [
      { name: 'Fleet status', body: 'Track the operational health of every unit from a single real-time dashboard.' },
      { name: 'GPS location', body: 'Locate each robot on the map with precision, wherever your fleet is deployed.' },
      { name: 'Live camera', body: 'View the camera feed of every unit without switching between systems.' }
    ] : [
      { name: 'Estado de flota', body: 'Consulta el estado operativo de cada unidad desde un solo panel en tiempo real.' },
      { name: 'Ubicación GPS', body: 'Ubica cada robot en el mapa con precisión, sin importar dónde opere tu flota.' },
      { name: 'Cámara en vivo', body: 'Visualiza la cámara de cada unidad sin cambiar de sistema.' }
    ]
  });

  /* ---------- modal de video ---------- */
  (function initVideoModal() {
    const modal  = document.getElementById('videoModal');
    const player = modal?.querySelector('.video-modal__player');
    if (!modal || !player) return;

    function openModal() {
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (window.lucide) window.lucide.createIcons();
      requestAnimationFrame(() => {
        player.currentTime = 0;
        player.play().catch(() => {});
      });
    }

    function closeModal() {
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      player.pause();
      player.currentTime = 0;
    }

    document.querySelectorAll('[data-modal-open="video"]').forEach(el => {
      el.addEventListener('click', e => { e.preventDefault(); openModal(); });
    });

    modal.querySelectorAll('[data-video-modal-close]').forEach(el => {
      el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
    });
  })();

  /* ---------- modal de contacto ---------- */
  (function initContactModal() {
    const modal     = document.getElementById('contactModal');
    const form      = document.getElementById('contactForm');
    const submitBtn = document.getElementById('cfSubmit');
    const successEl = document.getElementById('cfSuccess');
    if (!modal || !form) return;

    /* — abrir / cerrar — */
    function openModal() {
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      // re-render lucide dentro del modal
      if (window.lucide) window.lucide.createIcons();
      // foco al primer campo
      setTimeout(() => {
        const first = modal.querySelector('input, textarea, button');
        if (first) first.focus();
      }, 120);
    }
    function closeModal() {
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // triggers de apertura: botón "Contacto" en header + cualquier [data-modal-open="contact"]
    document.querySelectorAll('[data-modal-open="contact"]').forEach(el => {
      el.addEventListener('click', e => { e.preventDefault(); openModal(); });
    });

    // triggers de cierre: backdrop y botón X
    document.querySelectorAll('[data-modal-close]').forEach(el => {
      el.addEventListener('click', closeModal);
    });

    // tecla Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
    });

    /* — validación de campos — */
    function getError(input) {
      const val = input.value.trim();
      if (input.required && !val) return 'Este campo es requerido.';
      if (input.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
        return 'Ingresa un correo electrónico válido.';
      if (input.type === 'tel' && val) {
        const digits = val.replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 15)
          return 'El teléfono debe tener entre 10 y 15 dígitos.';
      }
      return '';
    }

    function validateField(input) {
      const msg     = getError(input);
      const errorEl = input.closest('.contact-form__field').querySelector('.contact-form__error');
      if (errorEl) errorEl.textContent = msg;
      input.classList.toggle('is-error', !!msg);
      return !msg;
    }

    function validateAll() {
      const fields = [...form.querySelectorAll('input, textarea')];
      return fields.map(f => (f.required || f.value.trim()) ? validateField(f) : true)
                   .every(Boolean);
    }

    // validación en tiempo real
    form.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('is-error')) validateField(input);
      });
    });

    /* — envío — */
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validateAll()) return;

      // estado loading
      submitBtn.setAttribute('data-loading', 'true');
      submitBtn.disabled = true;
      successEl.textContent = '';

      // simulación de llamada API (reemplazar por fetch real)
      await new Promise(r => setTimeout(r, 1800));

      // éxito
      submitBtn.removeAttribute('data-loading');
      submitBtn.disabled = false;
      form.reset();
      successEl.textContent = '✓ ¡Solicitud enviada! Te contactaremos en menos de 24 horas.';
      setTimeout(() => { successEl.textContent = ''; }, 6000);
    });
  })();

  /* ---------- nosotros: timeline card carousel ---------- */
  (function initTimeline() {
    const track = document.querySelector('[data-tl-track]');
    if (!track) return;

    const prevBtn = document.querySelector('[data-tl-prev]');
    const nextBtn = document.querySelector('[data-tl-next]');
    const card = track.querySelector('.timeline__card');
    if (!card) return;

    function getScrollAmount() {
      const style = getComputedStyle(track);
      const gap = parseFloat(style.gap) || 24;
      return card.offsetWidth + gap;
    }

    if (prevBtn) prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });
  })();

  /* ---------- robótica: reveal al entrar en viewport ---------- */
  (function initRoboticaReveal() {
    const section = document.querySelector('.robotica');
    if (!section) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        section.classList.add('in-view');
        io.disconnect();
      }
    }, { threshold: 0.08 });
    io.observe(section);
    // fallback
    setTimeout(() => section.classList.add('in-view'), 2000);
  })();

  /* ---------- robótica: parallax de fondo ---------- */
  (function initRoboticaParallax() {
    const stack = document.querySelector('[data-robo-parallax]');
    if (!stack) return;
    const STRENGTH = 0.13;   // qué tan pronunciado es el efecto
    let current = 0;
    let target  = 0;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function update() {
      const rect   = stack.parentElement.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      target  = center * STRENGTH;
      current = lerp(current, target, 0.07);
      stack.style.transform = `translate3d(0, ${current.toFixed(2)}px, 0)`;
      requestAnimationFrame(update);
    }
    update();
  })();

  /* ---------- robótica: carousel with background swap + card stack + dots/arrows ---------- */
  (function initRoboticaCarousel() {
    const section = document.querySelector('.robotica');
    if (!section) return;
    const bgSlides = [...section.querySelectorAll('.robotica__bg-slide')];
    const cards = [...section.querySelectorAll('.robotica__card')];
    const dots = [...section.querySelectorAll('.robotica__dot')];
    const prevBtn = section.querySelector('[data-robo-prev]');
    const nextBtn = section.querySelector('[data-robo-next]');
    const count = cards.length;
    let i = 0;
    let iv = null;

    function render() {
      bgSlides.forEach((el, idx) => el.classList.toggle('is-active', idx === i));
      cards.forEach((el, idx) => el.classList.toggle('is-active', idx === i));
      dots.forEach((el, idx) => el.classList.toggle('is-active', idx === i));
    }
    function go(newIndex) {
      i = (newIndex + count) % count;
      render();
    }
    function startAutoplay() {
      clearInterval(iv);
      iv = setInterval(() => go(i + 1), 4300);
    }
    function restart(newIndex) {
      go(newIndex);
      startAutoplay();
    }

    prevBtn && prevBtn.addEventListener('click', () => restart(i - 1));
    nextBtn && nextBtn.addEventListener('click', () => restart(i + 1));
    dots.forEach((dot, idx) => dot.addEventListener('click', () => restart(idx)));

    render();
    startAutoplay();
  })();

  /* ---------- Back-to-top button ---------- */
  (function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    const SHOW_AT = 600;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('is-visible', window.scrollY > SHOW_AT);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();

  /* ---------- Mobile Nav (hamburger) ---------- */
  (function initMobileNav() {
    const burger = document.querySelector('[data-burger]');
    const mobileNav = document.getElementById('mobileNav');
    if (!burger || !mobileNav) return;

    function openNav() {
      burger.classList.add('is-open');
      mobileNav.classList.add('is-open');
      mobileNav.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeNav() {
      burger.classList.remove('is-open');
      mobileNav.classList.remove('is-open');
      mobileNav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    burger.addEventListener('click', () => {
      mobileNav.classList.contains('is-open') ? closeNav() : openNav();
    });

    mobileNav.querySelectorAll('[data-mobile-close]').forEach(link => {
      link.addEventListener('click', () => closeNav());
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) closeNav();
    });
  })();

  /* ---------- Mega-menús (Soluciones + Sectores + Robótica) ---------- */
  (function initMegamenus() {
    const allMenus = document.querySelectorAll('.megamenu');
    if (!allMenus.length) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'megamenu-backdrop';
    document.body.appendChild(backdrop);

    function closeAll() {
      allMenus.forEach(m => {
        m.classList.remove('is-open');
        m.setAttribute('aria-hidden', 'true');
      });
      backdrop.classList.remove('is-visible');
      document.body.style.overflow = '';
    }

    function openMenu(id) {
      closeAll();
      // close mobile nav if open
      const burger = document.querySelector('[data-burger]');
      const mobileNav = document.getElementById('mobileNav');
      if (mobileNav && mobileNav.classList.contains('is-open')) {
        mobileNav.classList.remove('is-open');
        mobileNav.setAttribute('aria-hidden', 'true');
        if (burger) burger.classList.remove('is-open');
      }
      const menu = document.getElementById('megamenu-' + id);
      if (!menu) return;
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      backdrop.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    document.querySelectorAll('[data-megamenu-trigger]').forEach(t => {
      t.addEventListener('click', e => {
        e.preventDefault();
        openMenu(t.getAttribute('data-megamenu-trigger'));
      });
    });

    allMenus.forEach(menu => {
      menu.querySelectorAll('[data-megamenu-close]').forEach(c => {
        c.addEventListener('click', (e) => {
          const href = c.getAttribute('href');
          const isPageLink = href && href !== '#' && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:');
          closeAll();
          if (isPageLink && c.tagName === 'A') {
            e.preventDefault();
            window.location.assign(href);
          }
        });
      });
    });

    backdrop.addEventListener('click', closeAll);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeAll();
    });
  })();

  /* ---------- sectores: carruseles de sub-sector ---------- */
  document.querySelectorAll('[data-ss-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('[data-ss-track]');
    const dotsWrap = carousel.querySelector('[data-ss-dots]');
    const prevBtn = carousel.querySelector('[data-ss-prev]');
    const nextBtn = carousel.querySelector('[data-ss-next]');
    if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

    const slides = [...track.querySelectorAll('.ss-carousel__slide')];
    if (!slides.length) return;
    let index = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Ir a la diapositiva ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = [...dotsWrap.querySelectorAll('button')];

    function render() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
    }
    function goTo(i) {
      index = i;
      render();
    }

    prevBtn.addEventListener('click', () => goTo((index - 1 + slides.length) % slides.length));
    nextBtn.addEventListener('click', () => goTo((index + 1) % slides.length));
    render();
  });

  /* ---------- public safety: parallax de fondo productos ---------- */
  (function initPsProdParallax() {
    const stack = document.querySelector('[data-ps-prod-parallax]');
    if (!stack) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const STRENGTH = 0.14;
    let current = 0;
    let target = 0;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function update() {
      const section = stack.closest('.ps-prod') || stack.parentElement;
      const rect = section.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      target = center * STRENGTH;
      current = lerp(current, target, 0.07);
      stack.style.transform = `translate3d(0, ${current.toFixed(2)}px, 0)`;
      requestAnimationFrame(update);
    }
    update();
  })();

  /* ---------- public safety: módulos assemble on scroll ---------- */
  (function initPsModulosAssemble() {
    const section = document.querySelector('[data-ps-modulos]');
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      section.classList.add('is-inview');
      return;
    }
    if (!('IntersectionObserver' in window)) {
      section.classList.add('is-inview');
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      section.classList.add('is-inview');
      io.disconnect();
    }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });
    io.observe(section);
  })();

  /* ---------- public safety: carrusel de productos ---------- */
  document.querySelectorAll('[data-ps-prod]').forEach((carousel) => {
    const track = carousel.querySelector('[data-ps-track]');
    const dotsWrap = carousel.parentElement
      ? carousel.parentElement.querySelector('[data-ps-dots]')
      : null;
    const prevBtn = carousel.querySelector('[data-ps-prev]');
    const nextBtn = carousel.querySelector('[data-ps-next]');
    if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

    const slides = [...track.querySelectorAll('.ps-prod__slide')];
    if (!slides.length) return;

    const section = carousel.closest('.ps-prod');
    const bgSlides = section
      ? [...section.querySelectorAll('.ps-prod__bg-slide')]
      : [];
    let index = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Ir a la diapositiva ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = [...dotsWrap.querySelectorAll('button')];

    function render() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
      bgSlides.forEach((el, i) => el.classList.toggle('is-active', i === index));
    }
    function goTo(i) {
      index = i;
      render();
    }

    prevBtn.addEventListener('click', () => goTo((index - 1 + slides.length) % slides.length));
    nextBtn.addEventListener('click', () => goTo((index + 1) % slides.length));
    render();
  });

  /* ---------- saimon vision: video fallback ---------- */
  (function initVisionVideoFallback() {
    const video = document.querySelector('[data-v-video]');
    const fallback = document.querySelector('[data-v-video-fallback]');
    if (!video) return;
    const showFallback = () => {
      video.style.display = 'none';
      if (fallback) fallback.hidden = false;
    };
    video.addEventListener('error', showFallback);
    const source = video.querySelector('source');
    if (source) source.addEventListener('error', showFallback);
  })();

  /* ---------- saimon vision: sector carousel ---------- */
  document.querySelectorAll('[data-v-sect]').forEach((carousel) => {
    const track = carousel.querySelector('[data-v-track]');
    const dotsWrap = carousel.querySelector('[data-v-dots]');
    const prevBtn = carousel.querySelector('[data-v-prev]');
    const nextBtn = carousel.querySelector('[data-v-next]');
    if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

    const slides = [...track.querySelectorAll('.v-sect__slide')];
    if (!slides.length) return;
    let index = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Ir a la diapositiva ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = [...dotsWrap.querySelectorAll('button')];

    function render() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
    }
    function goTo(i) {
      index = i;
      render();
    }

    prevBtn.addEventListener('click', () => goTo((index - 1 + slides.length) % slides.length));
    nextBtn.addEventListener('click', () => goTo((index + 1) % slides.length));
    render();
  });

  /* ---------- saimon vision: rotating platform card ---------- */
  (function initVisionPlatformCard() {
    const platCard = document.querySelector('[data-v-plat-card]');
    if (!platCard) return;
    const isEn = document.documentElement.lang === 'en';
    const items = isEn ? [
      { label: 'Advanced Analytics', body: 'AI models that turn video into structured, actionable information in real time.' },
      { label: 'BI Dashboards', body: 'Business Intelligence with clear operational indicators for decision-making.' },
      { label: 'Big Data', body: 'Correlation of large volumes of data from sensors and existing systems.' },
      { label: 'Link Networks', body: 'Relate events and entities to reveal patterns that used to go unnoticed.' }
    ] : [
      { label: 'Analítica Avanzada', body: 'Modelos de IA que convierten video en información estructurada y accionable en tiempo real.' },
      { label: 'Tableros BI', body: 'Analítica de Datos con indicadores operativos claros para la toma de decisiones.' },
      { label: 'Big Data', body: 'Correlación de grandes volúmenes de datos provenientes de sensores y sistemas existentes.' },
      { label: 'Redes de Vínculos', body: 'Relaciona eventos y entidades para revelar patrones que antes pasaban desapercibidos.' }
    ];
    const titleEl = document.querySelector('[data-v-plat-title]');
    const bodyEl = document.querySelector('[data-v-plat-body]');
    const counterEl = document.querySelector('[data-v-plat-counter]');
    const barEl = document.querySelector('[data-v-plat-bar]');
    const bgSlides = [...document.querySelectorAll('[data-v-plat-bg] .v-plat__photo-slide')];
    let platIdx = 0;
    function renderPlat() {
      const p = items[platIdx];
      if (titleEl) titleEl.textContent = p.label;
      if (bodyEl) bodyEl.textContent = p.body;
      if (counterEl) counterEl.textContent = `${platIdx + 1} / ${items.length}`;
      if (barEl) barEl.style.width = `${((platIdx + 1) / items.length) * 100}%`;
      bgSlides.forEach((el, i) => el.classList.toggle('is-active', i === platIdx));
    }
    renderPlat();
    setInterval(() => {
      platIdx = (platIdx + 1) % items.length;
      renderPlat();
    }, 4200);
  })();

  /* ---------- saimon robotics: categories carousel (infinite loop) ---------- */
  (function initRoboticsCats() {
    const section = document.querySelector('[data-rb-cats]');
    if (!section) return;
    const track = section.querySelector('[data-rb-cats-track]');
    const prevBtn = section.querySelector('[data-rb-cats-prev]');
    const nextBtn = section.querySelector('[data-rb-cats-next]');
    if (!track || !prevBtn || !nextBtn) return;

    const originals = [...track.children];
    const total = originals.length;
    if (!total) return;

    function cloneCard(node) {
      const clone = node.cloneNode(true);
      clone.classList.add('visible');
      clone.setAttribute('aria-hidden', 'true');
      clone.tabIndex = -1;
      return clone;
    }

    // Only append clones (no prepend) so the initial state has nothing peeking on the left
    originals.forEach((card) => track.appendChild(cloneCard(card)));

    let idx = 0;
    let animating = false;

    function gap() {
      const g = parseFloat(getComputedStyle(track).gap);
      return Number.isFinite(g) ? g : 24;
    }

    function step() {
      const card = track.children[0];
      if (!card) return 0;
      return card.getBoundingClientRect().width + gap();
    }

    function setX(animate) {
      track.style.transition = animate
        ? 'transform .5s cubic-bezier(.16,1,.3,1)'
        : 'none';
      track.style.transform = 'translate3d(' + (-idx * step()) + 'px,0,0)';
    }

    function go(dir) {
      if (animating) return;
      animating = true;

      if (dir < 0 && idx === 0) {
        // Jump to the cloned set (same visual as start), then step back to last card
        idx = total;
        setX(false);
        void track.offsetWidth;
        idx = total - 1;
        setX(true);
        return;
      }

      idx += dir;
      setX(true);
    }

    track.addEventListener('transitionend', (e) => {
      if (e.target !== track || e.propertyName !== 'transform') return;
      if (idx >= total) {
        idx -= total;
        setX(false);
      }
      animating = false;
    });

    prevBtn.disabled = false;
    nextBtn.disabled = false;
    prevBtn.addEventListener('click', () => go(-1));
    nextBtn.addEventListener('click', () => go(1));

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (idx >= total) idx -= total;
        setX(false);
      }, 100);
    });

    setX(false);
  })();



  /* ---------- saimon analytics: redes de vínculos carousel ---------- */
  (function initAnalyticsLinks() {
    const titleEl = document.querySelector('[data-an-links-title]');
    if (!titleEl) return;
    const detailEl = document.querySelector('[data-an-links-detail]');
    const iconEl = document.querySelector('[data-an-links-icon]');
    const dotsEl = document.querySelector('[data-an-links-dots]');
    const prevBtn = document.querySelector('[data-an-links-prev]');
    const nextBtn = document.querySelector('[data-an-links-next]');
    if (!detailEl || !iconEl || !dotsEl || !prevBtn || !nextBtn) return;

    const isEn = document.documentElement.lang === 'en';
    const links = isEn ? [
      { icon: 'link-2', title: 'CAD systems integration', detail: 'Connects directly with the SAiMON CAD system to bring calls, dispatches and incidents into the analysis.' },
      { icon: 'share-2', title: 'Link analysis across people, vehicles and events', detail: 'Maps hidden relationships between entities to reveal patterns that are not obvious in isolation.' },
      { icon: 'phone', title: 'Correlation of calls, incidents and evidence', detail: 'Crosses call logs, reports and evidence to reconstruct the full chain of an event.' },
      { icon: 'scan-eye', title: 'Higher-precision support for investigations', detail: 'Gives investigators a consolidated view that speeds analysis and reduces the margin of error.' }
    ] : [
      { icon: 'link-2', title: 'Integración con sistemas CAD', detail: 'Conecta directamente con el sistema CAD SAiMON para incorporar llamadas, despachos e incidentes al análisis.' },
      { icon: 'share-2', title: 'Análisis de vínculos entre personas, vehículos y eventos', detail: 'Mapea relaciones ocultas entre entidades para revelar patrones que no son evidentes de forma aislada.' },
      { icon: 'phone', title: 'Correlación de llamadas, incidentes y evidencias', detail: 'Cruza registros de llamadas, reportes y evidencia para reconstruir la cadena completa de un evento.' },
      { icon: 'scan-eye', title: 'Apoyo a investigaciones con mayor precisión', detail: 'Entrega a los investigadores una vista consolidada que acelera el análisis y reduce el margen de error.' }
    ];

    let linkIdx = 0;
    links.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.addEventListener('click', () => { linkIdx = i; renderLink(); });
      dotsEl.appendChild(dot);
    });

    const iconWrap = iconEl.parentElement;
    function renderLink() {
      const item = links[linkIdx];
      titleEl.textContent = item.title;
      detailEl.textContent = item.detail;
      iconWrap.innerHTML = '<i data-lucide="' + item.icon + '" data-an-links-icon></i>';
      if (window.lucide) { try { window.lucide.createIcons({ nodes: [iconWrap] }); } catch (e) {} }
      Array.from(dotsEl.children).forEach((d, i) => d.classList.toggle('is-active', i === linkIdx));
    }
    prevBtn.addEventListener('click', () => { linkIdx = (linkIdx - 1 + links.length) % links.length; renderLink(); });
    nextBtn.addEventListener('click', () => { linkIdx = (linkIdx + 1) % links.length; renderLink(); });
    renderLink();
  })();

});
