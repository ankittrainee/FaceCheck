import { useRef, useEffect, useState } from 'react';
import './App.css';
import * as faceapi from 'face-api.js';
import { Container } from 'react-bootstrap';

function App() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [detectedExpression, setDetectedExpression] = useState(''); // State variable to hold detected expression

  useEffect(() => {
    startVideo();
    videoRef && loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const loadModels = () => {
    Promise.all([
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

      canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(videoRef.current);
      faceapi.matchDimensions(canvasRef.current, {
        width: 940,
        height: 650
      });

      const resized = faceapi.resizeResults(detections, {
        width: 750,
        height: 650
      });

      faceapi.draw.drawDetections(canvasRef.current, resized);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);

      // Check if expressions are detected
      if (resized.length > 0 && resized[0].expressions) {
        // Get the detected expression with the highest confidence
        const detectedExp = Object.keys(resized[0].expressions)
          .reduce((a, b) => (resized[0].expressions[a] > resized[0].expressions[b] ? a : b));
        setDetectedExpression(detectedExp); // Update the state with the detected expression
      } else {
        setDetectedExpression(''); // If no expression is detected, clear the state
      }
    }, 1000);
  }

  return (
    <div className="myapp">
      <h1>{detectedExpression}</h1> {/* Display the detected expression */}
      <video className="responsive-video" crossOrigin="anonymous" ref={videoRef} autoPlay></video>
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="appcanvas" />
    </div>
  );
}

export default App;
