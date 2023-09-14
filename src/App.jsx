import { useRef, useEffect } from 'react';
import './App.css';
import * as faceapi from 'face-api.js';
import { Container } from 'react-bootstrap';

function App() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const aspectRatio = (940 + 650) / 2;

  // LOAD FROM USEEFFECT
  useEffect(() => {
    startVideo();
    videoRef && loadModels();
  }, []);

  // OPEN YOU FACE WEBCAM
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // LOAD MODELS FROM FACE API
  const loadModels = () => {
    Promise.all([
      // THIS FOR FACE DETECT AND LOAD FROM YOU PUBLIC/MODELS DIRECTORY
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models")
    ])
    .then(() => {
      faceMyDetect();
    });
  }

  const faceMyDetect = () => {
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(videoRef.current,
        new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();

      // Clear the canvas before each update
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);

      // If faces are detected, draw squares around each detected face
      if (detections && detections.length > 0) {
        detections.forEach((detection) => {
          const { x, y, width, height } = detection.detection.box;
          const size = Math.max(width, height); // Determine the size of the square
          context.strokeStyle = 'red'; // Set the square color
          context.lineWidth = 2;
          context.strokeRect(x, y, size, size); // Draw the square
        });
      }
    }, 1000);
  }

  return (
    <div className="myapp">
      <h1>Face Detection</h1>
      <video className="responsive-video" crossOrigin="anonymous" ref={videoRef} autoPlay></video>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="appcanvas"
      />
    </div>
  );
}

export default App;
