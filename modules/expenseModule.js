// modules/expenseModule.js - Logic for Expense Tracker feature

let expenseForm, expenseDescriptionInput, expenseAmountInput, expenseTypeSelect, expenseList, currentBalanceDisplay;
let transactions = []; // Array to hold expense/income objects

/**
 * Renders all transactions and updates the balance display.
 */
function renderTransactions() {
    if (!expenseList || !currentBalanceDisplay) return;
    expenseList.innerHTML = '';
    let balance = 0;

    transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.dataset.id = transaction.id;
        li.className = transaction.type; // 'income' or 'expense' for styling

        const sign = transaction.type === 'expense' ? '-' : '+';
        const formattedAmount = Math.abs(transaction.amount).toFixed(2); // Ensure two decimal places

        li.innerHTML = `
            <span>${transaction.description}</span>
            <span class="item-amount">${sign}₹${formattedAmount}</span>
            <div class="item-actions">
                <button type="button" class="delete-btn" title="Delete Transaction"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        expenseList.appendChild(li);

        // Calculate balance
        balance += transaction.type === 'income' ? transaction.amount : -transaction.amount;
    });

    currentBalanceDisplay.textContent = `₹${balance.toFixed(2)}`;
}

/**
 * Adds a new transaction (expense or income).
 */
function addTransaction(description, amount, type) {
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid positive amount.");
        return;
    }

    const newTransaction = {
        id: Date.now().toString(),
        description: description,
        amount: parseFloat(amount), // Ensure it's a number
        type: type,
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    };
    transactions.push(newTransaction);
    saveData('expenses', transactions); // Using 'expenses' as key for all transactions
    renderTransactions();
    
    const action = type === 'income' ? 'Income Added' : 'Expense Logged';
    addHistoryItem(action, `${description}: ₹${parseFloat(amount).toFixed(2)}`);
}

/**
 * Deletes a transaction.
 */
function deleteTransaction(id) {
    const transactionToDelete = transactions.find(t => t.id === id);
    if (transactionToDelete) {
        const desc = transactionToDelete.description;
        const amount = transactionToDelete.amount;
        transactions = transactions.filter(transaction => transaction.id !== id);
        saveData('expenses', transactions);
        renderTransactions();
        addHistoryItem('Deleted Transaction', `Removed "${desc}" (₹${amount.toFixed(2)})`);
    }
}

/**
 * Initializes the Expense Module.
 * @param {Array<Object>} loadedTransactions - Transactions loaded from storage.
 */
function initExpenses(loadedTransactions) {
    try {
        // Elements from DOM
        expenseForm = document.getElementById('expense-form');
        expenseDescriptionInput = document.getElementById('expense-description-input');
        expenseAmountInput = document.getElementById('expense-amount-input');
        expenseTypeSelect = document.getElementById('expense-type-select');
        expenseList = document.getElementById('expense-list');
        currentBalanceDisplay = document.getElementById('current-balance');

        if (expenseForm) {
            expenseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const description = expenseDescriptionInput.value.trim();
                const amount = parseFloat(expenseAmountInput.value); // Convert to number
                const type = expenseTypeSelect.value;
        
                if (description && amount) {
                    addTransaction(description, amount, type);
                    expenseDescriptionInput.value = '';
                    expenseAmountInput.value = '';
                }
            });
        }

        if (expenseList) {
            expenseList.addEventListener('click', (e) => {
                const listItem = e.target.closest('li');
                if (!listItem) return;
        
                const transactionId = listItem.dataset.id;
                if (e.target.closest('.delete-btn')) {
                    deleteTransaction(transactionId);
                }
            });
        }

        if (loadedTransactions) {
            transactions = loadedTransactions;
        }
        renderTransactions();
    } catch (error) {
        console.error("Expense fail:", error);
    }
    console.log("Expense Module initialized.");
}