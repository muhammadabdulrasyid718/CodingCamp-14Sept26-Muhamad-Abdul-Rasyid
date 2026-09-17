// Expense & Budget Visualizer - Main Application File

// ============================================
// Data Manager Module
// ============================================
const DataManager = {
    STORAGE_KEY: 'expense_budget_visualizer_transactions',

    /**
     * Load transactions from Local Storage
     * @returns {Array} Array of transactions
     */
    loadTransactions() {
        try {
            if (!window.Storage) {
                console.warn('Local Storage not supported');
                return [];
            }

            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data === null) {
                return [];
            }

            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Error loading data from Local Storage:', error);
            return [];
        }
    },

    /**
     * Save transactions to Local Storage
     * @param {Array} transactions - Array of transactions to save
     */
    saveTransactions(transactions) {
        try {
            const data = JSON.stringify(transactions);
            localStorage.setItem(this.STORAGE_KEY, data);
        } catch (error) {
            console.error('Error saving data to Local Storage:', error);
        }
    },

    /**
     * Add a new transaction
     * @param {Object} transaction - Transaction object to add
     */
    addTransaction(transaction) {
        const transactions = this.loadTransactions();
        transactions.push(transaction);
        this.saveTransactions(transactions);
    },

    /**
     * Delete a transaction by ID
     * @param {string} id - Transaction ID to delete
     */
    deleteTransaction(id) {
        const transactions = this.loadTransactions();
        const filtered = transactions.filter(t => t.id !== id);
        this.saveTransactions(filtered);
    },

    /**
     * Calculate total balance
     * @returns {number} Total balance
     */
    calculateBalance() {
        const transactions = this.loadTransactions();
        return transactions.reduce((sum, t) => sum + t.amount, 0);
    },

    /**
     * Get spending by category
     * @returns {Object} Spending breakdown by category
     */
    getSpendingByCategory() {
        const transactions = this.loadTransactions();
        
        return transactions.reduce((acc, t) => {
            if (t.category === 'food') {
                acc.food += t.amount;
            } else if (t.category === 'transport') {
                acc.transport += t.amount;
            } else if (t.category === 'fun') {
                acc.fun += t.amount;
            }
            return acc;
        }, { food: 0, transport: 0, fun: 0 });
    }
};

// ============================================
// Form Handler Module
// ============================================
const FormHandler = {
    /**
     * Bind form event listeners
     */
    bindEvents() {
        const form = document.getElementById('transaction-form');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            App.handleFormSubmit(event);
        });
    },

    /**
     * Validate form inputs
     * @param {string} itemName - Item name input
     * @param {string} amount - Amount input
     * @param {string} category - Category input
     * @returns {Object} Validation result with valid flag and optional error message
     */
    validateForm(itemName, amount, category) {
        // Check item name is not empty or whitespace
        if (!itemName || itemName.trim() === '') {
            return { valid: false, error: 'Item name is required' };
        }

        // Check item name length
        if (itemName.trim().length > 100) {
            return { valid: false, error: 'Item name must be 100 characters or less' };
        }

        // Check amount is provided
        if (!amount || amount.trim() === '') {
            return { valid: false, error: 'Amount is required' };
        }

        // Check amount is a valid number
        const amountValue = parseFloat(amount);
        if (isNaN(amountValue)) {
            return { valid: false, error: 'Amount must be a valid number' };
        }

        // Check amount is positive
        if (amountValue <= 0) {
            return { valid: false, error: 'Amount must be greater than zero' };
        }

        // Check category is selected
        if (!category || category === '') {
            return { valid: false, error: 'Category must be selected' };
        }

        return { valid: true };
    },

    /**
     * Get form data
     * @returns {Object|null} Form data object or null if inputs invalid
     */
    getFormData() {
        const itemName = document.getElementById('item-name').value;
        const amount = document.getElementById('amount').value;
        const category = document.getElementById('category').value;

        return {
            itemName: itemName.trim(),
            amount: amount,
            category: category
        };
    },

    /**
     * Clear form
     */
    clearForm() {
        document.getElementById('item-name').value = '';
        document.getElementById('amount').value = '';
        document.getElementById('category').value = '';
        FormHandler.hideError();
    },

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.classList.add('visible');

        // Auto-hide after 3 seconds
        setTimeout(() => {
            FormHandler.hideError();
        }, 3000);
    },

    /**
     * Hide error message
     */
    hideError() {
        const errorElement = document.getElementById('error-message');
        errorElement.classList.remove('visible');
    }
};

// ============================================
// UI Renderer Module
// ============================================
const UIRenderer = {
    /**
     * Render transaction list
     * @param {Array} transactions - Array of transactions to render
     */
    renderTransactionList(transactions) {
        const container = document.getElementById('transaction-list');
        container.innerHTML = '';

        if (transactions.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No transactions yet. Add one above!</p>';
            return;
        }

        transactions.forEach(transaction => {
            const item = document.createElement('div');
            item.className = 'transaction-item';
            item.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-name">${this.escapeHtml(transaction.itemName)}</div>
                    <div class="transaction-details">
                        <span class="transaction-category">${this.formatCategory(transaction.category)}</span>
                    </div>
                </div>
                <div class="transaction-amount">-${this.formatCurrency(transaction.amount)}</div>
                <button class="delete-btn" data-id="${transaction.id}">Delete</button>
            `;
            container.appendChild(item);
        });

        // Add delete button event listeners
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                const id = event.currentTarget.dataset.id;
                App.handleTransactionDelete(id);
            });
        });
    },

    /**
     * Render total balance
     * @param {number} amount - Balance amount to display
     */
    renderBalance(amount) {
        const balanceElement = document.getElementById('total-balance');
        balanceElement.textContent = this.formatCurrency(amount);
    },

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.classList.add('visible');
    },

    /**
     * Hide error message
     */
    hideError() {
        const errorElement = document.getElementById('error-message');
        errorElement.classList.remove('visible');
    },

    /**
     * Format currency
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    /**
     * Format category for display
     * @param {string} category - Category value
     * @returns {string} Formatted category
     */
    formatCategory(category) {
        const categories = {
            food: 'Food',
            transport: 'Transport',
            fun: 'Fun'
        };
        return categories[category] || category;
    },

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ============================================
// Chart Manager Module
// ============================================
let chartInstance = null;

const ChartManager = {
    /**
     * Initialize Chart.js
     */
    initializeChart() {
        const ctx = document.getElementById('category-chart').getContext('2d');

        chartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Food', 'Transport', 'Fun'],
                datasets: [{
                    label: 'Spending by Category',
                    data: [0, 0, 0],
                    backgroundColor: [
                        '#FF6384',  // Red for Food
                        '#36A2EB',  // Blue for Transport
                        '#FFCE56'   // Yellow for Fun
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                }
            }
        });
    },

    /**
     * Update chart data
     * @param {Object} spending - Spending by category
     */
    updateChart(spending) {
        if (!chartInstance) return;

        chartInstance.data.datasets[0].data = [
            spending.food,
            spending.transport,
            spending.fun
        ];
        chartInstance.update();
    },

    /**
     * Destroy chart instance
     */
    destroyChart() {
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
    },

    /**
     * Show/hide no data message based on spending data
     * @param {Object} spending - Spending by category
     */
    showNoDataMessage(spending) {
        const noDataMessage = document.getElementById('no-data-message');
        const chartContainer = document.getElementById('category-chart').parentElement;

        const hasData = spending.food > 0 || spending.transport > 0 || spending.fun > 0;

        if (hasData) {
            noDataMessage.style.display = 'none';
            chartContainer.style.opacity = '1';
        } else {
            noDataMessage.style.display = 'block';
            chartContainer.style.opacity = '0.5';
        }
    }
};

// ============================================
// Main Application Module
// ============================================
const App = {
    /**
     * Initialize application
     */
    init() {
        // Check for Local Storage support
        this.checkLocalStorageSupport();

        // Initialize all modules
        FormHandler.bindEvents();
        ChartManager.initializeChart();

        // Load and render initial data
        this.refreshUI();
    },

    /**
     * Check for Local Storage support
     */
    checkLocalStorageSupport() {
        if (!window.Storage) {
            UIRenderer.showError('Your browser does not support Local Storage. Your data will not be saved between sessions.');
        }
    },

    /**
     * Handle form submission
     * @param {Event} event - Submit event
     */
    handleFormSubmit(event) {
        event.preventDefault();

        const formData = FormHandler.getFormData();
        const validation = FormHandler.validateForm(
            formData.itemName,
            formData.amount,
            formData.category
        );

        if (!validation.valid) {
            FormHandler.showError(validation.error);
            return;
        }

        // Create transaction object
        const transaction = {
            id: this.generateId(),
            itemName: formData.itemName,
            amount: parseFloat(formData.amount),
            category: formData.category,
            timestamp: Date.now()
        };

        // Add transaction and refresh UI
        DataManager.addTransaction(transaction);
        this.refreshUI();
        FormHandler.clearForm();
    },

    /**
     * Handle transaction deletion
     * @param {string} id - Transaction ID to delete
     */
    handleTransactionDelete(id) {
        DataManager.deleteTransaction(id);
        this.refreshUI();
    },

    /**
     * Refresh all UI components
     */
    refreshUI() {
        const transactions = DataManager.loadTransactions();
        const balance = DataManager.calculateBalance();
        const spendingByCategory = DataManager.getSpendingByCategory();

        UIRenderer.renderTransactionList(transactions);
        UIRenderer.renderBalance(balance);
        ChartManager.updateChart(spendingByCategory);
        ChartManager.showNoDataMessage(spendingByCategory);
    },

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
};

// ============================================
// Initialize on DOM ready
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});