const html = document.querySelector(':root');

/**
 * Updates color theme depending on timer status
 * @param {String} status
 */
export default function updateTheme(status) {
  if (status === 'pomodoro') html.classList.remove('blue-theme');
  else html.classList.add('blue-theme');
}
