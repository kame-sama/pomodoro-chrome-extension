import formatTime from './format-time';
/**
 * Factory for extension popup DOM controller
 * @return {object} - different methods for DOM manipulations
 */
export default function popupDOMController() {
  const root = document.querySelector(':root');
  const statusBarDivs = document.querySelectorAll('#statusBar > *');
  const timerDiv = document.querySelector('#timer');
  const counterDiv = document.querySelector('#counter');
  const toggleTimerButton = document.querySelector('#toggleTimer');
  const taskMenuList = document.querySelector('#taskMenuList');
  const newTaskMenu = document.querySelector('.new-task-menu');
  const taskList = document.querySelector('#taskList');
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

  const toggleTaskMenu = () => {
    taskMenuList.classList.toggle('open');
  };

  const createTaskForm = () => {
    newTaskMenu.innerHTML = `
      <div class="task-form">
        <div>Task Title:</div>
        <input type="text" id="taskTitle" autofocus maxlength="20"/>
        <div>Estimated Pomodoros:</div>
        <div class="est-pomodoros">
          <input type="number" id="estPomodoros" min="0" step="1" />
          <div id="incrementEstPomodoros" class="icon">
            <img src="/chevron-up-circle.svg" alt="Up Arrow Icon" />
          </div>
          <div id="decrementEstPomodoros" class="icon">
            <img src="/chevron-down-circle.svg" alt="Down Arrow Icon" />
          </div>
        </div>
        <div class="footer">
          <button id="taskFormCancel">Cancel</button>
          <button id="taskFormSubmit">Submit</button>
        </div>
      </div>`;
  };

  const createTaskEdit = (task, index, parentNode, callback) => {
    parentNode.innerHTML = `
    <div class="task-form">
        <div>Task Title:</div>
        <input type="text" id="taskTitle" autofocus maxlength="20" value="${task.title}"/>
        <div>Actual Pomodoros:</div>
        <input type="number" id="actPomodoros" min="0" step="1" value="${task.pomodoros}"/>
        <div>Estimated Pomodoros:</div>
        <div class="est-pomodoros">
          <input type="number" id="estPomodoros" min="0" step="1" value="${task.estPomodoros}"/>
          <div id="incrementEstPomodoros" class="icon">
            <img src="/chevron-up-circle.svg" alt="Up Arrow Icon" />
          </div>
          <div id="decrementEstPomodoros" class="icon">
            <img src="/chevron-down-circle.svg" alt="Down Arrow Icon" />
          </div>
        </div>
        <div class="footer">
          <button id="taskFormCancel">Cancel</button>
          <button id="taskFormSubmit">Submit</button>
        </div>
      </div>`;
    parentNode
      .querySelector('#taskFormCancel')
      .addEventListener('click', () => {
        parentNode.innerHTML = `
        <input type="checkbox" id="${index}" data-type="task"/>
        <div>${task.title}</div>
        <div>${task.pomodoros}/${task.estPomodoros}</div>
        <div class="icon" data-type="edit" data-id="${index}">
          <img
            src="/dots-horizontal-circle-outline.svg"
            alt="Dots Horizontal Icon"
          />
        </div>`;
      });

    parentNode
      .querySelector('#taskFormSubmit')
      .addEventListener('click', callback);
  };

  const createTaskItem = (index) => {
    const title = document.querySelector('#taskTitle');
    const estPomodoros = document.querySelector('#estPomodoros');
    if (title.value && estPomodoros.value) {
      taskList.innerHTML += `
          <li>
            <input type="checkbox" id="${index}" data-type="task"/>
            <div>${title.value}</div>
            <div>0/${estPomodoros.value}</div>
            <div class="icon" data-type="edit" data-id="${index}">
              <img
                src="/dots-horizontal-circle-outline.svg"
                alt="Dots Horizontal Icon"
              />
            </div>
          </li>`;
      return { title: title.value, estPomodoros: estPomodoros.value };
    }
  };

  const updateTaskItem = (index, parentNode) => {
    const title = document.querySelector('#taskTitle');
    const actPomodoros = document.querySelector('#actPomodoros');
    const estPomodoros = document.querySelector('#estPomodoros');

    parentNode.innerHTML = `
      <input type="checkbox" id="${index}" data-type="task"/>
      <div>${title.value}</div>
      <div>${actPomodoros.value}/${estPomodoros.value}</div>
      <div class="icon" data-type="edit" data-id="${index}">
        <img
          src="/dots-horizontal-circle-outline.svg"
          alt="Dots Horizontal Icon"
        />
      </div>`;
    return {
      title: title.value,
      actPomodoros: actPomodoros.value,
      estPomodoros: estPomodoros.value,
    };
  };

  const createAddTaskButton = () => {
    newTaskMenu.innerHTML = `
        <button id="addTask">
          <div class="icon">
            <img src="/plus-circle-outline.svg" alt="Plus Circle Icon" />
          </div>
          <div>Add Task</div>
        </button>`;
  };

  const updateTaskList = (tasks) => {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
      taskList.innerHTML += `
          <li>
            <input type="checkbox" id="${index}" ${
        task.completed ? 'checked' : ''
      } data-type="task"/>
            <div>${task.title}</div>
            <div>${task.pomodoros}/${task.estPomodoros}</div>
            <div class="icon" data-type="edit" data-id="${index}">
              <img
                src="/dots-horizontal-circle-outline.svg"
                alt="Dots Horizontal Icon"
              />
            </div>
          </li>`;
    });
  };

  document.body.addEventListener('click', (event) => {
    if (
      (event.target.id !== 'clearFinishedTasks' ||
        event.target.id !== 'clearAllTasks') &&
      taskMenuList.className === 'open'
    ) {
      taskMenuList.classList.remove('open');
    }
  });

  return {
    updateStatus,
    updateTimer,
    updateCounter,
    updateTheme,
    toggleButtonText,
    toggleTaskMenu,
    createTaskForm,
    createTaskItem,
    createAddTaskButton,
    updateTaskList,
    createTaskEdit,
    updateTaskItem,
  };
}
