import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';

const PhotoUpload = ({ onImageCropped }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    // Load ad script dynamically
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = '//www.highperformanceformat.com/cfa9f1073272a234ff16d14c490a08fe/invoke.js';
    
    const atOptionsScript = document.createElement('script');
    atOptionsScript.type = 'text/javascript';
    atOptionsScript.innerHTML = `
      atOptions = {
        'key' : 'cfa9f1073272a234ff16d14c490a08fe',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;
    
    const adContainer = document.getElementById('ad-banner-top');
    if (adContainer) {
      adContainer.appendChild(atOptionsScript);
      adContainer.appendChild(script);
    }
    
    return () => {
      // Cleanup
      if (adContainer) {
        adContainer.innerHTML = '';
      }
    };
  }, []);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
      image.src = url;
    });

  const getCroppedImg = async () => {
    try {
      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const size = Math.min(croppedAreaPixels.width, croppedAreaPixels.height);
      canvas.width = size;
      canvas.height = size;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        size,
        size
      );

      return canvas.toDataURL('image/jpeg');
    } catch (e) {
      console.error('Error cropping image:', e);
      return null;
    }
  };

  const handleDone = async () => {
    const croppedImage = await getCroppedImg();
    if (croppedImage) onImageCropped(croppedImage);
  };

  return (
    <div className="photo-upload-wrapper" style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Ad Banner at Top */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '20px 0', backgroundColor: '#111' }}>
        <div id="ad-banner-top" style={{ minHeight: '90px', minWidth: '728px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* Ad will be injected here by the script */}
        </div>
      </div>

      {/* Photo Upload Container */}
      <div
        className="photo-upload-container"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          padding: '20px'
        }}
        data-testid="photo-upload-container"
      >
        <div
          className="upload-card"
          style={{
            backgroundColor: '#1a1a1a',
            color: 'white',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            textAlign: 'center',
            width: '100%',
            maxWidth: '500px'
          }}
        >
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px', color: '#fff' }}>Flappy Face</h1>
          <p style={{ color: '#999', marginBottom: '30px', fontSize: '1.1rem' }}>
            Upload your photo to start the game!
          </p>

          {!imageSrc ? (
            <label
              style={{
                border: '2px dashed #666',
                borderRadius: '15px',
                padding: '60px 40px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.3s',
                width: '100%'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#aaa'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#666'}
              data-testid="upload-area"
            >
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                style={{ display: 'none' }}
                data-testid="file-input"
              />
              <div style={{ fontSize: '4rem', marginBottom: '15px' }}>📸</div>
              <div style={{ color: '#ddd', fontSize: '1.1rem', fontWeight: '500' }}>
                Click to upload your photo
              </div>
            </label>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
              <div
                style={{
                  position: 'relative',
                  width: '300px',
                  height: '300px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: '#000'
                }}
                data-testid="crop-container"
              >
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}>
                <label style={{ color: '#ddd', fontSize: '0.9rem' }}>Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  style={{ width: '75%', accentColor: '#ff6b35' }}
                  data-testid="zoom-slider"
                />
              </div>

              <button
                onClick={handleDone}
                style={{
                  backgroundColor: '#ff6b35',
                  color: 'white',
                  fontWeight: '600',
                  padding: '12px 40px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  marginTop: '10px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff5722'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff6b35'}
                data-testid="start-game-btn"
              >
                Start Game!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;