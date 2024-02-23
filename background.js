import iconBlueUrl from '/icon-16-blue.png';

chrome.runtime.onInstalled.addListener((_reason) => {
  chrome.tabs.create({
    url: './pages/settings.html',
  });
});

chrome.alarms.onAlarm.addListener(async (event) => {
  let { count, status } = await chrome.storage.session.get(['count', 'status']);
  const settings = await chrome.storage.sync.get([
    'pomodoro',
    'shortBreak',
    'longBreak',
    'autoStartBreaks',
    'autoStartPomodoros',
    'longBreakInterval',
    'tasks',
    'currentTaskId',
  ]);

  if (event.name === 'pomodoro') {
    if (
      settings.tasks.length &&
      settings.currentTaskId < settings.tasks.length
    ) {
      settings.tasks[settings.currentTaskId].pomodoros++;
      chrome.storage.sync.set({ tasks: settings.tasks });
    }
    status = count % settings.longBreakInterval ? 'shortBreak' : 'longBreak';
    chrome.action.setIcon({ path: iconBlueUrl });
  } else {
    count++;
    status = 'pomodoro';
    chrome.action.setIcon({ path: './images/icon-16.png' });
  }

  chrome.storage.session.set({ count, status, timeLeft: 0 });

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/icon-128.png',
    title: 'Pomodoro',
    message: `Time to ${status === 'pomodoro' ? 'Focus' : 'Rest'}!`,
    priority: 0,
  });

  if (
    (event.name === 'pomodoro' && settings.autoStartBreaks) ||
    (event.name !== 'pomodoro' && settings.autoStartPomodoros)
  ) {
    chrome.alarms.create(status, {
      delayInMinutes: parseFloat(settings[status]),
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.msg === 'time left') {
    (async () => {
      const alarms = await chrome.alarms.getAll();
      if (alarms.length) {
        sendResponse(alarms[0]);
      } else {
        sendResponse(null);
      }
    })();
  }
  return true;
});
