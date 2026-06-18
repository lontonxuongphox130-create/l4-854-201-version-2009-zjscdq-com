/* 欧美高清影片静态站点交互脚本：菜单、Hero 切换、筛选排序、HLS 播放器初始化。 */
(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initMissingImageFallback() {
    var images = document.querySelectorAll('.js-cover-img');
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
        image.setAttribute('aria-hidden', 'true');
      });
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-thumb]'));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === current);
      });
    }

    function start() {
      if (timer || slides.length <= 1) {
        return;
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var index = Number(thumb.getAttribute('data-hero-thumb')) || 0;
        show(index);
        stop();
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initCardFilters() {
    var panels = document.querySelectorAll('[data-filter-panel]');
    panels.forEach(function (panel) {
      var pageMain = panel.closest('main') || document;
      var grid = pageMain.querySelector('[data-card-grid]') || pageMain.querySelector('.movie-grid');
      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
      var input = panel.querySelector('.js-card-search');
      var yearSelect = panel.querySelector('.js-filter-year');
      var typeSelect = panel.querySelector('.js-filter-type');
      var sortSelect = panel.querySelector('.js-sort-cards');
      var result = panel.querySelector('[data-filter-result]');
      var params = new URLSearchParams(window.location.search);
      var queryFromUrl = params.get('q') || '';

      function fillSelect(select, values) {
        if (!select) {
          return;
        }
        values.forEach(function (value) {
          if (!value) {
            return;
          }
          var option = document.createElement('option');
          option.value = value;
          option.textContent = value;
          select.appendChild(option);
        });
      }

      var years = cards.map(function (card) {
        return card.getAttribute('data-year');
      }).filter(Boolean).sort(function (a, b) {
        return Number(b) - Number(a);
      });
      var uniqueYears = Array.from(new Set(years));
      var types = cards.map(function (card) {
        return card.getAttribute('data-type');
      }).filter(Boolean).sort();
      var uniqueTypes = Array.from(new Set(types));

      fillSelect(yearSelect, uniqueYears);
      fillSelect(typeSelect, uniqueTypes);

      if (input && queryFromUrl) {
        input.value = queryFromUrl;
      }

      function cardText(card) {
        return normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' '));
      }

      function apply() {
        var query = input ? normalize(input.value) : '';
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
          var matchesYear = !year || card.getAttribute('data-year') === year;
          var matchesType = !type || card.getAttribute('data-type') === type;
          var shouldShow = matchesQuery && matchesYear && matchesType;
          card.classList.toggle('is-hidden', !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        if (result) {
          result.textContent = '当前显示 ' + visible + ' 部影片，共 ' + cards.length + ' 部';
        }
      }

      function sortCards() {
        if (!sortSelect) {
          return;
        }
        var mode = sortSelect.value;
        var sorted = cards.slice();
        sorted.sort(function (a, b) {
          if (mode === 'rating') {
            return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
          }
          if (mode === 'views') {
            return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
          }
          if (mode === 'year') {
            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
          }
          if (mode === 'title') {
            return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
          }
          return cards.indexOf(a) - cards.indexOf(b);
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
        cards = sorted;
        apply();
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener('change', apply);
      }
      if (sortSelect) {
        sortSelect.addEventListener('change', sortCards);
      }

      apply();
    });
  }

  function initPlayers() {
    var players = document.querySelectorAll('.js-player');
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var startButton = player.querySelector('[data-player-start]');
      var status = player.querySelector('[data-player-status]');
      var source = player.getAttribute('data-video-url');
      var hlsInstance = null;
      var hasLoaded = false;

      if (!video || !startButton || !source) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function attachSource() {
        if (hasLoaded) {
          return;
        }
        hasLoaded = true;
        setStatus('正在初始化 HLS 播放源...');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源已加载，正在播放');
            playVideo();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放源加载失败，请刷新页面或更换浏览器重试');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setStatus('播放源已加载，正在播放');
            playVideo();
          }, { once: true });
        } else {
          video.src = source;
          setStatus('当前浏览器可能不支持 HLS，已尝试直接加载播放源');
          playVideo();
        }
      }

      function playVideo() {
        var promise = video.play();
        player.classList.add('is-playing');
        startButton.classList.add('is-hidden');
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            player.classList.remove('is-playing');
            startButton.classList.remove('is-hidden');
            setStatus('浏览器阻止自动播放，请再次点击播放按钮');
          });
        }
      }

      startButton.addEventListener('click', function () {
        attachSource();
        if (hasLoaded) {
          playVideo();
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
        startButton.classList.add('is-hidden');
      });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          setStatus('已暂停，点击播放器继续观看');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initMissingImageFallback();
    initHeroSlider();
    initCardFilters();
    initPlayers();
  });
})();
