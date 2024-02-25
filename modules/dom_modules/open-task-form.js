const template = document.querySelector('#formTemplate');

/**
 * Opens task form
 * @param {Element} parent
 * @param {Object} task optional
 * @param {Number} index optional
 * @return {Object}
 */
export default function openTaskForm(parent, task = null, index = null) {
  const clone = template.content.cloneNode(true);
  const title = clone.querySelector('#title');
  const actPomodoros = clone.querySelector('#actPomodoros');
  const estPomodoros = clone.querySelector('#estPomodoros');
  const submit = clone.querySelector('#submit');

  title.value = task ? task.title : '';

  if (!task) {
    actPomodoros.parentNode.remove();
    actPomodoros.value = 0;
  } else {
    actPomodoros.value = task.actPomodoros;
  }

  estPomodoros.value = task ? task.estPomodoros : '';

  if (index !== null) {
    submit.setAttribute('data-id', index);
  }

  parent.replaceChildren(clone);

  title.select();

  return { title, actPomodoros, estPomodoros };
}
