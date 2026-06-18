(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', mobileNav.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-global-search]').forEach(function (input) {
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        const query = input.value.trim();
        const target = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
        window.location.href = target;
      }
    });
  });

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;
    let timer = null;

    const activate = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    const start = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5600);
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
        start();
      });
    });

    activate(0);
    start();
  }

  const filterScope = document.querySelector('[data-filter-scope]');

  if (filterScope) {
    const cards = Array.from(filterScope.querySelectorAll('[data-card]'));
    const searchInput = document.querySelector('[data-local-search]');
    const selects = Array.from(document.querySelectorAll('[data-select-filter]'));
    const emptyState = document.querySelector('[data-empty-state]');

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');

    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    const normalize = function (value) {
      return (value || '').toString().toLowerCase();
    };

    const applyFilters = function () {
      const query = normalize(searchInput ? searchInput.value.trim() : '');
      let visible = 0;

      cards.forEach(function (card) {
        let matched = true;
        const searchText = normalize(card.getAttribute('data-search'));

        if (query && searchText.indexOf(query) === -1) {
          matched = false;
        }

        selects.forEach(function (select) {
          const field = select.getAttribute('data-select-filter');
          const value = select.value;

          if (value && card.getAttribute('data-' + field) !== value) {
            matched = false;
          }
        });

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    };

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    applyFilters();
  }

  const loadHls = function () {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const startVideo = function (shell) {
    const video = shell.querySelector('video');
    const overlay = shell.querySelector('[data-video-overlay]');

    if (!video || video.getAttribute('data-ready') === 'true') {
      if (video) {
        video.play().catch(function () {});
      }
      return;
    }

    const url = video.getAttribute('data-video-url');

    if (!url) {
      return;
    }

    const reveal = function () {
      video.setAttribute('data-ready', 'true');
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.play().catch(function () {});
    };

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      reveal();
      return;
    }

    loadHls()
      .then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          video.hls = hls;
          reveal();
        } else {
          video.src = url;
          reveal();
        }
      })
      .catch(function () {
        video.src = url;
        reveal();
      });
  };

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    shell.addEventListener('click', function (event) {
      const targetName = event.target && event.target.tagName ? event.target.tagName.toLowerCase() : '';
      if (targetName === 'video' && shell.querySelector('video').getAttribute('data-ready') === 'true') {
        return;
      }
      startVideo(shell);
    });
  });
})();
