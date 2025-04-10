import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Cactus extends GameObject {
  passed: boolean;
}

const DinoGame: React.FC = () => {
  const { theme } = useTheme();
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showModal, setShowModal] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const speedRef = useRef<number>(5);
  
  // Game objects
  const [dino, setDino] = useState<GameObject>({
    x: 50,
    y: 0,
    width: 30,
    height: 40,
  });
  
  const [cacti, setCacti] = useState<Cactus[]>([]);
  const [isJumping, setIsJumping] = useState(false);
  const [jumpHeight, setJumpHeight] = useState(0);
  
  // Initialize game
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setCacti([]);
    setIsJumping(false);
    setJumpHeight(0);
    speedRef.current = 5;
    
    // Create first cactus
    generateCactus();
    
    // Start game loop
    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(gameLoop);
  };
  
  // Game loop
  const gameLoop = (timestamp: number) => {
    if (!gameActive) return;
    
    // Calculate time delta
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    
    // Update game state
    updateDino(deltaTime);
    updateCacti(deltaTime);
    checkCollisions();
    
    // Increase score
    setScore(prev => {
      const newScore = prev + Math.floor(deltaTime * 0.01);
      // Increase game speed as score increases
      if (newScore % 100 === 0 && newScore > 0) {
        speedRef.current = Math.min(15, speedRef.current + 0.2);
      }
      return newScore;
    });
    
    if (gameActive) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  };
  
  // Update dinosaur position
  const updateDino = (deltaTime: number) => {
    if (isJumping) {
      // Handle jump physics
      const gravity = 0.003;
      setJumpHeight(prev => {
        const nextHeight = prev - gravity * deltaTime * 2;
        if (nextHeight <= 0) {
          setIsJumping(false);
          return 0;
        }
        return nextHeight;
      });
    }
    
    setDino(prev => ({
      ...prev,
      y: isJumping ? jumpHeight : 0,
    }));
  };
  
  // Generate a new cactus
  const generateCactus = () => {
    const newCactus: Cactus = {
      x: window.innerWidth,
      y: 0,
      width: 20 + Math.random() * 10,
      height: 30 + Math.random() * 20,
      passed: false,
    };
    
    setCacti(prev => [...prev, newCactus]);
  };
  
  // Update cacti positions
  const updateCacti = (deltaTime: number) => {
    const speed = speedRef.current;
    let shouldGenerateNew = false;
    
    setCacti(prev => {
      const newCacti = prev
        .map(cactus => {
          // Move cactus left
          const newX = cactus.x - speed * (deltaTime * 0.1);
          
          // Check if cactus passed dino position and score hasn't been counted
          if (!cactus.passed && newX < dino.x - dino.width) {
            shouldGenerateNew = true;
            return { ...cactus, x: newX, passed: true };
          }
          
          return { ...cactus, x: newX };
        })
        .filter(cactus => cactus.x > -cactus.width); // Remove cacti that are off-screen
      
      return newCacti;
    });
    
    // Generate new cactus when previous passes dino
    if (shouldGenerateNew && Math.random() > 0.3) {
      // Add some randomness to prevent cactus from appearing immediately
      setTimeout(() => {
        if (gameActive && !gameOver) {
          generateCactus();
        }
      }, Math.random() * 500 + 500);
    }
  };
  
  // Check for collisions
  const checkCollisions = () => {
    cacti.forEach(cactus => {
      if (
        dino.x < cactus.x + cactus.width - 5 &&
        dino.x + dino.width - 5 > cactus.x &&
        dino.height - jumpHeight * 100 > cactus.y
      ) {
        endGame();
      }
    });
  };
  
  // End the game
  const endGame = () => {
    setGameActive(false);
    setGameOver(true);
    setHighScore(prev => Math.max(prev, score));
    cancelAnimationFrame(requestRef.current);
  };
  
  // Handle jump action
  const jump = () => {
    if (!isJumping && gameActive) {
      setIsJumping(true);
      setJumpHeight(1.2); // Initial jump height
    }
  };
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === "Space" || e.code === "ArrowUp") && gameActive) {
        jump();
      } else if ((e.code === "Space" || e.code === "Enter") && !gameActive) {
        startGame();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameActive, isJumping]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, []);
  
  // Toggle the game modal
  const toggleModal = () => {
    setShowModal(prev => !prev);
  };
  
  return (
    <>
      <button
        onClick={toggleModal}
        className="fixed bottom-20 right-4 z-50 flex items-center gap-2 bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M6 16h2v2c0 1 1 2 2 2h8c1 0 2-1 2-2V8c0-1-1-2-2-2h-8c-1 0-2 1-2 2v2H6"></path>
          <line x1="10" y1="7" x2="10" y2="17"></line>
        </svg>
        Play Dino Game
      </button>
      
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <motion.div 
            className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-4 text-center border-b dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Dino Runner</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Press Space to jump, avoid the cacti!</p>
            </div>
            
            <div 
              ref={canvasRef}
              className="relative h-60 border-b border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800"
              onClick={gameActive ? jump : startGame}
            >
              {/* Ground */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300 dark:bg-gray-700"></div>
              
              {/* Score display */}
              <div className="absolute top-4 right-4 text-gray-800 dark:text-gray-200 font-mono">
                {score.toString().padStart(5, '0')}
              </div>
              
              {/* Dinosaur */}
              <div 
                className="absolute bottom-0 left-[50px] w-[30px] h-[40px]"
                style={{ transform: `translateY(-${jumpHeight * 100}px)` }}
              >
                <div className={`w-full h-full ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                    <path d="M32.5,2.5h-25c-2.8,0-5,2.2-5,5v35c0,2.8,2.2,5,5,5h25c2.8,0,5-2.2,5-5v-35C37.5,4.7,35.3,2.5,32.5,2.5z M15,37.5
                      c0,1.1-0.9,2-2,2s-2-0.9-2-2v-5c0-1.1,0.9-2,2-2s2,0.9,2,2V37.5z M29,37.5c0,1.1-0.9,2-2,2s-2-0.9-2-2v-5c0-1.1,0.9-2,2-2
                      s2,0.9,2,2V37.5z M34,20c0,1.1-0.9,2-2,2H8c-1.1,0-2-0.9-2-2v-6c0-1.1,0.9-2,2-2h24c1.1,0,2,0.9,2,2V20z"/>
                    <circle cx="27.5" cy="15" r="2.5"/>
                    <circle cx="12.5" cy="15" r="2.5"/>
                  </svg>
                </div>
              </div>
              
              {/* Cacti */}
              {cacti.map((cactus, index) => (
                <div
                  key={index}
                  className="absolute bottom-0"
                  style={{
                    left: `${cactus.x}px`,
                    width: `${cactus.width}px`,
                    height: `${cactus.height}px`,
                  }}
                >
                  <div className={`w-full h-full ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    <svg viewBox="0 0 50 60" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M25,5 L25,60 L35,60 L35,25 L40,25 L40,60 L45,60 L45,20 C45,12 38,5 30,5 L25,5 Z M15,15 L15,60 L25,60 L25,15 L15,15 Z M5,30 L5,60 L15,60 L15,35 C15,32 12,30 9,30 L5,30 Z" />
                    </svg>
                  </div>
                </div>
              ))}
              
              {/* Game over message */}
              {gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                  <div className="text-white text-2xl font-bold mb-4">GAME OVER</div>
                  <div className="text-white mb-2">Score: {score}</div>
                  <div className="text-white mb-6">High Score: {highScore}</div>
                  <button
                    className="bg-white text-gray-900 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                    onClick={startGame}
                  >
                    Play Again
                  </button>
                </div>
              )}
              
              {/* Start message */}
              {!gameActive && !gameOver && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    className="bg-primary-500 text-white px-6 py-3 rounded-md hover:bg-primary-600 transition-colors"
                    onClick={startGame}
                  >
                    Start Game
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-4 flex justify-between">
              <div className="text-gray-700 dark:text-gray-300">
                <span className="font-bold">High Score:</span> {highScore}
              </div>
              <button
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                onClick={toggleModal}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default DinoGame;