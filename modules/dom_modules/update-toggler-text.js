const toggler = document.querySelector('#toggler');

/**
 * Updates toggler text that represents current timer state
 * @param {String} text optional
 */
export default function updateTogglerText(text = null) {
  if (text) toggler.textContent = text;
  else
    toggler.textContent = toggler.textContent === 'Start' ? 'Pause' : 'Start';
}
