class AIAssistant {
    constructor(tetrisEngine) {
        this.tetris = tetrisEngine;
        this.isActive = false;
        this.mode = 'hint';
        this.thinking = false;
        this.predictions = [];
        this.commandHistory = [];
        
        this.initConsole();
    }
    
    activate() {
        this.isActive = true;
        this.logToConsole('AI Assistant Activated');
        this.logToConsole('Modes: Hint - Suggests moves | Auto - Plays automatically | Predict - Shows future moves');
        this.updateStatus('ACTIVE');
    }
    
    deactivate() {
        this.isActive = false;
        this.logToConsole('AI Assistant Deactivated');
        this.updateStatus('OFFLINE');
    }
    
    setMode(mode) {
        this.mode = mode;
        this.logToConsole(`Mode set to: ${mode.toUpperCase()}`);
        
        switch(mode) {
            case 'hint':
                this.startHintMode();
                break;
            case 'auto':
                this.startAutoMode();
                break;
            case 'predict':
                this.startPredictMode();
                break;
        }
    }
    
    startHintMode() {
        this.logToConsole('Hint Mode: I will suggest optimal moves');
        this.generateHint();
    }
    
    startAutoMode() {
        this.logToConsole('Auto Mode: Taking control of the game');
        this.autoPlay();
    }
    
    startPredictMode() {
        this.logToConsole('Predict Mode: Analyzing future possibilities');
        this.generatePredictions();
    }
    
    generateHint() {
        if (!this.isActive || this.mode !== 'hint' || !this.tetris.currentPiece) return;
        
        this.thinking = true;
        this.updateStatus('THINKING...');
        
        // Simulate AI thinking
        setTimeout(() => {
            const bestMove = this.calculateBestMove();
            this.displayHint(bestMove);
            this.thinking = false;
            this.updateStatus('ACTIVE');
        }, 500);
    }
    
    calculateBestMove() {
        const piece = this.tetris.currentPiece;
        const possibleMoves = [];
        
        // Simulate all possible rotations and positions
        for (let rotation = 0; rotation < 4; rotation++) {
            for (let x = -3; x < 13; x++) {
                // Test if this position is valid
                const simulatedPiece = {
                    shape: this.rotatePieceNTimes(piece.shape, rotation),
                    x: x,
                    y: piece.y
                };
                
                if (this.isValidPosition(simulatedPiece)) {
                    const score = this.evaluatePosition(simulatedPiece);
                    possibleMoves.push({
                        rotation,
                        x,
                        score,
                        piece: simulatedPiece
                    });
                }
            }
        }
        
        // Sort by score (higher is better)
        possibleMoves.sort((a, b) => b.score - a.score);
        
        return possibleMoves[0] || { rotation: 0, x: 5, score: 0 };
    }
    
    rotatePieceNTimes(shape, n) {
        let rotated = shape.map(row => [...row]);
        for (let i = 0; i < n; i++) {
            rotated = this.rotateMatrix(rotated);
        }
        return rotated;
    }
    
    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                rotated[x][rows - 1 - y] = matrix[y][x];
            }
        }
        
        return rotated;
    }
    
    isValidPosition(piece) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const boardX = piece.x + x;
                    const boardY = piece.y + y;
                    
                    if (boardX < 0 || boardX >= 10 || boardY >= 20) {
                        return false;
                    }
                    
                    if (boardY >= 0 && this.tetris.grid[boardY][boardX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    evaluatePosition(piece) {
        // Create a copy of the grid to simulate
        const tempGrid = this.tetris.grid.map(row => [...row]);
        
        // Place the piece
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const boardY = piece.y + y;
                    const boardX = piece.x + x;
                    
                    if (boardY >= 0) {
                        tempGrid[boardY][boardX] = 1;
                    }
                }
            }
        }
        
        // Calculate score based on:
        // 1. Height (lower is better)
        // 2. Complete lines
        // 3. Holes created
        // 4. Bumpiness
        
        let score = 1000; // Base score
        
        // Lower height is better
        let maxHeight = 0;
        for (let y = 0; y < 20; y++) {
            for (let x = 0; x < 10; x++) {
                if (tempGrid[y][x]) {
                    maxHeight = Math.max(maxHeight, 20 - y);
                }
            }
        }
        score -= maxHeight * 10;
        
        // Count complete lines
        let lines = 0;
        for (let y = 0; y < 20; y++) {
            if (tempGrid[y].every(cell => cell)) {
                lines++;
            }
        }
        score += lines * 100;
        
        // Count holes
        let holes = 0;
        for (let x = 0; x < 10; x++) {
            let blockFound = false;
            for (let y = 0; y < 20; y++) {
                if (tempGrid[y][x]) {
                    blockFound = true;
                } else if (blockFound) {
                    holes++;
                }
            }
        }
        score -= holes * 50;
        
        return score;
    }
    
    displayHint(bestMove) {
        const hintText = `Best move: Rotate ${bestMove.rotation} times, Move to column ${bestMove.x + 1}`;
        this.logToConsole(`HINT: ${hintText}`);
        
        // Update prediction display
        document.getElementById('best-move').textContent = 
            `Rotate ${bestMove.rotation}x, Col ${bestMove.x + 1}`;
        document.getElementById('probability').textContent = 
            `${Math.min(95, 70 + bestMove.score / 10)}%`;
        
        // Visual hint on game board
        this.drawVisualHint(bestMove);
    }
    
    drawVisualHint(bestMove) {
        const ctx = this.tetris.ctx;
        
        // Draw semi-transparent piece at suggested position
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = this.tetris.currentPiece.color;
        
        for (let y = 0; y < bestMove.piece.shape.length; y++) {
            for (let x = 0; x < bestMove.piece.shape[y].length; x++) {
                if (bestMove.piece.shape[y][x]) {
                    const pixelX = (bestMove.piece.x + x) * 30;
                    const pixelY = (bestMove.piece.y + y) * 30;
                    ctx.fillRect(pixelX, pixelY, 28, 28);
                }
            }
        }
        
        ctx.restore();
    }
    
    autoPlay() {
        if (!this.isActive || this.mode !== 'auto' || this.tetris.gameOver) return;
        
        const bestMove = this.calculateBestMove();
        
        // Execute the move
        const currentPiece = this.tetris.currentPiece;
        
        // Rotate to correct orientation
        let rotationsNeeded = bestMove.rotation;
        for (let i = 0; i < rotationsNeeded; i++) {
            this.tetris.rotatePiece();
        }
        
        // Move to correct column
        const moveDistance = bestMove.x - currentPiece.x;
        if (moveDistance !== 0) {
            const direction = moveDistance > 0 ? 1 : -1;
            for (let i = 0; i < Math.abs(moveDistance); i++) {
                this.tetris.movePiece(direction, 0);
            }
        }
        
        // Drop the piece
        this.tetris.dropPiece();
        
        // Schedule next move
        if (this.mode === 'auto') {
            setTimeout(() => this.autoPlay(), 300);
        }
    }
    
    generatePredictions() {
        if (!this.isActive || this.mode !== 'predict') return;
        
        this.predictions = [];
        const originalPiece = this.tetris.currentPiece;
        
        // Generate predictions for next 3 pieces
        for (let i = 0; i < 3; i++) {
            const simulatedPiece = this.tetris.pieces[
                (this.tetris.pieces.indexOf(
                    this.tetris.pieces.find(p => p.color === originalPiece.color)
                ) + i + 1) % 7
            ];
            
            const prediction = {
                piece: JSON.parse(JSON.stringify(simulatedPiece)),
                bestPosition: this.calculateBestMoveForPiece(simulatedPiece)
            };
            
            this.predictions.push(prediction);
        }
        
        this.displayPredictions();
    }
    
    calculateBestMoveForPiece(piece) {
        // Simplified best move calculation for prediction display
        return {
            x: Math.floor(Math.random() * 7),
            rotation: Math.floor(Math.random() * 4),
            score: Math.floor(Math.random() * 100)
        };
    }
    
    displayPredictions() {
        const predictionCanvas = document.getElementById('prediction-canvas');
        const ctx = predictionCanvas.getContext('2d');
        
        ctx.clearRect(0, 0, predictionCanvas.width, predictionCanvas.height);
        
        // Draw predicted pieces
        this.predictions.forEach((pred, index) => {
            const yOffset = index * 60;
            
            // Draw piece
            ctx.fillStyle = pred.piece.color;
            for (let y = 0; y < pred.piece.shape.length; y++) {
                for (let x = 0; x < pred.piece.shape[y].length; x++) {
                    if (pred.piece.shape[y][x]) {
                        ctx.fillRect(10 + x * 20, yOffset + 10 + y * 20, 18, 18);
                    }
                }
            }
            
            // Draw prediction info
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '10px Arial';
            ctx.fillText(
                `Pos: ${pred.bestPosition.x}, Rot: ${pred.bestPosition.rotation}`,
                100, yOffset + 30
            );
        });
    }
    
    processCommand(command) {
        this.commandHistory.push(command);
        this.logToConsole(`> ${command}`);
        
        // Simple command processing
        const cmd = command.toLowerCase().trim();
        
        if (cmd.includes('help') || cmd.includes('what can you do')) {
            this.showHelp();
        } else if (cmd.includes('score') || cmd.includes('how am i doing')) {
            this.analyzePerformance();
        } else if (cmd.includes('hint') || cmd.includes('what should i do')) {
            this.generateHint();
        } else if (cmd.includes('predict') || cmd.includes('next move')) {
            this.generatePredictions();
        } else if (cmd.includes('analyze') || cmd.includes('board')) {
            this.analyzeBoard();
        } else {
            this.logToConsole("I don't understand that command. Try: 'help', 'hint', 'analyze board', or 'predict next moves'");
        }
    }
    
    showHelp() {
        this.logToConsole("=== AI ASSISTANT HELP ===");
        this.logToConsole("Available commands:");
        this.logToConsole("- 'help': Show this help message");
        this.logToConsole("- 'hint': Get a hint for current piece");
        this.logToConsole("- 'analyze board': Get board analysis");
        this.logToConsole("- 'predict next moves': Show future predictions");
        this.logToConsole("- 'how am I doing?': Get performance analysis");
        this.logToConsole("=== END HELP ===");
    }
    
    analyzePerformance() {
        const tetris = this.tetris;
        const efficiency = (tetris.lines / (tetris.score / 1000)).toFixed(2);
        
        this.logToConsole("=== PERFORMANCE ANALYSIS ===");
        this.logToConsole(`Score: ${tetris.score}`);
        this.logToConsole(`Lines: ${tetris.lines}`);
        this.logToConsole(`Level: ${tetris.level}`);
        this.logToConsole(`Efficiency: ${efficiency} lines per 1000 points`);
        
        if (efficiency > 5) {
            this.logToConsole("You're doing GREAT! Keep it up!");
        } else if (efficiency > 3) {
            this.logToConsole("Good performance! Try to clear more lines at once.");
        } else {
            this.logToConsole("Room for improvement! Focus on clearing multiple lines.");
        }
        this.logToConsole("=== END ANALYSIS ===");
    }
    
    analyzeBoard() {
        const grid = this.tetris.grid;
        let holes = 0;
        let height = 0;
        
        for (let x = 0; x < 10; x++) {
            let columnHeight = 0;
            let foundBlock = false;
            
            for (let y = 0; y < 20; y++) {
                if (grid[y][x]) {
                    columnHeight = 20 - y;
                    foundBlock = true;
                } else if (foundBlock) {
                    holes++;
                }
            }
            
            height = Math.max(height, columnHeight);
        }
        
        this.logToConsole("=== BOARD ANALYSIS ===");
        this.logToConsole(`Maximum height: ${height}`);
        this.logToConsole(`Number of holes: ${holes}`);
        this.logToConsole(`Recommendation: ${holes > 5 ? 'Focus on filling holes' : 'Board looks good!'}`);
        this.logToConsole("=== END ANALYSIS ===");
    }
    
    analyzeGameOver() {
        this.logToConsole("=== GAME OVER ANALYSIS ===");
        this.logToConsole(`Final Score: ${this.tetris.score}`);
        this.logToConsole(`Total Lines: ${this.tetris.lines}`);
        this.logToConsole(`Highest Level: ${this.tetris.level}`);
        this.logToConsole("Tips for next game:");
        this.logToConsole("1. Try to keep the board flat");
        this.logToConsole("2. Leave space for I pieces (4-line clears)");
        this.logToConsole("3. Don't panic when the speed increases");
        this.logToConsole("=== END ANALYSIS ===");
    }
    
    update() {
        if (!this.isActive) return;
        
        switch(this.mode) {
            case 'hint':
                // Update hint every 5 seconds
                if (Math.random() < 0.01) { // 1% chance per frame
                    this.generateHint();
                }
                break;
            case 'predict':
                // Update predictions when piece changes
                if (!this.lastPiece || this.lastPiece !== this.tetris.currentPiece) {
                    this.generatePredictions();
                    this.lastPiece = this.tetris.currentPiece;
                }
                break;
        }
    }
    
    logToConsole(message) {
        const consoleOutput = document.getElementById('ai-output');
        consoleOutput.innerHTML += `> ${message}<br>`;
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
    
    updateStatus(status) {
        document.getElementById('ai-thinking').textContent = `AI: ${status}`;
    }
    
    initConsole() {
        // Add some initial console messages
        setTimeout(() => {
            this.logToConsole('NeuroBlox AI Initialized');
            this.logToConsole('Type "help" for available commands');
        }, 1000);
    }
}