// Retro UI Effects and Enhancements

class RetroUIEffects {
    constructor() {
        this.initScreenEffects();
        this.initButtonEffects();
        this.initTypingEffect();
        this.initCRTEffect();
    }
    
    initScreenEffects() {
        // Add scanlines effect
        const scanlines = document.createElement('div');
        scanlines.id = 'scanlines';
        scanlines.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                to bottom,
                transparent 50%,
                rgba(0, 0, 0, 0.2) 50%
            );
            background-size: 100% 4px;
            pointer-events: none;
            z-index: 9999;
            opacity: 0.3;
        `;
        document.body.appendChild(scanlines);
        
        // Add vignette effect
        const vignette = document.createElement('div');
        vignette.id = 'vignette';
        vignette.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.7);
            pointer-events: none;
            z-index: 9998;
        `;
        document.body.appendChild(vignette);
    }
    
    initButtonEffects() {
        // Add click sound to all retro buttons
        document.querySelectorAll('.retro-button, .win-btn').forEach(button => {
            button.addEventListener('mousedown', () => {
                GameUtils.playSound('move');
            });
        });
        
        // Add hover effect
        document.querySelectorAll('.retro-button').forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.backgroundColor = '#d0d0d0';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.backgroundColor = '#c0c0c0';
            });
        });
    }
    
    initTypingEffect() {
        // Typewriter effect for AI console
        const consoleOutput = document.getElementById('ai-output');
        if (consoleOutput) {
            const originalText = consoleOutput.innerHTML;
            consoleOutput.innerHTML = '';
            
            let i = 0;
            const typeWriter = () => {
                if (i < originalText.length) {
                    consoleOutput.innerHTML += originalText.charAt(i);
                    i++;
                    setTimeout(typeWriter, 10);
                }
            };
            
            setTimeout(typeWriter, 500);
        }
    }
    
    initCRTEffect() {
        // CRT curvature effect
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.borderRadius = '10px';
            gameContainer.style.boxShadow = 
                'inset 0 0 20px rgba(0, 255, 0, 0.1), 0 0 30px rgba(0, 255, 0, 0.1)';
            
            // Add bezel
            const bezel = document.createElement('div');
            bezel.style.cssText = `
                position: absolute;
                top: -10px;
                left: -10px;
                right: -10px;
                bottom: -10px;
                border: 15px solid #333;
                border-radius: 20px;
                pointer-events: none;
                z-index: 1;
                box-shadow: 
                    inset 0 0 30px #000,
                    0 0 40px rgba(0, 0, 0, 0.5);
            `;
            gameContainer.style.position = 'relative';
            gameContainer.appendChild(bezel);
        }
    }
    
    static showGlitchEffect(element, duration = 500) {
        const originalBackground = element.style.backgroundColor;
        const originalText = element.textContent;
        
        let glitchCount = 0;
        const glitchInterval = setInterval(() => {
            // Random color glitch
            element.style.backgroundColor = 
                `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
            
            // Text glitch
            if (Math.random() > 0.7) {
                element.textContent = originalText.split('').map(() => 
                    Math.random() > 0.5 ? String.fromCharCode(33 + Math.random() * 90) : ' '
                ).join('');
            }
            
            glitchCount++;
            if (glitchCount > 10) {
                clearInterval(glitchInterval);
                element.style.backgroundColor = originalBackground;
                element.textContent = originalText;
            }
        }, 50);
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    new RetroUIEffects();
});