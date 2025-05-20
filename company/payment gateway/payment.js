document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const paymentForm = document.getElementById('paymentForm');
    const paymentCards = document.querySelectorAll('.payment-card');
    const selectedMethodInput = document.getElementById('selectedMethod');
    const amountInput = document.getElementById('amount');
    const referenceInput = document.getElementById('reference');
    const copyReferenceBtn = document.getElementById('copyReference');
    const receiptInput = document.getElementById('receipt');
    const fileNameSpan = document.getElementById('file-name');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    const attemptsWarning = document.getElementById('attemptsWarning');
    const successModal = document.getElementById('successModal');
    
    // Error elements
    const amountError = document.getElementById('amountError');
    const referenceError = document.getElementById('referenceError');
    const receiptError = document.getElementById('receiptError');
    
    // State
    let failedAttempts = 0;
    const MAX_ATTEMPTS = 3;
    
    // Initialize payment method selection
    paymentCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected class from all cards
            paymentCards.forEach(c => c.classList.remove('selected'));
            
            // Add selected class to clicked card
            this.classList.add('selected');
            
            // Update hidden input value
            selectedMethodInput.value = this.dataset.method;
        });
    });
    
    // Set first payment method as default
    if (paymentCards.length > 0) {
        paymentCards[0].click();
    }
    
    // Copy reference number to clipboard
    copyReferenceBtn.addEventListener('click', function() {
        if (referenceInput.value.trim() === '') {
            referenceError.textContent = 'No reference number to copy';
            referenceError.style.display = 'block';
            return;
        }
        
        referenceInput.select();
        document.execCommand('copy');
        
        // Visual feedback
        const originalText = copyReferenceBtn.innerHTML;
        copyReferenceBtn.innerHTML = '<i class="fas fa-check"></i>';
        
        setTimeout(() => {
            copyReferenceBtn.innerHTML = originalText;
        }, 2000);
    });
    
    // Handle file input change
    receiptInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            const file = this.files[0];
            fileNameSpan.textContent = file.name;
            
            // Validate file type
            const validTypes = ['application/pdf', 'image/png'];
            if (!validTypes.includes(file.type)) {
                receiptError.textContent = 'Only PDF and PNG files are allowed';
                receiptError.style.display = 'block';
                this.value = '';
                fileNameSpan.textContent = 'Choose file';
            } else {
                receiptError.style.display = 'none';
            }
        } else {
            fileNameSpan.textContent = 'Choose file';
        }
    });
    
    // Form submission
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Reset error messages
        amountError.style.display = 'none';
        referenceError.style.display = 'none';
        receiptError.style.display = 'none';
        
        // Validate form
        let isValid = true;
        
        // Validate amount
        if (!amountInput.value || isNaN(amountInput.value)) {
            amountError.style.display = 'block';
            isValid = false;
        }
        
        // Validate reference
        if (!referenceInput.value.trim()) {
            referenceError.style.display = 'block';
            isValid = false;
        }
        
        // Validate receipt
        if (!receiptInput.files || receiptInput.files.length === 0) {
            receiptError.textContent = 'Please upload your payment receipt';
            receiptError.style.display = 'block';
            isValid = false;
        }
        
        if (!isValid) {
            failedAttempts++;
            checkAttempts();
            return;
        }
        
        // Show loading state
        btnText.textContent = 'Processing...';
        spinner.classList.remove('hidden');
        submitBtn.disabled = true;
        
        // Simulate secure form submission
        setTimeout(() => {
            // In a real app, this would be an actual form submission
            console.log('Form data:', {
                payment_method: selectedMethodInput.value,
                amount: amountInput.value,
                reference: referenceInput.value,
                receipt: receiptInput.files[0].name
            });
            
            // Simulate random success/failure for demo
            const isSuccess = Math.random() > 0.3;
            
            if (isSuccess) {
                // Show success modal
                successModal.classList.remove('hidden');
                
                // Reset form
                paymentForm.reset();
                fileNameSpan.textContent = 'Choose file';
                failedAttempts = 0;
                
                // Redirect to dashboard after 3 seconds
                setTimeout(() => {
                    window.location.href = '../dashboard/dashboard.html';
                }, 3000);
            } else {
                // Failure case
                alert('Payment failed. Please try again.');
                failedAttempts++;
                checkAttempts();
            }
            
            // Reset button state
            btnText.textContent = 'Submit Payment';
            spinner.classList.add('hidden');
            submitBtn.disabled = false;
        }, 2000);
    });
    
    // Check failed attempts and redirect if needed
    function checkAttempts() {
        if (failedAttempts >= MAX_ATTEMPTS) {
            attemptsWarning.classList.remove('hidden');
            
            // Disable form
            submitBtn.disabled = true;
            
            // Redirect after 5 seconds
            setTimeout(() => {
                window.location.href = 'https://example.com/support';
            }, 5000);
        }
    }
    
    // Auto-zoom on mobile for input focus
    if (window.innerWidth <= 480) {
        const inputs = [amountInput, referenceInput];
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                window.scrollTo({
                    top: input.offsetTop - 100,
                    behavior: 'smooth'
                });
            });
        });
    }
});