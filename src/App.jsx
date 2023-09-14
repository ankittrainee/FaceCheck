import {useRef,useEffect} from 'react'
import './App.css'
import * as faceapi from 'face-api.js'
import { Container } from 'react-bootstrap'

function App(){
  const videoRef = useRef()
  const canvasRef = useRef()
  const aspectRatio = (940 + 650) / 2; 
  // LOAD FROM USEEFFECT
  useEffect(()=>{
    startVideo()
    videoRef && loadModels()

  },[])


  const canvasWidth = videoRef.current ? videoRef.current.videoWidth : 800;
  const canvasHeight = (canvasWidth / aspectRatio) * 0.8
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

  const faceMyDetect = ()=>{
    setInterval(async()=>{
      const detections = await faceapi.detectAllFaces(videoRef.current,
        new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()

      // DRAW YOU FACE IN WEBCAM
      canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(videoRef.current)
      faceapi.matchDimensions(canvasRef.current,{
        width:800,
        height:750
      })

      const resized = faceapi.resizeResults(detections,{
         width:800,
        height:750
      })

      faceapi.draw.drawDetections(canvasRef.current,resized)
      faceapi.draw.drawFaceLandmarks(canvasRef.current,resized)
      faceapi.draw.drawFaceExpressions(canvasRef.current,resized)


    },1000)
  }

  return (
    <Container fluid className="myapp">
    <h1>FAce Detection</h1>
      <Container fluid className="appvide">
        
      <video className='responsive-video' crossOrigin="anonymous" ref={videoRef} autoPlay></video>
      </Container>
      <canvas ref={canvasRef} width="800" height="750"
      className="appcanvas"/>
    </Container>
    )

}

export default App;