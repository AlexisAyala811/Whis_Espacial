// Play the supplied launch footage once before entering the spacecraft.
export function playLaunchSequence({ container, video, phase, skip, reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches }) {
  return new Promise(resolve => {
    let finished = false;
    let timer;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      video.removeEventListener('ended', finish);
      video.removeEventListener('error', unavailable);
      video.removeEventListener('playing', playing);
      skip.removeEventListener('click', finish);
      video.pause();
      container.hidden = true;
      resolve();
    };
    const unavailable = () => {
      if (finished) return;
      clearTimeout(timer);
      phase.textContent = 'VIDEO UNAVAILABLE · CONTINUING TO THE SPACECRAFT';
      timer = setTimeout(finish, 2500);
    };
    const playing = () => clearTimeout(timer);
    video.addEventListener('ended', finish);
    video.addEventListener('error', unavailable);
    video.addEventListener('playing', playing);
    skip.addEventListener('click', finish);
    container.hidden = false;
    skip.focus();
    phase.textContent = reducedMotion ? 'PREPARING TO ENTER THE SPACECRAFT' : 'LAUNCH SEQUENCE';
    if (reducedMotion) {
      timer = setTimeout(finish, 1800);
      return;
    }
    try {
      video.currentTime = 0;
      timer = setTimeout(unavailable, 10000);
      Promise.resolve(video.play()).catch(unavailable);
    } catch {
      unavailable();
    }
  });
}
