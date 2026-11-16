// Keep decorative background videos still when the visitor requests reduced motion.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
function pauseBackgroundVideos() {
  if (motionPreference.matches) document.querySelectorAll('video').forEach(video => video.pause());
}
document.addEventListener('play', event => {
  if (motionPreference.matches && event.target instanceof HTMLVideoElement) event.target.pause();
}, true);
motionPreference.addEventListener('change', pauseBackgroundVideos);
