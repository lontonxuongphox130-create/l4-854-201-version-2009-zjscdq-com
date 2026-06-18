document.addEventListener("DOMContentLoaded", function () {
  var body = document.body;
  var toggle = document.querySelector(".menu-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      body.classList.toggle("nav-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  if (slides.length > 1) {
    var current = 0;
    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });
    setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  document.querySelectorAll(".toolbar").forEach(function (toolbar) {
    var input = toolbar.querySelector(".movie-search");
    var buttons = Array.prototype.slice.call(toolbar.querySelectorAll(".filter-btn"));
    var list = toolbar.parentElement.querySelector(".searchable-list");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var activeFilter = "all";
    var apply = function () {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var haystack = card.getAttribute("data-search") || "";
        var type = card.getAttribute("data-type") || "";
        var year = card.getAttribute("data-year") || "";
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchFilter = activeFilter === "all" || type === activeFilter || year === activeFilter || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
        card.classList.toggle("hidden-by-filter", !(matchKeyword && matchFilter));
      });
    };
    if (input) {
      input.addEventListener("input", apply);
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        activeFilter = button.getAttribute("data-filter") || "all";
        apply();
      });
    });
  });
});
