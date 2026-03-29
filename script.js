// script.js - The main brain of our dashboard

// --- Dashboard Wide Elements & Initial Setup ---
const currentDateDisplay = document.getElementById('current-date');
const currentTimeDisplay = document.getElementById('current-time');
const refreshQuoteBtn = document.getElementById('refresh-quote-btn');

// History Panel Elements
const toggleHistoryBtn = document.getElementById('toggle-history-btn');
const closeHistoryBtn = document.getElementById('close-history-btn');
const historySection = document.getElementById('history-section');

// Function to update current date and time
function updateDateTime() {
    const now = new Date();
    currentDateDisplay.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    currentTimeDisplay.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Function to load all data and render UI on startup
function initializeDashboard() {
    console.log("Dashboard initializing...");
    updateDateTime();
    setInterval(updateDateTime, 1000); // Update time every second

    // Load data for each module using the DataManager
    const tasks = loadData('tasks');
    const habits = loadData('habits');
    const expenses = loadData('expenses');
    const events = loadData('events');
    const history = loadData('history');

    // Initialize each module with safety try-catch
    try { initHistory(history); } catch (e) { console.error("History fail:", e); }
    try { initTasks(tasks); } catch (e) { console.error("Task fail:", e); }
    try { initHabits(habits); } catch (e) { console.error("Habit fail:", e); }
    try { initExpenses(expenses); } catch (e) { console.error("Expense fail:", e); }
    try { initEvents(events); } catch (e) { console.error("Event fail:", e); }

    // Fetch initial motivational quote independently
    try {
        fetchMotivationalQuote();
    } catch (e) {
        console.error("Failed to fetch initial quote:", e);
    }

    console.log("Dashboard ready!");
}

// --- Event Listeners for Dashboard-wide interactions ---

// Motivational Quote refresh button
if (refreshQuoteBtn) {
    refreshQuoteBtn.addEventListener('click', fetchMotivationalQuote);
}


// History Panel toggle
if (toggleHistoryBtn && historySection) {
    toggleHistoryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        historySection.classList.toggle('hidden');
    });
}

if (closeHistoryBtn && historySection) {
    closeHistoryBtn.addEventListener('click', () => {
        historySection.classList.add('hidden');
    });
}

// Close history if clicking outside
document.addEventListener('click', (e) => {
    if (historySection && toggleHistoryBtn && 
        !historySection.contains(e.target) && 
        !toggleHistoryBtn.contains(e.target) && 
        !historySection.classList.contains('hidden')) {
        historySection.classList.add('hidden');
    }
});



// --- Kick off the dashboard when the DOM is fully loaded ---
document.addEventListener('DOMContentLoaded', initializeDashboard);