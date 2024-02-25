const statusBar = document.querySelectorAll('.status-bar > *');

/**
 * Updates DOM with current timer status
 * @param {String} status
 */
export default function updateStatus(status) {
  statusBar.forEach((item) => {
    if (item.id === status) item.classList.add('active');
    else item.classList.remove('active');
  });
}
