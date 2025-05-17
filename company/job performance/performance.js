document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    initCharts();
    
    // Set up export functionality
    setupExport();
    
    // Sample data - in a real app, this would come from an API
    const jobData = {
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
    };
    
    function initCharts() {
        // Views vs Applicants Line Chart
        const viewsCtx = document.getElementById('viewsChart').getContext('2d');
        new Chart(viewsCtx, {
            type: 'line',
            data: {
                labels: jobData.months,
                datasets: [
                    {
                        label: 'Job Views',
                        data: jobData.views,
                        borderColor: '#2563EB',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Applicants',
                        data: jobData.applicants,
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
                labels: jobData.ageGroups.map(g => g.range),
                datasets: [{
                    data: jobData.ageGroups.map(g => g.count),
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
                labels: jobData.genderDistribution.map(g => g.gender),
                datasets: [{
                    data: jobData.genderDistribution.map(g => g.count),
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
    
    function setupExport() {
        const { jsPDF } = window.jspdf;
        
        document.getElementById('exportPdf').addEventListener('click', exportToPdf);
        document.getElementById('exportCsv').addEventListener('click', exportToCsv);
        
        function exportToPdf() {
            const doc = new jsPDF();
            
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
                body: jobData.months.map((month, i) => [month, jobData.views[i], jobData.applicants[i]]),
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235] }
            });
            
            // Add demographic data
            doc.setFontSize(14);
            doc.text('Applicant Demographics', 14, doc.autoTable.previous.finalY + 15);
            
            doc.autoTable({
                startY: doc.autoTable.previous.finalY + 20,
                head: [['Age Group', 'Count']],
                body: jobData.ageGroups.map(g => [g.range, g.count]),
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235] }
            });
            
            doc.autoTable({
                startY: doc.autoTable.previous.finalY + 20,
                head: [['Gender', 'Count']],
                body: jobData.genderDistribution.map(g => [g.gender, g.count]),
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235] }
            });
            
            // Save the PDF
            doc.save(`job_performance_${new Date().toISOString().split('T')[0]}.pdf`);
        }
        
        function exportToCsv() {
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
            jobData.months.forEach((month, i) => {
                csvContent += `${month},${jobData.views[i]},${jobData.applicants[i]}\n`;
            });
            csvContent += "\n";
            
            // Add demographics
            csvContent += "Applicant Demographics\n";
            csvContent += "Age Group,Count\n";
            jobData.ageGroups.forEach(g => {
                csvContent += `${g.range},${g.count}\n`;
            });
            csvContent += "\n";
            
            csvContent += "Gender,Count\n";
            jobData.genderDistribution.forEach(g => {
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
});