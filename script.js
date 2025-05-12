const webcamBtn = document.getElementById('webcamBtn');
const webcamModal = document.getElementById('webcamModal');
const closeModal = document.querySelector('.close');
const captureBtn = document.getElementById('captureBtn');
const webcamFeed = document.getElementById('webcamFeed');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const loading = document.getElementById('loading');
const resultsSection = document.getElementById('predictionResults');

let stream;

// Webcam handlers
webcamBtn.addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcamFeed.srcObject = stream;
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

    const formData = new FormData();
    formData.append('image', file);

    try {
        // Replace with your ngrok URL
        const response = await fetch('https://your-ngrok-url.ngrok.io/predict', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Analysis failed');
        
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}

function displayResults(data) {
    resultsSection.innerHTML = data.predictions.map(pred => `
        <div class="prediction-item">
            <h3>${pred.class} (${Math.round(pred.confidence * 100)}%)</h3>
            <p>Location: ${pred.bbox.join(', ')}</p>
        </div>
    `).join('');
}