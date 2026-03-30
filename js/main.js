/* =============================================
   MOLECULAR SOLUTIONS — main.js
   Orden de módulos:
   1. Año dinámico
   2. Header scroll
   3. Menú hamburguesa
   4. Nav link activo (Intersection Observer)
   5. Hero slider
   6. Swipe táctil en el hero
================================================= */


/* =============================================
   1. AÑO DINÁMICO
   Inyecta el año actual en el footer
   sin necesidad de actualizarlo manualmente
================================================= */

const yearEl = document.getElementById('currentYear');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}


/* =============================================
   2. HEADER — transparente → sólido al scroll
   Añade .header--scrolled cuando el usuario
   baja más de 80px desde el tope de la página
================================================= */

const header = document.getElementById('header');

const handleHeaderScroll = () => {
  if (window.scrollY > 80) {
    header.classList.add('header--scrolled');
  } else {
    header.classList.remove('header--scrolled');
  }
};

window.addEventListener('scroll', handleHeaderScroll, { passive: true });

// Ejecutar al cargar por si la página abre en medio del scroll
handleHeaderScroll();


/* =============================================
   3. MENÚ HAMBURGUESA
   - Abre y cierra el nav en móvil
   - Anima el botón hamburguesa → X
   - Bloquea el scroll del body cuando está abierto
   - Cierra al hacer click en un link del nav
   - Cierra al hacer click fuera del nav
================================================= */

const navToggle  = document.getElementById('navToggle');
const nav        = document.getElementById('nav');
const navLinks   = document.querySelectorAll('.nav__link');

const openNav = () => {
  nav.classList.add('nav--open');
  navToggle.classList.add('nav__toggle--open');
  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.setAttribute('aria-label', 'Cerrar menú');
  document.body.style.overflow = 'hidden';    /* Bloquea scroll del body */
};

const closeNav = () => {
  nav.classList.remove('nav--open');
  navToggle.classList.remove('nav__toggle--open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Abrir menú');
  document.body.style.overflow = '';          /* Restaura scroll del body */
};

const toggleNav = () => {
  nav.classList.contains('nav--open') ? closeNav() : openNav();
};

// Click en el botón hamburguesa
navToggle.addEventListener('click', toggleNav);

// Click en cualquier link del nav → cierra el menú
navLinks.forEach(link => {
  link.addEventListener('click', closeNav);
});

// Click fuera del nav y del toggle → cierra el menú
document.addEventListener('click', (e) => {
  const navIsOpen = nav.classList.contains('nav--open');
  const clickedOutside = !nav.contains(e.target) && !navToggle.contains(e.target);
  if (navIsOpen && clickedOutside) closeNav();
});

// Tecla Escape → cierra el menú
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('nav--open')) closeNav();
});


/* =============================================
   4. NAV LINK ACTIVO
   Intersection Observer detecta qué sección
   está visible y marca el link correspondiente
   en el nav con la clase .nav__link--active
================================================= */

const sections  = document.querySelectorAll('main section[id], footer[id]');
const navItems  = document.querySelectorAll('.nav__link:not(.nav__link--cta)');

const setActiveLink = (id) => {
  navItems.forEach(link => {
    link.classList.remove('nav__link--active');
    if (link.getAttribute('href') === `#${id}`) {
      link.classList.add('nav__link--active');
    }
  });
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  },
  {
    /* La sección se considera "activa" cuando ocupa
       al menos el 30% del viewport                  */
    threshold: 0.3,
    rootMargin: '-80px 0px 0px 0px'  /* Compensa la altura del header fijo */
  }
);

sections.forEach(section => sectionObserver.observe(section));


/* =============================================
   5. HERO SLIDER
   - Autoplay cada 5 segundos
   - Flechas prev/next
   - Dots indicadores
   - Pausa el autoplay al interactuar
   - Reanuda el autoplay tras 8 segundos de inactividad
================================================= */

const slides      = document.querySelectorAll('.hero__slide');
const dots        = document.querySelectorAll('.hero__dot');
const prevBtn     = document.getElementById('heroPrev');
const nextBtn     = document.getElementById('heroNext');

let currentSlide  = 0;
let autoplayTimer = null;
let resumeTimer   = null;

const totalSlides = slides.length;

// Activa el slide indicado y actualiza los dots
const goToSlide = (index) => {

  // Desactiva el slide y dot actuales
  slides[currentSlide].classList.remove('hero__slide--active');
  dots[currentSlide].classList.remove('hero__dot--active');

  // Calcula el índice con wrap-around (circular)
  currentSlide = (index + totalSlides) % totalSlides;

  // Activa el nuevo slide y dot
  slides[currentSlide].classList.add('hero__slide--active');
  dots[currentSlide].classList.add('hero__dot--active');
};

const nextSlide = () => goToSlide(currentSlide + 1);
const prevSlide = () => goToSlide(currentSlide - 1);

// Inicia el autoplay
const startAutoplay = () => {
  stopAutoplay();
  autoplayTimer = setInterval(nextSlide, 5000);
};

// Detiene el autoplay
const stopAutoplay = () => {
  clearInterval(autoplayTimer);
};

// Pausa y programa la reanudación del autoplay
// después de 8 segundos sin interacción
const pauseAndResume = () => {
  stopAutoplay();
  clearTimeout(resumeTimer);
  resumeTimer = setTimeout(startAutoplay, 8000);
};

// Flechas
prevBtn.addEventListener('click', () => {
  prevSlide();
  pauseAndResume();
});

nextBtn.addEventListener('click', () => {
  nextSlide();
  pauseAndResume();
});

// Dots
dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    goToSlide(index);
    pauseAndResume();
  });
});

// Pausa el autoplay cuando el usuario hace hover sobre el hero
const heroSection = document.querySelector('.hero');

heroSection.addEventListener('mouseenter', stopAutoplay);
heroSection.addEventListener('mouseleave', startAutoplay);

// Arranca el autoplay al cargar
startAutoplay();


/* =============================================
   6. SWIPE TÁCTIL EN EL HERO
   Detecta el gesto de deslizamiento horizontal
   en dispositivos táctiles para cambiar de slide
   Umbral mínimo de 50px para evitar falsos positivos
================================================= */

let touchStartX = 0;
let touchEndX   = 0;
const SWIPE_THRESHOLD = 50;   /* px mínimos para considerar un swipe */

heroSection.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });

heroSection.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].clientX;
  handleSwipe();
}, { passive: true });

const handleSwipe = () => {
  const delta = touchStartX - touchEndX;

  if (Math.abs(delta) < SWIPE_THRESHOLD) return;   /* Movimiento muy corto, ignorar */

  if (delta > 0) {
    nextSlide();    /* Swipe hacia la izquierda → siguiente */
  } else {
    prevSlide();    /* Swipe hacia la derecha → anterior    */
  }

  pauseAndResume();
};

