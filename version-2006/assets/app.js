(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
        if (window.Hls) {
          resolve();
        }
        return;
      }
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setupNavigation() {
    var button = document.querySelector('.nav-toggle');
    var nav = document.getElementById('mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('.hero-thumb'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });
      thumbs.forEach(function (thumb, current) {
        thumb.classList.toggle('active', current === index);
      });
    }
    thumbs.forEach(function (thumb, current) {
      thumb.addEventListener('click', function () {
        show(current);
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      });
    });
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
    show(0);
  }

  function setupFilters() {
    var q = document.getElementById('filter-q');
    var region = document.getElementById('filter-region');
    var type = document.getElementById('filter-type');
    var year = document.getElementById('filter-year');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var empty = document.getElementById('filter-empty');
    if (!cards.length || !q) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    if (params.get('q')) {
      q.value = params.get('q');
    }
    function apply() {
      var keyword = (q.value || '').trim().toLowerCase();
      var selectedRegion = region ? region.value : '';
      var selectedType = type ? type.value : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = (card.dataset.keywords || '').toLowerCase();
        var matched = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (selectedRegion && card.dataset.region !== selectedRegion) {
          matched = false;
        }
        if (selectedType && card.dataset.type !== selectedType) {
          matched = false;
        }
        if (selectedYear && card.dataset.year !== selectedYear) {
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
    [q, region, type, year].forEach(function (item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });
    apply();
  }

  function setupPlayers() {
    var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-hls]'));
    videos.forEach(function (video) {
      var source = video.getAttribute('data-hls');
      var wrap = video.closest('.player-wrap');
      var button = wrap ? wrap.querySelector('.play-overlay') : null;
      var status = document.querySelector('.player-status');
      var bound = false;
      var hlsInstance = null;
      function message(text) {
        if (status) {
          status.textContent = text;
          status.classList.add('show');
        }
      }
      function bindHls() {
        if (!source) {
          message('播放地址暂不可用');
          return Promise.reject(new Error('empty source'));
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (!video.src) {
            video.src = source;
          }
          bound = true;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          if (!bound) {
            hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
              if (!data || !data.fatal) {
                return;
              }
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              } else {
                message('播放遇到阻碍，请刷新重试');
              }
            });
            bound = true;
          }
          return Promise.resolve();
        }
        return loadScript('https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js').then(bindHls);
      }
      function play() {
        if (button) {
          button.classList.add('hidden');
        }
        bindHls().then(function () {
          var result = video.play();
          if (result && typeof result.catch === 'function') {
            result.catch(function () {
              message('点击播放器即可继续播放');
            });
          }
        }).catch(function () {
          message('当前浏览器无法启动播放');
        });
      }
      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('hidden');
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
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
