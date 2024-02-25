import getTimeLeft from './modules/helpers/get-time-left';
import formatTime from './modules/helpers/format-time';

const modalDialog = document.createElement('dialog');
const timerDiv = document.createElement('div');

modalDialog.style.backgroundColor = 'rgb(255 99 71 / 80%)';
modalDialog.style.color = 'cornsilk';
modalDialog.style.backdropFilter = 'blur(2px)';
modalDialog.style.width = '100vw';
modalDialog.style.height = '100vh';
modalDialog.style.border = 'none';
modalDialog.style.outline = 'none';
modalDialog.style.borderRadius = 'none';
modalDialog.style.margin = 0;
modalDialog.style.maxWidth = '100%';
modalDialog.style.maxHeight = '100%';

timerDiv.style.height = '100%';
timerDiv.style.fontSize = '50vh';
timerDiv.style.fontWeight = 'bold';
timerDiv.style.display = 'flex';
timerDiv.style.justifyContent = 'center';
timerDiv.style.alignItems = 'center';

modalDialog.appendChild(timerDiv);
document.body.appendChild(modalDialog);

const updateTimer = function (timeInSeconds) {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  timerDiv.textContent = `${formatTime(minutes)}:${formatTime(seconds)}`;
};

setInterval(async () => {
  const alarm = await chrome.runtime.sendMessage({ msg: 'time left' });
  if (alarm?.name === 'pomodoro') {
    if (!modalDialog.hasAttribute('open')) modalDialog.showModal();
    updateTimer(await getTimeLeft(alarm));
  } else {
    modalDialog.close();
  }
}, 1000);
