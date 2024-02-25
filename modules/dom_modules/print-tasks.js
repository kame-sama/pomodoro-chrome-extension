const taskList = document.querySelector('.task-list');
const template = document.querySelector('#taskTemplate');

/**
 *
 * @param {Object[]} tasks
 * @param {Number} index
 * @param {Element} parent
 */
export default function printTasks(tasks, index, parent) {
  if (tasks.length !== 1) taskList.textContent = '';

  tasks.forEach((task, i) => {
    const clone = template.content.cloneNode(true);
    const checkbox = clone.querySelector('input[type="checkbox"');
    const title = clone.querySelector('.task-title');
    const count = clone.querySelector('.task-count');
    const button = clone.querySelector('button');

    checkbox.setAttribute('data-id', index === undefined ? i : index);
    checkbox.checked = task.completed;
    title.textContent = task.title;
    count.textContent = `${task.actPomodoros}/${task.estPomodoros}`;
    button.setAttribute('data-id', index === undefined ? i : index);

    if (!parent) {
      const li = document.createElement('li');
      li.setAttribute('data-id', tasks.length > 1 ? i : index);
      li.replaceChildren(clone);
      taskList.appendChild(li);
    } else {
      parent.replaceChildren(clone);
    }
  });
}
