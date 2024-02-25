import formatTime from '../helpers/format-time';

const timer = document.querySelector('.timer');

/**
 * Updates DOM with current timer value
 * @param {Number} secondsLeft
 */
export default function updateTimer(secondsLeft) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = Math.floor(secondsLeft % 60);
  timer.textContent = `${formatTime(minutes)}:${formatTime(seconds)}`;
}
