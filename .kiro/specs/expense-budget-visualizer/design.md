# Technical Design Document

## Overview

The Expense & Budget Visualizer is a client-side web application built with HTML, CSS, and Vanilla JavaScript. The application tracks user expenses by category and provides visual representation through a pie chart. All data is persisted using the browser's Local Storage API.

### Key Design Decisions

- **Single-page architecture**: All functionality is contained in a single HTML file for simplicity
- **Vanilla JavaScript**: No build tools or framework overhead, keeping the application lightweight
- **Local Storage API**: Browser-native persistence without external dependencies
- **Chart.js**: Popular, well-documented charting library for pie chart visualization
- **Separate CSS file**: Maintains clean separation of concerns
- **Separate JS file**: Organizes application logic for maintainability

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Expense & Budget Visualizer             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────┐ │
│  │   Input Form    │───▶│  Data Manager   │───▶│  Storage │ │
│  │ (HTML/CSS/JS)   │    │   (JS)          │    │(Storage) │ │
│  └─────────────────┘    └─────────────────┘    └──────────┘ │
│                                │                              │
│                                ▼                              │
│                    ┌─────────────────────┐                   │
│                    │  View Controllers   │                   │
│                    │  (Transaction List, │                   │
│                    │   Balance Display,  │                   │
│                    │   Chart Renderer)   │                   │
│                    └─────────────────────┘                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Component Structure

```
index.html
├── Header Section
│   └── Total Balance Display
├── Input Form Section
│   ├── Item Name Input
│   ├── Amount Input
│   ├── Category Select
│   └── Submit Button
├── Transaction List Section
│   └── Scrollable List Container
├── Chart Section
│   └── Pie Chart Canvas
└── Error Message Display
```

---

## Components and Interfaces

### HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Expense & Budget Visualizer</title>
    <link rel="stylesheet" href="css/styles.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="container">
        <header>
            <h1>Expense & Budget Visualizer</h1>
            <div class="balance-display">
                <span>Total Balance:</span>
                <span id="total-balance">$0.00</span>
            </div>
        </header>
        
        <main>
            <section class="input-form-section">
                <h2>Add Transaction</h2>
                <form id="transaction-form">
                    <div class="form-group">
                        <label for="item-name">Item Name:</label>
                        <input type="text" id="item-name" name="item-name" required>
                    </div>
                    <div class="form-group">
                        <label for="amount">Amount:</label>
                        <input type="number" id="amount" name="amount" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="category">Category:</label>
                        <select id="category" name="category" required>
                            <option value="">Select Category</option>
                            <option value="food">Food</option>
                            <option value="transport">Transport</option>
                            <option value="fun">Fun</option>
                        </select>
                    </div>
                    <button type="submit">Add Transaction</button>
                </form>
                <div id="error-message" class="error-message"></div>
            </section>
            
            <section class="transaction-list-section">
                <h2>Transactions</h2>
                <div id="transaction-list" class="transaction-list">
                    <!-- Transactions will be rendered here -->
                </div>
            </section>
            
            <section class="chart-section">
                <h2>Spending by Category</h2>
                <div class="chart-container">
                    <canvas id="category-chart"></canvas>
                    <div id="no-data-message" class="no-data-message">No data available</div>
                </div>
            </section>
        </main>
    </div>
    
    <script src="js/app.js"></script>
</body>
</html>
```

### JavaScript Module Structure

```javascript
// app.js - Main application file

// Data types and interfaces
interface Transaction {
    id: string;
    itemName: string;
    amount: number;
    category: 'food' | 'transport' | 'fun';
    timestamp: number;
}

interface AppState {
    transactions: Transaction[];
}

// Data Manager Module
const DataManager = {
    localStorageKey: 'expense_budget_visualizer_transactions',
    
    // Load transactions from Local Storage
    loadTransactions(): Transaction[],
    
    // Save transactions to Local Storage
    saveTransactions(transactions: Transaction[]): void,
    
    // Add a new transaction
    addTransaction(transaction: Transaction): void,
    
    // Delete a transaction by ID
    deleteTransaction(id: string): void,
    
    // Calculate total balance
    calculateBalance(): number,
    
    // Get spending by category
    getSpendingByCategory(): { food: number; transport: number; fun: number }
};

// Form Handler Module
const FormHandler = {
    // Bind form event listeners
    bindEvents(): void,
    
    // Validate form inputs
    validateForm(itemName: string, amount: string, category: string): { valid: boolean; error?: string },
    
    // Get form data
    getFormData(): { itemName: string; amount: number; category: string } | null,
    
    // Clear form
    clearForm(): void
};

// UI Renderer Module
const UIRenderer = {
    // Render transaction list
    renderTransactionList(transactions: Transaction[]): void,
    
    // Render total balance
    renderBalance(amount: number): void,
    
    // Render chart
    renderChart(spending: { food: number; transport: number; fun: number }): void,
    
    // Show error message
    showError(message: string): void,
    
    // Hide error message
    hideError(): void
};

// Chart Manager Module
const ChartManager = {
    chartInstance: Chart | null,
    
    // Initialize Chart.js
    initializeChart(): void,
    
    // Update chart data
    updateChart(spending: { food: number; transport: number; fun: number }): void,
    
    // Destroy chart instance
    destroyChart(): void
};

// Main Application Module
const App = {
    // Initialize application
    init(): void,
    
    // Handle form submission
    handleFormSubmit(event: SubmitEvent): void,
    
    // Handle transaction deletion
    handleTransactionDelete(id: string): void,
    
    // Refresh all UI components
    refreshUI(): void
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
```

---

## Data Models

### Transaction Interface

```typescript
interface Transaction {
    id: string;              // Unique identifier (UUID)
    itemName: string;        // Name of the item purchased
    amount: number;          // Cost of the item (positive number)
    category: 'food' | 'transport' | 'fun';  // Expense category
    timestamp: number;       // Timestamp of when transaction was added
}
```

### Local Storage Format

```json
{
  "transactions": [
    {
      "id": "uuid-v4-string",
      "itemName": "Grocery Shopping",
      "amount": 45.50,
      "category": "food",
      "timestamp": 1699999999999
    }
  ]
}
```

### State Management

The application uses a simple state management approach:

```javascript
let state = {
    transactions: [],
    balance: 0,
    spendingByCategory: { food: 0, transport: 0, fun: 0 }
};
```

State is stored in Local Storage and loaded on application initialization. All state changes go through the `DataManager` module.

---

## State Management Approach

### State Flow

```
┌──────────────────────────────────────────────────────────┐
│                    Application State                      │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  1. Load from Local Storage on init                      │
│     │                                                      │
│     ▼                                                      │
│  2. User performs action (add/delete)                    │
│     │                                                      │
│     ▼                                                      │
│  3. DataManager updates state                            │
│     │                                                      │
│     ▼                                                      │
│  4. State persisted to Local Storage                     │
│     │                                                      │
│     ▼                                                      │
│  5. UI components updated                                │
│     │                                                      │
│     ▼                                                      │
│  6. Refresh: Calculate balance and chart data            │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### State Update Pattern

1. **Action**: User triggers an action (add/delete transaction)
2. **Validation**: Form handler validates inputs
3. **Update**: Data manager updates the transactions array
4. **Persistence**: Transactions saved to Local Storage
5. **Calculation**: Balance and category spending recalculated
6. **Render**: All UI components re-rendered with new data

---

## Local Storage Key Naming

### Key Naming Convention

```
expense_budget_visualizer_transactions
```

### Rationale

- **Descriptive**: Clearly identifies the data purpose
- **Snake_case**: Consistent naming convention for readability
- **Namespace**: Unique prefix prevents collision with other applications

### Storage Structure

```javascript
// Single key for all transactions
const STORAGE_KEY = 'expense_budget_visualizer_transactions';

// Value is JSON stringified array of transactions
{
  "transactions": [
    {
      "id": "unique-id",
      "itemName": "Item Name",
      "amount": 10.00,
      "category": "food",
      "timestamp": 1234567890
    }
  ]
}
```

---

## Chart Configuration

### Chart.js Setup

```javascript
const ChartManager = {
    chartInstance: null,
    
    initializeChart() {
        const ctx = document.getElementById('category-chart').getContext('2d');
        
        this.chartInstance = new Chart(ctx, {
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
                    },
                    title: {
                        display: false
                    }
                }
            }
        });
    },
    
    updateChart(spending) {
        if (!this.chartInstance) return;
        
        this.chartInstance.data.datasets[0].data = [
            spending.food,
            spending.transport,
            spending.fun
        ];
        this.chartInstance.update();
    }
};
```

### Category Colors

| Category | Color | Hex Code |
|----------|-------|----------|
| Food | Red | `#FF6384` |
| Transport | Blue | `#36A2EB` |
| Fun | Yellow | `#FFCE56` |

---

## Validation Rules Implementation

### Form Validation Rules

```javascript
FormHandler.validateForm = function(itemName, amount, category) {
    // Rule 1: Item Name must not be empty or whitespace
    if (!itemName || itemName.trim() === '') {
        return { valid: false, error: 'Item name is required' };
    }
    
    // Rule 2: Item Name must not exceed maximum length (100 characters)
    if (itemName.trim().length > 100) {
        return { valid: false, error: 'Item name must be 100 characters or less' };
    }
    
    // Rule 3: Amount must be provided
    if (!amount || amount.trim() === '') {
        return { valid: false, error: 'Amount is required' };
    }
    
    // Rule 4: Amount must be a valid number
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue)) {
        return { valid: false, error: 'Amount must be a valid number' };
    }
    
    // Rule 5: Amount must be positive
    if (amountValue <= 0) {
        return { valid: false, error: 'Amount must be greater than zero' };
    }
    
    // Rule 6: Category must be selected
    if (!category || category === '') {
        return { valid: false, error: 'Category must be selected' };
    }
    
    return { valid: true };
};
```

### Validation Error Display

```javascript
FormHandler.showError = function(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.classList.add('visible');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        errorElement.classList.remove('visible');
    }, 3000);
};
```

---

## Error Handling

### Error Categories

1. **Input Validation Errors**
   - Empty required fields
   - Invalid number format
   - Negative or zero amounts
   - Field length exceeded

2. **Local Storage Errors**
   - Browser not supporting Local Storage
   - Storage quota exceeded
   - Security restrictions (private browsing mode)

3. **Data Parsing Errors**
   - Corrupted Local Storage data
   - Invalid JSON format

### Error Handling Implementation

```javascript
// Local Storage error handling
try {
    if (!window.Storage) {
        throw new Error('Local Storage not supported');
    }
    
    const data = localStorage.getItem(STORAGE_KEY);
    if (data === null) {
        // No data exists yet
        return [];
    }
    
    return JSON.parse(data);
} catch (error) {
    console.error('Error loading data from Local Storage:', error);
    // Return empty transactions array
    return [];
}

// Input validation error handling
try {
    const formData = FormHandler.getFormData();
    const validation = FormHandler.validateForm(
        formData.itemName,
        formData.amount,
        formData.category
    );
    
    if (!validation.valid) {
        throw new Error(validation.error);
    }
    
    // Process valid form
} catch (error) {
    FormHandler.showError(error.message);
}
```

### User-Facing Error Messages

| Error Type | Message | Action |
|------------|---------|--------|
| Empty Item Name | "Item name is required" | Field highlights in red |
| Invalid Amount | "Amount must be a valid number" | Field highlights in red |
| Negative Amount | "Amount must be greater than zero" | Field highlights in red |
| No Category | "Category must be selected" | Dropdown highlights in red |
| Local Storage Not Supported | "Your browser does not support Local Storage. Your data will not be saved between sessions." | Shows warning banner |
| Storage Full | "Storage space exceeded. Please delete some transactions." | Shows warning banner |

---

## Testing Strategy

### Unit Tests

**Input Validation Tests**
- Empty item name is rejected
- Whitespace-only item name is rejected
- Negative amount is rejected
- Zero amount is rejected
- Non-numeric amount is rejected
- Missing category is rejected

**Data Manager Tests**
- Transaction can be added and persisted
- Transaction can be deleted and removed from storage
- Balance is calculated correctly
- Category spending is calculated correctly
- Order of transactions is preserved

**UI Renderer Tests**
- Transactions render with correct data
- Balance displays with correct formatting
- Chart renders with correct data
- Error messages display correctly

### Property-Based Tests

When using Property-Based Testing, the following properties should be tested:

#### Property 1: Addition Preserves Total

*For any* transaction list with balance B, and *any* valid transaction with amount A, adding the transaction should result in a new balance of B + A.

**Validates: Requirements 2.3, 6.2**

#### Property 2: Deletion Corrects Total

*For any* transaction list with balance B, and *any* transaction with amount A, deleting the transaction should result in a new balance of B - A.

**Validates: Requirements 5.3, 6.3**

#### Property 3: Persistence Round-Trip

*For any* transaction list, saving to Local Storage and loading back should produce an identical list.

**Validates: Requirements 9.1, 9.2, 9.3**

#### Property 4: Category Distribution Preservation

*For any* transaction list, the sum of amounts in each category should equal the total spending for that category.

**Validates: Requirements 7.2, 8.1, 8.2**

#### Property 5: Input Validation Rejection

*For any* invalid input (empty, non-numeric, negative), the transaction should not be added to the list.

**Validates: Requirements 3.1, 3.2**

---

## Correctness Properties

This section defines the formal correctness properties that the application must satisfy to ensure data integrity and consistent behavior.

### Property 1: Transaction List Integrity

*For any* sequence of add and delete operations, the transaction list must remain a valid array containing only valid transaction objects (with non-null name, positive numeric amount, and valid category), with no null, undefined, or malformed entries.

**Validates: Requirements 1.1, 1.5, 3.1, 3.2**

### Property 2: Balance Calculation Accuracy

*For any* transaction list, the displayed Total Balance must always equal the sum of all transaction amounts, regardless of the order in which transactions were added or deleted.

**Validates: Requirements 2.3, 5.3, 6.1, 6.2, 6.3**

### Property 3: Category Spending Accuracy

*For any* transaction list, the spending breakdown for each category (Food, Transport, Fun) must always equal the sum of amounts for transactions in that category, and categories with zero spending must show 0% in the chart.

**Validates: Requirements 7.1, 7.2, 8.1, 8.2, 8.3**

### Property 4: Local Storage Persistence Consistency

*For any* transaction list, after saving to Local Storage and reloading, the complete transaction list must be identical to the original, including all transaction details (name, amount, category).

**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

### Property 5: Validation Rejection Preservation

*For any* attempt to add a transaction with empty fields or non-numeric amount, the transaction list must remain unchanged and no new entry should be added, regardless of how many invalid attempts are made.

**Validates: Requirements 1.5, 3.1, 3.2**

### Property 6: Delete Operation Correctness

*For any* transaction in the list, clicking its delete button must remove exactly that transaction and no others, and the resulting list must maintain the relative order of remaining transactions.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 7: Chart Update Consistency

*For any* transaction list, the pie chart must always reflect the current category distribution based on actual transaction amounts, updating immediately after any add or delete operation.

**Validates: Requirements 7.1, 8.1, 8.2, 8.3**

### Property 8: Order Preservation

*For any* sequence of add operations, the transaction list must maintain the order in which transactions were successfully added, with new transactions appearing at the end of the list.

**Validates: Requirements 4.3**

2. **Refresh Operation Idempotence**: Refreshing the UI multiple times with the same data must not change the displayed state.

### Metamorphic Properties

1. **Validation Monotonicity**: After applying input validation, the resulting valid transaction list must have fewer or equal items compared to the original attempt.

2. **Filtering Property**: Any operation that removes invalid data must result in a list that passes all validation rules.

### Error Condition Properties

1. **Error Recovery**: When Local Storage operations fail, the application must gracefully degrade to an empty state without crashing.

2. **Invalid Input Handling**: Any invalid input must be rejected without modifying the current transaction list.

### Integration Tests

1. **End-to-End Flow**
   - Load application
   - Add multiple transactions
   - Verify balance updates
   - Verify chart updates
   - Refresh page
   - Verify data persists

2. **Cross-Browser Compatibility**
   - Chrome
   - Firefox
   - Edge
   - Safari

3. **Local Storage Edge Cases**
   - Empty storage
   - Corrupted storage
   - Large transaction lists (1000+ items)

### Test Configuration

- **Property-Based Tests**: 100 iterations minimum per property
- **Unit Tests**: Run on every code change
- **Integration Tests**: Run before each release

---

## Responsive Design Considerations

### Breakpoints

| Breakpoint | Screen Width | Design Adjustment |
|------------|--------------|-------------------|
| Mobile | < 600px | Stack layout vertically, full-width inputs |
| Tablet | 600px - 1024px | Two-column layout for form |
| Desktop | > 1024px | Centered container, wider form |

### Mobile Optimizations

- Full-width form elements
- Larger touch targets (minimum 44px)
- Scrollable transaction list
- Stacked layout

### Tablet Optimizations

- Two-column layout for input form
- Balanced spacing
- Responsive chart container

### Desktop Optimizations

- Centered container with max-width
- Wider spacing between elements
- Optimized chart display

### CSS Media Queries

```css
/* Mobile */
@media (max-width: 599px) {
    .container {
        padding: 16px;
    }
    
    .form-group {
        margin-bottom: 16px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 4px;
    }
    
    .form-group input,
    .form-group select {
        width: 100%;
        padding: 12px;
        font-size: 16px;
    }
    
    .transaction-item {
        flex-direction: column;
        gap: 8px;
    }
}

/* Tablet */
@media (min-width: 600px) and (max-width: 1023px) {
    .container {
        padding: 24px;
        max-width: 768px;
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        gap: 12px;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .container {
        padding: 32px;
        max-width: 960px;
    }
    
    .balance-display {
        text-align: center;
    }
}
```

### Accessibility Considerations

- All form fields have associated labels
- Error messages are screen reader accessible
- Chart includes data table fallback
- Color contrast meets WCAG AA standards
- Keyboard navigation supported

---

## Implementation Checklist

### Phase 1: Core Structure
- [ ] Create HTML structure with all sections
- [ ] Link CSS and JavaScript files
- [ ] Implement basic styling

### Phase 2: Data Management
- [ ] Implement Local Storage read/write
- [ ] Implement transaction CRUD operations
- [ ] Implement balance calculation

### Phase 3: Form Handling
- [ ] Implement input validation
- [ ] Handle form submission
- [ ] Clear form after successful submission

### Phase 4: UI Rendering
- [ ] Render transaction list
- [ ] Display balance
- [ ] Implement delete functionality

### Phase 5: Chart Integration
- [ ] Integrate Chart.js
- [ ] Configure chart data
- [ ] Implement auto-update on data changes

### Phase 6: Testing
- [ ] Write unit tests
- [ ] Write property-based tests (if PBT selected)
- [ ] Write integration tests
- [ ] Test across browsers

---

## Next Steps

1. Review this design document with the team
2. Confirm technical approach with stakeholders
3. Begin implementation following the checklist
4. Run tests after each phase
5. Iterate based on feedback

---

## References

- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [Local Storage API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [HTML5 Form Validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation)
