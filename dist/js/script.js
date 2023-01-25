
const btnAddTask = document.querySelector(".form-add__btn");
const btnSearchTask = document.querySelector(".form-search__btn");
const container = document.querySelector(".container");

class Todo {
  constructor(completed, description) {
    this.completed = completed;
    this.description = description;
  }
}

//Добавляем заголовок для активных задачек
function buildTitleActiveTasks() {
  if (!document.querySelector(".block-tasks__title-active-tasks")) {
    const sectionTasks = document.querySelector(".block-tasks > .container");
    const titleActiveTasks = document.createElement("div");
    titleActiveTasks.classList.add("block-tasks__title-active-tasks");
    titleActiveTasks.textContent = "Активные";
    sectionTasks.prepend(titleActiveTasks);
  }
}

// Составляем из нашего массива объектов html блоки наших задач(tasks)
function buildTasks(data) {
  return data.forEach((elem) => {
    const sectionTasks = document.querySelector(".block-tasks > .container");
    const task = document.createElement("div");
    task.classList.add("block-tasks__task", "task");
    task.id = `${elem.id}`;
    task.innerHTML = `
        <div class="task__info">
          <label class="task__text">
            <input class="task__status" type="checkbox">
            <span class="task__checkbox"></span>
            <span class="task__text-value">${elem.description}</span>
          </label>
        </div>
        <div class="task__btns btns">
          <div class="btns__more-details btn-option">
            <img src='/dist/img/icons/preview.svg' alt='Изменить'>
          </div>
          <div class="btns__change btn-option">
            <img src='/dist/img/icons/pencil.svg' alt='Изменить'>
          </div>
          <div class="btns__delete btn-option">
            <img src='/dist/img/icons/trash.svg' alt='Изменить'>
          </div>
        </div>
      `;
    sectionTasks.append(task);
  });
}

addTaskEvent();
updateTasksList();


//------ Ф-ция, которая возвращает отсортированный список задач с сервера и выводит на экран в виде html
async function getTasks() {
  // Очищаем наш блок с задачами
  document
    .querySelectorAll(".block-tasks__task")
    .forEach((elem) => elem.remove());

  const response = await fetch(`http://127.0.0.1:8080/todo/`);
  const data = await response.json();

  // Сортируем полученный массив из объектов по убыванию значения свойства "id"
  const sortedData = data.sort((task1, task2) => task2.id - task1.id);

  buildTasks(sortedData);
}

//------ Ф-ция, которая очищает список задач и загружает актуальный
async function updateTasksList() {
  // Вызываем задачи с сервера и строим из них блок задач
  await getTasks();
  await changeTaskStatusEvent();
  showTaskCardEvent();
  buildTitleActiveTasks();
}

//------ Ф-ция, которая добавляет задачу на сервер и выводит актуальный список на экран
async function addTaskEvent() {
  //Добавляем событие на кнопку "Добавить"
  btnAddTask.addEventListener("click", async function (event) {
    event.preventDefault();
    const taskValue = document.querySelector(".form-add__input-task").value;
    const task = new Todo(false, taskValue);

    // Отправляем запрос на сервер, на добавление новой задачи
    const response = await fetch("http://127.0.0.1:8080/todo", {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    const data = await response.json();

    // Очищаем поле для ввода новой задачки
    document.querySelector(".form-add__input-task").value = "";

    // Получаем обновленный список задачек
    await updateTasksList();
    return data;
  });
}

//------ Ф-ция, которая отмечает задачу выполненной и меняет свойство "completed" на true
async function changeTaskStatusEvent() {
  const statusTasks = document.querySelectorAll(".task__status");
  if (statusTasks.length > 0) {
    statusTasks.forEach(statusTask => {
      statusTask.addEventListener('change', async function(event) {
        const taskBlock = event.target.closest(".block-tasks__task");
        taskBlock.classList.toggle("done");
        taskBlock.querySelector(".task__text-value").classList.toggle("cross-out");
        
        // const checkboxValue = taskBlock.querySelector('.task__status').checked
        const changedTask = {
          completed: true,
          description: taskBlock.querySelector(".task__text-value").textContent
        }
  
        const response = await fetch(`http://127.0.0.1:8080/todo/${taskBlock.id}`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(changedTask)
        });
        await response.json();
      })
    })
  }
}


function showTaskCardEvent() {
  const btnsTaskDetails = document.querySelectorAll('.btns__more-details');

  if (btnsTaskDetails.length > 0) {
    btnsTaskDetails.forEach(btnTaskDetails => {
      btnTaskDetails.addEventListener('click', function(event) {
        if (!event.target.closest('.btns__more-details')) return
        document.querySelector('.popup').classList.add('open');

        const task = btnTaskDetails.closest('.block-tasks__task');
        const taskText = task.querySelector('.task__text-value');
        const taskCardText = document.querySelector('.popup__title');
        taskCardText.textContent = `Задача: ${taskText.textContent}`;

        const taskStatusOnCard = document.querySelector('.popup__status-text');
        const statusTasks = task.querySelector(".task__status");

        statusTasks.checked
          ? taskStatusOnCard.textContent = 'Завершена'
          : taskStatusOnCard.textContent = 'В процессе'


        closeTaskCardEvent();
      })
    })
  }
}

function closeTaskCardEvent() {
  const btnCloseTaskCard = document.querySelector('.popup__btn-close');

  btnCloseTaskCard.addEventListener('click', function(event) {
    document.querySelector('.popup').classList.remove('open');
  })

  document.addEventListener('keydown', function(event) {
    if(event.which === 27) {
      document.querySelector('.popup').classList.remove('open');
    }
  })

}