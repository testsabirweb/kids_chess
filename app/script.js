// Game State
const state = {
    selectedPiece: 'rook', // Default to rook
    showMoves: false,
    soundOn: true,
    gameActive: false,
    starIndex: null,
    stickers: [],
    centerIndex: 12, // Center of 5x5 board (0-24)
    recentStarPositions: [] // Track recent star positions for variety
};

// Piece Unicode Map
const pieceMap = {
    rook: '♖',
    bishop: '♗',
    queen: '♕',
    king: '♔',
    knight: '♘',
    pawn: '♙'
};

// Sticker Emojis
const stickerEmojis = ['🐶', '🐱', '🐻', '🐼', '🦁', '🐯', '🐸', '🐰', '🐨', '🐵', 
                       '🚀', '⭐', '🎈', '🎁', '🍎', '🍌', '🍪', '🍰', '🎂', '🧁',
                       '🌈', '🌙', '☀️', '⭐', '💫', '🎉', '🎊', '🏆', '🥇', '🎯'];

// DOM Elements
const board = document.getElementById('board');
const hint = document.getElementById('hint');
const playBtn = document.getElementById('play-btn');
const showMovesBtn = document.getElementById('show-moves-btn');
const soundBtn = document.getElementById('sound-btn');
const resetBtn = document.getElementById('reset-btn');
const stickersRow = document.getElementById('stickers-row');
const modalOverlay = document.getElementById('modal-overlay');
const playAgainBtn = document.getElementById('play-again-btn');

// Initialize Board (5x5 = 25 cells)
function initBoard() {
    board.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.setAttribute('role', 'gridcell');
        const row = Math.floor(i / 5) + 1;
        const col = (i % 5) + 1;
        cell.setAttribute('aria-label', `Row ${row} Column ${col}`);
        cell.dataset.index = i;
        
        // Mark center cell
        if (i === state.centerIndex) {
            cell.classList.add('center');
        }
        
        cell.addEventListener('click', () => handleCellClick(i));
        board.appendChild(cell);
    }
}

// Calculate Legal Moves for Each Piece from Center (index 12)
function getLegalMoves(piece, centerIndex = 12) {
    const moves = {
        legal: [], // Blue highlights
        move: [],  // Green (pawn forward)
        cap: []    // Red (pawn captures)
    };
    
    const row = Math.floor(centerIndex / 5);
    const col = centerIndex % 5;
    
    switch (piece) {
        case 'rook':
            // Same row and column (excluding center)
            for (let i = 0; i < 5; i++) {
                if (i !== col) moves.legal.push(row * 5 + i); // Same row
                if (i !== row) moves.legal.push(i * 5 + col); // Same column
            }
            break;
            
        case 'bishop':
            // Diagonals
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    if (i === row && j === col) continue;
                    const rowDiff = Math.abs(i - row);
                    const colDiff = Math.abs(j - col);
                    if (rowDiff === colDiff) {
                        moves.legal.push(i * 5 + j);
                    }
                }
            }
            break;
            
        case 'queen':
            // Rook + Bishop
            const rookMoves = getLegalMoves('rook', centerIndex);
            const bishopMoves = getLegalMoves('bishop', centerIndex);
            moves.legal = [...rookMoves.legal, ...bishopMoves.legal];
            break;
            
        case 'king':
            // 8 neighbors (within bounds)
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    const newRow = row + i;
                    const newCol = col + j;
                    if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5) {
                        moves.legal.push(newRow * 5 + newCol);
                    }
                }
            }
            break;
            
        case 'knight':
            // L-jumps: (±1,±2) or (±2,±1)
            const knightMoves = [
                [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                [1, -2], [1, 2], [2, -1], [2, 1]
            ];
            knightMoves.forEach(([dr, dc]) => {
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5) {
                    moves.legal.push(newRow * 5 + newCol);
                }
            });
            break;
            
        case 'pawn':
            // Forward = one square "up" (toward lower index rows, i.e., row - 1)
            // Captures = two diagonals forward
            const forwardRow = row - 1;
            if (forwardRow >= 0) {
                moves.move.push(forwardRow * 5 + col); // Forward move (green)
                
                // Diagonal captures (red)
                if (col - 1 >= 0) {
                    moves.cap.push(forwardRow * 5 + (col - 1));
                }
                if (col + 1 < 5) {
                    moves.cap.push(forwardRow * 5 + (col + 1));
                }
            }
            break;
    }
    
    return moves;
}

// Show/Hide Moves on Board
function updateMoveHighlights() {
    // Clear all highlights
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('hl-legal', 'hl-move', 'hl-cap');
        // Remove star only if game is not active (preserve star during mini-game)
        if (!state.gameActive) {
            const star = cell.querySelector('.star');
            if (star) star.remove();
        }
        // Remove piece icon if exists
        const pieceIcon = cell.querySelector('.piece-on-board');
        if (pieceIcon) pieceIcon.remove();
    });
    
    if (!state.selectedPiece || (!state.showMoves && !state.gameActive)) return;
    
    const moves = getLegalMoves(state.selectedPiece);
    
    // Apply highlights
    moves.legal.forEach(index => {
        const cell = document.querySelector(`[data-index="${index}"]`);
        if (cell) cell.classList.add('hl-legal');
    });
    
    moves.move.forEach(index => {
        const cell = document.querySelector(`[data-index="${index}"]`);
        if (cell) cell.classList.add('hl-move');
    });
    
    moves.cap.forEach(index => {
        const cell = document.querySelector(`[data-index="${index}"]`);
        if (cell) cell.classList.add('hl-cap');
    });
    
    // Show piece icon on center
    const centerCell = document.querySelector(`[data-index="${state.centerIndex}"]`);
    if (centerCell && pieceMap[state.selectedPiece]) {
        const pieceIcon = document.createElement('span');
        pieceIcon.className = 'piece-on-board';
        pieceIcon.textContent = pieceMap[state.selectedPiece];
        centerCell.appendChild(pieceIcon);
    }
    
    // Re-add star if game is active
    if (state.gameActive && state.starIndex !== null) {
        const starCell = document.querySelector(`[data-index="${state.starIndex}"]`);
        if (starCell && !starCell.querySelector('.star')) {
            const star = document.createElement('span');
            star.className = 'star';
            star.textContent = '⭐';
            star.setAttribute('aria-label', 'Target star');
            starCell.appendChild(star);
        }
    }
}

// WebAudio Helper
const audioContext = (() => {
    try {
        return new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        return null;
    }
})();

function playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!state.soundOn || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        // Graceful failure
    }
}

function playClickSound() {
    playTone(440, 0.1, 'sine', 0.2);
}

function playSuccessSound() {
    // Cheer chord
    playTone(523, 0.15, 'sine', 0.25); // C
    setTimeout(() => playTone(659, 0.15, 'sine', 0.25), 50); // E
    setTimeout(() => playTone(784, 0.2, 'sine', 0.3), 100); // G
}

function playMissSound() {
    playTone(200, 0.3, 'triangle', 0.15);
}

// Vibration Helper
function vibrate(pattern) {
    if ('vibrate' in navigator) {
        try {
            navigator.vibrate(pattern);
        } catch (e) {
            // Graceful failure
        }
    }
}

// Confetti Effect with variety
function createConfetti(x, y) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];
    const rainbowColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
    const shapes = ['circle', 'square', 'star'];
    const count = 35;
    
    // Occasionally use rainbow effect (20% chance)
    const useRainbow = Math.random() < 0.2;
    const colorPalette = useRainbow ? rainbowColors : colors;
    
    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        confetti.className = `confetti ${shape}`;
        confetti.style.left = x + 'px';
        confetti.style.top = y + 'px';
        confetti.style.background = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        confetti.style.borderColor = useRainbow ? colorPalette[Math.floor(Math.random() * colorPalette.length)] : 'transparent';
        confetti.style.position = 'fixed';
        confetti.style.pointerEvents = 'none';
        
        // Add rotation for visual interest
        const rotation = Math.random() * 360;
        confetti.style.transform = `rotate(${rotation}deg)`;
        
        document.body.appendChild(confetti);
        
        const angle = (Math.PI * 2 * i) / count;
        const velocity = 50 + Math.random() * 50;
        let vx = Math.cos(angle) * velocity;
        let vy = Math.sin(angle) * velocity;
        
        let px = x;
        let py = y;
        let frame = 0;
        const maxFrames = 60;
        const rotationSpeed = (Math.random() - 0.5) * 10; // Random rotation speed
        
        function animate() {
            frame++;
            px += vx * 0.1;
            py += vy * 0.1 + frame * 0.5; // Gravity
            vy += 0.5;
            
            // Add rotation during animation
            const currentRotation = rotation + frame * rotationSpeed;
            
            confetti.style.left = px + 'px';
            confetti.style.top = py + 'px';
            confetti.style.opacity = Math.max(0, 1 - (frame / maxFrames));
            confetti.style.transform = `rotate(${currentRotation}deg)`;
            
            if (frame < maxFrames) {
                requestAnimationFrame(animate);
            } else {
                // Ensure cleanup
                if (confetti.parentNode) {
                    confetti.remove();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // If rainbow effect, add extra sparkle
    if (useRainbow) {
        setTimeout(() => createConfetti(x, y), 100); // Second burst for rainbow
    }
}

// Add Sticker
function addSticker() {
    const emoji = stickerEmojis[Math.floor(Math.random() * stickerEmojis.length)];
    state.stickers.push(emoji);
    
    const sticker = document.createElement('span');
    sticker.className = 'sticker';
    sticker.textContent = emoji;
    sticker.setAttribute('aria-label', 'Reward sticker');
    stickersRow.appendChild(sticker);
    
    // Check for 5 stickers
    if (state.stickers.length >= 5) {
        setTimeout(() => {
            modalOverlay.classList.add('show');
            modalOverlay.setAttribute('aria-hidden', 'false');
        }, 500);
    }
}

// Clean up any leftover confetti
function cleanupConfetti() {
    const confettiElements = document.querySelectorAll('.confetti');
    confettiElements.forEach(el => {
        if (el.parentNode) {
            el.remove();
        }
    });
}

// Handle Cell Click
function handleCellClick(index) {
    playClickSound();
    
    if (state.gameActive && state.starIndex === index) {
        // Success!
        const cell = document.querySelector(`[data-index="${index}"]`);
        const rect = cell.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        playSuccessSound();
        vibrate([100, 50, 100]);
        createConfetti(x, y);
        addSticker();
        
        // Remove star
        const star = cell.querySelector('.star');
        if (star) star.remove();
        
        state.gameActive = false;
        state.starIndex = null;
        hint.textContent = 'Great job! Tap a piece to play again!';
        playBtn.disabled = false;
        
    } else if (state.gameActive && state.starIndex !== null) {
        // Miss
        playMissSound();
        vibrate(100);
        board.classList.add('shake');
        setTimeout(() => board.classList.remove('shake'), 500);
    }
}

// Piece Selection
document.querySelectorAll('.piece-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const piece = btn.dataset.piece;
        state.selectedPiece = piece;
        
        // Update UI
        document.querySelectorAll('.piece-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        playBtn.disabled = false;
        showMovesBtn.disabled = false;
        hint.textContent = `Selected: ${piece.charAt(0).toUpperCase() + piece.slice(1)}. Tap "Show Moves" or "Play"!`;
        
        // Clear game state
        state.gameActive = false;
        state.starIndex = null;
        // Don't clear recentStarPositions when switching pieces - allows variety across pieces
        
        // Clean up any leftover confetti when switching pieces
        cleanupConfetti();
        
        updateMoveHighlights();
    });
});

// Play Button
playBtn.addEventListener('click', () => {
    if (!state.selectedPiece) return;
    
    const moves = getLegalMoves(state.selectedPiece);
    let validTargets = [];
    
    // Collect all valid targets
    if (state.selectedPiece === 'pawn') {
        validTargets = [...moves.move, ...moves.cap];
    } else {
        validTargets = moves.legal;
    }
    
    if (validTargets.length === 0) {
        hint.textContent = 'No valid moves from center!';
        return;
    }
    
    // Improve star placement: ensure variety and avoid recent positions
    let availableTargets = validTargets.filter(pos => 
        !state.recentStarPositions.includes(pos)
    );
    
    // If all positions were recently used, reset and use all
    if (availableTargets.length === 0) {
        availableTargets = validTargets;
        state.recentStarPositions = [];
    }
    
    // Add variety by preferring different board regions
    // Group targets by board region (corners, edges, inner)
    const corners = [0, 4, 20, 24];
    const edges = [1, 2, 3, 5, 9, 10, 14, 15, 19, 21, 22, 23];
    const inner = [6, 7, 8, 11, 13, 16, 17, 18];
    
    // Separate available targets by region
    const cornerTargets = availableTargets.filter(pos => corners.includes(pos));
    const edgeTargets = availableTargets.filter(pos => edges.includes(pos));
    const innerTargets = availableTargets.filter(pos => inner.includes(pos));
    
    // Prefer regions that haven't been used recently (weighted random selection)
    let weightedTargets = [];
    
    // Check which regions were used recently
    const recentCorners = state.recentStarPositions.filter(pos => corners.includes(pos)).length;
    const recentEdges = state.recentStarPositions.filter(pos => edges.includes(pos)).length;
    const recentInner = state.recentStarPositions.filter(pos => inner.includes(pos)).length;
    
    // Add targets with weights (less recently used = higher weight)
    if (cornerTargets.length > 0) {
        const weight = Math.max(1, 4 - recentCorners);
        weightedTargets.push(...Array(weight).fill(cornerTargets).flat());
    }
    if (edgeTargets.length > 0) {
        const weight = Math.max(1, 4 - recentEdges);
        weightedTargets.push(...Array(weight).fill(edgeTargets).flat());
    }
    if (innerTargets.length > 0) {
        const weight = Math.max(1, 4 - recentInner);
        weightedTargets.push(...Array(weight).fill(innerTargets).flat());
    }
    
    // Fallback to all available if weighted is empty
    if (weightedTargets.length === 0) {
        weightedTargets = availableTargets;
    }
    
    // Shuffle for better variety
    const shuffled = [...weightedTargets].sort(() => Math.random() - 0.5);
    
    // Choose from shuffled array
    const randomIndex = Math.floor(Math.random() * shuffled.length);
    state.starIndex = shuffled[randomIndex];
    
    // Track this position (keep last 3-5 positions)
    state.recentStarPositions.push(state.starIndex);
    if (state.recentStarPositions.length > Math.min(5, validTargets.length - 1)) {
        state.recentStarPositions.shift(); // Remove oldest
    }
    
    state.gameActive = true;
    
    // Show star
    const cell = document.querySelector(`[data-index="${state.starIndex}"]`);
    if (cell) {
        const star = document.createElement('span');
        star.className = 'star';
        star.textContent = '⭐';
        star.setAttribute('aria-label', 'Target star');
        cell.appendChild(star);
    }
    
    // Show moves
    state.showMoves = true;
    updateMoveHighlights();
    showMovesBtn.textContent = '👀 Hide Moves';
    
    hint.textContent = 'Find the ⭐ and tap it!';
    playBtn.disabled = true;
});

// Show/Hide Moves Button
showMovesBtn.addEventListener('click', () => {
    state.showMoves = !state.showMoves;
    updateMoveHighlights();
    showMovesBtn.textContent = state.showMoves ? '👀 Hide Moves' : '💡 Show Moves';
});

// Sound Toggle
soundBtn.addEventListener('click', () => {
    state.soundOn = !state.soundOn;
    soundBtn.textContent = state.soundOn ? '🔊 Sound: On' : '🔇 Sound: Off';
});

// Reset Button
resetBtn.addEventListener('click', () => {
    state.selectedPiece = null;
    state.showMoves = false;
    state.gameActive = false;
    state.starIndex = null;
    state.recentStarPositions = []; // Clear recent positions on reset
    
    // Clean up any leftover confetti
    cleanupConfetti();
    
    document.querySelectorAll('.piece-btn').forEach(b => b.classList.remove('selected'));
    playBtn.disabled = true;
    showMovesBtn.disabled = true;
    showMovesBtn.textContent = '💡 Show Moves';
    hint.textContent = 'Tap a piece to see how it moves!';
    
    updateMoveHighlights();
});

// Play Again Button (in modal)
playAgainBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('show');
    modalOverlay.setAttribute('aria-hidden', 'true');
    
    // Clear stickers
    state.stickers = [];
    stickersRow.innerHTML = '';
    
    // Reset game state but keep piece selection
    state.gameActive = false;
    state.starIndex = null;
    updateMoveHighlights();
    playBtn.disabled = false;
    hint.textContent = 'Great! Find 5 more stars!';
});

// Initialize
initBoard();

// Set default piece (rook) on load
// Since script is at end of body, DOM is already loaded
setTimeout(() => {
    const rookBtn = document.querySelector('[data-piece="rook"]');
    if (rookBtn) {
        // Trigger selection logic
        rookBtn.classList.add('selected');
        playBtn.disabled = false;
        showMovesBtn.disabled = false;
        hint.textContent = 'Selected: Rook. Tap "Show Moves" or "Play"!';
        // Show moves by default
        state.showMoves = true;
        updateMoveHighlights();
        showMovesBtn.textContent = '👀 Hide Moves';
    }
}, 0);

