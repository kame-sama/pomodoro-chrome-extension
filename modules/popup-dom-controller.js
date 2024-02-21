import formatTime from './format-time';

export default function popupDOMController() {
  const root = document.querySelector(':root');
  const statusBarDivs = document.querySelectorAll('#statusBar > *');
  const timerDiv = document.querySelector('#timer');
  const counterDiv = document.querySelector('#counter');
  const toggleTimerButton = document.querySelector('#toggleTimer');
  toggleTimerButton.textContent = 'Start';

  const updateStatus = (status) => {
    statusBarDivs.forEach((div) => {
      if (div.id === status) div.classList.add('active');
      else div.classList.remove('active');
    });
  };

  const updateTimer = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    timerDiv.textContent = `${formatTime(minutes)}:${formatTime(seconds)}`;
  };

  const updateCounter = (count) => {
    counterDiv.textContent = `#${count}`;
  };

  const updateTheme = (status) => {
    if (status === 'pomodoro') root.classList.remove('blue-theme');
    else root.classList.add('blue-theme');
  };

  const toggleButtonText = (forcedText = null) => {
    if (forcedText) toggleTimerButton.textContent = forcedText;
    else
      toggleTimerButton.textContent =
        toggleTimerButton.textContent === 'Start' ? 'Pause' : 'Start';
  };

  return {
    updateStatus,
    updateTimer,
    updateCounter,
    updateTheme,
    toggleButtonText,
  };
}
