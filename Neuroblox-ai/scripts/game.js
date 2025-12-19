class NeuroBloxGame {
    constructor() {
        this.tetris = new TetrisEngine('game-canvas', 'next-canvas');
        this.aiAssistant = new AIAssistant(this.tetris);
        this.isRunning = false;
        this.gameLoop = null;
        this.lastTime = 0;
        this.dropInterval = 1000; // Start at 1 second per drop
        
        this.initControls();
        this.initAI();
    }
    
    initControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.tetris.gameOver || this.tetris.isPaused) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.tetris.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    this.tetris.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    this.tetris.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    this.tetris.rotatePiece();
                    break;
                case ' ':
                    this.tetris.dropPiece();
                    break;
                case 'p':
                    this.togglePause();
                    break;
            }
        });
        
        // Button controls
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
        
        // Difficulty selector
        document.getElementById('difficulty').addEventListener('change', (e) => {
            const speeds = { easy: 1200, medium: 1000, hard: 700, insane: 400 };
            this.dropInterval = speeds[e.target.value];
        });
    }
    
    initAI() {
        const aiToggle = document.getElementById('ai-toggle');
        aiToggle.addEventListener('click', () => {
            if (this.aiAssistant.isActive) {
                this.aiAssistant.deactivate();
                aiToggle.textContent = 'ACTIVATE AI';
                document.getElementById('ai-status').textContent = 'OFFLINE';
            } else {
                this.aiAssistant.activate();
                aiToggle.textContent = 'DEACTIVATE AI';
                document.getElementById('ai-status').textContent = 'ONLINE';
            }
        });
        
        // AI mode selection
        document.querySelectorAll('input[name="ai-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.aiAssistant.setMode(e.target.value);
            });
        });
        
        // AI command input
        document.getElementById('ai-command').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = e.target.value;
                this.aiAssistant.processCommand(command);
                e.target.value = '';
            }
        });
    }
    
    startGame() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.tetris.gameOver = false;
        this.lastTime = performance.now();
        
        this.gameLoop = requestAnimationFrame((currentTime) => this.update(currentTime));
    }
    
    update(currentTime) {
        if (!this.isRunning || this.tetris.gameOver || this.tetris.isPaused) {
            if (this.tetris.gameOver) {
                this.gameOver();
            }
            return;
        }
        
        const deltaTime = currentTime - this.lastTime;
        
        if (deltaTime > this.dropInterval) {
            this.tetris.movePiece(0, 1);
            this.lastTime = currentTime;
            
            // Update drop speed based on level
            this.dropInterval = Math.max(100, 1000 - (this.tetris.level * 50));
        }
        
        // Update FPS counter
        const fps = Math.round(1000 / deltaTime);
        document.getElementById('fps-counter').textContent = `FPS: ${fps}`;
        
        // AI assistant thinking
        if (this.aiAssistant.isActive) {
            this.aiAssistant.update();
        }
        
        this.gameLoop = requestAnimationFrame((nextTime) => this.update(nextTime));
    }
    
    togglePause() {
        this.tetris.isPaused = !this.tetris.isPaused;
        const btn = document.getElementById('pause-btn');
        btn.textContent = this.tetris.isPaused ? 'RESUME' : 'PAUSE';
        
        if (!this.tetris.isPaused && this.isRunning) {
            this.lastTime = performance.now();
            this.gameLoop = requestAnimationFrame((time) => this.update(time));
        }
    }
    
    resetGame() {
        this.isRunning = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        this.tetris.reset();
        document.getElementById('pause-btn').textContent = 'PAUSE';
    }
    
    gameOver() {
        this.isRunning = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        
        // Show game over message
        const ctx = this.tetris.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.tetris.canvas.width, this.tetris.canvas.height);
        
        ctx.fillStyle = '#FF0000';
        ctx.font = '30px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', 150, 250);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px "Press Start 2P"';
        ctx.fillText(`FINAL SCORE: ${this.tetris.score}`, 150, 300);
        
        // AI analysis of game
        if (this.aiAssistant.isActive) {
            this.aiAssistant.analyzeGameOver();
        }
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    const game = new NeuroBloxGame();
    window.neuroBloxGame = game; // Make accessible for debugging
});