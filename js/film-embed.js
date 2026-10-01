// Click-to-load YouTube players: a poster with a play button, swapped for the embed on click,
// so the page makes no YouTube requests until a visitor asks for the film.
function playFilm(frame) {
    if (!frame || frame.querySelector('iframe')) return;
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${frame.dataset.yt}?autoplay=1&rel=0&playsinline=1`;
    iframe.title = frame.getAttribute('aria-label') || 'Video';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    frame.replaceChildren(iframe);
}

function initFilmEmbeds(root = document) {
    root.querySelectorAll('.yt-facade:not([data-ready])').forEach(frame => {
        frame.dataset.ready = '1';
        frame.addEventListener('click', () => playFilm(frame));
        frame.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                playFilm(frame);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => initFilmEmbeds());
