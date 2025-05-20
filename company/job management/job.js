// ===== Utility Functions =====
function formatJobType(type) {
    const types = {
        'full-time': 'Full-time',
        'part-time': 'Part-time',
        'contract': 'Contract',
        'internship': 'Internship',
        'temporary': 'Temporary',
        'remote': 'Remote'
    };
    return types[type] || type;
}

function formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusClass(status) {
    return `status-${status}`;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function validateDeadline(deadline) {
    if (!deadline) return true; // Empty deadline is allowed
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    
    return deadlineDate >= today;
}

let toastIdCounter = 0;
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    const toastId = `toast-${toastIdCounter++}`;
    toast.id = toastId;
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    if (duration > 0) {
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    return toastId;
}

function dismissToast(id) {
    const toast = document.getElementById(id);
    if (toast) {
        toast.remove();
    }
}

function showConfirmation(title, message, callback) {
    document.getElementById('confirmationTitle').textContent = title;
    document.getElementById('confirmationMessage').textContent = message;
    
    const confirmBtn = document.getElementById('confirmAction');
    // Remove previous listeners to avoid duplicates
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    document.getElementById('confirmAction').onclick = function() {
        callback();
        document.getElementById('confirmationModal').classList.add('hidden');
    };
    
    document.getElementById('confirmationModal').classList.remove('hidden');
}

// ===== Job Management =====
let currentJobs = [];
let selectedJobs = [];
let currentStatus = 'draft';
let currentPage = 1;
const jobsPerPage = 10;

// Initialize Quill Editor
const quill = new Quill('#jobDescriptionEditor', {
    theme: 'snow',
    modules: {
        toolbar: {
            container: [
                ['bold', 'italic', 'underline'],
                [{ 'header': [1, 2, 3, false] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link'],
                ['clean']
            ]
        }
    },
    placeholder: 'Enter detailed job description...',
    formats: ['bold', 'italic', 'underline', 'header', 'list', 'link']
});

// LocalStorage functions
function getJobsFromStorage() {
    const jobs = localStorage.getItem('jobs');
    return jobs ? JSON.parse(jobs) : [];
}

function saveJobsToStorage(jobs) {
    localStorage.setItem('jobs', JSON.stringify(jobs));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function loadJobs(status, page = 1) {
    currentStatus = status;
    currentPage = page;
    const jobListings = document.getElementById('jobListings');
    jobListings.innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i> Loading jobs...</div>';
    
    try {
        const allJobs = getJobsFromStorage();
        currentJobs = allJobs.filter(job => job.status === status)
                           .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        if (currentJobs.length === 0) {
            jobListings.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-briefcase text-gray-400 text-4xl mb-3"></i>
                    <p class="text-gray-600">No ${status} jobs found</p>
                    ${status === 'draft' ? 
                        '<button id="createFirstJob" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">Create your first job</button>' : 
                        ''}
                </div>
            `;
            
            if (status === 'draft') {
                document.getElementById('createFirstJob').addEventListener('click', () => {
                    document.getElementById('newJobBtn').click();
                });
            }
            
            document.getElementById('paginationContainer').classList.add('hidden');
            document.getElementById('bulkActionsContainer').classList.add('hidden');
            return;
        }
        
        // Pagination
        const totalPages = Math.ceil(currentJobs.length / jobsPerPage);
        const paginatedJobs = currentJobs.slice(
            (page - 1) * jobsPerPage,
            page * jobsPerPage
        );
        
        renderJobListings(paginatedJobs);
        updatePaginationControls(totalPages);
        
        // Show bulk actions if there are jobs
        document.getElementById('bulkActionsContainer').classList.remove('hidden');
        
    } catch (error) {
        console.error("Error loading jobs:", error);
        jobListings.innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="fas fa-exclamation-circle mr-2"></i>
                Error loading jobs. Please try again.
            </div>
        `;
        document.getElementById('paginationContainer').classList.add('hidden');
        document.getElementById('bulkActionsContainer').classList.add('hidden');
    }
}

function renderJobListings(jobs) {
    const jobListings = document.getElementById('jobListings');
    jobListings.innerHTML = '';
    
    jobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = `job-card bg-white rounded-lg shadow p-6 ${job.promoted ? 'promoted-job' : ''}`;
        jobCard.innerHTML = `
            <div class="flex items-start justify-between">
                <div class="flex items-center">
                    <input type="checkbox" class="job-checkbox mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" data-job-id="${job.id}" ${selectedJobs.includes(job.id) ? 'checked' : ''}>
                    <div>
                        <div class="flex items-center">
                            <h3 class="text-lg font-medium text-gray-900">${job.title}</h3>
                            ${job.promoted ? '<span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Promoted</span>' : ''}
                        </div>
                        <div class="job-details mt-2 text-sm text-gray-600">
                            <span class="mr-3"><i class="fas fa-map-marker-alt mr-1"></i> ${job.location}</span>
                            <span class="mr-3"><i class="fas fa-dollar-sign mr-1"></i> ${job.salary || 'Salary not specified'}</span>
                            <span class="mr-3"><i class="fas fa-briefcase mr-1"></i> ${formatJobType(job.type)}</span>
                        </div>
                        <div class="mt-2 flex flex-wrap gap-2">
                            <span class="status-badge ${getStatusClass(job.status)}">${formatStatus(job.status)}</span>
                            <span class="text-xs text-gray-500">
                                <i class="far fa-clock mr-1"></i> ${formatDate(job.updatedAt)}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button class="edit-job text-blue-600 hover:text-blue-800 text-sm font-medium" data-job-id="${job.id}">
                        <i class="fas fa-edit mr-1"></i> Edit
                    </button>
                    ${job.status === 'active' ? 
                        `<button class="archive-job text-gray-600 hover:text-gray-800 text-sm font-medium" data-job-id="${job.id}">
                            <i class="fas fa-archive mr-1"></i> Archive
                        </button>` : ''}
                    ${job.status === 'archived' ? 
                        `<button class="publish-job text-green-600 hover:text-green-800 text-sm font-medium" data-job-id="${job.id}">
                            <i class="fas fa-upload mr-1"></i> Publish
                        </button>` : ''}
                    <button class="delete-job text-red-600 hover:text-red-800 text-sm font-medium" data-job-id="${job.id}">
                        <i class="fas fa-trash-alt mr-1"></i> Delete
                    </button>
                </div>
            </div>
        `;
        jobListings.appendChild(jobCard);
    });
    
    // Add event listeners to the newly created elements
    setupJobCardEventListeners();
}

function setupJobCardEventListeners() {
    // Checkbox selection
    document.querySelectorAll('.job-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const jobId = this.dataset.jobId;
            if (this.checked) {
                if (!selectedJobs.includes(jobId)) {
                    selectedJobs.push(jobId);
                }
            } else {
                selectedJobs = selectedJobs.filter(id => id !== jobId);
            }
            updateSelectedCount();
        });
    });
    
    // Edit job
    document.querySelectorAll('.edit-job').forEach(btn => {
        btn.addEventListener('click', async function() {
            const jobId = this.dataset.jobId;
            await loadJobForEditing(jobId);
        });
    });
    
    // Archive job
    document.querySelectorAll('.archive-job').forEach(btn => {
        btn.addEventListener('click', function() {
            const jobId = this.dataset.jobId;
            showConfirmation(
                'Archive Job',
                'Are you sure you want to archive this job? It will no longer be visible to applicants.',
                () => updateJobStatus(jobId, 'archived')
            );
        });
    });
    
    // Publish job
    document.querySelectorAll('.publish-job').forEach(btn => {
        btn.addEventListener('click', function() {
            const jobId = this.dataset.jobId;
            showConfirmation(
                'Publish Job',
                'Are you sure you want to publish this job? It will be visible to applicants.',
                () => updateJobStatus(jobId, 'active')
            );
        });
    });
    
    // Delete job
    document.querySelectorAll('.delete-job').forEach(btn => {
        btn.addEventListener('click', function() {
            const jobId = this.dataset.jobId;
            showConfirmation(
                'Delete Job',
                'Are you sure you want to delete this job? This action cannot be undone.',
                () => deleteJob(jobId)
            );
        });
    });
}

function updatePaginationControls(totalPages) {
    const paginationContainer = document.getElementById('paginationContainer');
    const pageInfo = document.getElementById('pageInfo');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    
    if (totalPages > 1) {
        paginationContainer.classList.remove('hidden');
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    } else {
        paginationContainer.classList.add('hidden');
    }
}

function updateSelectedCount() {
    const selectedCount = document.getElementById('selectedCount');
    selectedCount.textContent = `${selectedJobs.length} selected`;
    
    // Enable/disable bulk action button
    document.getElementById('applyBulkAction').disabled = selectedJobs.length === 0;
}

async function loadJobForEditing(jobId) {
    try {
        const allJobs = getJobsFromStorage();
        const job = allJobs.find(j => j.id === jobId);
        
        if (job) {
            document.getElementById('editorTitle').textContent = 'Edit Job Post';
            document.getElementById('jobId').value = jobId;
            document.getElementById('jobTitle').value = job.title || '';
            document.getElementById('jobLocation').value = job.location || '';
            document.getElementById('jobSalary').value = job.salary || '';
            document.getElementById('jobType').value = job.type || '';
            document.getElementById('jobCategory').value = job.category || '';
            
            // Set deadline with validation
            const deadlineInput = document.getElementById('jobDeadline');
            if (job.deadline) {
                const deadlineDate = new Date(job.deadline);
                if (deadlineDate >= new Date()) {
                    deadlineInput.value = job.deadline.split('T')[0];
                } else {
                    deadlineInput.value = '';
                }
            } else {
                deadlineInput.value = '';
            }
            
            document.getElementById('jobVacancies').value = job.vacancies || '';
            document.getElementById('promoteJob').checked = job.promoted || false;
            
            // Set required documents checkboxes
            if (job.requiredDocuments) {
                document.getElementById('reqResume').checked = job.requiredDocuments.includes('resume');
                document.getElementById('reqCoverLetter').checked = job.requiredDocuments.includes('coverLetter');
                document.getElementById('reqPortfolio').checked = job.requiredDocuments.includes('portfolio');
            } else {
                document.getElementById('reqResume').checked = false;
                document.getElementById('reqCoverLetter').checked = false;
                document.getElementById('reqPortfolio').checked = false;
            }
            
            // Load description into Quill
            quill.root.innerHTML = job.description || '';
            
            // Show the editor
            document.getElementById('jobEditorModal').classList.remove('hidden');
        } else {
            showToast('Job not found', 'error');
        }
    } catch (error) {
        console.error("Error loading job:", error);
        showToast('Error loading job details', 'error');
    }
}

async function saveJob(jobData, status = 'draft') {
    try {
        // Validate deadline
        if (jobData.deadline && !validateDeadline(jobData.deadline)) {
            showToast('Deadline cannot be in the past', 'error');
            return false;
        }
        
        jobData.updatedAt = new Date().toISOString();
        jobData.status = status;
        
        // Get required documents
        const requiredDocuments = [];
        if (document.getElementById('reqResume').checked) requiredDocuments.push('resume');
        if (document.getElementById('reqCoverLetter').checked) requiredDocuments.push('coverLetter');
        if (document.getElementById('reqPortfolio').checked) requiredDocuments.push('portfolio');
        jobData.requiredDocuments = requiredDocuments;
        
        // Process description
        jobData.description = quill.root.innerHTML;
        
        // Process vacancies
        if (jobData.vacancies) {
            jobData.vacancies = parseInt(jobData.vacancies);
        }
        
        // Process promoted status
        jobData.promoted = document.getElementById('promoteJob').checked;

        const allJobs = getJobsFromStorage();
        
        if (jobData.id) {
            // Update existing job
            const index = allJobs.findIndex(j => j.id === jobData.id);
            if (index !== -1) {
                allJobs[index] = {...allJobs[index], ...jobData};
                saveJobsToStorage(allJobs);
                showToast('Job updated successfully!', 'success');
            }
        } else {
            // Create new job
            jobData.id = generateId();
            jobData.postedAt = new Date().toISOString();
            jobData.applications = [];
            allJobs.push(jobData);
            saveJobsToStorage(allJobs);
            showToast('Job created successfully!', 'success');
        }
        
        return true;
    } catch (error) {
        console.error("Error saving job:", error);
        showToast('Error saving job: ' + error.message, 'error');
        return false;
    }
}

async function updateJobStatus(jobId, status) {
    try {
        const allJobs = getJobsFromStorage();
        const index = allJobs.findIndex(j => j.id === jobId);
        if (index !== -1) {
            allJobs[index].status = status;
            allJobs[index].updatedAt = new Date().toISOString();
            saveJobsToStorage(allJobs);
            showToast(`Job ${status} successfully`, 'success');
            loadJobs(currentStatus, currentPage);
        }
    } catch (error) {
        console.error("Error updating job status:", error);
        showToast('Error updating job status', 'error');
    }
}

async function deleteJob(jobId) {
    try {
        const allJobs = getJobsFromStorage();
        const updatedJobs = allJobs.filter(j => j.id !== jobId);
        saveJobsToStorage(updatedJobs);
        showToast('Job deleted successfully', 'success');
        loadJobs(currentStatus, currentPage);
    } catch (error) {
        console.error("Error deleting job:", error);
        showToast('Error deleting job', 'error');
    }
}

async function performBulkAction(action) {
    if (selectedJobs.length === 0) {
        showToast('No jobs selected', 'error');
        return;
    }
    
    const loadingId = showToast(`Processing ${selectedJobs.length} jobs...`, 'info', 0);
    
    try {
        const allJobs = getJobsFromStorage();
        const now = new Date().toISOString();
        
        for (let i = 0; i < allJobs.length; i++) {
            if (selectedJobs.includes(allJobs[i].id)) {
                switch(action) {
                    case 'publish':
                        allJobs[i].status = 'active';
                        allJobs[i].updatedAt = now;
                        break;
                    case 'archive':
                        allJobs[i].status = 'archived';
                        allJobs[i].updatedAt = now;
                        break;
                    case 'delete':
                        // We'll handle deletion separately
                        break;
                    case 'promote':
                        allJobs[i].promoted = true;
                        allJobs[i].updatedAt = now;
                        break;
                    default:
                        break;
                }
            }
        }
        
        if (action === 'delete') {
            const updatedJobs = allJobs.filter(job => !selectedJobs.includes(job.id));
            saveJobsToStorage(updatedJobs);
        } else {
            saveJobsToStorage(allJobs);
        }
        
        dismissToast(loadingId);
        showToast(`Bulk action completed for ${selectedJobs.length} jobs`, 'success');
        
        // Clear selection and reload
        selectedJobs = [];
        updateSelectedCount();
        loadJobs(currentStatus, currentPage);
        
    } catch (error) {
        dismissToast(loadingId);
        console.error("Bulk action failed:", error);
        showToast('Bulk action failed: ' + error.message, 'error');
    }
}

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', () => {
    // Set minimum date for deadline input
    const deadlineInput = document.getElementById('jobDeadline');
    deadlineInput.min = getTodayDate();
    
    // Initialize mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileSidebar = document.querySelector('.mobile-sidebar');
    const closeSidebar = document.querySelector('.close-sidebar');
    const overlay = document.querySelector('.overlay');

    mobileMenuBtn.addEventListener('click', () => {
        mobileSidebar.classList.add('active');
        overlay.classList.add('active');
    });

    closeSidebar.addEventListener('click', () => {
        mobileSidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    overlay.addEventListener('click', () => {
        mobileSidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Initialize the app
    initializeAppComponents();
    // Load initial jobs
    loadJobs(currentStatus);
});

function initializeAppComponents() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.tab-btn').forEach(t => {
                t.classList.remove('active', 'bg-blue-100', 'text-blue-700');
            });
            
            // Add active class to clicked tab
            this.classList.add('active', 'bg-blue-100', 'text-blue-700');
            
            // Load jobs for this status
            loadJobs(this.dataset.status);
        });
    });

    // New Job Button
    document.getElementById('newJobBtn').addEventListener('click', () => {
        // Reset form
        document.getElementById('jobForm').reset();
        document.getElementById('editorTitle').textContent = 'New Job Post';
        document.getElementById('jobId').value = '';
        quill.root.innerHTML = '';
        
        // Set today's date as minimum for deadline
        document.getElementById('jobDeadline').min = getTodayDate();
        
        // Show modal
        document.getElementById('jobEditorModal').classList.remove('hidden');
    });

    // Form Submission
    document.getElementById('jobForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            id: document.getElementById('jobId').value,
            title: document.getElementById('jobTitle').value,
            location: document.getElementById('jobLocation').value,
            salary: document.getElementById('jobSalary').value,
            type: document.getElementById('jobType').value,
            category: document.getElementById('jobCategory').value,
            deadline: document.getElementById('jobDeadline').value,
            vacancies: document.getElementById('jobVacancies').value
        };

        const success = await saveJob(formData, 'active');
        if (success) {
            document.getElementById('jobEditorModal').classList.add('hidden');
            loadJobs(currentStatus);
        }
    });

    // Save Draft Button
    document.getElementById('saveDraft').addEventListener('click', async (e) => {
        e.preventDefault();
        
        const formData = {
            id: document.getElementById('jobId').value,
            title: document.getElementById('jobTitle').value,
            location: document.getElementById('jobLocation').value,
            salary: document.getElementById('jobSalary').value,
            type: document.getElementById('jobType').value,
            category: document.getElementById('jobCategory').value,
            deadline: document.getElementById('jobDeadline').value,
            vacancies: document.getElementById('jobVacancies').value
        };

        const success = await saveJob(formData, 'draft');
        if (success) {
            document.getElementById('jobEditorModal').classList.add('hidden');
            loadJobs(currentStatus);
        }
    });

    // Publish Job Button
    document.getElementById('publishJob').addEventListener('click', async (e) => {
        e.preventDefault();
        
        const formData = {
            id: document.getElementById('jobId').value,
            title: document.getElementById('jobTitle').value,
            location: document.getElementById('jobLocation').value,
            salary: document.getElementById('jobSalary').value,
            type: document.getElementById('jobType').value,
            category: document.getElementById('jobCategory').value,
            deadline: document.getElementById('jobDeadline').value,
            vacancies: document.getElementById('jobVacancies').value
        };

        const success = await saveJob(formData, 'active');
        if (success) {
            document.getElementById('jobEditorModal').classList.add('hidden');
            loadJobs(currentStatus);
        }
    });

    // Modal Close Buttons
    document.getElementById('closeEditor').addEventListener('click', () => {
        document.getElementById('jobEditorModal').classList.add('hidden');
    });

    document.getElementById('closeConfirmation').addEventListener('click', () => {
        document.getElementById('confirmationModal').classList.add('hidden');
    });

    document.getElementById('cancelAction').addEventListener('click', () => {
        document.getElementById('confirmationModal').classList.add('hidden');
    });

    // Pagination Controls
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            loadJobs(currentStatus, currentPage - 1);
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(currentJobs.length / jobsPerPage);
        if (currentPage < totalPages) {
            loadJobs(currentStatus, currentPage + 1);
        }
    });

    // Bulk Actions
    document.getElementById('applyBulkAction').addEventListener('click', () => {
        const action = document.getElementById('bulkActionSelect').value;
        if (action && selectedJobs.length > 0) {
            performBulkAction(action);
        }
    });

    // Clear Selection
    document.getElementById('clearSelection').addEventListener('click', () => {
        selectedJobs = [];
        document.querySelectorAll('.job-checkbox').forEach(cb => cb.checked = false);
        updateSelectedCount();
    });

    // Set initial active tab
    document.querySelector('.tab-btn[data-status="draft"]').classList.add('active', 'bg-blue-100', 'text-blue-700');
}