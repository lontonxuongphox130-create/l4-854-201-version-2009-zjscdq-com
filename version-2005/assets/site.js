(function () {
    function getCards() {
        return Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function updateFilter() {
        var input = document.querySelector('[data-filter-input]');
        var typeSelect = document.querySelector('[data-type-filter]');
        var count = document.querySelector('[data-filter-count]');
        var query = normalize(input && input.value);
        var selectedType = normalize(typeSelect && typeSelect.value);
        var cards = getCards();
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var type = normalize(card.getAttribute('data-type'));
            var matchedQuery = !query || text.indexOf(query) !== -1;
            var matchedType = !selectedType || type.indexOf(selectedType) !== -1;
            var show = matchedQuery && matchedType;
            card.classList.toggle('hidden-by-filter', !show);
            if (show) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = '当前显示 ' + visible + ' 部影片';
        }
    }

    function applySort() {
        var sort = document.querySelector('[data-sort]');
        var grid = document.querySelector('[data-grid]');
        if (!sort || !grid) {
            return;
        }
        var cards = getCards();
        var value = sort.value;
        cards.sort(function (a, b) {
            if (value === 'views') {
                return numberFromText(b) - numberFromText(a);
            }
            if (value === 'year') {
                return parseInt(b.getAttribute('data-year') || '0', 10) - parseInt(a.getAttribute('data-year') || '0', 10);
            }
            if (value === 'title') {
                return normalize(a.innerText).localeCompare(normalize(b.innerText), 'zh-Hans-CN');
            }
            return 0;
        });
        cards.forEach(function (card) {
            grid.appendChild(card);
        });
        updateFilter();
    }

    function numberFromText(card) {
        var text = card.innerText || '';
        var match = text.match(/([0-9,]+)\s*次观看/);
        return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
    }

    function initSearchQuery() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        var input = document.querySelector('[data-filter-input]');
        if (q && input) {
            input.value = q;
            updateFilter();
        }
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var active = 0;
        var timer;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(index);
                start();
            });
        });

        show(0);
        start();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initSearchQuery();
        updateFilter();

        var input = document.querySelector('[data-filter-input]');
        var typeSelect = document.querySelector('[data-type-filter]');
        var sort = document.querySelector('[data-sort]');

        if (input) {
            input.addEventListener('input', updateFilter);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', updateFilter);
        }
        if (sort) {
            sort.addEventListener('change', applySort);
        }
    });
})();
