const newTaskMenu = document.querySelector('.new-task-menu');
const template = document.querySelector('#addTaskTemplate');

/**
 * Prints #addTask button to DOM
 */
export default function printAddTaskButton() {
  // newTaskMenu.innerHTML = `
  //   <button id="addTask">
  //     <div class="icon">
  //       <img src="/plus-circle-outline.svg" alt="Plus Circle Icon" />
  //     </div>
  //     Add Task
  //   </button>`;
  const clone = template.content.cloneNode(true);
  newTaskMenu.replaceChildren(clone);
}
