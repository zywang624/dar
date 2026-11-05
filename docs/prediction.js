(() => {
  const container = document.querySelector('.hypothesis');
  const sentence = container?.querySelector('.prediction-sentence');
  if (!sentence) return;

  const words = [...sentence.children].map(word =>
    word.firstChild.textContent.trim()
  );
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const nodes = words.map(word => {
    const node = document.createElement('span');
    node.className = 'prediction-word';
    node.textContent = word;
    return node;
  });
  const dots = document.createElement('span');
  dots.className = 'prediction-dots';
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    dot.textContent = '.';
    dots.append(dot);
  }

  const toggle = document.createElement('button');
  toggle.className = 'prediction-toggle';
  toggle.type = 'button';
  container.after(toggle);
  container.classList.add('is-streaming');
  let count = 1;
  let paused = reducedMotion.matches;
  let timer;

  function render() {
    sentence.replaceChildren();
    nodes.slice(0, count).forEach((node, index) => {
      const distance = count - 1 - index;
      const proximity = Math.max(0, 1 - distance / 9);
      node.style.setProperty('--word-size', `${13 + 16 * proximity}px`);
      node.style.setProperty('--word-weight', distance === 0 ? '600' : '400');
      const color = [137, 147, 156].map((start, channel) =>
        Math.round(start + ([36, 77, 101][channel] - start) * proximity)
      );
      node.style.setProperty('--word-color', `rgb(${color.join(',')})`);
      if (index) sentence.append(document.createTextNode(' '));
      sentence.append(node);
    });
    sentence.append(dots);
    container.scrollLeft = container.scrollWidth;
  }

  function schedule() {
    clearTimeout(timer);
    if (paused || document.hidden) return;
    timer = setTimeout(() => {
      count = count === words.length ? 1 : count + 1;
      render();
      schedule();
    }, count === words.length ? 4200 : 850);
  }

  function updateControl() {
    const label = paused ? 'Play word animation' : 'Pause word animation';
    toggle.textContent = paused ? '\u25b6' : '\u23f8';
    toggle.title = label;
    toggle.setAttribute('aria-label', label);
    container.classList.toggle('is-paused', paused);
  }

  toggle.addEventListener('click', () => {
    paused = !paused;
    updateControl();
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', event => {
    paused = event.matches;
    if (paused) count = words.length;
    render();
    updateControl();
    schedule();
  });
  if (paused) count = words.length;
  render();
  updateControl();
  schedule();
})();
