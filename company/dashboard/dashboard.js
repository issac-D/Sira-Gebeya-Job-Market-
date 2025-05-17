document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const activeJobsCounter = document.getElementById('activeJobsCounter');
    const applicantsCounter = document.getElementById('applicantsCounter');
    const conversionCounter = document.getElementById('conversionCounter');
    const postJobBtn = document.getElementById('postJobBtn');
    const viewApplicantsBtn = document.getElementById('viewApplicantsBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const activityFeed = document.getElementById('activityFeed');
    const sessionModal = document.getElementById('sessionModal');
    const countdownEl = document.getElementById('countdown');
    const extendSessionBtn = document.getElementById('extendSession');
    const logoutBtn = document.getElementById('logout');
    
    // State
    let sessionTimeout;
    let countdownInterval;
    let isFirstVisit = !sessionStorage.getItem('visitedDashboard');
    
    // Initialize dashboard
    initDashboard();
    
    function initDashboard() {
        // Animated counters
        animateCounter(activeJobsCounter, 0, 142, 1000);
        animateCounter(applicantsCounter, 0, 28, 1000);
        animateCounter(conversionCounter, 0, 65, 1000, '%');
        
        // Create charts
        createBarChart('jobsChart', [30, 45, 60, 55, 70, 85, 90]);
        createBarChart('applicantsChart', [50, 45, 40, 35, 30, 25, 20]);
        createDonutChart('conversionChart', 65);
        
        // Load activity feed
        loadActivityFeed();
        
        // Set up session timeout
        resetSessionTimeout();
        
        // First visit pulse animation
        if (isFirstVisit) {
            sessionStorage.setItem('visitedDashboard', 'true');
            setTimeout(() => {
                postJobBtn.classList.remove('pulse');
            }, 2000);
        } else {
            postJobBtn.classList.remove('pulse');
        }
        
        // Set up IntersectionObserver for lazy loading
        setupObservers();
        
        // Set up debounced resize handler
        setupResizeHandler();
    }
    
    // Animate counter from start to end
    function animateCounter(element, start, end, duration, suffix = '') {
        const range = end - start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / range));
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            element.textContent = current + suffix;
            
            if (current === end) {
                clearInterval(timer);
            }
        }, stepTime);
    }
    
    // Create bar chart
    function createBarChart(elementId, dataPoints) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.innerHTML = '';
        
        // Normalize data to fit chart height
        const maxValue = Math.max(...dataPoints);
        const height = 40; // Chart height in pixels
        
        dataPoints.forEach(value => {
            const barHeight = (value / maxValue) * height;
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.height = `${barHeight}px`;
            
            // Random delay for animation effect
            bar.style.animationDelay = `${Math.random() * 0.5}s`;
            element.appendChild(bar);
        });
    }
    
    // Create donut chart
    function createDonutChart(elementId, percentage) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Update the conic-gradient
        element.style.background = `conic-gradient(
            var(--primary) 0% ${percentage}%,
            var(--border) ${percentage}% 100%
        )`;
        
        // Update the segment transforms
        const segment1 = element.querySelector('.donut-segment:nth-child(1)');
        const segment2 = element.querySelector('.donut-segment:nth-child(2)');
        
        if (segment1 && segment2) {
            segment1.style.background = `conic-gradient(
                var(--primary) 0% ${percentage}%,
                transparent ${percentage}% 100%
            )`;
            
            const rotation = (percentage / 100) * 360;
            segment2.style.transform = `rotate(${rotation}deg)`;
        }
    }
    
    // Load activity feed with sample data
    function loadActivityFeed() {
        const activities = [
            { 
                icon: 'fa-user-plus',
                text: 'New applicant for Senior Developer position',
                time: '2 mins ago',
                ip: '192.168.1.1',
                location: 'Addis Ababa, ET'
            },
            { 
                icon: 'fa-file-alt',
                text: 'Job posting "Frontend Engineer" published',
                time: '15 mins ago',
                ip: '192.168.1.45',
                location: 'Remote'
            },
            { 
                icon: 'fa-envelope',
                text: 'Application rejected for UX Designer role',
                time: '1 hour ago',
                ip: '192.168.1.12',
                location: 'Remote'
            },
            { 
                icon: 'fa-check-circle',
                text: 'Interview scheduled with candidate John Doe',
                time: '3 hours ago',
                ip: '192.168.1.1',
                location: 'Addis Ababa, ET'
            },
            { 
                icon: 'fa-bell',
                text: 'System notification: Weekly report generated',
                time: '1 day ago',
                ip: 'System',
                location: ''
            }
        ];
        
        activityFeed.innerHTML = '';
        
        activities.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'feed-item';
            
            item.innerHTML = `
                <i class="fas ${activity.icon}"></i>
                <div class="content">
                    <div>${activity.text}</div>
                    ${activity.ip ? `<div class="meta">${activity.ip}${activity.location ? ` • ${activity.location}` : ''}</div>` : ''}
                </div>
                <div class="time">${activity.time}</div>
            `;
            
            activityFeed.appendChild(item);
        });
    }
    
    // Session timeout handling
    function resetSessionTimeout() {
        // Clear existing timeout
        clearTimeout(sessionTimeout);
        
        // Set new timeout (14 minutes)
        sessionTimeout = setTimeout(() => {
            showSessionModal();
        }, 14 * 60 * 1000); // 14 minutes
    }
    
    function showSessionModal() {
        sessionModal.classList.add('active');
        
        // Start 2 minute countdown
        let seconds = 120;
        
        countdownInterval = setInterval(() => {
            seconds--;
            
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            
            countdownEl.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
            
            if (seconds <= 0) {
                clearInterval(countdownInterval);
                window.location.href = '/logout';
            }
        }, 1000);
    }
    
    function hideSessionModal() {
        sessionModal.classList.remove('active');
        clearInterval(countdownInterval);
        resetSessionTimeout();
    }
    
    // Set up IntersectionObserver for lazy loading
    function setupObservers() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.id === 'jobsChart') {
                        createBarChart('jobsChart', [30, 45, 60, 55, 70, 85, 90]);
                    } else if (entry.target.id === 'applicantsChart') {
                        createBarChart('applicantsChart', [50, 45, 40, 35, 30, 25, 20]);
                    } else if (entry.target.id === 'conversionChart') {
                        createDonutChart('conversionChart', 65);
                    }
                    
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        // Observe chart elements
        const charts = ['jobsChart', 'applicantsChart', 'conversionChart'];
        charts.forEach(id => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });
    }
    
    // Set up debounced resize handler
    function setupResizeHandler() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                createBarChart('jobsChart', [30, 45, 60, 55, 70, 85, 90]);
                createBarChart('applicantsChart', [50, 45, 40, 35, 30, 25, 20]);
                createDonutChart('conversionChart', 65);
            }, 200);
        });
    }
    
    // Event listeners
    postJobBtn.addEventListener('click', () => {
        alert('Post Job functionality would open a form in a real implementation');
    });
    
    viewApplicantsBtn.addEventListener('click', () => {
        alert('View Applicants would navigate to applicants list');
    });
    
    exportCsvBtn.addEventListener('click', () => {
        alert('CSV export would download activity data in a real implementation');
    });
    
    extendSessionBtn.addEventListener('click', hideSessionModal);
    
    logoutBtn.addEventListener('click', () => {
        window.location.href = '/logout';
    });
    
    // Reset timeout on user activity
    document.addEventListener('mousemove', resetSessionTimeout);
    document.addEventListener('keypress', resetSessionTimeout);
    document.addEventListener('click', resetSessionTimeout);
});