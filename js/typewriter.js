/* js/typewriter.js — Typewriter animation for the h1 heading */

const FULL_HTML = 'What AI model can<br>your <span class="hi">PC</span> run?';
const FULL_TEXT = 'What AI model can\nyour PC run?';

/**
 * Animates `el` with a character-by-character typewriter effect,
 * then swaps in the proper HTML version (with colour spans).
 *
 * @param {HTMLElement} el      - Target element
 * @param {Function}   [onDone] - Optional callback fired when animation ends
 */
function typewrite(el, onDone) {
  const chars = FULL_TEXT.split('');
  let built = '';
  let i = 0;

  function tick() {
    if (i >= chars.length) {
      // Replace plain text with rich HTML, keep cursor for 900ms
      el.innerHTML = FULL_HTML + '<span class="tw-cursor"></span>';
      setTimeout(() => {
        el.innerHTML = FULL_HTML;
        if (onDone) onDone();
      }, 900);
      return;
    }

    built += chars[i] === '\n' ? '<br>' : chars[i];
    el.innerHTML = built + '<span class="tw-cursor"></span>';
    i++;
    setTimeout(tick, i === 1 ? 0 : 38 + Math.random() * 30);
  }

  tick();
}
