document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById("task-input");
    const addTaskBtn = document.getElementById("add-task");
    const taskList = document.getElementById("task-list");
    const toggleThemeBtn = document.getElementById("toggle-theme");
    const filterButtons = document.querySelectorAll(".filter-section button");

    function loadTasks() {
        const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
        savedTasks.forEach(task => addTaskToDOM(task.text, task.completed));
        updateProgressBar(); // Ensure progress bar updates on reload
    }    

    function addTask() {
        const taskText = taskInput.value.trim();
        const dueDate = document.getElementById("task-date").value; // Get due date
        const priority = document.getElementById("task-priority").value; // Get priority
    
        if (taskText === "") return;
    
        addTaskToDOM(taskText, false, dueDate, priority);
        saveTask(taskText, false, dueDate, priority);
        taskInput.value = "";
        document.getElementById("task-date").value = ""; // Reset date input
    }
    

    function addTaskToDOM(text, completed, dueDate = "No due date", priority = "Normal") {
        const li = document.createElement("li");
        li.draggable = true;
        li.innerHTML = `
            <span class="task-text ${completed ? "completed" : ""}">${text}</span>
            <button class="complete-btn">✅</button>
            <button class="edit-btn">✏️</button>
            <button class="delete-btn">❎</button>
            <span class="status">${completed ? "✔ Completed" : "⏳ Pending"}</span>
            <br>
            <span class="due-date">📅 ${dueDate}</span>
            <span class="priority">🔥 ${priority}</span>
        `;

        // Mark as completed
        li.querySelector(".complete-btn").addEventListener("click", () => {
            const taskTextElement = li.querySelector(".task-text");
            const statusElement = li.querySelector(".status");
            taskTextElement.classList.toggle("completed");
            const isCompleted = taskTextElement.classList.contains("completed");
            statusElement.textContent = isCompleted ? "✔ Completed" : "⏳ Pending";
            updateTask(text, isCompleted);
            updateProgressBar(); // Update progress
        });        

        // Edit task
        li.querySelector(".edit-btn").addEventListener("click", () => {
            const newText = prompt("Edit your task:", text);
            if (newText) {
                const taskTextElement = li.querySelector(".task-text");
                taskTextElement.textContent = newText;
                updateTask(text, taskTextElement.classList.contains("completed"), newText);
            }
        });

        // Delete task
        li.querySelector(".delete-btn").addEventListener("click", () => {
            li.remove();
            removeTask(text);
            updateProgressBar(); // Update progress
        });    

        // Enable drag-and-drop
        li.addEventListener("dragstart", () => li.classList.add("dragging"));
        li.addEventListener("dragend", () => li.classList.remove("dragging"));

        taskList.appendChild(li);
    }

    function saveTask(text, completed) {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks.push({ text, completed });
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function updateTask(oldText, completed, newText = null) {
        let tasks = JSON.parse(localStorage.getItem("tasks"));
        tasks = tasks.map(task =>
            task.text === oldText ? { text: newText || oldText, completed } : task
        );
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function removeTask(text) {
        let tasks = JSON.parse(localStorage.getItem("tasks"));
        tasks = tasks.filter(task => task.text !== text);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        updateProgress(); // Update Progress Bar after deletion
    }

    function updateProgressBar() {
        const tasks = document.querySelectorAll("#task-list li");
        const completedTasks = document.querySelectorAll("#task-list .task-text.completed");
        
        let progress = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
        
        document.getElementById("task-progress").value = progress;
        document.getElementById("progress-text").textContent = `${Math.round(progress)}% Completed`;
    }      

    function toggleTheme() {
        document.body.classList.toggle("dark-mode");
        
        // Store the theme in localStorage
        const isDarkMode = document.body.classList.contains("dark-mode");
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    }
    
    // Apply the saved theme on page load
    function applySavedTheme() {
        if (localStorage.getItem("theme") === "dark") {
            document.body.classList.add("dark-mode");
        }
    }
    
    // Call the function on page load
    applySavedTheme();

    function filterTasks(filter) {
        const allTasks = document.querySelectorAll("#task-list li");
        allTasks.forEach(task => {
            const isCompleted = task.querySelector(".task-text").classList.contains("completed");
            task.style.display = (filter === "all" || (filter === "completed" && isCompleted) || (filter === "pending" && !isCompleted)) ? "flex" : "none";
        });
    }

    function enableDragDrop() {
        taskList.addEventListener("dragover", (e) => {
            e.preventDefault();
            const dragging = document.querySelector(".dragging");
            const afterElement = [...taskList.children].find(child => e.clientY < child.offsetTop + child.offsetHeight / 2);
            if (afterElement) {
                taskList.insertBefore(dragging, afterElement);
            } else {
                taskList.appendChild(dragging);
            }
        });
    }

    window.addEventListener("DOMContentLoaded", () => {
        loadTasks();
        enableDragDrop();
        applySavedTheme();
    });

    addTaskBtn.addEventListener("click", addTask);
    toggleThemeBtn.addEventListener("click", toggleTheme);
    filterButtons.forEach(btn => btn.addEventListener("click", () => filterTasks(btn.dataset.filter)));
    document.getElementById("toggle-theme").addEventListener("click", toggleTheme);


});
