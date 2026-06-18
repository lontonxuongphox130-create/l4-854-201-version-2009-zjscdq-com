(function () {
    function initHls(video, sourceUrl) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            return new Promise(function (resolve) {
                hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
            });
        }

        video.src = sourceUrl;
        return Promise.resolve();
    }

    document.addEventListener('DOMContentLoaded', function () {
        var player = document.querySelector('[data-player]');
        if (!player) {
            return;
        }

        var video = player.querySelector('video');
        var overlay = player.querySelector('[data-play-overlay]');
        var sourceUrl = player.getAttribute('data-source');
        var started = false;

        function play() {
            if (!video || !sourceUrl || started) {
                return;
            }
            started = true;
            if (overlay) {
                overlay.style.display = 'none';
            }
            video.controls = true;
            initHls(video, sourceUrl).then(function () {
                return video.play();
            }).catch(function () {
                video.controls = true;
            });
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }
        player.addEventListener('dblclick', play);
    });
})();
