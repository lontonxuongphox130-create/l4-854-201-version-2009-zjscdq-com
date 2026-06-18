document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".player-shell").forEach(function (shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    var source = shell.getAttribute("data-video-url");
    var prepared = false;

    var prepare = function () {
      if (!video || !source || prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    };

    var start = function () {
      prepare();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    };

    if (overlay && video) {
      overlay.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      video.addEventListener("click", function () {
        if (video.paused && !prepared) {
          start();
        }
      });
    }
  });
});
