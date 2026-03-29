// modules/habitModule.js - Logic for Habit Tracker feature

let habitForm, newHabitInput, habitList;
let habits = []; // Array to hold habit objects

/**
 * Renders all habits to the UI.
 */
function renderHabits() {
    if (!habitList) return;
    habitList.innerHTML = '';
    habits.forEach(habit => {
        const li = document.createElement('li');
        li.dataset.id = habit.id;

        const today = new Date().toDateString();
        const isCompletedToday = habit.completionDates.includes(today);
        const completedClass = isCompletedToday ? 'completed' : '';

        li.innerHTML = `
            <span>${habit.name}</span>
            <div class="item-actions">
                <button type="button" class="complete-btn ${completedClass}" title="${isCompletedToday ? 'Completed Today!' : 'Mark Complete'}">
                    <i class="fas ${isCompletedToday ? 'fa-check-square' : 'fa-square'}"></i>
                </button>
                <button type="button" class="delete-btn" title="Delete Habit"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        habitList.appendChild(li);
    });
}

/**
 * Adds a new habit.
 */
function addHabit(name) {
    const newHabit = {
        id: Date.now().toString(),
        name: name,
        completionDates: []
    };
    habits.push(newHabit);
    saveData('habits', habits);
    renderHabits();
    addHistoryItem('Created Habit', `Started tracking "${name}"`);
}

/**
 * Toggles a habit's completion status for the current day.
 */
function toggleHabitComplete(id) {
    const habit = habits.find(h => h.id === id);
    if (habit) {
        const today = new Date().toDateString();
        const index = habit.completionDates.indexOf(today);

        if (index > -1) {
            habit.completionDates.splice(index, 1);
            addHistoryItem('Habit Update', `Unmarked "${habit.name}" for today.`);
        } else {
            habit.completionDates.push(today);
            addHistoryItem('Habit Completed', `Marked "${habit.name}" as done for today!`);
        }
        saveData('habits', habits);
        renderHabits();
    }
}

/**
 * Deletes a habit.
 */
function deleteHabit(id) {
    const habitToDelete = habits.find(h => h.id === id);
    if (habitToDelete) {
        const name = habitToDelete.name;
        habits = habits.filter(habit => habit.id !== id);
        saveData('habits', habits);
        renderHabits();
        addHistoryItem('Deleted Habit', `Removed "${name}"`);
    }
}

/**
 * Initializes the Habit Module.
 * @param {Array<Object>} loadedHabits - Habits loaded from storage.
 */
function initHabits(loadedHabits) {
    try {
        // Elements from DOM
        habitForm = document.getElementById('habit-form');
        newHabitInput = document.getElementById('new-habit-input');
        habitList = document.getElementById('habit-list');

        if (habitForm) {
            habitForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const habitName = newHabitInput.value.trim();
                if (habitName) {
                    addHabit(habitName);
                    newHabitInput.value = '';
                }
            });
        }

        if (habitList) {
            habitList.addEventListener('click', (e) => {
                const listItem = e.target.closest('li');
                if (!listItem) return;

                const habitId = listItem.dataset.id;
                if (e.target.closest('.complete-btn')) {
                    toggleHabitComplete(habitId);
                } else if (e.target.closest('.delete-btn')) {
                    deleteHabit(habitId);
                }
            });
        }

        if (loadedHabits) {
            habits = loadedHabits;
        }
        renderHabits();
    } catch (error) {
        console.error("Habit fail:", error);
    }
    console.log("Habit Module initialized.");
}