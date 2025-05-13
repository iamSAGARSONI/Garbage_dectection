# EcoVision AI - Environmental Object Detection System

This system integrates computer vision with environmental analysis to detect and classify environmental issues like waste, pollution, and more.

## Project Overview

EcoVision AI uses the Ultralytics YOLO model to detect objects in images and video streams, with a focus on environmental impacts. The system includes:

1. A Flask backend for processing images and serving predictions
2. A responsive web interface for uploading images or using a webcam
3. Environmental impact analysis based on detected objects

## Setup Instructions

### Prerequisites
- Python 3.8+
- pip
- A trained YOLO model for environmental object detection (e.g., `model_1.pt`)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ecovision-ai.git
cd ecovision-ai
```

2. Install required packages:
```bash
pip install ultralytics opencv-python flask flask-cors
```

3. Place your trained YOLO model (e.g., `model_1.pt`) in the project directory.

4. Set up the file structure:
```
ecovision-ai/
├── app.py              # Flask server script
├── model_1.pt          # YOLO model file
├── static/             # Static files directory
│   ├── index.html      # Main HTML file
│   ├── pdf.html        # Resources page
│   ├── style.css       # CSS styles
│   └── script.js       # JavaScript code
├── README.md           # This file
└── requirements.txt    # Python dependencies
```

5. Create the static directory and copy the frontend files:
```bash
mkdir -p static
cp index.html pdf.html style.css script.js static/
```

### Running the Application

1. Start the Flask server:
```bash
python app.py --model model_1.pt --port 5000
```

2. Open a web browser and navigate to:
```
http://localhost:5000
```

## Using ngrok for External Access

To make your app accessible from the internet:

1. Install ngrok:
```bash
pip install pyngrok
```

2. Start ngrok tunnel:
```bash
ngrok http 5000
```

3. Update the `API_ENDPOINT` in `script.js` with your ngrok URL

## Features

- **Image Upload**: Analyze environmental impacts in uploaded images
- **Webcam Integration**: Real-time analysis using your device's camera
- **Environmental Impact Analysis**: Assessment of detected objects' environmental impact
- **Resources Page**: Educational materials and resources about environmental protection

## Customization

- **Model**: Replace `model_1.pt` with your own trained YOLO model
- **UI**: Modify the HTML/CSS/JS files in the `static` directory
- **Detection Classes**: Update the environmental impact analysis in `script.js` to match your model's classes

## License

This project is licensed under the MIT License - see the LICENSE file for details.