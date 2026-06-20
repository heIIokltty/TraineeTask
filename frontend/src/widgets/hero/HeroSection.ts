import './HeroSection.css';

const HERO_VIDEO_SOURCE = 'videos/HP.webm';

export function createHeroSection(): HTMLElement {
  const sectionElement = document.createElement('section');
  sectionElement.className = 'hero-section';
  sectionElement.setAttribute('aria-labelledby', 'hero-title');

  const videoElement = document.createElement('video');
  videoElement.className = 'hero-section__video';
  videoElement.autoplay = true;
  videoElement.muted = true;
  videoElement.defaultMuted = true;
  videoElement.loop = true;
  videoElement.playsInline = true;
  videoElement.preload = 'auto';
  videoElement.setAttribute('aria-hidden', 'true');
  videoElement.setAttribute('autoplay', '');
  videoElement.setAttribute('muted', '');
  videoElement.setAttribute('loop', '');
  videoElement.setAttribute('playsinline', '');
  videoElement.removeAttribute('controls');

  const sourceElement = document.createElement('source');
  sourceElement.src = HERO_VIDEO_SOURCE;
  sourceElement.type = 'video/webm';
  videoElement.append(sourceElement);

  const overlayElement = document.createElement('div');
  overlayElement.className = 'hero-section__overlay';

  const contentElement = document.createElement('div');
  contentElement.className = 'hero-section__content';

  const copyElement = document.createElement('div');
  copyElement.className = 'hero-section__copy';
  copyElement.innerHTML = `
    <h1 class="hero-section__title" id="hero-title">FROM THE FIELD OF ALL POSSIBILITY</h1>
    <p class="hero-section__description">
      This is an emergent space where ideas are not created, but carefully discovered.
      We navigate the vast potential to bring forth only the most resonant patterns and
      coherent forms. Here, the Future is curated from the infinite.
    </p>
  `;

  const actionsElement = document.createElement('div');
  actionsElement.className = 'hero-section__actions';

  const learnMoreLink = document.createElement('a');
  learnMoreLink.className = 'hero-section__button hero-section__button--primary';
  learnMoreLink.href = '#about';
  learnMoreLink.innerHTML = '<span>Learn More</span><span aria-hidden="true">-></span>';

  const playVideoButton = document.createElement('button');
  playVideoButton.className = 'hero-section__button hero-section__button--secondary';
  playVideoButton.type = 'button';
  playVideoButton.innerHTML = '<span>Play Video</span><span aria-hidden="true">&gt;</span>';

  actionsElement.append(learnMoreLink, playVideoButton);
  copyElement.append(actionsElement);
  contentElement.append(copyElement);
  sectionElement.append(videoElement, overlayElement, contentElement);

  requestAnimationFrame(() => {
    void videoElement.play().catch(() => {
      videoElement.dataset.autoplay = 'blocked';
    });
  });

  return sectionElement;
}
