document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.setAttribute('tabindex', '-1');
  });
});

document.querySelectorAll('.reference-list a').forEach((link) => {
  link.textContent = link.href;
});

document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.carousel-track');
  const slides = [...carousel.querySelectorAll('.carousel-slide')];
  const dots = [...carousel.querySelectorAll('.carousel-dot')];
  const status = carousel.querySelector('[data-status]');
  if (!track || slides.length === 0) return;

  const SLIDE_GAP = 16;
  let current = 0;
  let isDragging = false;
  let activePointerId = null;
  let startX = 0;
  let deltaX = 0;

  const setTrackPosition = (offsetPx = 0) => {
    const basePercent = -current * 100;
    const gapOffset = -current * SLIDE_GAP;
    track.style.transform = `translate3d(calc(${basePercent}% + ${gapOffset + offsetPx}px), 0, 0)`;
  };

  const updateUI = (index) => {
    current = (index + slides.length) % slides.length;
    setTrackPosition(0);
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    if (status) {
      status.textContent = `${current + 1} / ${slides.length} · Desliza ↔`;
    }
  };

  // Dot indicators
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      updateUI(i);
    });
  });

  // Keyboard navigation when focused
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      updateUI(current + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      updateUI(current - 1);
    }
  });

  // Only start drag on touch OR explicit primary mouse click (e.button === 0)
  track.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    isDragging = true;
    activePointerId = e.pointerId;
    startX = e.clientX;
    deltaX = 0;
    track.classList.add('is-dragging');
    track.setPointerCapture(e.pointerId);
  });

  track.addEventListener('pointermove', (e) => {
    if (!isDragging || e.pointerId !== activePointerId) return;
    if (e.pointerType === 'mouse' && (e.buttons & 1) !== 1) {
      finishDrag();
      return;
    }
    deltaX = e.clientX - startX;
    setTrackPosition(deltaX);
  });

  const finishDrag = (e) => {
    if (!isDragging) return;
    if (e && e.pointerId !== undefined && e.pointerId !== activePointerId) return;

    isDragging = false;
    activePointerId = null;
    track.classList.remove('is-dragging');

    const threshold = Math.min(60, (track.clientWidth || 300) * 0.15);
    if (deltaX < -threshold) {
      updateUI(current + 1);
    } else if (deltaX > threshold) {
      updateUI(current - 1);
    } else {
      setTrackPosition(0);
    }
    deltaX = 0;
  };

  track.addEventListener('pointerup', finishDrag);
  track.addEventListener('pointercancel', finishDrag);
  track.addEventListener('lostpointercapture', finishDrag);

  updateUI(0);
});
