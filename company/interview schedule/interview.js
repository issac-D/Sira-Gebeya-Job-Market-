document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthEl = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const timeSlots = document.getElementById('timeSlots');
    const eventModal = document.getElementById('eventModal');
    const eventDetailModal = document.getElementById('eventDetailModal');
    const saveEventBtn = document.getElementById('saveEvent');
    const updateEventBtn = document.getElementById('updateEvent');
    const cancelEventBtn = document.getElementById('cancelEvent');
    const closeDetailBtn = document.getElementById('closeDetail');
    const deleteEventBtn = document.getElementById('deleteEvent');
    const editEventBtn = document.getElementById('editEvent');
    const startMeetingBtn = document.getElementById('startMeeting');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileSidebar = document.querySelector('.mobile-sidebar');
    const closeSidebar = document.querySelector('.close-sidebar');
    const overlay = document.querySelector('.overlay');
    const modalTitle = document.getElementById('modalTitle');
    const eventTitleInput = document.getElementById('eventTitle');
    const eventDateInput = document.getElementById('eventDate');
    const eventTimeSelect = document.getElementById('eventTime');
    const eventDurationSelect = document.getElementById('eventDuration');
    const detailTitleEl = document.getElementById('detailTitle');
    const detailCandidateEl = document.getElementById('detailCandidate');
    const detailDateEl = document.getElementById('detailDate');
    const detailTimeEl = document.getElementById('detailTime');
    const detailDurationEl = document.getElementById('detailDuration');

    // State
    let currentDate = new Date();
    let selectedDate = null;
    let selectedEvent = null;
    let db = null;
    let isEditing = false;

    // Initialize the scheduler
    initScheduler();

    function initScheduler() {
        // Initialize IndexedDB
        initDB();

        // Set up event listeners
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        saveEventBtn.addEventListener('click', saveEvent);
        updateEventBtn.addEventListener('click', updateEvent);
        cancelEventBtn.addEventListener('click', closeEventModal);
        closeDetailBtn.addEventListener('click', closeEventDetailModal);
        deleteEventBtn.addEventListener('click', deleteEvent);
        editEventBtn.addEventListener('click', editEvent);
        startMeetingBtn.addEventListener('click', startMeeting);

        // Mobile menu toggle
        mobileMenuBtn.addEventListener('click', openMobileSidebar);
        closeSidebar.addEventListener('click', closeMobileSidebar);
        overlay.addEventListener('click', closeMobileSidebar);

        // Close sidebar when clicking a link
        const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', closeMobileSidebar);
        });

        // Request notification permission
        if ('Notification' in window) {
            Notification.requestPermission();
        }

        // Render initial calendar
        renderCalendar();
    }

    function openMobileSidebar() {
        mobileSidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileSidebar() {
        mobileSidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function initDB() {
        const request = indexedDB.open('InterviewSchedulerDB', 1);

        request.onupgradeneeded = function(event) {
            db = event.target.result;
            if (!db.objectStoreNames.contains('events')) {
                const store = db.createObjectStore('events', { keyPath: 'id' });
                store.createIndex('date', 'date', { unique: false });
            }
        };

        request.onsuccess = function(event) {
            db = event.target.result;
            renderCalendar();
        };

        request.onerror = function(event) {
            console.error('IndexedDB error:', event.target.error);
        };
    }

    function renderCalendar() {
        // Update month header
        currentMonthEl.textContent = new Intl.DateTimeFormat('en-US', { 
            month: 'long', 
            year: 'numeric' 
        }).format(currentDate);

        // Clear previous calendar
        calendarGrid.innerHTML = '';

        // Get first day of month and total days
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        // Create empty cells for days before the first day
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }

        // Create cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const today = new Date();
            if (
                date.getDate() === today.getDate() && 
                date.getMonth() === today.getMonth() && 
                date.getFullYear() === today.getFullYear()
            ) {
                dayElement.classList.add('today');
            }

            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayElement.appendChild(dayNumber);

            dayElement.addEventListener('click', () => showTimeSlots(date));
            calendarGrid.appendChild(dayElement);
        }

        // Load events for the current month
        loadEvents();
    }

    function loadEvents() {
        if (!db) return;

        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const transaction = db.transaction(['events'], 'readonly');
        const store = transaction.objectStore('events');
        const index = store.index('date');
        const range = IDBKeyRange.bound(
            firstDay.toISOString(),
            lastDay.toISOString()
        );

        const request = index.getAll(range);

        request.onsuccess = function() {
            const events = request.result;
            renderEvents(events);
            checkConflicts(events);
        };
    }

    function renderEvents(events) {
        const dayElements = document.querySelectorAll('.calendar-day:not(.empty)');
        
        dayElements.forEach(dayElement => {
            // Clear existing events
            const existingEvents = dayElement.querySelectorAll('.calendar-event');
            existingEvents.forEach(event => event.remove());

            const day = parseInt(dayElement.querySelector('.day-number').textContent);
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateStr = date.toISOString().split('T')[0];

            // Filter events for this day
            const dayEvents = events.filter(event => {
                const eventDate = new Date(event.date).toISOString().split('T')[0];
                return eventDate === dateStr;
            });

            // Add events to the day
            dayEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = `calendar-event ${event.conflict ? 'conflict' : ''}`;
                eventElement.textContent = `${event.time} - ${event.title}`;
                eventElement.dataset.id = event.id;
                
                eventElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEventDetails(event);
                });

                dayElement.appendChild(eventElement);
            });
        });
    }

    function checkConflicts(events) {
        // Group events by date and check for overlapping times
        const eventsByDate = {};
        
        events.forEach(event => {
            const dateStr = new Date(event.date).toISOString().split('T')[0];
            if (!eventsByDate[dateStr]) {
                eventsByDate[dateStr] = [];
            }
            eventsByDate[dateStr].push(event);
        });

        // Check for conflicts
        Object.values(eventsByDate).forEach(dayEvents => {
            // Sort events by time
            dayEvents.sort((a, b) => a.time.localeCompare(b.time));

            // Check for overlaps
            for (let i = 1; i < dayEvents.length; i++) {
                const prevEvent = dayEvents[i - 1];
                const currentEvent = dayEvents[i];
                
                const prevEnd = addMinutes(prevEvent.time, parseInt(prevEvent.duration));
                if (currentEvent.time < prevEnd) {
                    // Conflict found
                    prevEvent.conflict = true;
                    currentEvent.conflict = true;
                    
                    // Update in IndexedDB
                    markConflictInDB(prevEvent.id);
                    markConflictInDB(currentEvent.id);
                }
            }
        });
    }

    function markConflictInDB(eventId) {
        const transaction = db.transaction(['events'], 'readwrite');
        const store = transaction.objectStore('events');
        
        const getRequest = store.get(eventId);
        
        getRequest.onsuccess = function() {
            const event = getRequest.result;
            if (event && !event.conflict) {
                event.conflict = true;
                store.put(event);
            }
        };
    }

    function addMinutes(time, minutes) {
        const [hours, mins] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, mins + minutes, 0, 0);
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }

    function showTimeSlots(date) {
        selectedDate = date;
        
        // Format date for display
        const dateStr = new Intl.DateTimeFormat('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
        }).format(date);
        
        eventDateInput.value = dateStr;
        
        // Generate time slots (9AM-5PM in 30 minute increments)
        timeSlots.innerHTML = '';
        
        for (let hour = 9; hour <= 16; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot';
                timeSlot.textContent = time;
                timeSlot.dataset.time = time;
                
                // Check if slot is already booked
                if (db) {
                    const transaction = db.transaction(['events'], 'readonly');
                    const store = transaction.objectStore('events');
                    const index = store.index('date');
                    const dateStr = date.toISOString();
                    
                    const request = index.getAll(IDBKeyRange.only(dateStr));
                    
                    request.onsuccess = function() {
                        const events = request.result;
                        const isBooked = events.some(event => {
                            const eventTime = event.time;
                            const eventEnd = addMinutes(eventTime, parseInt(event.duration));
                            return time >= eventTime && time < eventEnd;
                        });
                        
                        if (isBooked) {
                            timeSlot.classList.add('booked');
                            timeSlot.title = 'This slot is already booked';
                        } else {
                            timeSlot.addEventListener('click', () => openEventModal(time));
                        }
                    };
                }
                
                timeSlots.appendChild(timeSlot);
            }
        }
        
        // Show time slots container
        document.getElementById('timeSlotsContainer').style.display = 'block';
    }

    function openEventModal(time = null) {
        isEditing = false;
        modalTitle.textContent = 'Schedule Interview';
        saveEventBtn.style.display = 'block';
        updateEventBtn.style.display = 'none';
        
        eventTitleInput.value = '';
        eventDurationSelect.value = '60';
        eventTimeSelect.innerHTML = '';
        
        if (time) {
            // Add the selected time as the first option
            const selectedOption = document.createElement('option');
            selectedOption.value = time;
            selectedOption.textContent = time;
            selectedOption.selected = true;
            eventTimeSelect.appendChild(selectedOption);
            
            // Add other time options around the selected time
            for (let i = 1; i <= 2; i++) {
                const earlierTime = subtractMinutes(time, i * 30);
                if (earlierTime >= '09:00') {
                    const option = document.createElement('option');
                    option.value = earlierTime;
                    option.textContent = earlierTime;
                    eventTimeSelect.appendChild(option);
                }
                
                const laterTime = addMinutes(time, i * 30);
                if (laterTime <= '17:00') {
                    const option = document.createElement('option');
                    option.value = laterTime;
                    option.textContent = laterTime;
                    eventTimeSelect.appendChild(option);
                }
            }
        } else {
            // Add default time options if no specific time is selected
            for (let hour = 9; hour <= 16; hour++) {
                const time = `${String(hour).padStart(2, '0')}:00`;
                const option = document.createElement('option');
                option.value = time;
                option.textContent = time;
                eventTimeSelect.appendChild(option);
            }
        }
        
        eventModal.classList.add('active');
    }

    function closeEventModal() {
        eventModal.classList.remove('active');
    }

    function subtractMinutes(time, minutes) {
        const [hours, mins] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, mins - minutes, 0, 0);
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }

    function saveEvent() {
        const title = eventTitleInput.value.trim();
        const time = eventTimeSelect.value;
        const duration = eventDurationSelect.value;
        
        if (!title) {
            alert('Please enter a candidate name');
            return;
        }
        
        const event = {
            id: Date.now().toString(),
            title: title,
            date: selectedDate.toISOString(),
            time: time,
            duration: duration,
            conflict: false,
            createdAt: new Date().toISOString()
        };
        
        // Save to IndexedDB
        const transaction = db.transaction(['events'], 'readwrite');
        const store = transaction.objectStore('events');
        
        store.add(event);
        
        transaction.oncomplete = function() {
            closeEventModal();
            renderCalendar();
            
            // Show notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Interview Scheduled', {
                    body: `Interview with ${title} scheduled for ${new Date(event.date).toLocaleDateString()} at ${event.time}`
                });
            }
        };
    }

    function showEventDetails(event) {
        selectedEvent = event;
        
        detailTitleEl.textContent = 'Interview Details';
        detailCandidateEl.textContent = event.title;
        detailDateEl.textContent = new Date(event.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        detailTimeEl.textContent = event.time;
        detailDurationEl.textContent = event.duration;
        
        eventDetailModal.classList.add('active');
    }

    function closeEventDetailModal() {
        eventDetailModal.classList.remove('active');
    }

    function editEvent() {
        isEditing = true;
        modalTitle.textContent = 'Edit Interview';
        saveEventBtn.style.display = 'none';
        updateEventBtn.style.display = 'block';
        
        eventTitleInput.value = selectedEvent.title;
        eventDateInput.value = new Date(selectedEvent.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Set up time options
        eventTimeSelect.innerHTML = '';
        const currentTime = selectedEvent.time;
        const selectedOption = document.createElement('option');
        selectedOption.value = currentTime;
        selectedOption.textContent = currentTime;
        selectedOption.selected = true;
        eventTimeSelect.appendChild(selectedOption);
        
        // Add surrounding time options
        for (let i = 1; i <= 2; i++) {
            const earlierTime = subtractMinutes(currentTime, i * 30);
            if (earlierTime >= '09:00') {
                const option = document.createElement('option');
                option.value = earlierTime;
                option.textContent = earlierTime;
                eventTimeSelect.appendChild(option);
            }
            
            const laterTime = addMinutes(currentTime, i * 30);
            if (laterTime <= '17:00') {
                const option = document.createElement('option');
                option.value = laterTime;
                option.textContent = laterTime;
                eventTimeSelect.appendChild(option);
            }
        }
        
        eventDurationSelect.value = selectedEvent.duration;
        
        closeEventDetailModal();
        eventModal.classList.add('active');
    }

    function updateEvent() {
        const title = eventTitleInput.value.trim();
        const time = eventTimeSelect.value;
        const duration = eventDurationSelect.value;
        
        if (!title) {
            alert('Please enter a candidate name');
            return;
        }
        
        // Get the latest version of the event from the database
        const transaction = db.transaction(['events'], 'readwrite');
        const store = transaction.objectStore('events');
        
        const getRequest = store.get(selectedEvent.id);
        
        getRequest.onsuccess = function() {
            const event = getRequest.result;
            if (event) {
                // Update the event properties
                event.title = title;
                event.time = time;
                event.duration = duration;
                event.conflict = false; // Reset conflict flag
                
                // Put the updated event back in the database
                const putRequest = store.put(event);
                
                putRequest.onsuccess = function() {
                    closeEventModal();
                    renderCalendar();
                    
                    // Show notification
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('Interview Updated', {
                            body: `Interview with ${title} has been updated`
                        });
                    }
                };
            }
        };
    }

    function deleteEvent() {
        if (!selectedEvent) return;
        
        if (!confirm('Are you sure you want to cancel this interview?')) {
            return;
        }
        
        const transaction = db.transaction(['events'], 'readwrite');
        const store = transaction.objectStore('events');
        
        store.delete(selectedEvent.id);
        
        transaction.oncomplete = function() {
            closeEventDetailModal();
            renderCalendar();
            
            // Show notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Interview Cancelled', {
                    body: `Interview with ${selectedEvent.title} has been cancelled`
                });
            }
        };
    }

    function startMeeting() {
        if (!selectedEvent) return;
        
        const zoomLink = generateZoomLink();
        
        // In a real app, you would save this link to the event
        console.log(`Generated Zoom link for ${selectedEvent.title}: ${zoomLink}`);
        
        // Open the Zoom link in a new tab
        window.open(zoomLink, '_blank');
    }

    function generateZoomLink() {
        return `https://zoom.us/j/${Math.random().toString(36).slice(2,11)}`;
    }
});