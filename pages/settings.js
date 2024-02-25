import '../css/settings.css';
import scriptPath from '../content?script';

const settings = await chrome.storage.sync.get();
const pomodoro = document.querySelector('#pomodoro');
const shortBreak = document.querySelector('#short-break');
const longBreak = document.querySelector('#long-break');
const autoStartBreaks = document.querySelector('#auto-start-breaks');
const autoStartPomodoros = document.querySelector('#auto-start-pomodoros');
const longBreakInterval = document.querySelector('#long-break-interval');
const blockList = document.querySelector('.block-list ul');

if (!settings.blocker) settings.blocker = [];

const displaySettings = function (
  pomodoroTime = 25,
  shortBreakTime = 5,
  longBreakTime = 15,
  autoStartBreaksEnabled = false,
  autoStartPomodorosEnabled = false,
  longBreakIntervalCount = 4,
) {
  pomodoro.value = pomodoroTime;
  shortBreak.value = shortBreakTime;
  longBreak.value = longBreakTime;
  autoStartBreaks.checked = autoStartBreaksEnabled;
  autoStartPomodoros.checked = autoStartPomodorosEnabled;
  longBreakInterval.value = longBreakIntervalCount;
};

const updateSettings = function () {
  chrome.storage.sync.set({
    pomodoro: pomodoro.value,
    shortBreak: shortBreak.value,
    longBreak: longBreak.value,
    autoStartBreaks: autoStartBreaks.checked,
    autoStartPomodoros: autoStartPomodoros.checked,
    longBreakInterval: longBreakInterval.value,
  });
};

const displayBlockList = function () {
  blockList.textContent = '';
  if (!settings.blocker?.length) return;
  settings.blocker.forEach((item, index) => {
    const li = document.createElement('li');
    li.classList.add('grid');
    li.innerHTML = `
      <div>${index + 1}</div>
      <div>${item.slice(4, -2)}</div>
      <button class="button" data-index="${index}">Delete</div>`;

    blockList.appendChild(li);
  });
};

const updateScripting = async function () {
  const currentScript = await chrome.scripting.getRegisteredContentScripts({
    ids: ['blocker'],
  });
  if (currentScript.length) {
    chrome.scripting.updateContentScripts([
      {
        id: 'blocker',
        matches: settings.blocker,
      },
    ]);
  } else {
    chrome.scripting.registerContentScripts([
      {
        id: 'blocker',
        matches: settings.blocker,
        js: [scriptPath],
        allFrames: true,
      },
    ]);
  }
};

if (settings.pomodoro) {
  displaySettings(
    settings.pomodoro,
    settings.shortBreak,
    settings.longBreak,
    settings.autoStartBreaks,
    settings.autoStartPomodoros,
    settings.longBreakInterval,
  );
} else {
  displaySettings();
  updateSettings();
}

if (settings.blocker.length) {
  updateScripting();
  displayBlockList();
}

document.querySelector('#save').addEventListener('click', updateSettings);
document.querySelector('#reset').addEventListener('click', () => {
  displaySettings();
  updateSettings();
  chrome.alarms.clearAll();
  chrome.storage.session.clear();
  chrome.action.setIcon({ path: './images/icon-16.png' });
});
document.querySelector('#add-target').addEventListener('click', async () => {
  const address = document.querySelector('#address');

  if (!address.value) return;
  if (settings.blocker.includes(`*://${address.value}/*`)) {
    address.value = '';
    return;
  }

  settings.blocker.push(`*://${address.value}/*`);
  address.value = '';
  chrome.storage.sync.set({ blocker: settings.blocker });

  updateScripting();
  displayBlockList();
});
blockList.addEventListener('click', (event) => {
  if (!event.target.dataset?.index) return;
  settings.blocker.splice(parseInt(event.target.dataset.index), 1);
  chrome.storage.sync.set({ blocker: settings.blocker });
  if (settings.blocker.length) updateScripting();
  else chrome.scripting.unregisterContentScripts({ ids: ['blocker'] });
  displayBlockList();
});
