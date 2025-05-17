document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('licenseFile');
    const filePreview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    const removeFile = document.getElementById('removeFile');
    
    // Dropzone functionality
    dropzone.addEventListener('click', () => {
        fileInput.click();
    });
    
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });
    
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
    
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFile(fileInput.files[0]);
        }
    });
    
    removeFile.addEventListener('click', () => {
        fileInput.value = '';
        filePreview.classList.add('hidden');
        dropzone.classList.remove('hidden');
    });
    
    function handleFile(file) {
        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showError(fileInput, 'File size exceeds 5MB limit');
            return;
        }
        
        // Check file type
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            showError(fileInput, 'Invalid file type. Please upload PDF, JPG or PNG');
            return;
        }
        
        fileName.textContent = file.name;
        filePreview.classList.remove('hidden');
        dropzone.classList.add('hidden');
        clearError(fileInput);
    }
    
    // Form validation
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        
        // Validate company name
        const companyName = document.getElementById('companyName');
        if (!companyName.value.trim()) {
            showError(companyName, 'Company name is required');
            isValid = false;
        } else {
            clearError(companyName);
        }
        
        // Validate email
        const email = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim()) {
            showError(email, 'Email address is required');
            isValid = false;
        } else if (!emailRegex.test(email.value.trim())) {
            showError(email, 'Please enter a valid email address');
            isValid = false;
        } else {
            clearError(email);
        }
        
        // Validate phone
        const phone = document.getElementById('phone');
        const phoneRegex = /^\+?[0-9\s\-()]{8,20}$/;
        if (!phone.value.trim()) {
            showError(phone, 'Phone number is required');
            isValid = false;
        } else if (!phoneRegex.test(phone.value.trim())) {
            showError(phone, 'Please enter a valid phone number');
            isValid = false;
        } else {
            clearError(phone);
        }
        
        // Validate file upload
        if (!fileInput.files.length) {
            showError(fileInput, 'Business license is required');
            isValid = false;
        } else {
            clearError(fileInput);
        }
        
        // Validate terms checkbox
        const terms = document.getElementById('terms');
        if (!terms.checked) {
            showError(terms, 'You must agree to the terms and conditions');
            isValid = false;
        } else {
            clearError(terms);
        }
        
        if (isValid) {
            // Submit form - in a real application, you would send the data to the server
            showSuccessMessage();
        }
    });
    
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
    
    function clearError(input) {
        const formGroup = input.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        
        input.classList.remove('error');
        errorElement.classList.add('hidden');
    }
    
    function showSuccessMessage() {
        // Replace form with success message
        const formContainer = document.querySelector('.form-container');
        formContainer.innerHTML = `
            <div class="bg-white rounded-md shadow-lg p-8 text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="ri-check-line ri-2x text-secondary"></i>
                </div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
                <p class="text-gray-600 mb-6">Your company registration has been submitted successfully. We will review your application and contact you shortly.</p>
                <div class="ethiopian-border mb-6 mx-auto w-32"></div>
                <p class="text-sm text-gray-500">Reference ID: REG-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}</p>
            </div>
        `;
    }
    
    // Input focus effects
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.classList.add('ring-2', 'ring-primary', 'ring-opacity-20');
        });
        
        input.addEventListener('blur', () => {
            input.classList.remove('ring-2', 'ring-primary', 'ring-opacity-20');
        });
    });
});