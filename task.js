document.addEventListener('DOMContentLoaded', function() {
    // Initialize tasks array from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Get all sections
    const welcomeSection = document.getElementById('welcomeSection');
    const tasksSection = document.getElementById('tasksSection');
    const taskManagementSection = document.getElementById('taskManagementSection');
    const taskReportsSection = document.getElementById('taskReportsSection');
    const hrSection = document.getElementById('hrSection');

    // Get task-related elements
    const myTasksContainer = document.getElementById('myTasks');
    const taskOverviewContainer = document.getElementById('taskOverview');
    const taskModal = document.getElementById('taskModal');
    const taskForm = document.getElementById('taskForm');

    // Get menu elements
    const operationMenu = document.querySelector('.has-submenu');
    const submenu = document.querySelector('.submenu');
    const menuItems = document.querySelectorAll('.menu-item:not(.has-submenu), .submenu-item');

    // Add new elements
    const searchInput = document.querySelector('.search-bar input');
    const taskFilterStatus = document.createElement('select');  
    const taskSortSelect = document.createElement('select');

    // Add task categories
    const taskCategories = [
        'Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Education', 'Other'
    ];

    // Load tasks immediately when page loads
    loadMyTasks();

    // Operation submenu toggle
    if (operationMenu && submenu) {
        operationMenu.onclick = function(e) {
            e.preventDefault();
            submenu.classList.toggle('active');
            this.classList.toggle('expanded');
        };
    }

    // Navigation click handlers
    menuItems.forEach(item => {
        item.onclick = function(e) {
            e.preventDefault();
            const sectionToShow = this.getAttribute('data-section');
            
            // Remove active class from all menu items
            menuItems.forEach(menuItem => menuItem.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            showSection(sectionToShow);
        };
    });

    // Section display handler
    function showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        const selectedSection = document.getElementById(sectionId + 'Section');
        if (selectedSection) {
            selectedSection.style.display = 'block';
        }
    }

    // Initialize filter and sort options
    function initializeFilters() {
        // Status filter
        taskFilterStatus.innerHTML = `
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
        `;
        taskFilterStatus.className = 'task-filter';

        // Sort options
        taskSortSelect.innerHTML = `
            <option value="date-asc">Due Date (Earliest)</option>
            <option value="date-desc">Due Date (Latest)</option>
            <option value="priority-high">Priority (High-Low)</option>
            <option value="priority-low">Priority (Low-High)</option>
        `;
        taskSortSelect.className = 'task-sort';

        // Add to filter container
        const filterContainer = document.querySelector('.task-filters');
        if (filterContainer) {
            filterContainer.appendChild(taskFilterStatus);
            filterContainer.appendChild(taskSortSelect);
        }
    }

    // Function to load tasks
    function loadMyTasks() {
        if (!myTasksContainer) return;

        // Get tasks from localStorage
        tasks = JSON.parse(localStorage.getItem('tasks')) || [];

        if (tasks.length === 0) {
            myTasksContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <h3>No tasks yet</h3>
                    <p>Add your first task to get started</p>
                </div>
            `;
            return;
        }

        myTasksContainer.innerHTML = '';
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            myTasksContainer.appendChild(taskElement);
        });

        updateTaskStats();
    }

    // Function to create task element
    function createTaskElement(task) {
        const div = document.createElement('div');
        div.className = `task-card ${task.status}`;
        div.dataset.taskId = task.id;
        
        div.innerHTML = `
            <div class="task-content">
                <div class="task-header">
                    <span class="task-priority ${task.priority}">
                        ${task.priority.toUpperCase()}
                    </span>
                    <div class="task-category">${task.category || 'Uncategorized'}</div>
                </div>
                <h3 class="task-title">${task.title}</h3>
                <p class="task-description">${task.description || 'No description'}</p>
                <div class="task-meta">
                    <div class="task-due-date">
                        <i class="far fa-calendar"></i>
                        <span>${formatDate(task.dueDate)}</span>
                    </div>
                    <div class="task-status">
                        <i class="fas fa-circle"></i>
                        <span>${task.status}</span>
                    </div>
                </div>
            </div>
            <div class="task-actions">
                <button type="button" class="task-action-btn status-btn" data-task-id="${task.id}">
                    <i class="fas fa-sync-alt"></i>
                </button>
                <button type="button" class="task-action-btn edit-btn" data-task-id="${task.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="task-action-btn delete-btn" data-task-id="${task.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Add event listeners to buttons
        const statusBtn = div.querySelector('.status-btn');
        const editBtn = div.querySelector('.edit-btn');
        const deleteBtn = div.querySelector('.delete-btn');

        statusBtn.addEventListener('click', () => updateTaskStatus(task.id));
        editBtn.addEventListener('click', () => editTask(task.id));
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        return div;
    }

    // Date formatter
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Add event listeners for filters and search
    if (searchInput) {
        searchInput.addEventListener('input', debounce(loadMyTasks, 300));
    }
    taskFilterStatus.addEventListener('change', loadMyTasks);
    taskSortSelect.addEventListener('change', loadMyTasks);

    // Debounce helper
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize filters
    initializeFilters();

    // Task loading functions
    function loadAllTasks() {
        if (taskOverviewContainer) {
            taskOverviewContainer.innerHTML = '';
            tasks.forEach(task => {
                const taskElement = createTaskElement(task, false);
                taskOverviewContainer.appendChild(taskElement);
            });
        }
    }

    // Task Modal
    window.openTaskModal = function() {
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.style.display = 'block';
            document.getElementById('taskForm').reset();
        }
    };

    // Close modal function
    function closeModal() {
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('taskForm').reset();
        }
    }

    // Close modal with X button
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.onclick = closeModal;
    }

    // Cancel button
    const cancelBtn = document.querySelector('.btn-cancel');
    if (cancelBtn) {
        cancelBtn.onclick = closeModal;
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('taskModal');
        if (event.target === modal) {
            closeModal();
        }
    };

    // Task form submission
    if (taskForm) {
        taskForm.onsubmit = function(e) {
            e.preventDefault();
            
            const newTask = {
                id: Date.now().toString(),
                title: document.getElementById('taskTitle').value,
                description: document.getElementById('taskDescription').value,
                priority: document.getElementById('taskPriority').value,
                dueDate: document.getElementById('taskDueDate').value,
                category: document.getElementById('taskCategory').value,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            tasks.push(newTask);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            
            loadMyTasks();
            closeModal();
            showNotification('New task created successfully');
        };
    }

    // Delete task function
    window.deleteTask = function(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== taskId);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            loadMyTasks();
            showNotification('Task deleted successfully');
        }
    };

    // Update task status
    window.updateTaskStatus = function(taskId) {
        const statusCycle = ['pending', 'in-progress', 'completed'];
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            const currentIndex = statusCycle.indexOf(task.status);
            task.status = statusCycle[(currentIndex + 1) % statusCycle.length];
            localStorage.setItem('tasks', JSON.stringify(tasks));
            loadMyTasks();
            showNotification(`Task status updated to ${task.status}`);
        }
    };

    // Edit task function
    window.editTask = function(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task && taskModal) {
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskDueDate').value = task.dueDate;
            document.getElementById('taskCategory').value = task.category || '';
            
            taskForm.onsubmit = function(e) {
                e.preventDefault();
                
                task.title = document.getElementById('taskTitle').value;
                task.description = document.getElementById('taskDescription').value;
                task.priority = document.getElementById('taskPriority').value;
                task.dueDate = document.getElementById('taskDueDate').value;
                task.category = document.getElementById('taskCategory').value;

                localStorage.setItem('tasks', JSON.stringify(tasks));
                loadMyTasks();
                closeModal();
                showNotification('Task updated successfully');
            };
            
            taskModal.style.display = 'block';
        }
    };

    // Notification system
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Task statistics
    function updateTaskStats() {
        const stats = {
            total: tasks.length,
            pending: tasks.filter(t => t.status === 'pending').length,
            inProgress: tasks.filter(t => t.status === 'in-progress').length,
            completed: tasks.filter(t => t.status === 'completed').length
        };

        const statsContainer = document.getElementById('taskStats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-item">
                    <span class="stat-value">${stats.total}</span>
                    <span class="stat-label">Total Tasks</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.pending}</span>
                    <span class="stat-label">Pending</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.inProgress}</span>
                    <span class="stat-label">In Progress</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.completed}</span>
                    <span class="stat-label">Completed</span>
                </div>
            `;
        }
    }

    // Initialize welcome section
    showSection('welcome');

    // Update task form with categories
    function enhanceTaskForm() {
        const categorySelect = document.getElementById('taskCategory');
        if (categorySelect) {
            categorySelect.innerHTML = `
                <option value="">Select Category</option>
                ${taskCategories.map(category => 
                    `<option value="${category.toLowerCase()}">${category}</option>`
                ).join('')}
            `;
        }
    }

    // Task Analytics
    function generateTaskAnalytics() {
        const analyticsContainer = document.getElementById('taskAnalytics');
        if (!analyticsContainer) return;

        // Category distribution
        const categoryData = {};
        tasks.forEach(task => {
            const category = task.category || 'Uncategorized';
            categoryData[category] = (categoryData[category] || 0) + 1;
        });

        // Priority distribution
        const priorityData = {
            high: tasks.filter(t => t.priority === 'high').length,
            medium: tasks.filter(t => t.priority === 'medium').length,
            low: tasks.filter(t => t.priority === 'low').length
        };

        // Due date analysis
        const today = new Date();
        const overdueTasks = tasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            return dueDate < today && task.status !== 'completed';
        }).length;

        analyticsContainer.innerHTML = `
            <div class="analytics-section">
                <h3>Task Distribution</h3>
                <div class="chart-container">
                    ${generatePieChart(categoryData)}
                </div>
            </div>
            <div class="analytics-section">
                <h3>Priority Breakdown</h3>
                <div class="priority-bars">
                    ${generatePriorityBars(priorityData)}
                </div>
            </div>
            <div class="analytics-section">
                <h3>Task Status</h3>
                <div class="status-overview">
                    <div class="status-item overdue">
                        <span class="status-value">${overdueTasks}</span>
                        <span class="status-label">Overdue Tasks</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Drag and Drop functionality
    function initializeDragAndDrop() {
        const taskCards = document.querySelectorAll('.task-card');
        const dropZones = document.querySelectorAll('.status-column');

        taskCards.forEach(card => {
            card.setAttribute('draggable', true);
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);
        });

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', handleDragOver);
            zone.addEventListener('drop', handleDrop);
        });
    }

    function handleDragStart(e) {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        const taskId = parseInt(e.dataTransfer.getData('text/plain'));
        const newStatus = e.currentTarget.dataset.status;
        
        updateTaskStatus(taskId, newStatus);
        e.currentTarget.classList.remove('drag-over');
    }

    // Task Priority Management
    function updateTaskPriority(taskId, newPriority) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.priority = newPriority;
            localStorage.setItem('tasks', JSON.stringify(tasks));
            loadMyTasks();
            showNotification(`Task priority updated to ${newPriority}`);
        }
    }

    // Helper function to check if task is overdue
    function isOverdue(dueDate) {
        return new Date(dueDate) < new Date() && task.status !== 'completed';
    }

    // Task Collaboration
    function initializeCollaboration() {
        const collaborators = [
            { id: 1, name: 'John Doe', avatar: 'images/newlogo.png' },
            { id: 2, name: 'Jane Smith', avatar: 'images/newlogo.png' },
            // Add more collaborators as needed
        ];

        // Add collaborator selection to task form
        const collaboratorSelect = document.createElement('div');
        collaboratorSelect.className = 'collaborator-select';
        collaboratorSelect.innerHTML = `
            <label>Assign To:</label>
            <div class="collaborator-list">
                ${collaborators.map(user => `
                    <div class="collaborator-item">
                        <input type="checkbox" id="user-${user.id}" name="collaborators" value="${user.id}">
                        <label for="user-${user.id}">
                            <img src="${user.avatar}" alt="${user.name}">
                            <span>${user.name}</span>
                        </label>
                    </div>
                `).join('')}
            </div>
        `;

        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.insertBefore(collaboratorSelect, taskForm.querySelector('.modal-footer'));
        }
    }

    // Task Progress Tracking
    function initializeProgressTracking() {
        const taskCard = document.querySelectorAll('.task-card');
        taskCard.forEach(card => {
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.innerHTML = `
                <div class="progress-track">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <span class="progress-text">0%</span>
            `;
            
            const checklistContainer = document.createElement('div');
            checklistContainer.className = 'task-checklist';
            checklistContainer.innerHTML = `
                <div class="checklist-header">
                    <h4>Checklist</h4>
                    <button class="add-checklist-item">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="checklist-items"></div>
            `;

            card.appendChild(progressBar);
            card.appendChild(checklistContainer);
        });
    }

    // Task Reminders
    function initializeReminders() {
        const reminderToggle = document.createElement('div');
        reminderToggle.className = 'reminder-toggle';
        reminderToggle.innerHTML = `
            <label>Set Reminder:</label>
            <select class="reminder-time">
                <option value="">No Reminder</option>
                <option value="15">15 minutes before</option>
                <option value="30">30 minutes before</option>
                <option value="60">1 hour before</option>
                <option value="1440">1 day before</option>
            </select>
        `;

        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.insertBefore(reminderToggle, taskForm.querySelector('.modal-footer'));
        }
    }

    // Task Comments
    function initializeComments() {
        const commentSection = document.createElement('div');
        commentSection.className = 'task-comments';
        commentSection.innerHTML = `
            <div class="comments-header">
                <h4>Comments</h4>
            </div>
            <div class="comments-list"></div>
            <div class="comment-input">
                <textarea placeholder="Add a comment..."></textarea>
                <button class="submit-comment">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;

        document.querySelectorAll('.task-card').forEach(card => {
            card.appendChild(commentSection.cloneNode(true));
        });
    }

    // Schedule Reminder
    function scheduleReminder(task) {
        const dueDate = new Date(task.dueDate);
        const reminderTime = dueDate.getTime() - (task.reminder * 60 * 1000);
        
        if (reminderTime > Date.now()) {
            setTimeout(() => {
                showNotification(`Reminder: Task "${task.title}" is due in ${task.reminder} minutes`);
            }, reminderTime - Date.now());
        }
    }

    // Initialize new features
    function initializeEnhancements() {
        initializeCollaboration();
        initializeProgressTracking();
        initializeReminders();
        initializeComments();
    }

    // Call initialize
    initializeEnhancements();
});

const styles = `
.notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #0F828D;
    color: white;
    padding: 15px 25px;
    border-radius: 6px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.fas.low { color: #51cf66; }
.fas.medium { color: #ffd43b; }
.fas.high { color: #ff6b6b; }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

