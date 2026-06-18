(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var heroIndex = 0;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle('is-active', current === heroIndex);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle('is-active', current === heroIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showHero(index);
        });
    });

    if (slides.length > 1) {
        showHero(0);
        window.setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function bindFilter(input) {
        var target = input.getAttribute('data-filter-input');
        var scope = target ? document.querySelector(target) : document;
        var empty = document.querySelector(input.getAttribute('data-empty-target') || '');
        if (!scope) {
            return;
        }
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
        var apply = function () {
            var term = normalize(input.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var matched = !term || haystack.indexOf(term) !== -1;
                card.classList.toggle('is-hidden-card', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        };
        input.addEventListener('input', apply);
        apply();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]')).forEach(bindFilter);

    var searchPageInput = document.querySelector('[data-search-page-input]');
    if (searchPageInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        searchPageInput.value = query;
        searchPageInput.dispatchEvent(new Event('input'));
    }

    var player = document.querySelector('[data-player]');
    if (player) {
        var source = player.getAttribute('data-video');
        var layer = document.querySelector('[data-play-layer]');
        var button = document.querySelector('[data-play-button]');
        var ready = false;

        function prepareVideo() {
            if (ready || !source) {
                return;
            }
            ready = true;
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(player);
            } else {
                player.src = source;
            }
        }

        function startVideo() {
            prepareVideo();
            if (layer) {
                layer.classList.add('is-hidden');
            }
            var attempt = player.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', startVideo);
        }
        if (layer) {
            layer.addEventListener('click', startVideo);
        }
        player.addEventListener('play', function () {
            if (layer) {
                layer.classList.add('is-hidden');
            }
        });
        player.addEventListener('pause', function () {
            if (player.currentTime === 0 && layer) {
                layer.classList.remove('is-hidden');
            }
        });
    }
})();
