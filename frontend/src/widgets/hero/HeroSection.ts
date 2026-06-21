import { createAuthService } from '../../features/google-auth/model/auth.service';
import { createBankingCard } from '../banking-card/BankingCard';
import './HeroSection.css';

const HERO_VIDEO_SOURCE = 'videos/HP.webm';
const HERO_VIDEO_POSTER = 'images/hero-poster.png';

export function createHeroSection(): HTMLElement {
  const authService = createAuthService();
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
  videoElement.poster = HERO_VIDEO_POSTER;
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

  const contentElement = document.createElement('div');
  contentElement.className = 'hero-section__content';

  const copyElement = document.createElement('div');
  copyElement.className = 'hero-section__copy';
  copyElement.innerHTML = `
    <h1 class="hero-section__title animate-on-load delay-1" id="hero-title">
      FROM THE FIELD OF ALL POSSIBILITY
    </h1>
    <p class="hero-section__description animate-on-load delay-2">
      This is an emergent space where ideas are not created, but carefully discovered.
      We navigate the vast potential to bring forth only the most resonant patterns and
      coherent forms. Here, the Future is curated from the infinite.
    </p>
  `;

  const actionsElement = document.createElement('div');
  actionsElement.className = 'hero-section__actions animate-on-load delay-3';

  const learnMoreLink = document.createElement('a');
  learnMoreLink.className = 'hero-section__button hero-section__button--primary';
  learnMoreLink.href = '#about';
  learnMoreLink.innerHTML = '<span>Learn More</span><span aria-hidden="true">→</span>';
  learnMoreLink.addEventListener('click', (event) => {
    event.preventDefault();
    openModal(createLearnMoreModal());
  });

  const playVideoButton = document.createElement('button');
  playVideoButton.className = 'hero-section__button hero-section__button--secondary';
  playVideoButton.type = 'button';
  playVideoButton.innerHTML = '<span>Play Video</span><span aria-hidden="true">▶</span>';
  playVideoButton.addEventListener('click', () => {
    openModal(createVideoModal());
  });

  actionsElement.append(learnMoreLink, playVideoButton);
  copyElement.append(actionsElement);
  const bankingCardElement = createBankingCard({ authService });
  bankingCardElement.classList.add('animate-on-load', 'delay-4');

  contentElement.append(copyElement, bankingCardElement);
  sectionElement.append(videoElement, contentElement);

  requestAnimationFrame(() => {
    void videoElement.play().catch(() => {
      videoElement.dataset.autoplay = 'blocked';
    });
  });

  return sectionElement;
}

function openModal(contentElement: HTMLElement): void {
  const modalElement = document.createElement('div');
  modalElement.className = 'hero-modal';
  modalElement.setAttribute('role', 'dialog');
  modalElement.setAttribute('aria-modal', 'true');

  const closeButton = document.createElement('button');
  closeButton.className = 'hero-modal__close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close popup');
  closeButton.textContent = '×';

  const modalShellElement = document.createElement('div');
  modalShellElement.className = 'hero-modal__shell';
  modalShellElement.append(closeButton, contentElement);

  modalElement.append(modalShellElement);
  document.body.append(modalElement);
  document.body.classList.add('hero-modal-open');
  closeButton.focus();

  closeButton.addEventListener('click', closeModal);
  modalElement.addEventListener('click', (event) => {
    if (event.target === modalElement) {
      closeModal();
    }
  });
  document.addEventListener('keydown', handleKeydown);

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      closeModal();
    }
  }

  function closeModal(): void {
    const videoElement = modalElement.querySelector('video');
    videoElement?.pause();
    document.removeEventListener('keydown', handleKeydown);
    document.body.classList.remove('hero-modal-open');
    modalElement.remove();
  }
}

function createLearnMoreModal(): HTMLElement {
  const articleElement = document.createElement('article');
  articleElement.className = 'hero-modal__panel hero-modal__panel--learn-more';
  articleElement.innerHTML = `
    <h2 class="hero-modal__title">The Digital Bridge Between Reality and Tomorrow</h2>
    <div class="hero-modal__text">
      <p>
        When you turn on your smart alarm clock in the morning of 2026, it already knows you
        slept seventeen minutes less than usual. The algorithm picks a morning playlist based
        on your heart rate and the current moon phase. Your voice assistant, trained on
        thousands of previous conversations, doesn't just say “good morning” - it reminds you:
        “Don't forget to pick up your package from the drone post before 10:30 AM.” You step up
        to the mirror, and instead of your reflection, you see graphs of your hydration levels,
        your daily schedule, and a suggestion: “You might want to take extra vitamin D - it's
        going to be cloudy today.”
      </p>
      <p>
        In the evening, you activate “dark matter” mode at home: the lights dim gradually,
        following your movement; the Wi-Fi reallocates bandwidth to stream a movie in 32K; and
        the lounge chair warms up exactly the spot on your back that got tired from sitting. On
        screen - not just a film: a generative neural network adjusts the subtitles, replaces
        store signs with brands you recognize, and even redubs the actors if you whisper a
        request.
      </p>
      <p>
        When you turn on your smart alarm clock in the morning of 2026, it already knows you
        slept seventeen minutes less than usual. The algorithm picks a morning playlist based
        on your heart rate and the current moon phase.
      </p>
    </div>
  `;

  return articleElement;
}

function createVideoModal(): HTMLElement {
  const videoPanelElement = document.createElement('div');
  videoPanelElement.className = 'hero-modal__panel hero-modal__panel--video';

  const videoElement = document.createElement('video');
  videoElement.className = 'hero-modal__video';
  videoElement.controls = true;
  videoElement.playsInline = true;
  videoElement.preload = 'metadata';
  videoElement.poster = HERO_VIDEO_POSTER;

  const sourceElement = document.createElement('source');
  sourceElement.src = HERO_VIDEO_SOURCE;
  sourceElement.type = 'video/webm';
  videoElement.append(sourceElement);

  videoPanelElement.append(videoElement);

  return videoPanelElement;
}
