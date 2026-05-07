// ============================================
// TASK MANAGER - LOCAL STORAGE
// ============================================

// Default tasks
var defaultTasks = [
  { id: 1, text: "Buy groceries", completed: false },
  { id: 2, text: "Finish homework", completed: false },
  { id: 3, text: "Call mom", completed: true },
  { id: 4, text: "Exercise", completed: false }
];

// ============================================
// LOCAL STORAGE FUNCTIONS
// ============================================

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

// ============================================
// CREATE TASK ELEMENT
// ============================================

function createTaskElement(task) {
  var div = document.createElement("div");
  div.className = "task";
  var checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  var span = document.createElement("span");
  span.textContent = task.text;
  // completed style
  if (task.completed) {
    span.style.textDecoration = "line-through";
    span.style.opacity = "0.6";
  }

  // checkbox change
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

// ============================================
// RENDER TASKS
// ============================================

function renderTasks() {
  var tasks = getTasks();
  var inputContainer = document.querySelector(".input-container");
  // remove old tasks
  var oldTasks = document.querySelectorAll(".task");
  for (var i = 0; i < oldTasks.length; i++) {
    oldTasks[i].remove();
  }

  // show only incomplete tasks
  for (var i = tasks.length - 1; i >= 0; i--) {
    if (tasks[i].completed === false) {
      var taskEl = createTaskElement(tasks[i]);
      inputContainer.insertAdjacentElement("afterend", taskEl);
    }
  }
}

// ============================================
// ADD TASK
// ============================================

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
    time: time,
    notified: false
  };
  tasks.push(newTask);
  saveTasks(tasks);
  renderTasks();
  // clear inputs
  input.value = "";
  document.querySelector(".date-input").value = "";
  document.querySelector(".time-input").value = "";
}

// ============================================
// MARK ALL COMPLETE
// ============================================

function markAllComplete() {
  var tasks = getTasks();
  for (var i = 0; i < tasks.length; i++) {
    tasks[i].completed = true;
  }

  saveTasks(tasks);
  renderTasks();
  alert("All reminders completed!");
}

// ============================================
// HOME PAGE
// ============================================

if (document.querySelector(".input-container")) {
  document.addEventListener("DOMContentLoaded", function () {

    // save default tasks first time
    if (!localStorage.getItem("tasks")) {
      saveTasks(defaultTasks);
    }
    // render tasks
    renderTasks();

    // add task button
    var addButton = document.querySelector(".input-container button");
    if (addButton) {
      addButton.addEventListener("click", addTask);
    }

    // enter key
    var taskInput = document.querySelector(".input-container input");
    if (taskInput) {
      taskInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          addTask();
        }
      });
    }
    // mark all complete button
    var markAllButton = document.querySelector("#all_complete button");
    if (markAllButton) {
      markAllButton.addEventListener("click", markAllComplete);
    }
  });
}

// ============================================
// PAST REMINDERS PAGE
// ============================================

if (document.title === "Past Reminders") {
  document.addEventListener("DOMContentLoaded", function () {
    var tasks = getTasks();
    var completedTasks = [];
    // filter completed
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].completed) {
        completedTasks.push(tasks[i]);
      }
    }

    // remove old tasks
    var existing = document.querySelectorAll(".task");
    for (var i = 0; i < existing.length; i++) {
      existing[i].remove();
    }
    var article = document.querySelector("article");
    // no completed tasks
    if (completedTasks.length === 0) {
      var p = document.createElement("p");
      p.textContent = "No completed tasks yet.";
      article.appendChild(p);
    }

    // show completed tasks
    else {
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

// ============================================
// NOTIFICATIONS
// ============================================

// request permission
function requestNotificationPermission() {
  if ("Notification" in window) {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }
}

// show notification
function showNotification(task) {
  if (Notification.permission === "granted") {
    new Notification("⏰ Reminder", {
      body: task.text,
      icon: "https://cdn-icons-png.flaticon.com/512/1827/1827392.png"
    });
  }
}

// check reminders
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

// start notifications
document.addEventListener("DOMContentLoaded", function () {
  requestNotificationPermission();
  checkRemindersPro();
});

// check every second
setInterval(checkRemindersPro, 1000);