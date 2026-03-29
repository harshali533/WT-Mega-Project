// modules/historyModule.js - Logic for User Activity History

let historyItems = [];

/**
 * Initializes the History Module.
 * @param {Array<Object>} loadedHistory - History items loaded from storage.
 */
function initHistory(loadedHistory) {
    if (Array.isArray(loadedHistory)) {
        historyItems = loadedHistory;
    } else {
        historyItems = loadData('history') || [];
    }
    renderHistory();
    console.log("History Module initialized.");
}

/**
 * Adds a new activity to the history.
 * @param {string} action - The action performed (e.g., "Created Task").
 * @param {string} details - Additional details about the action.
 */
function addHistoryItem(action, details) {
    const newItem = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        action: action,
        details: details
    };

    // Add to the beginning of the array (most recent first)
    historyItems.unshift(newItem);

    // Keep only the last 50 items to avoid excessive storage use
    if (historyItems.length > 50) {
        historyItems.pop();
    }

    saveData('history', historyItems);
    renderHistory();
}

/**
 * Renders the history items to the UI.
 */
function renderHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    historyList.innerHTML = '';

    if (!Array.isArray(historyItems) || historyItems.length === 0) {
        const emptyMsg = document.createElement('li');
        emptyMsg.className = 'history-empty';
        emptyMsg.textContent = 'No history yet. Start by adding tasks or events!';
        historyList.appendChild(emptyMsg);
        return;
    }

    historyItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
            <div class="history-content">
                <span class="history-action">${item.action}</span>
                <span class="history-details">${item.details}</span>
                <span class="history-time">${item.timestamp}</span>
            </div>
        `;
        historyList.appendChild(li);
    });
}


