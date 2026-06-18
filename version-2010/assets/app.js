(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slides = selectAll(".hero-slide");
    var thumbs = selectAll(".hero-thumb");
    if (!slides.length || !thumbs.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle("active", thumbIndex === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(thumb.getAttribute("data-slide")) || 0);
        play();
      });
    });

    show(0);
    play();
  }

  function initSearch() {
    var input = document.getElementById("searchInput");
    var cards = selectAll(".searchable-grid .movie-card");
    if (!input || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function apply() {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
        card.classList.toggle("search-hidden", keyword && haystack.indexOf(keyword) === -1);
      });
    }

    input.addEventListener("input", apply);
    apply();
  }

  window.startMoviePlayer = function (source) {
    var video = document.getElementById("movie-player");
    var button = document.getElementById("movie-play");
    if (!video || !source) {
      return;
    }
    var hls;
    var ready = false;

    function attach() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      if (button) {
        button.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (!ready || video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (button && video.currentTime === 0) {
        button.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
