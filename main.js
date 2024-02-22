import './css/style.css';
import getTimeLeft from './modules/get-time-left';
import popupDOMController from './modules/popup-dom-controller';
import iconBlueUrl from '/icon-16-blue.png';

let { status, count, timeLeft } = await chrome.storage.session.get();

if (!status) {
  status = 'pomodoro';
  chrome.storage.session.set({ status });
}

if (!count) {
  count = 1;
  chrome.storage.session.set({ count });
}

if (!timeLeft) {
  timeLeft = 0;
  chrome.storage.session.set({ timeLeft });
}

const settings = await chrome.storage.sync.get([
  'pomodoro',
  'shortBreak',
  'longBreak',
  'autoStartBreaks',
  'autoStartPomodoros',
  'longBreakInterval',
]);
const DOMController = popupDOMController();
const alarm = await chrome.alarms.get(status);
let intervalId;

const updateSession = (oldStatus) => {
  if (oldStatus === 'pomodoro') {
    status = count % settings.longBreakInterval ? 'shortBreak' : 'longBreak';
  } else {
    count++;
    status = 'pomodoro';
  }
  timeLeft = 0;
};

DOMController.updateStatus(status);
DOMController.updateCounter(count);
DOMController.updateTheme(status);

if (!alarm && !timeLeft) {
  DOMController.updateTimer(parseInt(settings[status]) * 60);
}

if (!alarm && timeLeft) {
  DOMController.updateTimer(timeLeft);
}

if (alarm) {
  DOMController.toggleButtonText('Pause');
  DOMController.updateTimer(await getTimeLeft());
  intervalId = setInterval(async () => {
    DOMController.updateTimer(await getTimeLeft());
  }, 1000);
}

document
  .querySelector('#toggleTimer')
  .addEventListener('click', async (event) => {
    if (event.target.textContent === 'Start') {
      if (!timeLeft)
        chrome.alarms.create(status, {
          delayInMinutes: parseFloat(settings[status]),
        });
      else chrome.alarms.create(status, { delayInMinutes: timeLeft / 60 });

      intervalId = setInterval(async () => {
        DOMController.updateTimer(await getTimeLeft());
      }, 1000);
    } else {
      timeLeft = await getTimeLeft();
      chrome.storage.session.set({ timeLeft });
      chrome.alarms.clearAll();
      clearInterval(intervalId);
    }
    DOMController.toggleButtonText();
  });

document.querySelector('#settings').addEventListener('click', () => {
  chrome.tabs.create({ url: './pages/settings.html' });
});

document.querySelector('#skip').addEventListener('click', () => {
  chrome.alarms.clearAll();
  updateSession(status);

  if (status === 'pomodoro')
    chrome.action.setIcon({ path: './images/icon-16.png' });
  else chrome.action.setIcon({ path: iconBlueUrl });

  chrome.storage.session.set({ status, count, timeLeft });
  clearInterval(intervalId);
  DOMController.toggleButtonText('Start');
  DOMController.updateStatus(status);
  DOMController.updateCounter(count);
  DOMController.updateTheme(status);
  DOMController.updateTimer(parseInt(settings[status]) * 60);
});

chrome.alarms.onAlarm.addListener((event) => {
  updateSession(event.name);
  clearInterval(intervalId);

  if (
    (event.name === 'pomodoro' && !settings.autoStartBreaks) ||
    (event.name !== 'pomodoro' && !settings.autoStartPomodoros)
  ) {
    DOMController.toggleButtonText('Start');
  }

  DOMController.updateStatus(status);
  DOMController.updateCounter(count);
  DOMController.updateTheme(status);
  DOMController.updateTimer(parseInt(settings[status]) * 60);

  if (
    (event.name === 'pomodoro' && settings.autoStartBreaks) ||
    (event.name !== 'pomodoro' && settings.autoStartPomodoros)
  ) {
    intervalId = setInterval(async () => {
      DOMController.updateTimer(await getTimeLeft());
    }, 1000);
  }
});
