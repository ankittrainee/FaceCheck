import {useRef,useEffect} from 'react'
import './App.css'
import * as faceapi from 'face-api.js'
import { Container } from 'react-bootstrap'

function App(){
  const videoRef = useRef()
  const canvasRef = useRef()

  // LOAD FROM USEEFFECT
  useEffect(()=>{
    startVideo()
    videoRef && loadModels()

  },[])



  // OPEN YOU FACE WEBCAM
  const startVideo = ()=>{
    navigator.mediaDevices.getUserMedia({video:true})
    .then((currentStream)=>{
      videoRef.current.srcObject = currentStream
    })
    .catch((err)=>{
      console.log(err)
    })
  }
  // LOAD MODELS FROM FACE API

  const loadModels = ()=>{
    Promise.all([
      // THIS FOR FACE DETECT AND LOAD FROM YOU PUBLIC/MODELS DIRECTORY
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models")

      ]).then(()=>{
      faceMyDetect()
    })
  }

  const faceMyDetect = () => {
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
  
      // Get the dimensions of the parent container
      const parentContainer = canvasRef.current.parentElement;
      const parentWidth = parentContainer.clientWidth;
  
      // Calculate the canvas height based on the detected face size
      const resizedDetections = faceapi.resizeResults(detections, {
        width: parentWidth * 0.8, // Set width to 80% of parent width
        height: (parentWidth * 0.8) / (940 / 650), // Maintain aspect ratio based on original width and height
      });
  
      const context = canvasRef.current.getContext('2d');
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  
      // Calculate the position to center the face detection box horizontally
      const xOffset = (parentWidth - parentWidth * 0.8) / 2;
  
      // Draw the resized detections with the adjusted position
      faceapi.draw.drawDetections(canvasRef.current, resizedDetections.map(detection => ({
        ...detection,
        x: detection.x + xOffset, // Adjust the x position to center horizontally
      })));
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
    }, 1000);
  };
  

  return (
    <Container className="myapp">
    <h1>FAce Detection</h1>
      <Container className="appvide">
        
      <video className="responsive-video" crossOrigin="anonymous" ref={videoRef} autoPlay></video>
      </Container>
      <canvas ref={canvasRef} width="940" height="650"
      className="appcanvas"/>
    </Container>
    )

}

export default App;