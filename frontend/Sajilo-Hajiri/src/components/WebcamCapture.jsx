// WebcamCapture.jsx
import React, { useCallback, useRef } from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    onCapture(imageSrc);
  }, [webcamRef, onCapture]);

  return (
    <div className="webcam-container">
      <Webcam
        audio={false}
        height={200}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={220}
      />
      <button onClick={capture}>Capture</button>
    </div>
  );
};

export default WebcamCapture;
