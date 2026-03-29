// modules/taskModule.js - Logic for Task Planner feature

let taskForm, newTaskInput, newTaskDescInput, newTaskDateInput, taskList;
let tasks = []; // Array to hold all our task objects



/**
 * Renders all tasks to the UI.
 */
function renderTasks() {
    taskList.innerHTML = ''; // Clear existing tasks
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.dataset.id = task.id; // Store ID for easy reference
        li.className = task.completed ? 'completed' : ''; // Apply 'completed' class if needed

        li.innerHTML = `
            <div class="task-text-content">
                <span class="task-title">
                    ${task.text}
                    <span class="status-badge ${task.completed ? 'status-completed' : 'status-pending'}">
                        ${task.completed ? '✔️' : '❌'} ${task.completed ? 'Completed' : 'Pending'}
                    </span>
                </span>
                ${task.description ? `<span class="task-desc">${task.description}</span>` : ''}
                ${task.dueDate ? `<small class="task-date"><i class="far fa-calendar-alt"></i> ${task.dueDate}</small>` : ''}
            </div>
            <div class="item-actions">
                <button type="button" class="complete-btn" title="Mark ${task.completed ? 'Incomplete' : 'Complete'}">
                    <i class="fas ${task.completed ? 'fa-xmark incomplete-btn' : 'fa-check'}"></i>
                </button>
                <button type="button" class="edit-btn" title="Edit Task"><i class="fas fa-edit"></i></button>
                <button type="button" class="delete-btn" title="Delete Task"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

/**
 * Adds a new task.
 */
function addTask(text, description, dueDate) {
    const newTask = {
        id: Date.now().toString(), // Unique ID using timestamp
        text: text,
        description: description,
        dueDate: dueDate,
        completed: false,
        createdAt: Date.now()
    };
    tasks.push(newTask);
    saveData('tasks', tasks);
    renderTasks();
    
    addHistoryItem('Created Task', `Added "${text}"`);
    
    // Set 5-hour reminder (5 * 60 * 60 * 1000 ms)
    scheduleReminder(newTask);
}

/**
 * Schedules a reminder for a task after 5 hours.
 */
function scheduleReminder(task) {
    if (!task || !task.createdAt) return; // Skip legacy tasks without createdAt
    
    const fiveHoursInMs = 5 * 60 * 60 * 1000;
    const timeSinceCreation = Date.now() - task.createdAt;
    const delay = Math.max(0, fiveHoursInMs - timeSinceCreation);

    setTimeout(() => {
        // Find the most recent version of this task
        const currentTask = tasks.find(t => t.id === task.id);
        if (currentTask && !currentTask.completed) {
            sendNotification('Task Reminder', `Don't forget: "${currentTask.text}" is still pending!`);
        }
    }, delay);
}

/**
 * Sends a browser notification or alert.
 */
function sendNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: message, icon: 'assets/logo.png' });
    } else {
        console.log(`Notification: ${title} - ${message}`);
    }
}

/**
 * Opens a simple prompt to edit task details.
 */
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newText = prompt("Edit Task Name:", task.text);
    if (newText === null) return; // Cancelled

    const newDesc = prompt("Edit Task Description:", task.description || "");
    const newDate = prompt("Edit Task Date (YYYY-MM-DD):", task.dueDate || "");

    task.text = newText || task.text;
    task.description = newDesc;
    task.dueDate = newDate;

    saveData('tasks', tasks);
    renderTasks();
    addHistoryItem('Updated Task', `Changed details for "${task.text}"`);
}

/**
 * Toggles completion status.
 */
function toggleTaskComplete(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex > -1) {
        const isNowCompleted = !tasks[taskIndex].completed;
        tasks[taskIndex].completed = isNowCompleted;
        saveData('tasks', tasks);
        renderTasks();
        
        const action = isNowCompleted ? 'Completed Task' : 'Reopened Task';
        addHistoryItem(action, `"${tasks[taskIndex].text}" is now ${isNowCompleted ? 'Completed ✔️' : 'Pending ❌'}`);
    }
}

/**
 * Deletes a task.
 */
function deleteTask(id) {
    const taskToDelete = tasks.find(t => t.id === id);
    if (taskToDelete) {
        const title = taskToDelete.text;
        tasks = tasks.filter(task => task.id !== id);
        saveData('tasks', tasks);
        renderTasks();
        addHistoryItem('Deleted Task', `Removed "${title}"`);
    }
}

// --- Internal Event Listeners Setup ---
function setupTaskListeners() {
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const taskText = newTaskInput.value.trim();
            const taskDesc = newTaskDescInput.value.trim();
            const taskDate = newTaskDateInput.value;
            
            if (taskText) {
                addTask(taskText, taskDesc, taskDate);
                taskForm.reset();
            }
        });
    }

    if (taskList) {
        taskList.addEventListener('click', (e) => {
            const listItem = e.target.closest('li');
            if (!listItem) return;

            const taskId = listItem.dataset.id;

            if (e.target.closest('.complete-btn')) {
                toggleTaskComplete(taskId);
            } else if (e.target.closest('.edit-btn')) {
                editTask(taskId);
            } else if (e.target.closest('.delete-btn')) {
                deleteTask(taskId);
            }
        });
    }
}

/**
 * Initializes the Task Module.
 */
function initTasks(loadedTasks) {
    try {
        // Elements from DOM
        taskForm = document.getElementById('task-form');
        newTaskInput = document.getElementById('new-task-input');
        newTaskDescInput = document.getElementById('new-task-desc');
        newTaskDateInput = document.getElementById('new-task-date');
        taskList = document.getElementById('task-list');

        setupTaskListeners();

        if (Array.isArray(loadedTasks)) {
            tasks = loadedTasks;
        }
        renderTasks();
        
        // Check for reminders on startup for incomplete tasks
        tasks.forEach(task => {
            if (!task.completed) {
                scheduleReminder(task);
            }
        });

        // Request notification permission safely
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    } catch (error) {
        console.error("Error initializing Task Module:", error);
    }
    
    console.log("Task Module initialized.");
}