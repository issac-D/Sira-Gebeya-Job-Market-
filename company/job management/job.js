// Job Management System with File Uploads
document.addEventListener('DOMContentLoaded', function() {
    // ===== File Upload Handler =====
    const fileHandler = {
        allowedTypes: [
            'image/jpeg', 'image/png', 'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        maxSize: 5 * 1024 * 1024, // 5MB
        
        upload: function(file) {
            return new Promise((resolve, reject) => {
                // Simulate upload (replace with actual API call)
                setTimeout(() => {
                    const fileId = 'file-' + Date.now();
                    const fileData = {
                        id: fileId,
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        url: URL.createObjectURL(file) // In production, use server URL
                    };
                    localStorage.setItem(fileId, JSON.stringify(fileData));
                    resolve(fileData);
                }, 500);
            });
        },
        
        remove: function(fileId) {
            return new Promise((resolve) => {
                localStorage.removeItem(fileId);
                resolve();
            });
        }
    };

    // ===== Initialize Quill Editor =====
    const quill = new Quill('#jobDescriptionEditor', {
        theme: 'snow',
        modules: {
            toolbar: {
                container: [
                    ['bold', 'italic'],
                    [{ 'list': 'bullet' }],
                    ['link', 'image', 'file']
                ],
                handlers: {
                    image: function() {
                        selectAndUploadFile('image/*');
                    },
                    file: function() {
                        selectAndUploadFile('.pdf,.doc,.docx');
                    }
                }
            }
        },
        formats: ['bold', 'italic', 'list', 'link', 'image', 'file']
    });

    // ===== File Selection & Upload =====
    function selectAndUploadFile(accept) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.click();
        
        input.onchange = async function() {
            const file = input.files[0];
            if (!file) return;
            
            // Validate file
            if (!fileHandler.allowedTypes.includes(file.type)) {
                showToast('File type not allowed', 'error');
                return;
            }
            
            if (file.size > fileHandler.maxSize) {
                showToast('File must be smaller than 5MB', 'error');
                return;
            }
            
            const loadingId = showToast('Uploading file...', 'info', 0);
            
            try {
                const fileData = await fileHandler.upload(file);
                
                // Insert into editor
                const range = quill.getSelection();
                if (fileData.type.startsWith('image/')) {
                    quill.insertEmbed(range.index, 'image', fileData.url);
                } else {
                    quill.insertText(range.index, `[File: ${fileData.name}]`, {
                        link: fileData.url,
                        fileId: fileData.id
                    });
                }
                
                dismissToast(loadingId);
                showToast('File uploaded', 'success');
            } catch (error) {
                dismissToast(loadingId);
                showToast('Upload failed', 'error');
            }
        };
    }

    // ===== Render File Previews =====
    quill.on('text-change', function() {
        document.querySelectorAll('.ql-editor a[fileid]').forEach(link => {
            const fileId = link.getAttribute('fileid');
            const fileData = JSON.parse(localStorage.getItem(fileId));
            
            if (fileData && !link.nextElementSibling?.classList?.contains('file-preview-container')) {
                const preview = document.createElement('div');
                preview.className = 'file-preview-container';
                
                if (fileData.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = fileData.url;
                    img.className = 'file-preview';
                    preview.appendChild(img);
                } else {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'file-item';
                    fileItem.innerHTML = `
                        <span class="file-icon">📄</span>
                        <span>${fileData.name}</span>
                        <span class="remove-file" data-fileid="${fileData.id}">×</span>
                    `;
                    preview.appendChild(fileItem);
                }
                
                link.parentNode.insertBefore(preview, link.nextSibling);
            }
        });
    });

    // ===== Handle File Deletion =====
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-file')) {
            const fileId = e.target.getAttribute('data-fileid');
            const loadingId = showToast('Deleting file...', 'info', 0);
            
            fileHandler.remove(fileId)
                .then(() => {
                    const link = document.querySelector(`.ql-editor a[fileid="${fileId}"]`);
                    if (link) {
                        const range = quill.getSelection();
                        const index = quill.getIndex(quill.scroll, link);
                        const length = link.textContent.length + 2; // +2 for brackets
                        
                        quill.deleteText(index - 1, length);
                        quill.setSelection(range.index, range.length);
                    }
                    
                    dismissToast(loadingId);
                    showToast('File removed', 'success');
                })
                .catch(() => {
                    dismissToast(loadingId);
                    showToast('Failed to delete file', 'error');
                });
        }
    });

    // ===== Job Management =====
    let jobs = [
        { id: 1, title: 'Frontend Developer', status: 'draft', promoted: false },
        { id: 2, title: 'Backend Engineer', status: 'active', promoted: true },
        { id: 3, title: 'UX Designer', status: 'archived', promoted: false }
    ];

    // Load jobs based on status
    function loadJobs(status) {
        const jobListings = document.getElementById('jobListings');
        jobListings.innerHTML = '';
        
        jobs.filter(job => job.status === status).forEach(job => {
            const jobCard = document.createElement('div');
            jobCard.className = `job-card bg-white rounded-lg shadow p-6 ${job.promoted ? 'promoted-job' : ''}`;
            jobCard.innerHTML = `
                <div class="flex items-start justify-between">
                    <div class="flex items-center">
                        <input type="checkbox" class="job-checkbox mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" data-job-id="${job.id}">
                        <div>
                            <h3 class="text-lg font-medium text-gray-900">${job.title}</h3>
                            <div class="job-details mt-2 text-sm text-gray-600">
                                <span>Status: ${job.status}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button class="edit-job text-blue-600 hover:text-blue-800 text-sm font-medium" data-job-id="${job.id}">
                            Edit
                        </button>
                    </div>
                </div>
            `;
            jobListings.appendChild(jobCard);
        });
    }

    // Initialize with draft jobs
    loadJobs('draft');

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active', 'bg-blue-100', 'text-blue-700'));
            this.classList.add('active', 'bg-blue-100', 'text-blue-700');
            loadJobs(this.dataset.status);
        });
    });

    // New job button
    document.getElementById('newJobBtn').addEventListener('click', function() {
        document.getElementById('editorTitle').textContent = 'New Job Post';
        document.getElementById('jobId').value = '';
        document.getElementById('jobForm').reset();
        quill.root.innerHTML = '';
        document.getElementById('jobEditorModal').classList.remove('hidden');
    });

    // Close editor
    document.getElementById('closeEditor').addEventListener('click', function() {
        document.getElementById('jobEditorModal').classList.add('hidden');
    });

    // Form submission
    document.getElementById('jobForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect files
        const files = [];
        document.querySelectorAll('.ql-editor a[fileid]').forEach(link => {
            const fileId = link.getAttribute('fileid');
            const fileData = JSON.parse(localStorage.getItem(fileId));
            if (fileData) files.push(fileData);
        });
        
        // Prepare job data
        const jobData = {
            id: document.getElementById('jobId').value || Date.now(),
            title: document.getElementById('jobTitle').value,
            description: quill.root.innerHTML,
            location: document.getElementById('jobLocation').value,
            salary: document.getElementById('jobSalary').value,
            type: document.getElementById('jobType').value,
            promoted: document.getElementById('promoteJob').checked,
            status: 'active',
            files: files
        };
        
        // Update or add job
        const existingIndex = jobs.findIndex(j => j.id == jobData.id);
        if (existingIndex >= 0) {
            jobs[existingIndex] = jobData;
        } else {
            jobs.push(jobData);
        }
        
        // Close editor and refresh
        document.getElementById('jobEditorModal').classList.add('hidden');
        showToast('Job saved successfully!', 'success');
        loadJobs('active');
    });

    // ===== Toast System =====
    let toastCounter = 0;
    function showToast(message, type = 'info', duration = 3000) {
        const id = 'toast-' + toastCounter++;
        const toast = document.createElement('div');
        toast.id = id;
        toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg transform translate-y-10 opacity-0 transition-all duration-300 ${
            type === 'error' ? 'bg-red-500' : 
            type === 'success' ? 'bg-green-500' : 
            'bg-blue-500'
        } text-white toast`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.remove('translate-y-10', 'opacity-0');
            toast.classList.add('translate-y-0', 'opacity-100');
        }, 10);
        
        if (duration > 0) {
            setTimeout(() => dismissToast(id), duration);
        }
        
        return id;
    }
    
    function dismissToast(id) {
        const toast = document.getElementById(id);
        if (toast) {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-10', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }
    }
});