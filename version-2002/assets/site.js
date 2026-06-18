
(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('hero-slide-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var search = panel.querySelector('[data-search-input]');
    var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-select]'));
    var section = panel.closest('section') || document;
    var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
    var empty = section.querySelector('[data-empty-state]');

    function valueOf(name) {
      var select = panel.querySelector('[data-filter-select="' + name + '"]');
      return select ? select.value.trim().toLowerCase() : '';
    }

    function applyFilters() {
      var keyword = search ? search.value.trim().toLowerCase() : '';
      var region = valueOf('region');
      var genre = valueOf('genre');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();
        var regionText = (card.dataset.region || '').toLowerCase();
        var genreText = (card.dataset.genre || '').toLowerCase();
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (region && regionText.indexOf(region) === -1) {
          matched = false;
        }

        if (genre && genreText.indexOf(genre) === -1) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (search) {
      search.addEventListener('input', applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });
  });
})();
