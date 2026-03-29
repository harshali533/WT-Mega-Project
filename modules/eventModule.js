// modules/eventModule.js - Logic for Event Countdown feature

let eventForm, newEventNameInput, newEventDateInput, eventList;


let events = []; // Array to hold event objects
let countdownInterval; // To store the interval for updating countdowns
let notifiedEvents = new Set(); // To prevent duplicate notifications for already passed events in current session

// Alarm Audio - Using a standard beep sound URL
const alarmSound = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
alarmSound.loop = true;

/**
 * Initializes listeners for the alarm overlay.
 */
function initAlarmListeners() {
    const stopBtn = document.getElementById('stop-alarm-btn');
    if (stopBtn) {
        stopBtn.addEventListener('click', stopAlarm);
    }
}

/**
 * Triggers the persistent alarm overlay and sound.
 */
function triggerAlarm(event) {
    const overlay = document.getElementById('alarm-overlay');
    const nameDisplay = document.getElementById('alarm-event-name');
    
    if (overlay && nameDisplay) {
        nameDisplay.textContent = event.name.toUpperCase();
        overlay.classList.remove('hidden');
        
        // Play sound (Modern browsers require user interaction first, 
        // but since they probably clicked something on the dashboard, it should work)
        alarmSound.play().catch(e => console.log("Audio play blocked until user interaction"));
        
        // Also send a standard notification as backup
        sendNotification('EVENT ALARM!', `It's time for: ${event.name}`);
    }
}

/**
 * Stops the alarm sound and hides the overlay.
 */
function stopAlarm(e) {
    if (e) e.preventDefault(); // Extra safety
    const overlay = document.getElementById('alarm-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        alarmSound.pause();
        alarmSound.currentTime = 0;
        addHistoryItem('Alarm Stopped', 'User acknowledged the event alarm.');
    }
}

/**
 * Calculates time remaining for an event.
 */
function getTimeRemaining(eventDateString) {
    const eventDate = new Date(eventDateString);
    const now = new Date();
    const total = eventDate.getTime() - now.getTime(); // Milliseconds remaining

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return { total, days, hours, minutes, seconds };
}

/**
 * Renders all events to the UI and starts countdown updates.
 */
function renderEvents() {
    const eventList = document.getElementById('event-list');
    if (!eventList) return;
    
    eventList.innerHTML = '';
    // Sort events by date and time, upcoming first
    events.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        
        return dateA - dateB;
    });

    events.forEach(event => {
        const li = document.createElement('li');
        li.dataset.id = event.id;
        
        const displayDate = new Date(event.date).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        li.innerHTML = `
            <div class="event-info">
                <span class="event-name">${event.name}</span>
                <span class="event-date-display">${displayDate}</span>
            </div>
            <span class="event-countdown" data-event-date="${event.date}">Calculating...</span>
            <div class="item-actions">
                <button type="button" class="delete-btn" title="Delete Event"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        eventList.appendChild(li);
    });
    startCountdownUpdater();
}

/**
 * Updates the countdown for each event and checks for notifications.
 */
function updateAllCountdowns() {
    document.querySelectorAll('.event-countdown').forEach(countdownSpan => {
        const eventDateString = countdownSpan.dataset.eventDate;
        const listItem = countdownSpan.closest('li');
        if (!listItem) return;
        const eventId = listItem.dataset.id;
        const { total, days, hours, minutes, seconds } = getTimeRemaining(eventDateString);

        if (total > 0) {
            countdownSpan.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            countdownSpan.style.color = 'inherit';
        } else {
            countdownSpan.textContent = 'Happening Now!';
            countdownSpan.style.color = '#ff4757';
            
            // Trigger Alarm if not already notified
            if (!notifiedEvents.has(eventId)) {
                const event = events.find(e => e.id === eventId);
                if (event) {
                    triggerAlarm(event);
                    notifiedEvents.add(eventId);
                    addHistoryItem('Event Started', `"${event.name}" triggered the alarm.`);
                }
            }
        }
    });
}

/**
 * Sends a browser notification.
 */
function sendNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: message, icon: 'assets/logo.png' });
    } else {
        console.log(`Notification: ${title} - ${message}`);
    }
}

/**
 * Starts the countdown updater.
 */
function startCountdownUpdater() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    updateAllCountdowns();
    countdownInterval = setInterval(updateAllCountdowns, 1000);
}

/**
 * Adds a new event.
 */
function addEvent(name, date) {
    const newEvent = {
        id: Date.now().toString(),
        name: name,
        date: date
    };
    events.push(newEvent);
    saveData('events', events);
    renderEvents();
    addHistoryItem('Created Event', `Scheduled "${name}" for ${new Date(date).toLocaleString()}`);
}

/**
 * Deletes an event.
 */
function deleteEvent(id) {
    const eventToDelete = events.find(e => e.id === id);
    if (eventToDelete) {
        const name = eventToDelete.name;
        events = events.filter(event => event.id !== id);
        saveData('events', events);
        renderEvents();
        addHistoryItem('Deleted Event', `Removed "${name}"`);
    }
}

// --- Internal Event Listeners Setup ---
function setupEventListeners() {
    if (eventForm) {
        eventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const eventName = newEventNameInput.value.trim();
            const eventDate = newEventDateInput.value;

            if (eventName && eventDate) {
                addEvent(eventName, eventDate);
                eventForm.reset();
            }
        });
    }

    if (eventList) {
        eventList.addEventListener('click', (e) => {
            const listItem = e.target.closest('li');
            if (!listItem) return;

            const eventId = listItem.dataset.id;
            if (e.target.closest('.delete-btn')) {
                deleteEvent(eventId);
            }
        });
    }
}


/**
 * Initializes the Event Module.
 */
function initEvents(loadedEvents) {
    try {
        // Elements from DOM
        eventForm = document.getElementById('event-form');
        newEventNameInput = document.getElementById('new-event-name-input');
        newEventDateInput = document.getElementById('new-event-date-input');
        eventList = document.getElementById('event-list');

        initAlarmListeners(); // Initialize the Stop button
        setupEventListeners(); // Initialize other listeners
        
        if (Array.isArray(loadedEvents)) {
            events = loadedEvents;
        }
        
        const now = new Date().getTime();
        events.forEach(e => {
            const eventTime = new Date(e.date).getTime();
            if (!isNaN(eventTime) && eventTime < now) {
                notifiedEvents.add(e.id);
            }
        });
        
        renderEvents();
    } catch (error) {
        console.error("Error initializing Event Module:", error);
    }
    console.log("Event Module initialized.");
}