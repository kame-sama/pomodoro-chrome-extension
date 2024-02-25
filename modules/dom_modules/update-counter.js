const counter = document.querySelector('.counter');

/**
 * Update DOM with current pomodoros count
 * @param {Number} count
 */
export default function updateCounter(count) {
  counter.textContent = `#${count}`;
}
