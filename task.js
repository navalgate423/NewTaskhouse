console.log('Script loaded'); // Check if script is loading

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded'); // Check if DOM is ready
    
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
            // Convert the string to a DOM element before appending
            const taskHTML = createTaskCard(task);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = taskHTML;
            const taskElement = tempDiv.firstElementChild;
            myTasksContainer.appendChild(taskElement);
        });

        updateTaskStats();
    }

    // Function to create task element
    function createTaskCard(task) {
        return `
            <div class="task-card ${task.priority}" data-task-id="${task.id}">
                <div class="task-content">
                    <div class="status-badge">${task.status}</div>
                    <h3 class="task-title">${task.title}</h3>
                    <p class="task-description">${task.description}</p>
                    <div class="task-meta">
                        <div class="due-date">
                            <i class="far fa-calendar"></i>
                            ${task.dueDate}
                        </div>
                        <div class="task-actions">
                            <button class="task-btn edit-btn" onclick="showUpdateModal('${task.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="task-btn delete-btn" onclick="showDeleteModal('${task.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Date formatter
    function formatDate(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: '2-digit',
            year: 'numeric'
        });
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
                const taskElement = createTaskCard(task, false);
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
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Add icon based on type
        const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Animate out after 2 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
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

    // Attendance functionality
    let workStartTime = null;
    let workTimer = null;

    // Initialize attendance modal buttons
    function initializeAttendanceButtons() {
        console.log('Initializing attendance buttons');
        const clockInBtn = document.getElementById('clockInBtn');
        const clockOutBtn = document.getElementById('clockOutBtn');
        
        if (clockInBtn) {
            console.log('Found Clock In button');
            clockInBtn.onclick = function() {
                console.log('Clock In clicked');
                clockIn();
            };
        } else {
            console.log('Clock In button not found');
        }
        
        if (clockOutBtn) {
            clockOutBtn.onclick = function() {
                console.log('Clock Out clicked');
                clockOut();
            };
        }
    }

    // Update toggleAttendanceModal function
    window.toggleAttendanceModal = function() {
        console.log('Toggle modal called');
        const modal = document.getElementById('attendanceModal');
        if (modal) {
            modal.classList.toggle('show');
            updateDateTime();
            updateRecords();
            // Initialize buttons after modal is shown
            setTimeout(initializeAttendanceButtons, 100);
        }
    };

    // Initialize buttons on page load as well
    initializeAttendanceButtons();

    function updateDateTime() {
        const now = new Date();
        const dateTimeElement = document.getElementById('currentDateTime');
        const dateRangeElement = document.getElementById('dateRangeText');
        
        if (dateTimeElement) {
            dateTimeElement.textContent = formatDateTime(now);
        }
        
        if (dateRangeElement) {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            dateRangeElement.textContent = `${formatDate(monthStart)} - ${formatDate(monthEnd)}`;
        }
    }

    function updateRealTimeClock() {
        const now = new Date();
        const timeElement = document.getElementById('realTimeClock');
        const dateElement = document.getElementById('currentDateTime');
        
        if (timeElement) {
            // Update time in HH:MM:SS format
            timeElement.textContent = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
        
        if (dateElement) {
            // Update date
            dateElement.textContent = now.toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
            });
        }
    }

    // Start the clock when the document loads
    document.addEventListener('DOMContentLoaded', function() {
        // Initial update
        updateRealTimeClock();
        
        // Update every second
        setInterval(updateRealTimeClock, 1000);
    });

    function clockIn() {
        const now = new Date();
        const lastClockOut = localStorage.getItem('lastClockOut');
        
        if (lastClockOut) {
            const lastClockOutDate = new Date(parseInt(lastClockOut));
            const nextAvailableDate = new Date(lastClockOutDate);
            nextAvailableDate.setHours(0, 0, 0, 0);
            nextAvailableDate.setDate(nextAvailableDate.getDate() + 1);
            
            if (now < nextAvailableDate) {
                showNotification('You can only clock in again tomorrow', 'error');
                return;
            }
        }
        
        const record = {
            type: 'Clock In',
            time: now.toLocaleTimeString(),
            date: now.toLocaleDateString(),
            timestamp: now.getTime()
        };
        
        // Save to localStorage
        let records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
        records.push(record);
        localStorage.setItem('attendanceRecords', JSON.stringify(records));
        
        // Update UI
        const clockInBtn = document.getElementById('clockInBtn');
        const clockOutBtn = document.getElementById('clockOutBtn');
        if (clockInBtn) clockInBtn.disabled = true;
        if (clockOutBtn) clockOutBtn.disabled = false;
        
        // Update table
        updateRecords();
        showNotification('You have successfully clocked in!');
    }

    function clockOut() {
        const now = new Date();
        const record = {
            type: 'Clock Out',
            time: now.toLocaleTimeString(),
            date: now.toLocaleDateString(),
            timestamp: now.getTime()
        };
        
        // Save to localStorage
        let records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
        records.push(record);
        localStorage.setItem('attendanceRecords', JSON.stringify(records));
        
        // Save last clock out time
        localStorage.setItem('lastClockOut', now.getTime().toString());
        
        // Update UI
        const clockInBtn = document.getElementById('clockInBtn');
        const clockOutBtn = document.getElementById('clockOutBtn');
        if (clockInBtn) clockInBtn.disabled = true;
        if (clockOutBtn) clockOutBtn.disabled = true;
        
        // Update table
        updateRecords();
        showNotification('You have successfully clocked out!');
    }

    function checkClockStatus() {
        const records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
        const today = new Date().toLocaleDateString();
        const lastClockOut = localStorage.getItem('lastClockOut');
        
        if (lastClockOut) {
            const lastClockOutDate = new Date(parseInt(lastClockOut));
            const nextAvailableDate = new Date(lastClockOutDate);
            nextAvailableDate.setHours(0, 0, 0, 0);
            nextAvailableDate.setDate(nextAvailableDate.getDate() + 1);
            
            const now = new Date();
            if (now < nextAvailableDate) {
                const clockInBtn = document.getElementById('clockInBtn');
                if (clockInBtn) clockInBtn.disabled = true;
                return;
            }
        }
        
        const todayRecords = records.filter(record => record.date === today);
        
        if (todayRecords.length > 0) {
            const lastRecord = todayRecords[todayRecords.length - 1];
            const isClockedIn = lastRecord.type === 'Clock In';
            
            const clockInBtn = document.getElementById('clockInBtn');
            const clockOutBtn = document.getElementById('clockOutBtn');
            
            if (clockInBtn) clockInBtn.disabled = isClockedIn;
            if (clockOutBtn) clockOutBtn.disabled = !isClockedIn;
        }
    }

    function updateRecords() {
        const tableBody = document.getElementById('attendanceTableBody');
        const records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
        const days = generateWeekSchedule(new Date());
        
        tableBody.innerHTML = days.map((day, index) => {
            const dayRecords = records.filter(r => r.date === day.date);
            const clockIn = dayRecords.find(r => r.type === 'Clock In');
            const clockOut = dayRecords.find(r => r.type === 'Clock Out');
            
            const metrics = calculateAttendanceMetrics(dayRecords);
            
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${day.dayName}</td>
                    <td>${day.scheduleIn}</td>
                    <td>${day.scheduleOut}</td>
                    <td>${day.break}</td>
                    <td>${clockIn ? clockIn.time : ''}</td>
                    <td>${clockOut ? clockOut.time : ''}</td>
                    <td>${formatDuration(metrics.tardiness)}</td>
                    <td>${formatDuration(metrics.undertime)}</td>
                    <td>${formatDuration(metrics.breakDuration)}</td>
                    <td>${formatDuration(metrics.workHours)}</td>
                    <td>${formatDuration(metrics.excess)}</td>
                    <td class="action-cell">
                        <button class="action-btn">
                            <i class="fas fa-cog"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function calculateAttendanceMetrics(records) {
        const workStart = '10:00 PM'; // Expected start time
        const workHoursRequired = 9 * 60; // 9 hours in minutes
        
        let metrics = {
            clockIn: records.find(r => r.type === 'Clock In')?.time || null,
            clockOut: records.find(r => r.type === 'Clock Out')?.time || null,
            workHours: 0,
            breakDuration: 60, // Default 1 hour break
            tardiness: 0,
            undertime: 0,
            excess: 0
        };
        
        if (metrics.clockIn && metrics.clockOut) {
            const clockInTime = parseTime(metrics.clockIn);
            const clockOutTime = parseTime(metrics.clockOut);
            const expectedStartTime = parseTime(workStart);
            
            // Calculate tardiness
            if (clockInTime > expectedStartTime) {
                metrics.tardiness = clockInTime - expectedStartTime;
            }
            
            // Calculate total work hours
            let totalMinutes = clockOutTime - clockInTime - metrics.breakDuration;
            metrics.workHours = totalMinutes;
            
            // Calculate undertime/excess
            if (totalMinutes < workHoursRequired) {
                metrics.undertime = workHoursRequired - totalMinutes;
            } else {
                metrics.excess = totalMinutes - workHoursRequired;
            }
        }
        
        return metrics;
    }

    function parseTime(timeString) {
        const [time, period] = timeString.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        return hours * 60 + minutes;
    }

    function formatDuration(minutes) {
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    function formatDateTime(date) {
        return date.toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    function generateWeekSchedule(startDate) {
        const days = [];
        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            days.push({
                dayName: dayNames[currentDate.getDay()],
                date: currentDate.toLocaleDateString(),
                scheduleIn: '10:00 PM',
                scheduleOut: '7:00 AM',
                break: '1:0'
            });
        }
        
        return days;
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        // Update time every second
        setInterval(updateDateTime, 1000);
        
        // Check if already clocked in
        checkClockStatus();
        
        // Initial records update
        updateRecords();
    });

    const attendanceIcon = document.querySelector('.attendance-icon');
    if (attendanceIcon) {
        attendanceIcon.addEventListener('click', function() {
            const modal = document.getElementById('attendanceModal');
            if (modal) {
                modal.classList.toggle('show');
                updateDateTime();
            }
        });
    }

    // Add close button handler
    const closeBtn = document.querySelector('.close-attendance');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            const modal = document.getElementById('attendanceModal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    }

    // Close when clicking outside the modal
    const modal = document.getElementById('attendanceModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }

    // Attendance Table Functions
    function initializeAttendance() {
        updateDateTime();
        setInterval(updateDateTime, 1000);
        populateAttendanceTable();
    }

    function populateAttendanceTable() {
        const tableBody = document.getElementById('attendanceTableBody');
        const currentDate = new Date();
        const days = generateWeekSchedule(currentDate);
        
        tableBody.innerHTML = days.map((day, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${day.dayName}</td>
                <td>${day.scheduleIn}</td>
                <td>${day.scheduleOut}</td>
                <td>${day.break || '1:0'}</td>
                <td>${day.attendanceIn || ''}</td>
                <td>${day.attendanceOut || ''}</td>
                <td>${day.tardiness || ''}</td>
                <td>${day.undertime || ''}</td>
                <td>${day.break || ''}</td>
                <td>${day.workedHours || ''}</td>
                <td>${day.excessHours || ''}</td>
                <td class="action-cell">
                    <button class="action-btn" onclick="showActionMenu(${index})">
                        <i class="fas fa-cog"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    function showActionMenu(index) {
        // Implement action menu functionality
        console.log('Show action menu for row:', index);
    }

    // Delete Modal Functionality
    function showDeleteModal(taskId) {
        const modal = document.getElementById('deleteModal');
        if (modal) {
            modal.dataset.taskId = taskId;
            modal.classList.add('show');
        }
    }

    function hideDeleteModal() {
        const modal = document.getElementById('deleteModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    function confirmDelete() {
        const modal = document.getElementById('deleteModal');
        const taskId = modal.dataset.taskId;
        
        if (taskId) {
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            tasks = tasks.filter(task => task.id !== taskId);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            
            hideDeleteModal();
            loadMyTasks(); // Refresh the task list
        }
    }

    // Update Task Functionality
    function showUpdateModal(taskId) {
        const modal = document.getElementById('updateModal');
        const task = findTaskById(taskId);
        
        if (modal && task) {
            // Fill the form with task data
            document.getElementById('updateTitle').value = task.title;
            document.getElementById('updateDescription').value = task.description;
            document.getElementById('updateDueDate').value = task.dueDate;
            document.getElementById('updatePriority').value = task.priority;
            document.getElementById('updateStatus').value = task.status;
            
            modal.dataset.taskId = taskId;
            modal.classList.add('show');
        }
    }

    function hideUpdateModal() {
        const modal = document.getElementById('updateModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    function updateTask() {
        const modal = document.getElementById('updateModal');
        const taskId = modal.dataset.taskId;
        
        if (taskId) {
            const updatedTask = {
                id: taskId,
                title: document.getElementById('updateTitle').value,
                description: document.getElementById('updateDescription').value,
                dueDate: document.getElementById('updateDueDate').value,
                priority: document.getElementById('updatePriority').value,
                status: document.getElementById('updateStatus').value
            };
            
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            tasks = tasks.map(task => task.id === taskId ? updatedTask : task);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            
            hideUpdateModal();
            loadMyTasks(); // Refresh the task list
        }
    }

    function findTaskById(taskId) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        return tasks.find(task => task.id === taskId);
    }

    // Add event listeners when document loads
    document.addEventListener('DOMContentLoaded', function() {
        // Delete modal listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                showDeleteModal(taskId);
            });
        });
        
        // Update modal listeners
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                showUpdateModal(taskId);
            });
        });
    });
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

