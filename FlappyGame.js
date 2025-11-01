import React, { useEffect, useRef, useState } from 'react';
import P5 from 'p5';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './game/constants';
import Pipe from './game/pipe';
import Bird from './game/bird';
import Floor from './game/floor';
import Text from './game/gameText';
import Images from './assets/sprite.png';
import BackgroundImage from './assets/background.png';
import font from './assets/FlappyBirdy.ttf';
import Storage from './storage';
import './game.css';

const FlappyGame = ({ userPhoto, onUploadAnother }) => {
  const gameContainerRef = useRef(null);
  const p5InstanceRef = useRef(null);
  const [isDayMode, setIsDayMode] = useState(true);
  const [showGameOver, setShowGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    const sketch = (p5) => {
      let background, spriteImage, birdyFont;
      let gameStart, gameOver;
      let bird, pipe, floor, gameText;
      let score = 0;
      let storage;
      let bestScoreLocal = 0;
      let userPhotoImg;

      p5.preload = () => {
        background = p5.loadImage(BackgroundImage);
        spriteImage = p5.loadImage(Images);
        birdyFont = p5.loadFont(font);
        userPhotoImg = p5.loadImage(userPhoto);
      };

      const resetGame = () => {
        gameStart = false;
        gameOver = false;
        bird = new Bird(p5, spriteImage, userPhotoImg);
        pipe = new Pipe(p5, spriteImage);
        floor = new Floor(p5, spriteImage);
        gameText = new Text(p5, birdyFont);
        storage = new Storage();
        score = 0;
        setShowGameOver(false);
        pipe.generateFirst();
        bird.draw();
        floor.draw();
        let dataFromStorage = storage.getStorageData();

        if (dataFromStorage === null) {
          bestScoreLocal = 0;
        } else {
          bestScoreLocal = dataFromStorage.bestScore || 0;
        }
        setBestScore(bestScoreLocal);
      };

      const canvasClick = () => {
        if (p5.mouseButton === 'left') {
          if (gameOver === false) bird.jump();
          if (gameStart === false) gameStart = true;
        }
      };

      const canvasTouch = () => {
        if (gameOver === false) bird.jump();
        if (gameStart === false) gameStart = true;
      };

      p5.setup = () => {
        const canvas = p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent(gameContainerRef.current);
        canvas.mousePressed(canvasClick);
        canvas.touchStarted(canvasTouch);
        resetGame();
      };

      p5.draw = () => {
        // Draw background based on mode
        if (isDayMode) {
          p5.image(background, 0, 0);
        } else {
          // Night mode: black background with better-looking stars
          p5.background(10, 10, 30); // Dark blue-black instead of pure black
          
          // Draw twinkling stars
          p5.noStroke();
          for (let i = 0; i < 100; i++) {
            const x = (i * 157) % CANVAS_WIDTH;
            const y = (i * 211) % CANVAS_HEIGHT;
            const twinkle = p5.sin(p5.frameCount * 0.05 + i) * 0.5 + 0.5;
            const brightness = 150 + twinkle * 105;
            const size = (i % 3) + 1; // Varying star sizes
            
            p5.fill(brightness, brightness, 200 + brightness / 2);
            p5.circle(x, y, size);
            
            // Add some larger, brighter stars
            if (i % 7 === 0) {
              p5.fill(255, 255, 200, 100 + twinkle * 100);
              p5.circle(x, y, size + 2);
            }
          }
          
          // Add a moon
          p5.fill(240, 240, 180, 200);
          p5.circle(CANVAS_WIDTH - 80, 80, 60);
          p5.fill(10, 10, 30, 50);
          p5.circle(CANVAS_WIDTH - 65, 75, 55);
        }

        const level = Math.floor(score / 10) + 1;
        setCurrentLevel(level);

        if (gameStart && gameOver === false) {
          pipe.move(level - 1);
          pipe.draw();

          bird.update();
          bird.draw();

          floor.update();
          floor.draw();

          gameOver = pipe.checkCrash(bird) || bird.isDead();

          if (pipe.getScore(bird)) score++;

          if (gameOver) {
            if (score > bestScoreLocal) {
              bestScoreLocal = score;
              storage.setStorageData({ bestScore: score });
              setBestScore(score);
            }
            setFinalScore(score);
            setShowGameOver(true);
          }
        } else {
          pipe.draw();
          bird.draw();
          floor.draw();
          if (gameOver) bird.update();
          else floor.update();
        }

        if (gameStart === false && gameOver === false) {
          gameText.startText();
        }

        if (!gameOver) {
          gameText.scoreText(score, level);
        }
      };

      p5.keyPressed = (e) => {
        if (e.key === ' ') {
          if (gameOver === false) bird.jump();
          if (gameStart === false) gameStart = true;
        }
        if (e.key === 'r' && gameOver) {
          resetGame();
        }
      };

      // Expose resetGame to external calls
      window.resetFlappyGame = resetGame;
    };

    p5InstanceRef.current = new P5(sketch);

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
      }
    };
  }, [userPhoto, isDayMode]);

  const toggleMode = () => {
    setIsDayMode(!isDayMode);
  };

  const handleNewGame = () => {
    setShowGameOver(false);
    if (window.resetFlappyGame) {
      window.resetFlappyGame();
    }
  };

  const handleRevive = () => {
    window.open('https://www.effectivegatecpm.com/nsh5vc22b9?key=6221457948f63c231d5667f843bc0a1f', '_blank');
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Flappy Face',
      text: `I scored ${finalScore} on Flappy Face! Can you beat me?`,
      url: 'https://faceflappy.netlify.app'
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div style={{ backgroundColor: isDayMode ? '#272b30' : '#000', minHeight: '100vh', position: 'relative' }}>
      {/* Day/Night Mode Toggle */}
      <button
        onClick={toggleMode}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          padding: '12px 20px',
          borderRadius: '10px',
          border: 'none',
          backgroundColor: isDayMode ? '#fff' : '#333',
          color: isDayMode ? '#000' : '#fff',
          fontSize: '1.2rem',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          fontWeight: 'bold',
          transition: 'all 0.3s'
        }}
        data-testid="mode-toggle"
      >
        {isDayMode ? '🌙 Night' : '☀️ Day'}
      </button>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
        <div style={{ position: 'relative' }}>
          <div ref={gameContainerRef} style={{ position: 'relative' }}></div>

          {/* Custom Game Over Screen */}
          {showGameOver && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                padding: '40px',
                borderRadius: '20px',
                textAlign: 'center',
                zIndex: 100,
                minWidth: '350px',
                boxShadow: '0 10px 50px rgba(0,0,0,0.8)'
              }}
              data-testid="game-over-modal"
            >
              <h1 style={{ color: '#ff6b35', fontSize: '2.5rem', marginBottom: '20px', fontWeight: 'bold' }}>Game Over!</h1>
              <p style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '10px' }}>Score: {finalScore}</p>
              <p style={{ color: '#aaa', fontSize: '1.2rem', marginBottom: '10px' }}>Best: {bestScore}</p>
              <p style={{ color: '#888', fontSize: '1rem', marginBottom: '30px' }}>Level: {currentLevel}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button
                  onClick={handleRevive}
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    padding: '15px 30px',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
                  data-testid="revive-btn"
                >
                  🎬 Revive (Watch Ad)
                </button>

                <button
                  onClick={handleNewGame}
                  style={{
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    padding: '15px 30px',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff5722'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff6b35'}
                  data-testid="new-game-btn"
                >
                  🔄 New Game
                </button>

                <button
                  onClick={onUploadAnother}
                  style={{
                    backgroundColor: '#2196F3',
                    color: 'white',
                    padding: '15px 30px',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0b7dda'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
                  data-testid="upload-another-btn"
                >
                  📸 Upload Another Photo
                </button>

                <button
                  onClick={handleShare}
                  style={{
                    backgroundColor: '#9C27B0',
                    color: 'white',
                    padding: '15px 30px',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7B1FA2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#9C27B0'}
                  data-testid="share-btn"
                >
                  🔗 Share with Friends
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlappyGame;