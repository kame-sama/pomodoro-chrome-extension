const taskMenuPopup = document.querySelector('.task-menu-popup');

document.body.addEventListener('click', (event) => {
  if (
    (event.target.id !== 'clearFinished' || event.target.id !== 'clearAll') &&
    taskMenuPopup.className.includes('open')
  ) {
    taskMenuPopup.classList.remove('open');
  }
});

/**
 * Opens task menu popup
 */
export default function openTaskMenu() {
  taskMenuPopup.classList.toggle('open');
}
