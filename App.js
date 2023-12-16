import React, { useRef, useState, useEffect } from "react";
import './App.css';
import * as tf from '@tensorflow/tfjs' 
import * as handpose from '@tensorflow-models/handpose'
import Webcam from 'react-webcam';
import { drawHand } from "./utilities";


///////// NEW STUFF IMPORTS
import * as fp from "fingerpose";
import victory from "./victory.png";
import thumbs_up from "./thumbs_up.png";
import perfect from "./perfect.png";


function App() {

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  
  ///////// NEW STUFF ADDED STATE HOOK
  const [emoji, setEmoji] = useState(null);
  const images = { thumbs_up: thumbs_up, victory: victory ,perfect:perfect};
  ///////// NEW STUFF ADDED STATE HOOK

  const runHandpose = async() =>{
     const net= await handpose.load();
     console.log("Handpose model loaded.");
     setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async(net) =>{
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    )
    {
       // Get Video Properties
       const video = webcamRef.current.video;
       const videoWidth = webcamRef.current.video.videoWidth;
       const videoHeight = webcamRef.current.video.videoHeight;
 
       // Set video width
       webcamRef.current.video.width = videoWidth;
       webcamRef.current.video.height = videoHeight;
 
       // Set canvas height and width
       canvasRef.current.width = videoWidth;
       canvasRef.current.height = videoHeight;
 
       // Make Detections
       const hand = await net.estimateHands(video);
       console.log(hand);

       if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          fp.Gestures.ThumbsUpGesture,
         // fp.Gestures.PerfectGesture,
        ]);
        const gesture = await GE.estimate(hand[0].landmarks, 4);
        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          // console.log(gesture.gestures);

          const confidence = gesture.gestures.map(
            (prediction) => prediction.score
          );
          const maxConfidence = confidence.indexOf(
            Math.max.apply(null, confidence)
          );
          // console.log(gesture.gestures[maxConfidence].name);
          setEmoji(gesture.gestures[maxConfidence].name);
          console.log(emoji);
        }

      }

        // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);


    }

  };

   
  runHandpose();

  return (
    <div className="App">
      <header className="App-header">
      <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

{emoji !== null ? (
          <img
            src={images[emoji]}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 400,
              bottom: 500,
              right: 0,
              textAlign: "center",
              height: 100,
            }}
          />
        ) : (
          ""
        )}
      </header>
    </div>
  );
}

export default App;
