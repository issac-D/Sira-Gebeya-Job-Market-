// js/dashboard.js

document.addEventListener('DOMContentLoaded', function() {
    // Data Store Class
    class LocalStorageDataStore {
        constructor() {
            this.storageKey = 'dashboardData';
            this.profileKey = 'companyProfile';
            this.initializeStorage();
        }

        initializeStorage() {
            if (!localStorage.getItem(this.storageKey)) {
                localStorage.setItem(this.storageKey, JSON.stringify({
                    activeJobs: 12,
                    applicants: 45,
                    newApplicants: 8,
                    hiringRate: 65,
                    unreadMessages: 3,
                    activityFeed: [
                        {
                            message: 'New application received for Software Engineer',
                            timestamp: new Date(Date.now() - 3600000).toLocaleString(),
                            icon: 'fas fa-user-plus'
                        },
                        {
                            message: 'Job posting for Data Analyst updated',
                            timestamp: new Date(Date.now() - 7200000).toLocaleString(),
                            icon: 'fas fa-edit'
                        },
                        {
                            message: 'Interview scheduled for Product Manager',
                            timestamp: new Date(Date.now() - 86400000).toLocaleString(),
                            icon: 'fas fa-calendar'
                        },
                        {
                            message: 'New job posted: Marketing Specialist',
                            timestamp: new Date(Date.now() - 172800000).toLocaleString(),
                            icon: 'fas fa-plus'
                        },
                        {
                            message: 'Candidate moved to final round',
                            timestamp: new Date(Date.now() - 259200000).toLocaleString(),
                            icon: 'fas fa-check'
                        }
                    ],
                    jobs: [
                        { id: 1, title: 'Software Engineer', views: 320, applications: 45, status: 'active' },
                        { id: 2, title: 'Product Manager', views: 150, applications: 20, status: 'closed' },
                        { id: 3, title: 'UX Designer', views: 200, applications: 30, status: 'draft' },
                        { id: 4, title: 'Data Analyst', views: 280, applications: 35, status: 'active' },
                        { id: 5, title: 'Marketing Specialist', views: 100, applications: 15, status: 'active' },
                        { id: 6, title: 'DevOps Engineer', views: 180, applications: 25, status: 'draft' }
                    ],
                    jobPerformance: {
                        views: [120, 190, 170, 210, 180, 220, 250, 280, 300, 270, 240, 290],
                        applicants: [8, 12, 10, 15, 14, 18, 20, 22, 25, 21, 19, 23],
                        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        ageGroups: [
                            { range: '18-24', count: 15 },
                            { range: '25-34', count: 45 },
                            { range: '35-44', count: 25 },
                            { range: '45-54', count: 10 },
                            { range: '55+', count: 5 }
                        ],
                        genderDistribution: [
                            { gender: 'Male', count: 55 },
                            { gender: 'Female', count: 40 },
                            { gender: 'Other', count: 5 }
                        ]
                    }
                }));
            }
        }

        getData() {
            return JSON.parse(localStorage.getItem(this.storageKey)) || {};
        }

        updateData(updates) {
            const data = this.getData();
            Object.assign(data, updates);
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return data;
        }
    }

    const dataStore = new LocalStorageDataStore();

    // Toast notification system
    let toastIdCounter = 0;
    function showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        const toastId = `toast-${toastIdCounter++}`;
        toast.id = toastId;
        toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${
            type === 'error' ? 'bg-red-500' : 
            type === 'success' ? 'bg-green-500' : 
            'bg-blue-500'
        }`;
        toast.textContent = message;
        document.body.appendChild(toast);

        if (duration > 0) {
            setTimeout(() => {
                toast.remove();
            }, duration);
        }
        return toastId;
    }

    // DOM Elements
    const activeJobsCounter = document.getElementById('activeJobsCounter');
    const applicantsCounter = document.getElementById('applicantsCounter');
    const hiringRateCounter = document.getElementById('hiringRateCounter');
    const jobsTrend = document.getElementById('jobsTrend');
    const applicantsTrend = document.getElementById('applicantsTrend');
    const hiringRateTrend = document.getElementById('hiringRateTrend');
    const jobTableBody = document.getElementById('jobTableBody');
    const jobStatusFilter = document.getElementById('jobStatusFilter');
    const exportActivityBtn = document.getElementById('exportActivityBtn');
    const exportPdfBtn = document.getElementById('exportPdf');
    const exportCsvBtn = document.getElementById('exportCsv');
    const demoModal = document.getElementById('demoModal');
    const continueDemoBtn = document.getElementById('continueDemoBtn');
    const resetDemoBtn = document.getElementById('resetDemoBtn');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileSidebar = document.querySelector('.mobile-sidebar');
    const closeSidebar = document.querySelector('.close-sidebar');
    const overlay = document.querySelector('.overlay');
    const mobileProfile = document.querySelector('.mobile-profile');

    // Initialize dashboard
    function initializeDashboard() {
        const data = dataStore.getData();
        updateDashboard(data);
        initCharts(data.jobPerformance);
        startDynamicUpdates();
        setupEventListeners();
        
        if (!localStorage.getItem('demoShown')) {
            demoModal.style.display = 'flex';
            demoModal.style.animation = 'fadeIn 0.3s';
            localStorage.setItem('demoShown', 'true');
        }
    }

    // Update dashboard metrics
    function updateDashboard(data) {
        activeJobsCounter.textContent = data.activeJobs || 0;
        applicantsCounter.textContent = data.applicants || 0;
        hiringRateCounter.textContent = `${data.hiringRate || 0}%`;

        jobsTrend.className = `trend ${data.activeJobs > 10 ? 'up' : data.activeJobs < 5 ? 'down' : 'neutral'}`;
        applicantsTrend.className = `trend ${data.newApplicants > 5 ? 'up' : data.newApplicants < 2 ? 'down' : 'neutral'}`;
        hiringRateTrend.className = `trend ${data.hiringRate > 60 ? 'up' : data.hiringRate < 30 ? 'down' : 'neutral'}`;

        renderJobsChart(data.activeJobs || 0);
        renderApplicantsChart(data.applicants || 0, data.newApplicants || 0);
        renderHiringRateChart(data.hiringRate || 0);
        renderActivityFeed(data.activityFeed || []);
        renderJobTable(data.jobs || []);
    }

    // Initialize charts for job performance
    function initCharts(jobPerformanceData) {
        if (!jobPerformanceData) return;

        // Views vs Applicants Line Chart
        const viewsCtx = document.getElementById('viewsChart').getContext('2d');
        new Chart(viewsCtx, {
            type: 'line',
            data: {
                labels: jobPerformanceData.months,
                datasets: [
                    {
                        label: 'Job Views',
                        data: jobPerformanceData.views,
                        borderColor: '#2563EB',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Applicants',
                        data: jobPerformanceData.applicants,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Age Distribution Pie Chart
        const ageCtx = document.getElementById('ageChart').getContext('2d');
        new Chart(ageCtx, {
            type: 'pie',
            data: {
                labels: jobPerformanceData.ageGroups.map(g => g.range),
                datasets: [{
                    data: jobPerformanceData.ageGroups.map(g => g.count),
                    backgroundColor: [
                        '#3B82F6',
                        '#6366F1',
                        '#8B5CF6',
                        '#EC4899',
                        '#F43F5E'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
        
        // Gender Distribution Doughnut Chart
        const genderCtx = document.getElementById('genderChart').getContext('2d');
        new Chart(genderCtx, {
            type: 'doughnut',
            data: {
                labels: jobPerformanceData.genderDistribution.map(g => g.gender),
                datasets: [{
                    data: jobPerformanceData.genderDistribution.map(g => g.count),
                    backgroundColor: [
                        '#2563EB',
                        '#EC4899',
                        '#F59E0B'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    // Render simple charts
    function renderJobsChart(count) {
        const chart = document.getElementById('jobsChart');
        chart.innerHTML = '';
        const bar = document.createElement('div');
        bar.style.height = '100%';
        bar.style.width = `${Math.min(count * 5, 100)}%`;
        bar.style.background = 'linear-gradient(90deg, var(--primary), #4b83f1)';
        bar.style.transition = 'width 1s ease-in-out';
        chart.appendChild(bar);
    }

    function renderApplicantsChart(total, newApplicants) {
        const chart = document.getElementById('applicantsChart');
        chart.innerHTML = '';
        const totalBar = document.createElement('div');
        totalBar.style.height = '60%';
        totalBar.style.width = `${Math.min(total * 2, 100)}%`;
        totalBar.style.background = 'linear-gradient(90deg, var(--primary), #4b83f1)';
        totalBar.style.position = 'absolute';
        totalBar.style.bottom = '0';
        totalBar.style.left = '0';
        totalBar.style.transition = 'width 1s ease-in-out';
        
        const newBar = document.createElement('div');
        newBar.style.height = '40%';
        newBar.style.width = `${Math.min(newApplicants * 10, 100)}%`;
        newBar.style.background = 'linear-gradient(90deg, var(--secondary), #2ecc71)';
        newBar.style.position = 'absolute';
        newBar.style.bottom = '60%';
        newBar.style.left = '0';
        newBar.style.transition = 'width 1s ease-in-out';
        
        chart.appendChild(totalBar);
        chart.appendChild(newBar);
    }

    function renderHiringRateChart(rate) {
        const chart = document.getElementById('hiringRateChart');
        chart.innerHTML = '';
        const segment = document.createElement('div');
        segment.style.position = 'absolute';
        segment.style.width = '100%';
        segment.style.height = '100%';
        segment.style.borderRadius = '50%';
        segment.style.border = '10px solid var(--bg)';
        segment.style.borderTopColor = 'var(--secondary)';
        segment.style.borderRightColor = 'var(--secondary)';
        segment.style.transform = `rotate(${rate * 3.6}deg)`;
        segment.style.transition = 'transform 1s ease-in-out';
        chart.appendChild(segment);
    }

    function renderActivityFeed(activities) {
        const feed = document.getElementById('activityFeed');
        feed.innerHTML = '';
        activities.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'feed-item';
            item.innerHTML = `
                <i class="${activity.icon}"></i>
                <div>
                    <p>${activity.message}</p>
                    <small>${activity.timestamp}</small>
                </div>
            `;
            feed.appendChild(item);
        });
        if (activities.length === 0) {
            feed.innerHTML = '<p>No recent activity</p>';
        }
    }

    function renderJobTable(jobs) {
        const filter = jobStatusFilter.value;
        const filteredJobs = filter === 'all' ? jobs : jobs.filter(job => job.status === filter);
        
        jobTableBody.innerHTML = '';
        filteredJobs.forEach(job => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${job.title}</td>
                <td>${job.views}</td>
                <td>${job.applications}</td>
                <td><span class="status-badge ${job.status}">${job.status.charAt(0).toUpperCase() + job.status.slice(1)}</span></td>
                <td><button class="view-details-btn" data-job-id="${job.id}">View Details</button></td>
            `;
            jobTableBody.appendChild(row);
        });
        if (filteredJobs.length === 0) {
            jobTableBody.innerHTML = '<tr><td colspan="5">No jobs found</td></tr>';
        }
    }

    // Dynamic updates
    function startDynamicUpdates() {
        setInterval(() => {
            const data = dataStore.getData();
            const shouldUpdate = Math.random() > 0.7;
            if (shouldUpdate) {
                const newApplicant = Math.random() > 0.5;
                if (newApplicant) {
                    data.newApplicants = (data.newApplicants || 0) + 1;
                    data.applicants = (data.applicants || 0) + 1;
                    data.activityFeed.unshift({
                        message: `New application for ${data.jobs[Math.floor(Math.random() * data.jobs.length)].title}`,
                        timestamp: new Date().toLocaleString(),
                        icon: 'fas fa-user-plus'
                    });
                    if (data.activityFeed.length > 5) {
                        data.activityFeed.pop();
                    }
                } else {
                    data.activeJobs = Math.max(0, (data.activeJobs || 0) + (Math.random() > 0.5 ? 1 : -1));
                    data.hiringRate = Math.min(100, Math.max(0, (data.hiringRate || 0) + (Math.random() * 10 - 5)));
                    data.jobs.forEach(job => {
                        if (job.status === 'active') {
                            job.views = (job.views || 0) + Math.floor(Math.random() * 10);
                            job.applications = (job.applications || 0) + Math.floor(Math.random() * 3);
                        }
                    });
                }
                dataStore.updateData(data);
                updateDashboard(data);
                showToast(newApplicant ? 'New applicant added' : 'Dashboard metrics updated', 'success', 2000);
            }
        }, 10000);
    }

    // Export functionality
    function setupExportFunctionality() {
        const { jsPDF } = window.jspdf;
        
        exportPdfBtn.addEventListener('click', exportToPdf);
        exportCsvBtn.addEventListener('click', exportToCsv);
        
        function exportToPdf() {
            const doc = new jsPDF();
            const data = dataStore.getData();
            const jobPerformance = data.jobPerformance || {};
            
            // Add watermark
            doc.setFontSize(40);
            doc.setTextColor(200, 200, 200);
            doc.text('CONFIDENTIAL', 105, 140, { angle: 45, align: 'center' });
            doc.setTextColor(0, 0, 0);
            
            // Add title
            doc.setFontSize(20);
            doc.text('Job Performance Dashboard', 105, 20, { align: 'center' });
            
            // Add date
            doc.setFontSize(12);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
            
            // Add metrics
            doc.setFontSize(14);
            doc.text('Key Metrics', 14, 40);
            
            doc.autoTable({
                startY: 45,
                head: [['Metric', 'Value', 'Change']],
                body: [
                    ['Total Views', '1,248', '+12% from last month'],
                    ['Total Applicants', '84', '+8% from last month'],
                    ['Conversion Rate', '6.7%', '-1.2% from last month']
                ],
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235] }
            });
            
            // Add charts data
            doc.setFontSize(14);
            doc.text('Views vs Applicants (Last 12 Months)', 14, doc.autoTable.previous.finalY + 15);
            
            doc.autoTable({
                startY: doc.autoTable.previous.finalY + 20,
                head: [['Month', 'Views', 'Applicants']],
                body: jobPerformance.months?.map((month, i) => [month, jobPerformance.views[i], jobPerformance.applicants[i]]) || [],
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235] }
            });
            
            // Add demographic data
            doc.setFontSize(14);
            doc.text('Applicant Demographics', 14, doc.autoTable.previous.finalY + 15);
            
            doc.autoTable({
                startY: doc.autoTable.previous.finalY + 20,
                head: [['Age Group', 'Count']],
                body: jobPerformance.ageGroups?.map(g => [g.range, g.count]) || [],
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235] }
            });
            
            doc.autoTable({
                startY: doc.autoTable.previous.finalY + 20,
                head: [['Gender', 'Count']],
                body: jobPerformance.genderDistribution?.map(g => [g.gender, g.count]) || [],
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235] }
            });
            
            // Save the PDF
            doc.save(`job_performance_${new Date().toISOString().split('T')[0]}.pdf`);
        }
        
        function exportToCsv() {
            const data = dataStore.getData();
            const jobPerformance = data.jobPerformance || {};
            
            // Prepare CSV content
            let csvContent = "data:text/csv;charset=utf-8,";
            
            // Add header
            csvContent += "Job Performance Dashboard\n";
            csvContent += `Generated: ${new Date().toLocaleDateString()}\n\n`;
            
            // Add metrics
            csvContent += "Key Metrics\n";
            csvContent += "Metric,Value,Change\n";
            csvContent += "Total Views,1,248,+12% from last month\n";
            csvContent += "Total Applicants,84,+8% from last month\n";
            csvContent += "Conversion Rate,6.7%,-1.2% from last month\n\n";
            
            // Add views vs applicants
            csvContent += "Views vs Applicants (Last 12 Months)\n";
            csvContent += "Month,Views,Applicants\n";
            jobPerformance.months?.forEach((month, i) => {
                csvContent += `${month},${jobPerformance.views[i]},${jobPerformance.applicants[i]}\n`;
            });
            csvContent += "\n";
            
            // Add demographics
            csvContent += "Applicant Demographics\n";
            csvContent += "Age Group,Count\n";
            jobPerformance.ageGroups?.forEach(g => {
                csvContent += `${g.range},${g.count}\n`;
            });
            csvContent += "\n";
            
            csvContent += "Gender,Count\n";
            jobPerformance.genderDistribution?.forEach(g => {
                csvContent += `${g.gender},${g.count}\n`;
            });
            
            // Add watermark
            csvContent += "\n\nCONFIDENTIAL - AGGREGATE DATA ONLY";
            
            // Create download link
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `job_performance_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Event listeners
    function setupEventListeners() {
        // Activity feed export
        exportActivityBtn.addEventListener('click', () => {
            try {
                const data = dataStore.getData();
                if (!data.activityFeed || data.activityFeed.length === 0) {
                    showToast('No activity to export', 'error');
                    return;
                }
                const csvContent = [
                    'Message,Timestamp',
                    ...data.activityFeed.map(item => 
                        `"${item.message.replace(/"/g, '""')}",${item.timestamp}`
                    )
                ].join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'activity_feed.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('Activity exported as CSV', 'success');
            } catch (error) {
                showToast('Failed to export activity', 'error');
                console.error('Export error:', error);
            }
        });

        jobStatusFilter.addEventListener('change', () => {
            const data = dataStore.getData();
            renderJobTable(data.jobs || []);
        });

        jobTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-details-btn')) {
                const jobId = e.target.dataset.jobId;
                showToast(`Viewing details for job ID: ${jobId}`, 'info');
                // In a real implementation, this would navigate to a job details page
            }
        });

        // Demo modal controls
        continueDemoBtn.addEventListener('click', () => {
            demoModal.style.display = 'none';
        });

        resetDemoBtn.addEventListener('click', () => {
            localStorage.removeItem('dashboardData');
            localStorage.removeItem('demoShown');
            dataStore.initializeStorage();
            initializeDashboard();
            demoModal.style.display = 'none';
            showToast('Demo data reset', 'success');
        });

        // Mobile menu controls
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

        mobileProfile.addEventListener('click', () => {
            window.location.href = '../profile/profile.html';
        });

        // Setup export functionality
        setupExportFunctionality();

        // Reset timeout on user activity
        document.addEventListener('mousemove', resetSessionTimeout);
        document.addEventListener('keypress', resetSessionTimeout);
        document.addEventListener('click', resetSessionTimeout);
    }

    // Session timeout handling
    let sessionTimeout;
    let countdownInterval;

    function resetSessionTimeout() {
        clearTimeout(sessionTimeout);
        sessionTimeout = setTimeout(() => {
            showSessionModal();
        }, 14 * 60 * 1000); // 14 minutes
    }

    function showSessionModal() {
        demoModal.style.display = 'flex';
        demoModal.style.animation = 'fadeIn 0.3s';
        
        let seconds = 120;
        
        countdownInterval = setInterval(() => {
            seconds--;
            
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            
            document.getElementById('countdown').textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
            
            if (seconds <= 0) {
                clearInterval(countdownInterval);
                window.location.href = '/logout';
            }
        }, 1000);
    }

    // Initialize the dashboard
    initializeDashboard();
});