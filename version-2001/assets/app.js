(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var button = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function setSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        setSlide(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        setSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        setSlide(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupLocalFilters() {
    var input = document.querySelector(".local-filter-input");
    var select = document.querySelector(".local-filter-select");
    var list = document.querySelector("[data-local-list]");
    if (!input || !select || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

    function matchesYear(card, year) {
      if (!year) {
        return true;
      }
      var value = card.getAttribute("data-year") || "";
      if (year === "2022") {
        var numeric = parseInt(value, 10);
        return !numeric || numeric <= 2022;
      }
      return value === year;
    }

    function apply() {
      var keyword = input.value.trim().toLowerCase();
      var year = select.value;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-genre") || ""
        ].join(" ").toLowerCase();
        var visible = haystack.indexOf(keyword) !== -1 && matchesYear(card, year);
        card.style.display = visible ? "" : "none";
      });
    }

    input.addEventListener("input", apply);
    select.addEventListener("change", apply);
  }

  function setupSearchPage() {
    var input = document.getElementById("site-search-input");
    var yearSelect = document.getElementById("site-search-year");
    var typeSelect = document.getElementById("site-search-type");
    var results = document.getElementById("search-results");
    var dataNode = document.getElementById("search-data");
    if (!input || !yearSelect || !typeSelect || !results || !dataNode) {
      return;
    }
    var movies = [];
    try {
      movies = JSON.parse(dataNode.textContent || "[]");
    } catch (error) {
      movies = [];
    }
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get("q") || "";
    if (initialKeyword) {
      input.value = initialKeyword;
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;",
          "'": "&#39;"
        }[char];
      });
    }

    function yearMatches(value, year) {
      if (!year) {
        return true;
      }
      if (year === "2022") {
        var numeric = parseInt(value, 10);
        return !numeric || numeric <= 2022;
      }
      return String(value) === year;
    }

    function cardHtml(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return [
        "<article class=\"movie-card\">",
        "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看 " + escapeHtml(movie.title) + "\">",
        "<span class=\"poster-frame\">",
        "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" onerror=\"this.remove()\">",
        "<span class=\"poster-shadow\"></span>",
        "<span class=\"play-circle\">▶</span>",
        "<span class=\"score-badge\">" + escapeHtml(movie.score) + "</span>",
        "</span>",
        "</a>",
        "<div class=\"movie-card-body\">",
        "<h2><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h2>",
        "<p class=\"movie-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</p>",
        "<p class=\"movie-desc\">" + escapeHtml(movie.oneLine || "") + "</p>",
        "<div class=\"movie-tags\">" + tags + "</div>",
        "</div>",
        "</article>"
      ].join("");
    }

    function apply() {
      var keyword = input.value.trim().toLowerCase();
      var year = yearSelect.value;
      var type = typeSelect.value;
      var filtered = movies.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" ").toLowerCase();
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        var yearMatch = yearMatches(movie.year, year);
        var typeMatch = !type || movie.type === type;
        return keywordMatch && yearMatch && typeMatch;
      }).slice(0, 120);
      if (!filtered.length) {
        results.innerHTML = "<div class=\"no-results\">没有找到匹配影片</div>";
        return;
      }
      results.innerHTML = filtered.map(cardHtml).join("");
    }

    input.addEventListener("input", apply);
    yearSelect.addEventListener("change", apply);
    typeSelect.addEventListener("change", apply);
    if (initialKeyword) {
      apply();
    }
  }

  function setupPlayers() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    blocks.forEach(function (block) {
      var video = block.querySelector("video");
      var cover = block.querySelector(".player-cover");
      var info = block.querySelector(".player-info");
      if (!video || !cover || !info) {
        return;
      }
      var config = {};
      try {
        config = JSON.parse(info.textContent || "{}");
      } catch (error) {
        config = {};
      }
      var url = config.url || video.getAttribute("src") || "";
      var loaded = false;
      var hls = null;

      function attach() {
        if (loaded || !url) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          video.removeAttribute("src");
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      function play() {
        attach();
        cover.classList.add("is-hidden");
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {
            cover.classList.remove("is-hidden");
          });
        }
      }

      cover.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        cover.classList.add("is-hidden");
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupLocalFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
