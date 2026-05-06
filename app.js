// ============================================
// Task Manager - Local Storage
// ============================================

// Tareas por defecto (primera vez que se abre la app)
var defaultTasks = [
  { id: 1, text: "Buy groceries", completed: false },
  { id: 2, text: "Finish homework", completed: false },
  { id: 3, text: "Call mom", completed: true },
  { id: 4, text: "Exercise", completed: false }
];

// --- Funciones de localStorage ---

function getTasks() {
  var data = localStorage.getItem("tasks");
  if (data) {
    return JSON.parse(data);
  }
  return defaultTasks;
}

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// --- Crear elemento visual de una tarea ---

function createTaskElement(task) {
  var div = document.createElement("div");
  div.className = "task";

  var checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;

  var span = document.createElement("span");
  span.textContent = task.text;

  // Si está completada, se ve tachada
  if (task.completed) {
    span.style.textDecoration = "line-through";
    span.style.opacity = "0.6";
  }

  // Cuando el usuario marca/desmarca el checkbox
  checkbox.addEventListener("change", function () {
    var tasks = getTasks();
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === task.id) {
        tasks[i].completed = checkbox.checked;
      }
    }
    saveTasks(tasks);
    renderTasks();
  });

  div.appendChild(checkbox);
  div.appendChild(span);
  return div;
}

// --- Mostrar todas las tareas en pantalla ---

function renderTasks() {
  var tasks = getTasks();

  // Borrar las tareas que están en pantalla
  var existing = document.querySelectorAll(".task");
  for (var i = 0; i < existing.length; i++) {
    existing[i].remove();
  }

  // Insertar tareas después del input-container
  var inputContainer = document.querySelector(".input-container");

  for (var i = tasks.length - 1; i >= 0; i--) {
    if (!tasks[i].completed) {
      var taskEl = createTaskElement(tasks[i]);
      inputContainer.insertAdjacentElement("afterend", taskEl);
    }
  }
}

function addTask() {
  var input = document.querySelector(".input-container input");
  var text = input.value.trim();

  var date = document.querySelector(".date-input").value;
  var time = document.querySelector(".time-input").value;

  if (text === "") return;

  var tasks = getTasks();
  var newTask = {
    id: Date.now(),
    text: text,
    completed: false,
    date: date,
    time: time
  };

  tasks.push(newTask);
  saveTasks(tasks);
  renderTasks();

  input.value = "";
  document.querySelector(".date-input").value = "";
  document.querySelector(".time-input").value = "";
}

// --- Marcar todas las tareas como completadas ---

function markAllComplete() {
  var tasks = getTasks();
  for (var i = 0; i < tasks.length; i++) {
    tasks[i].completed = true;
  }
  saveTasks(tasks);
  renderTasks();
}


//---eliminar recordatorios---//
function markAllComplete(){
  var tasks = getTasks();
 if (e.target.tagname==="li"){
  e.target.remove();
 }
}

// ============================================
// Página Principal (index.html)
// ============================================

if (document.querySelector(".input-container")) {
  document.addEventListener("DOMContentLoaded", function () {

    // Guardar tareas por defecto si es la primera vez
    if (!localStorage.getItem("tasks")) {
      saveTasks(defaultTasks);
    }

    // Mostrar tareas
    renderTasks();

    // Botón "Add Task"
    var addButton = document.querySelector(".input-container button");
    addButton.addEventListener("click", addTask);

    // También agregar con la tecla Enter
    var taskInput = document.querySelector(".input-container input");
    taskInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        addTask();
      }
    });

    // Botón "Mark all as complete"
    var markAllButton = document.querySelector(".button button");
    markAllButton.addEventListener("click", markAllComplete);
  });
}

// ============================================
// Página de Past Reminders
// ============================================

if (document.title === "Past Reminders") {
  document.addEventListener("DOMContentLoaded", function () {
    var tasks = getTasks();
    var completedTasks = [];

    // Filtrar solo las completadas
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].completed) {
        completedTasks.push(tasks[i]);
      }
    }

    // Borrar tareas estáticas del HTML
    var existing = document.querySelectorAll(".task");
    for (var i = 0; i < existing.length; i++) {
      existing[i].remove();
    }

    var article = document.querySelector("article");

    if (completedTasks.length === 0) {
      var p = document.createElement("p");
      p.textContent = "No completed tasks yet.";
      article.appendChild(p);
    } else {
      for (var i = 0; i < completedTasks.length; i++) {
        var div = document.createElement("div");
        div.className = "task";

        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true;

        var span = document.createElement("span");
        span.textContent = completedTasks[i].text;
        span.style.textDecoration = "line-through";
        span.style.opacity = "0.6";

        div.appendChild(checkbox);
        div.appendChild(span);
        article.appendChild(div);
      }
    }
  });
}

// ===========================================
// Notificaciones
// ===========================================

// Pedir permiso
function requestNotificationPermission() {
  if ("Notification" in window) {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }
}

// Mostrar notificación
function showNotification(task) {
  if (Notification.permission === "granted") {
    new Notification("⏰ Reminder", {
      body: task.text,
      icon: "https://cdn-icons-png.flaticon.com/512/1827/1827392.png"
    });
  }
}

// Revisar recordatorios
function checkRemindersPro() {
  var tasks = getTasks();
  var now = new Date();

  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];

    if (task.date && task.time && !task.completed) {
      var taskDateTime = new Date(task.date + "T" + task.time);

      if (now >= taskDateTime && !task.notified) {
        showNotification(task);
        task.notified = true;
      }
    }
  }

  saveTasks(tasks);
}

// Activar al cargar
document.addEventListener("DOMContentLoaded", function () {
  requestNotificationPermission();
  checkRemindersPro();
});

// Revisar cada minuto
setInterval(checkRemindersPro, 60000);
