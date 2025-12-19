class TetrisEngine {
    constructor(canvasId, nextCanvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById(nextCanvasId);
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.grid = Array(20).fill().map(() => Array(10).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.isPaused = false;
        
        // Tetromino definitions
        this.pieces = [
            { shape: [[1,1,1,1]], color: '#00FFFF' }, // I
            { shape: [[1,1],[1,1]], color: '#FFFF00' }, // O
            { shape: [[0,1,0],[1,1,1]], color: '#800080' }, // T
            { shape: [[1,1,0],[0,1,1]], color: '#00FF00' }, // S
            { shape: [[0,1,1],[1,1,0]], color: '#FF0000' }, // Z
            { shape: [[1,0,0],[1,1,1]], color: '#0000FF' }, // J
            { shape: [[0,0,1],[1,1,1]], color: '#FFA500' }  // L
        ];
        
        this.init();
    }
    
    init() {
        this.spawnPiece();
        this.spawnNextPiece();
        this.draw();
    }
    
    spawnPiece() {
        this.currentPiece = this.nextPiece || this.getRandomPiece();
        this.currentPiece.x = Math.floor(10 / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
        this.currentPiece.y = 0;
        this.spawnNextPiece();
    }
    
    spawnNextPiece() {
        this.nextPiece = this.getRandomPiece();
        this.drawNextPiece();
    }
    
    getRandomPiece() {
        const piece = JSON.parse(JSON.stringify(this.pieces[Math.floor(Math.random() * 7)]));
        piece.shape = piece.shape.map(row => [...row]);
        return piece;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw placed pieces
        this.drawPlacedPieces();
        
        // Draw current piece
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece, this.ctx);
        }
        
        // Draw grid lines
        this.drawGridLines();
    }
    
    drawNextPiece() {
        this.nextCtx.fillStyle = '#000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            this.drawPiece(this.nextPiece, this.nextCtx, 25, 25);
        }
    }
    
    drawPiece(piece, ctx, offsetX = 0, offsetY = 0) {
        ctx.fillStyle = piece.color;
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const pixelX = (piece.x + x) * 30 + offsetX;
                    const pixelY = (piece.y + y) * 30 + offsetY;
                    ctx.fillRect(pixelX, pixelY, 28, 28);
                    ctx.strokeStyle = '#FFF';
                    ctx.strokeRect(pixelX, pixelY, 28, 28);
                }
            }
        }
    }
    
    drawGrid() {
        for (let y = 0; y < 20; y++) {
            for (let x = 0; x < 10; x++) {
                if (this.grid[y][x]) {
                    this.ctx.fillStyle = this.getColorForValue(this.grid[y][x]);
                    this.ctx.fillRect(x * 30, y * 30, 28, 28);
                }
            }
        }
    }
    
    drawGridLines() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= 10; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * 30, 0);
            this.ctx.lineTo(x * 30, 600);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= 20; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * 30);
            this.ctx.lineTo(300, y * 30);
            this.ctx.stroke();
        }
    }
    
    drawPlacedPieces() {
        for (let y = 0; y < 20; y++) {
            for (let x = 0; x < 10; x++) {
                if (this.grid[y][x]) {
                    this.ctx.fillStyle = this.getColorForValue(this.grid[y][x]);
                    this.ctx.fillRect(x * 30, y * 30, 28, 28);
                    this.ctx.strokeStyle = '#FFF';
                    this.ctx.strokeRect(x * 30, y * 30, 28, 28);
                }
            }
        }
    }
    
    getColorForValue(value) {
        const colors = ['#000', '#00FFFF', '#FFFF00', '#800080', 
                       '#00FF00', '#FF0000', '#0000FF', '#FFA500'];
        return colors[value] || '#000';
    }
    
    movePiece(dx, dy) {
        if (!this.currentPiece || this.gameOver || this.isPaused) return false;
        
        this.currentPiece.x += dx;
        this.currentPiece.y += dy;
        
        if (this.checkCollision()) {
            this.currentPiece.x -= dx;
            this.currentPiece.y -= dy;
            
            if (dy > 0) {
                this.lockPiece();
                this.clearLines();
                this.spawnPiece();
                if (this.checkCollision()) {
                    this.gameOver = true;
                }
            }
            return false;
        }
        
        this.draw();
        return true;
    }
    
    rotatePiece() {
        if (!this.currentPiece || this.gameOver || this.isPaused) return;
        
        const originalShape = this.currentPiece.shape.map(row => [...row]);
        const rows = originalShape.length;
        const cols = originalShape[0].length;
        
        // Transpose matrix
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                rotated[x][rows - 1 - y] = originalShape[y][x];
            }
        }
        
        this.currentPiece.shape = rotated;
        
        if (this.checkCollision()) {
            this.currentPiece.shape = originalShape;
        }
        
        this.draw();
    }
    
    checkCollision() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    
                    if (boardX < 0 || boardX >= 10 || 
                        boardY >= 20 || 
                        (boardY >= 0 && this.grid[boardY][boardX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    lockPiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    
                    if (boardY >= 0) {
                        // Store color index
                        const colorIndex = this.pieces.findIndex(p => p.color === this.currentPiece.color) + 1;
                        this.grid[boardY][boardX] = colorIndex;
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = 19; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                // Remove line
                this.grid.splice(y, 1);
                // Add new empty line at top
                this.grid.unshift(Array(10).fill(0));
                linesCleared++;
                y++; // Check same line again after shift
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            
            // Update UI
            document.getElementById('score').textContent = this.score.toString().padStart(5, '0');
            document.getElementById('level').textContent = this.level.toString().padStart(2, '0');
            document.getElementById('lines').textContent = this.lines;
        }
    }
    
    dropPiece() {
        while (this.movePiece(0, 1)) {}
    }
    
    reset() {
        this.grid = Array(20).fill().map(() => Array(10).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.isPaused = false;
        
        document.getElementById('score').textContent = '00000';
        document.getElementById('level').textContent = '01';
        document.getElementById('lines').textContent = '0';
        
        this.spawnPiece();
        this.draw();
    }
}