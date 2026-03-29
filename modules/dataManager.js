// modules/dataManager.js - Manages data persistence using Local Storage

/**
 * Saves data to Local Storage under a specific key.
 * @param {string} key - The key to store the data under.
 * @param {Array<Object>} data - The array of objects to save.
 */
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`Data for '${key}' saved successfully.`);
    } catch (error) {
        console.error(`Error saving data for '${key}':`, error);
    }
}

/**
 * Loads data from Local Storage for a specific key.
 * @param {string} key - The key to retrieve the data from.
 * @returns {Array<Object>} The parsed array of objects, or an empty array if none found/error.
 */
function loadData(key) {
    try {
        const dataString = localStorage.getItem(key);
        if (dataString) {
            return JSON.parse(dataString);
        }
    } catch (error) {
        console.error(`Error loading data for '${key}':`, error);
    }
    return [];
}