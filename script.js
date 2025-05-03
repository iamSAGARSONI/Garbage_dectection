const imageUpload = document.getElementById('imageUpload');
const preview     = document.getElementById('preview');
const detectBtn   = document.getElementById('detectBtn');
const resultBox   = document.getElementById('result');

let uploadedFile = null;

// Show image preview and enable button
imageUpload.addEventListener('change', () => {
  const file = imageUpload.files[0];
  if (!file) return;

  uploadedFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    preview.src = e.target.result;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);

  detectBtn.disabled = false;
  resultBox.textContent = '';
});

// Send the image to your backend
detectBtn.addEventListener('click', () => {
  if (!uploadedFile) return;

  const formData = new FormData();
  formData.append('image', uploadedFile);

  // ← replace with your actual ngrok URL:
  fetch('https://af50-34-42-230-99.ngrok-free.app', {
    method: 'POST',
    body: formData
  })
  .then(async res => {
    if (!res.ok) throw new Error('Network response was not OK');
    return res.json();
  })
  .then(data => {
    const items = data.detected.length 
      ? data.detected.join(', ')
      : 'No materials detected';
    resultBox.textContent = `Detected: ${items}`;
  })
  .catch(err => {
    console.error(err);
    resultBox.textContent = 'Error detecting garbage.';
  });
});
