// API Configuration - UPDATE THIS WITH YOUR API URL
const API_BASE_URL = 'http://localhost:8000/todos';

let currentFilter = 'all';
let todos = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    setupEventListeners();
});

function setupEventListeners() {
    // Add todo form
    document.getElementById('addTodoForm').addEventListener('submit', handleAddTodo);

    // Edit todo form
    document.getElementById('editTodoForm').addEventListener('submit', handleEditTodo);

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            loadTodos();
        });
    });

    // Close modal on overlay click
    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeEditModal();
        }
    });
}

// Load todos
async function loadTodos() {
    try {
        showLoading();
        const url = currentFilter === 'all' 
            ? `${API_BASE_URL}/getall` 
            : `${API_BASE_URL}/getall?status=${currentFilter}`;
        
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Failed to load todos');
        
        todos = await response.json();
        renderTodos(todos);
    } catch (error) {
        showError('Failed to load tasks. Please check your API connection.');
        console.error('Error loading todos:', error);
    }
}

// Render todos
function renderTodos(todosToRender) {
    const container = document.getElementById('todosContainer');
    
    if (todosToRender.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✨</div>
                <h3 class="empty-state-text">No tasks yet</h3>
                <p class="empty-state-subtext">Add a new task to get started</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="todos-list">
            ${todosToRender.map((todo, index) => `
                <div class="todo-item ${todo.status}" style="animation-delay: ${index * 0.05}s">
                    <div class="checkbox-wrapper">
                        <div class="custom-checkbox ${todo.status === 'completed' ? 'checked' : ''}" 
                             onclick="toggleTodoStatus(${todo.id})">
                        </div>
                    </div>
                    <div class="todo-content">
                        <h3 class="todo-title">${escapeHtml(todo.title)}</h3>
                        ${todo.description ? `<p class="todo-description">${escapeHtml(todo.description)}</p>` : ''}
                        <div class="todo-meta">
                            <span class="status-badge ${todo.status}">${todo.status}</span>
                            ${todo.created_at ? `<span class="todo-date">Created ${formatDate(todo.created_at)}</span>` : ''}
                        </div>
                    </div>
                    <div class="todo-actions">
                        <button class="action-btn edit-btn" onclick="openEditModal(${todo.id})" title="Edit">✏️</button>
                        <button class="action-btn delete-btn" onclick="deleteTodo(${todo.id})" title="Delete">🗑️</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Add todo
async function handleAddTodo(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const todoData = {
        title: formData.get('title'),
        description: formData.get('description') || '',
        status: formData.get('status')
    };

    try {
        const response = await fetch(`${API_BASE_URL}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(todoData)
        });

        if (!response.ok) throw new Error('Failed to add todo');

        showSuccess('Task added successfully!');
        e.target.reset();
        loadTodos();
    } catch (error) {
        showError('Failed to add task. Please try again.');
        console.error('Error adding todo:', error);
    }
}

// Toggle todo status
async function toggleTodoStatus(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';

    try {
        const response = await fetch(`${API_BASE_URL}/update/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: todo.title,
                description: todo.description,
                status: newStatus
            })
        });

        if (!response.ok) throw new Error('Failed to update todo');

        loadTodos();
    } catch (error) {
        showError('Failed to update task status.');
        console.error('Error updating todo:', error);
    }
}

// Open edit modal
function openEditModal(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    document.getElementById('editId').value = todo.id;
    document.getElementById('editTitle').value = todo.title;
    document.getElementById('editDescription').value = todo.description || '';
    document.getElementById('editStatus').value = todo.status;

    document.getElementById('editModal').classList.add('active');
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

// Handle edit todo
async function handleEditTodo(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const id = document.getElementById('editId').value;
    const todoData = {
        title: formData.get('title'),
        description: formData.get('description') || '',
        status: formData.get('status')
    };

    try {
        const response = await fetch(`${API_BASE_URL}/update/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(todoData)
        });

        if (!response.ok) throw new Error('Failed to update todo');

        showSuccess('Task updated successfully!');
        closeEditModal();
        loadTodos();
    } catch (error) {
        showError('Failed to update task. Please try again.');
        console.error('Error updating todo:', error);
    }
}

// Delete todo
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete todo');

        showSuccess('Task deleted successfully!');
        loadTodos();
    } catch (error) {
        showError('Failed to delete task. Please try again.');
        console.error('Error deleting todo:', error);
    }
}

// Utility functions
function showLoading() {
    document.getElementById('todosContainer').innerHTML = '<div class="loading">Loading your tasks...</div>';
}

function showError(message) {
    const container = document.getElementById('errorContainer');
    container.innerHTML = `<div class="error-message">${message}</div>`;
    setTimeout(() => container.innerHTML = '', 5000);
}

function showSuccess(message) {
    const container = document.getElementById('successContainer');
    container.innerHTML = `<div class="success-message">${message}</div>`;
    setTimeout(() => container.innerHTML = '', 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}