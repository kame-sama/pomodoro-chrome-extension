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

let { tasks } = await chrome.storage.sync.get('tasks');

if (!tasks) {
  tasks = [];
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
let { currentTaskId } = await chrome.storage.sync.get('currentTaskId');

if (!currentTaskId) {
  currentTaskId = 0;
  chrome.storage.sync.set({ currentTaskId });
}

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
DOMController.updateTaskList(tasks);

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

  if (status === 'pomodoro') {
    chrome.action.setIcon({ path: './images/icon-16.png' });
  } else {
    chrome.action.setIcon({ path: iconBlueUrl });
    if (currentTaskId < tasks.length) {
      tasks[currentTaskId].pomodoros++;
      DOMController.updateTaskList(tasks);
      chrome.storage.sync.set({ tasks });
    }
  }

  chrome.storage.session.set({ status, count, timeLeft });
  clearInterval(intervalId);
  DOMController.toggleButtonText('Start');
  DOMController.updateStatus(status);
  DOMController.updateCounter(count);
  DOMController.updateTheme(status);
  DOMController.updateTimer(parseInt(settings[status]) * 60);
});

document.querySelector('#toggleTaskMenu').addEventListener('click', (event) => {
  event.stopPropagation();
  DOMController.toggleTaskMenu();
});

document.querySelector('.new-task-menu').addEventListener('click', (event) => {
  console.log(event);
  if (event.target.id === 'addTask') DOMController.createTaskForm();
  if (event.target.id === 'taskFormCancel') DOMController.createAddTaskButton();
  if (event.target.id === 'taskFormSubmit') {
    const { title, estPomodoros } = DOMController.createTaskItem(tasks.length);
    tasks.push({ title, estPomodoros, pomodoros: 0, completed: false });
    chrome.storage.sync.set({ tasks });
  }
});

document.querySelector('#taskList').addEventListener('click', (event) => {
  if (event.target.dataset?.type === 'task') {
    tasks[event.target.id].completed = event.target.checked;
    while (
      tasks[currentTaskId]?.completed === true &&
      currentTaskId < tasks.length
    ) {
      currentTaskId++;
    }
    chrome.storage.sync.set({ tasks, currentTaskId });
  }

  if (event.target.dataset?.type === 'edit') {
    console.log(event.target.parentElement);
    const parent = event.target.parentElement;
    const id = event.target.dataset.id;
    const submitCallback = function () {
      console.log(event.target.parentElement);
      const { title, actPomodoros, estPomodoros } =
        DOMController.updateTaskItem(id, parent);
      tasks[event.target.dataset.id].title = title;
      tasks[event.target.dataset.id].pomodoros = actPomodoros;
      tasks[event.target.dataset.id].estPomodoros = estPomodoros;
      chrome.storage.sync.set({ tasks });
    };

    DOMController.createTaskEdit(
      tasks[event.target.dataset.id],
      event.target.dataset.id,
      event.target.parentElement,
      submitCallback,
    );
  }
});

document.querySelector('#clearFinishedTasks').addEventListener('click', () => {
  tasks = tasks.filter((task) => !task.completed);
  currentTaskId = 0;
  DOMController.updateTaskList(tasks);
  chrome.storage.sync.set({ tasks, currentTaskId });
});

document.querySelector('#clearAllTasks').addEventListener('click', () => {
  tasks = [];
  currentTaskId = 0;
  DOMController.updateTaskList(tasks);
  chrome.storage.sync.set({ tasks, currentTaskId });
});

chrome.alarms.onAlarm.addListener((event) => {
  updateSession(event.name);
  clearInterval(intervalId);

  if (
    event.name === 'pomodoro' &&
    tasks.length &&
    currentTaskId < tasks.length
  ) {
    tasks[currentTaskId].pomodoros++;
    DOMController.updateTaskList(tasks);
  }

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
