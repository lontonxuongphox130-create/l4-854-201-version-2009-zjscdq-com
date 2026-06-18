
(function () {
  function initPlayer(player) {
    var video = player.querySelector('video');
    var trigger = player.querySelector('[data-player-trigger]');

    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var hlsInstance = null;
    var loaded = false;

    function attachStream() {
      if (!stream || loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function playVideo() {
      attachStream();
      video.setAttribute('controls', 'controls');
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
      var playback = video.play();
      if (playback && typeof playback.catch === 'function') {
        playback.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', playVideo);
    }

    video.addEventListener('click', playVideo, { once: true });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.querySelectorAll('.video-player').forEach(initPlayer);
})();
