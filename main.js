import './css/style.css';
import * as DOMController from './modules/dom_modules/barrel';
import getTimeLeft from './modules/helpers/get-time-left';
import updateSession from './modules/helpers/update-session';
import iconBlueUrl from '/icon-16-blue.png';

let {
  status = 'pomodoro',
  count = 1,
  timeLeft = 0,
} = await chrome.storage.session.get();

let {
  tasks = [],
  currentTaskId = 0,
  ...settings
} = await chrome.storage.sync.get();

const alarm = await chrome.alarms.get(status);
let intervalId;
let formControls;

chrome.storage.session.set({ status, count, timeLeft });
chrome.storage.sync.set({ tasks, currentTaskId });

DOMController.updateStatus(status);
DOMController.updateCounter(count);
DOMController.updateTheme(status);
DOMController.printTasks(tasks);
DOMController.printAddTaskButton();

if (!alarm && !timeLeft) {
  DOMController.updateTimer(parseInt(settings[status]) * 60);
} else if (!alarm && timeLeft) {
  DOMController.updateTimer(timeLeft);
} else {
  DOMController.updateTogglerText('Pause');
  DOMController.updateTimer(await getTimeLeft());
  intervalId = setInterval(async () => {
    DOMController.updateTimer(await getTimeLeft());
  }, 1000);
}

document.querySelector('#toggler').addEventListener('click', async (event) => {
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
  DOMController.updateTogglerText();
});

document.querySelector('#settings').addEventListener('click', () => {
  chrome.tabs.create({ url: './pages/settings.html' });
});

document.querySelector('#skip').addEventListener('click', () => {
  chrome.alarms.clearAll();
  [status, count, timeLeft] = updateSession({
    status,
    count,
    timeLeft,
    interval: settings.longBreakInterval,
  });

  if (status === 'pomodoro') {
    chrome.action.setIcon({ path: './images/icon-16.png' });
  } else {
    chrome.action.setIcon({ path: iconBlueUrl });
    if (currentTaskId < tasks.length) {
      tasks[currentTaskId].actPomodoros++;
      DOMController.printTasks(tasks);
      chrome.storage.sync.set({ tasks });
    }
  }

  chrome.storage.session.set({ status, count, timeLeft });
  clearInterval(intervalId);
  DOMController.updateTogglerText('Start');
  DOMController.updateStatus(status);
  DOMController.updateCounter(count);
  DOMController.updateTheme(status);
  DOMController.updateTimer(parseInt(settings[status]) * 60);
});

document
  .querySelector('#taskMenuToggler')
  .addEventListener('click', (event) => {
    event.stopPropagation();
    DOMController.openTaskMenu();
  });

document.querySelector('.new-task-menu').addEventListener('click', (event) => {
  if (event.target.id === 'addTask') {
    const form = document.querySelector('.task-list .form');

    if (form) {
      DOMController.printTasks(
        [tasks[form.parentElement.dataset.id]],
        form.parentElement.dataset.id,
        form.parentElement,
      );
    }

    formControls = DOMController.openTaskForm(event.target.parentElement);
  }
  if (event.target.id === 'cancel') DOMController.printAddTaskButton();
  if (event.target.id === 'submit') {
    tasks.push({
      title: formControls.title.value,
      estPomodoros: parseInt(formControls.estPomodoros.value),
      actPomodoros: 0,
      completed: false,
    });
    chrome.storage.sync.set({ tasks });
    DOMController.printTasks(tasks.slice(-1), tasks.length - 1);
    DOMController.printAddTaskButton();
  }
});

document.querySelector('.task-list').addEventListener('click', (event) => {
  if (event.target.dataset?.type === 'task') {
    tasks[event.target.dataset.id].completed = event.target.checked;
    while (tasks[currentTaskId]?.completed && currentTaskId < tasks.length) {
      currentTaskId++;
    }
    chrome.storage.sync.set({ tasks, currentTaskId });
  } else if (event.target.dataset?.type === 'edit') {
    const form = document.querySelector('.task-list .form');

    if (form) {
      DOMController.printTasks(
        [tasks[form.parentElement.dataset.id]],
        form.parentElement.dataset.id,
        form.parentElement,
      );
    }

    DOMController.printAddTaskButton();
    const parent = event.target.parentElement;
    const index = parseInt(event.target.dataset.id);
    formControls = DOMController.openTaskForm(parent, tasks[index], index);

    document.querySelector('#submit').addEventListener('click', () => {
      tasks[index].title = formControls.title.value;
      tasks[index].actPomodoros = parseInt(formControls.actPomodoros.value);
      tasks[index].estPomodoros = parseInt(formControls.estPomodoros.value);
      DOMController.printTasks([tasks[index]], index, parent);
      chrome.storage.sync.set({ tasks });
    });

    document.querySelector('#cancel').addEventListener('click', () => {
      DOMController.printTasks([tasks[index]], index, parent);
    });
  }
});

document.querySelector('#clearFinished').addEventListener('click', () => {
  tasks = tasks.filter((task) => !task.completed);
  currentTaskId = 0;
  DOMController.printTasks(tasks);
  chrome.storage.sync.set({ tasks, currentTaskId });
});

document.querySelector('#clearAll').addEventListener('click', () => {
  tasks = [];
  currentTaskId = 0;
  DOMController.printTasks(tasks);
  chrome.storage.sync.set({ tasks, currentTaskId });
});

chrome.alarms.onAlarm.addListener((event) => {
  [status, count, timeLeft] = updateSession({
    status: event.name,
    count,
    timeLeft,
    interval: settings.longBreakInterval,
  });
  clearInterval(intervalId);

  if (event.name === 'pomodoro' && currentTaskId < tasks.length) {
    tasks[currentTaskId].actPomodoros++;
    DOMController.printTasks(tasks);
  }

  if (
    (event.name === 'pomodoro' && !settings.autoStartBreaks) ||
    (event.name !== 'pomodoro' && !settings.autoStartPomodoros)
  ) {
    DOMController.updateTogglerText('Start');
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
