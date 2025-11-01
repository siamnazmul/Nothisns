import React, { useState } from 'react';
import PhotoUpload from './components/PhotoUpload';
import FlappyGame from './FlappyGame';

function App() {
  const [userPhoto, setUserPhoto] = useState(null);
  const [gameKey, setGameKey] = useState(0);

  const handleImageCropped = (croppedImage) => {
    setUserPhoto(croppedImage);
  };

  const handleUploadAnother = () => {
    setUserPhoto(null);
    setGameKey(prev => prev + 1);
  };

  return (
    <div className="App">
      {!userPhoto ? (
        <PhotoUpload onImageCropped={handleImageCropped} />
      ) : (
        <FlappyGame key={gameKey} userPhoto={userPhoto} onUploadAnother={handleUploadAnother} />
      )}
    </div>
  );
}

export default App;