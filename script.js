const webcamBtn = document.getElementById('webcamBtn');
const webcamModal = document.getElementById('webcamModal');
const closeModal = document.querySelector('.close');
const captureBtn = document.getElementById('captureBtn');
const webcamFeed = document.getElementById('webcamFeed');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const loading = document.getElementById('loading');
const resultsSection = document.getElementById('predictionResults');
const impactSummary = document.getElementById('impactSummary');
const impactDetails = document.getElementById('impactDetails');

// Configure your server endpoint here
const API_ENDPOINT = 'http://localhost:5000/predict';

let stream;

// Webcam handlers
webcamBtn.addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcamFeed.srcObject = stream;
        webcamFeed.play();
        webcamModal.style.display = 'flex';
    } catch (err) {
        alert('Error accessing webcam: ' + err.message);
    }
});

closeModal.addEventListener('click', () => {
    webcamModal.style.display = 'none';
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});

captureBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = webcamFeed.videoWidth;
    canvas.height = webcamFeed.videoHeight;
    canvas.getContext('2d').drawImage(webcamFeed, 0, 0);
    
    canvas.toBlob(blob => {
        handleImage(blob);
        webcamModal.style.display = 'none';
        if (stream) stream.getTracks().forEach(track => track.stop());
    }, 'image/jpeg');
});

// File input handler
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleImage(file);
});

function handleImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        processImage(file);
    };
    reader.readAsDataURL(file);
}

async function processImage(file) {
    loading.style.display = 'flex';
    resultsSection.innerHTML = '';
    impactSummary.style.display = 'none';

    const formData = new FormData();
    formData.append('image', file, file.name || 'image.jpg');

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${await response.text()}`);
        }
        
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error('Error:', error);
        resultsSection.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error processing image: ${error.message}</p>
            </div>
        `;
    } finally {
        loading.style.display = 'none';
    }
}

function displayResults(data) {
    if (!data.predictions || data.predictions.length === 0) {
        resultsSection.innerHTML = '<p>No objects detected in the image.</p>';
        return;
    }

    // Sort predictions by confidence
    const sortedPredictions = [...data.predictions].sort((a, b) => b.confidence - a.confidence);
    
    // Display predictions
    resultsSection.innerHTML = sortedPredictions.map(pred => {
        const confidencePercent = Math.round(pred.confidence * 100);
        const confidenceClass = confidencePercent > 80 ? 'high-confidence' : 
                               confidencePercent > 50 ? 'medium-confidence' : 'low-confidence';
        
        return `
            <div class="prediction-item ${confidenceClass}">
                <h3>${pred.class} (${confidencePercent}%)</h3>
                <div class="confidence-bar">
                    <div class="confidence-level" style="width: ${confidencePercent}%"></div>
                </div>
                <p>Location: [${pred.bbox.map(coord => Math.round(coord)).join(', ')}]</p>
            </div>
        `;
    }).join('');

    // Generate environmental impact analysis
    generateImpactAnalysis(sortedPredictions);
}

function generateImpactAnalysis(predictions) {
    // Get detected classes
    const detectedClasses = predictions.map(p => p.class.toLowerCase());
    
    // Check for environmental concerns
    const environmentalIssues = [];
    
    if (detectedClasses.some(c => c.includes('trash') || c.includes('garbage') || c.includes('litter') || c.includes('waste'))) {
        environmentalIssues.push({
            issue: 'Waste pollution detected',
            impact: 'High',
            description: 'Improper waste disposal can contaminate soil and water sources, and harm wildlife.'
        });
    }
    
    if (detectedClasses.some(c => c.includes('plastic'))) {
        environmentalIssues.push({
            issue: 'Plastic pollution detected',
            impact: 'High',
            description: 'Plastic waste can persist in the environment for hundreds of years and harm wildlife through ingestion or entanglement.'
        });
    }

    if (environmentalIssues.length > 0) {
        impactSummary.style.display = 'block';
        impactDetails.innerHTML = environmentalIssues.map(issue => `
            <div class="impact-item impact-${issue.impact.toLowerCase()}">
                <h4>${issue.issue}</h4>
                <p class="impact-level">Impact Level: ${issue.impact}</p>
                <p>${issue.description}</p>
            </div>
        `).join('');
    } else {
        impactSummary.style.display = 'none';
    }
}

// Add drag and drop functionality
imagePreview.addEventListener('dragover', (e) => {
    e.preventDefault();
    imagePreview.classList.add('dragover');
});

imagePreview.addEventListener('dragleave', () => {
    imagePreview.classList.remove('dragover');
});

imagePreview.addEventListener('drop', (e) => {
    e.preventDefault();
    imagePreview.classList.remove('dragover');
    
    if (e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
            handleImage(file);
        }
    }
});

// Show a placeholder in the image preview area
imagePreview.innerHTML = `
    <div class="upload-placeholder">
        <i class="fas fa-file-image fa-3x"></i>
        <p>Drag and drop an image here<br>or use the buttons above</p>
    </div>
`;