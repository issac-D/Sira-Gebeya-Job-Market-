document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const kanbanBoard = document.getElementById('kanbanBoard');
    
    // Pipeline stages
    const pipelineStages = [
        { id: 'applied', name: 'Applied' },
        { id: 'screened', name: 'Screened' },
        { id: 'interview', name: 'Interview' },
        { id: 'hired', name: 'Hired' }
    ];
    
    // Sample candidates data
    let candidates = [
        { id: '1', name: 'John Smith', stage: 'applied', appliedDate: '2023-06-15', rating: 4, urgent: true, topRated: false },
        { id: '2', name: 'Emily Johnson', stage: 'applied', appliedDate: '2023-06-18', rating: 5, urgent: false, topRated: true },
        { id: '3', name: 'Michael Brown', stage: 'screened', appliedDate: '2023-06-10', rating: 3, urgent: true, topRated: false },
        { id: '4', name: 'Sarah Davis', stage: 'screened', appliedDate: '2023-06-12', rating: 4, urgent: false, topRated: false },
        { id: '5', name: 'David Wilson', stage: 'interview', appliedDate: '2023-06-05', rating: 2, urgent: false, topRated: false },
        { id: '6', name: 'Jessica Miller', stage: 'interview', appliedDate: '2023-06-08', rating: 5, urgent: false, topRated: true },
        { id: '7', name: 'Robert Taylor', stage: 'hired', appliedDate: '2023-05-28', rating: 4, urgent: false, topRated: false }
    ];
    
    // Initialize the pipeline
    initPipeline();
    
    function initPipeline() {
        // Create columns for each stage
        pipelineStages.forEach(stage => {
            const column = document.createElement('div');
            column.className = `kanban-column column-${stage.id}`;
            column.dataset.stage = stage.id;
            
            // Column header
            const header = document.createElement('div');
            header.className = 'column-header';
            header.innerHTML = `
                <span>${stage.name}</span>
                <span class="column-count">0</span>
            `;
            column.appendChild(header);
            
            // Candidate list
            const candidateList = document.createElement('div');
            candidateList.className = 'candidate-list';
            candidateList.dataset.stage = stage.id;
            
            // Add placeholder for drag-and-drop
            const placeholder = document.createElement('div');
            placeholder.className = 'column-placeholder';
            candidateList.appendChild(placeholder);
            
            column.appendChild(candidateList);
            
            // Make column a drop target
            setupDropZone(candidateList);
            
            kanbanBoard.appendChild(column);
        });
        
        // Render candidates
        renderCandidates();
        
        // Set up drag events for all candidate cards
        setupDragEvents();
    }
    
    function renderCandidates() {
        // Clear all candidate lists
        document.querySelectorAll('.candidate-list').forEach(list => {
            // Keep the placeholder
            while (list.children.length > 1) {
                list.removeChild(list.lastChild);
            }
        });
        
        // Group candidates by stage
        const candidatesByStage = {};
        pipelineStages.forEach(stage => {
            candidatesByStage[stage.id] = candidates.filter(c => c.stage === stage.id);
        });
        
        // Add candidates to their respective columns
        pipelineStages.forEach(stage => {
            const candidateList = document.querySelector(`.candidate-list[data-stage="${stage.id}"]`);
            const countElement = candidateList.parentElement.querySelector('.column-count');
            
            // Update count
            countElement.textContent = candidatesByStage[stage.id].length;
            
            // Add candidates
            candidatesByStage[stage.id].forEach(candidate => {
                const card = createCandidateCard(candidate);
                candidateList.insertBefore(card, candidateList.lastElementChild);
            });
        });
    }
    
    function createCandidateCard(candidate) {
        const card = document.createElement('div');
        card.className = 'candidate-card';
        if (candidate.urgent) card.classList.add('urgent');
        card.dataset.id = candidate.id;
        card.draggable = true;
        
        // Get initials for avatar
        const initials = candidate.name.split(' ').map(n => n[0]).join('');
        
        // Create star rating
        const stars = '★'.repeat(candidate.rating) + '☆'.repeat(5 - candidate.rating);
        
        card.innerHTML = `
            <div class="candidate-card-header">
                <div class="candidate-avatar">${initials}</div>
                <div class="candidate-name">${candidate.name}</div>
                ${candidate.topRated ? '<div class="top-rated-badge">Top Rated</div>' : ''}
            </div>
            <div class="candidate-meta">
                <span>${formatDate(candidate.appliedDate)}</span>
                <span class="rating-stars">${stars}</span>
            </div>
        `;
        
        return card;
    }
    
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
    
    function setupDragEvents() {
        const cards = document.querySelectorAll('.candidate-card');
        
        cards.forEach(card => {
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);
        });
    }
    
    function setupDropZone(element) {
        element.addEventListener('dragover', handleDragOver);
        element.addEventListener('dragenter', handleDragEnter);
        element.addEventListener('dragleave', handleDragLeave);
        element.addEventListener('drop', handleDrop);
    }
    
    let draggedCard = null;
    
    function handleDragStart(e) {
        draggedCard = this;
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', this.dataset.id);
        e.dataTransfer.effectAllowed = 'move';
    }
    
    function handleDragEnd() {
        this.classList.remove('dragging');
        draggedCard = null;
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    function handleDragEnter(e) {
        e.preventDefault();
        this.querySelector('.column-placeholder').classList.add('active');
    }
    
    function handleDragLeave() {
        this.querySelector('.column-placeholder').classList.remove('active');
    }
    
    function handleDrop(e) {
        e.preventDefault();
        this.querySelector('.column-placeholder').classList.remove('active');
        
        if (!draggedCard) return;
        
        const candidateId = draggedCard.dataset.id;
        const oldStage = draggedCard.closest('.candidate-list').dataset.stage;
        const newStage = this.dataset.stage;
        
        // Check permissions (only HR can move to "hired")
        const userRole = document.body.dataset.role;
        if (newStage === 'hired' && userRole !== 'hr') {
            alert('Only HR can move candidates to "Hired" stage');
            return;
        }
        
        // Update candidate stage
        const candidate = candidates.find(c => c.id === candidateId);
        if (candidate && candidate.stage !== newStage) {
            const oldStageName = pipelineStages.find(s => s.id === oldStage).name;
            const newStageName = pipelineStages.find(s => s.id === newStage).name;
            
            // Log the change to audit trail
            console.log(`Moved ${candidate.name} from ${oldStageName} to ${newStageName}`);
            
            candidate.stage = newStage;
            
            // Re-render the pipeline
            renderCandidates();
            setupDragEvents();
        }
    }
    
    // Reinitialize drag events when new cards are added
    function setupDragEvents() {
        const cards = document.querySelectorAll('.candidate-card');
        
        cards.forEach(card => {
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);
        });
    }
});