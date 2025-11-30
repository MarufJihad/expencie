import React, { useState, useMemo, useCallback } from 'react';

// NOTE: This component is self-contained and uses Tailwind CSS (assumed available).

// The main application component
const App = () => {
    
    // ==========================================================
    // TASK 1: DEFINE CORE STATE VARIABLES (The Data Backbone)
    // ==========================================================
    const [expenses, setExpenses] = useState([]); // Master list of all saved transactions
    const [newExpense, setNewExpense] = useState({ name: '', amount: '' }); // Tracks form input fields (draft data)
    const [error, setError] = useState(null); // Manages validation messages (null means no error)

    // Object Destructuring for easier access to form input values
    const { name, amount } = newExpense; 

    // ==========================================================
    // TASK 2: INPUT HANDLER (Connecting HTML Inputs to State)
    // ==========================================================
    // Updates the 'newExpense' object every time a character is typed.
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        
        // Updates state dynamically: copies the old state (...prev) and updates only the one field [name]: value
        setNewExpense(prev => ({ 
            ...prev, 
            [name]: value 
        }));
    }, []);

    // ==========================================================
    // TASK 3: CALCULATE TOTAL EXPENSES (Performance Optimization)
    // ==========================================================
    const totalExpenses = useMemo(() => {
        // useMemo caches the result and only recalculates if 'expenses' changes.
        return expenses.reduce((acc, expense) => {
            // Converts amount string to number for math and uses 0 as a fallback for bad data.
            return acc + (parseFloat(expense.amount) || 0);
        }, 0); // Starts the accumulation at 0
    }, [expenses]); 
    // Dependency array: re-calculate only when the master list changes.


    // ==========================================================
    // TASK 4: ADD EXPENSE (SUBMISSION LOGIC)
    // ==========================================================
    const addExpense = (e) => {
        e.preventDefault(); // Prevents the browser from reloading the page
        
        // --- Validation ---
        const validatedAmount = parseFloat(amount);

        if (!name || isNaN(validatedAmount) || validatedAmount <= 0) {
            setError("Please enter a valid description and a positive amount.");
            return; // Stop execution if validation fails
        }

        // --- Data Creation ---
        const newExpenseData = {
            id: Date.now(), // Unique ID for key and deletion
            name: name,
            amount: validatedAmount, // Use the validated number
            timestamp: Date.now(),
        };

        // --- Commit to State (Immutability) ---
        // Creates a NEW array: puts the new item at the front for easy viewing, followed by all old items (...prev).
        setExpenses(prev => [newExpenseData, ...prev]); 
        
        // --- Cleanup ---
        setNewExpense({ name: '', amount: '' }); // Clear form inputs
        setError(null); // Clear error message
    };
    
    // ==========================================================
    // TASK 5: DELETE EXPENSE (Immutability through Filtering)
    // ==========================================================
    const deleteExpense = (id) => {
        // filter() creates a NEW array that excludes the item matching the ID.
        setExpenses(prev => prev.filter(exp => exp.id !== id));
    };


    // ==========================================================
    // TASK 6: RENDER UI (The View Layer)
    // ==========================================================
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-teal-700 tracking-tight">
                        Pocket Ledger
                    </h1>
                    <p className="text-slate-600 mt-2">
                        Simple, efficient, and fast expense tracking.
                    </p>
                </header>

                {/* Summary Card and Form Container */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    
                    {/* Summary Card (Total Expenses) - Displays Task 3 result */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border-b-4 border-teal-500">
                        <h2 className="text-lg font-semibold text-slate-700 mb-2">Total Spent</h2>
                        <p className="text-5xl font-bold text-teal-600">
                            ${totalExpenses.toFixed(2)} 
                        </p>
                        <p className="text-sm text-slate-500 mt-2">
                            Tracking {expenses.length} transaction(s)
                        </p>
                    </div>

                    {/* New Expense Form */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-slate-700 mb-4">Record New Expense</h2>
                        
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm font-medium" role="alert">
                                {error}
                            </div>
                        )}

                        <form onSubmit={addExpense}>
                            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                {/* Input 1: Description (Controlled by newExpense.name) */}
                                <input
                                    type="text"
                                    name="name" 
                                    placeholder="Description (e.g., Office Supplies, Lunch)"
                                    value={name} // Uses destructured 'name' from Task 1
                                    onChange={handleInputChange} // Uses handler from Task 2
                                    required
                                    className="flex-grow p-3 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition duration-150 text-slate-700"
                                />

                                {/* Input 2: Amount (Controlled by newExpense.amount) */}
                                <input
                                    type="number"
                                    name="amount" 
                                    placeholder="Amount ($)"
                                    value={amount} // Uses destructured 'amount' from Task 1
                                    onChange={handleInputChange} // Uses handler from Task 2
                                    required
                                    step="0.01"
                                    min="0.01"
                                    className="w-full sm:w-32 p-3 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition duration-150 text-slate-700"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition duration-150 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50"
                            >
                                Save Expense
                            </button>
                        </form>
                    </div>
                </div>

                {/* Transaction List */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2">
                        Transaction History
                    </h2>
                    
                    {expenses.length === 0 ? (
                        <p className="text-center text-slate-500 py-6">
                            No transactions recorded yet. Add your first expense above!
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {expenses.map((expense) => (
                                <li 
                                    key={expense.id} 
                                    className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition duration-150 border"
                                >
                                    {/* Description */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-800 truncate">{expense.name}</p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(expense.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                    
                                    {/* Amount and Delete Button */}
                                    <div className="flex items-center space-x-4">
                                        <p className="font-bold text-red-600 text-lg">
                                            -${expense.amount.toFixed(2)} 
                                        </p>
                                        <button 
                                            onClick={() => deleteExpense(expense.id)} 
                                            className="text-red-400 hover:text-red-600 transition duration-150 p-1 rounded-full hover:bg-red-50"
                                            aria-label={`Delete ${expense.name}`}
                                        >
                                            
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </li> 
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;