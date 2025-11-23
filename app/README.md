# Chess for Toddlers 🎯

A simple, offline-capable web app that teaches basic chess piece movement to young children on touch devices.

## How to Run

Simply open `index.html` in any modern web browser:
- **Desktop**: Double-click `index.html` or drag it into your browser
- **Mobile/Tablet**: Transfer the `/app` folder to your device and open `index.html` in Safari/Chrome

No build step, no dependencies, no internet connection required!

## Features

- **6 Chess Pieces**: Rook, Bishop, Queen, King, Knight, Pawn
- **Visual Learning**: Tap a piece to see its legal moves highlighted on a 5×5 board
- **Mini-Game**: "Find the ⭐" - locate the star on a random legal square
- **Rewards**: Collect stickers for finding stars; celebrate after 3 wins!
- **Accessibility**: Large tap targets, high contrast, screen reader support
- **Responsive**: Works on phones, tablets, and desktop

## Controls

- **Piece Buttons**: Select a chess piece to learn its moves
- **▶ Play**: Start the "Find the ⭐" mini-game
- **💡 Show Moves / 👀 Hide Moves**: Toggle move highlights
- **🔊 Sound: On/Off**: Toggle audio feedback
- **↻ Reset**: Clear selection and start over

## Technical Details

- Pure HTML/CSS/JavaScript (no frameworks)
- Uses Unicode chess pieces (♖ ♗ ♕ ♔ ♘ ♙)
- WebAudio API for sounds
- Vibration API for haptic feedback (mobile)
- Pure DOM animations for confetti
- Fully offline-capable

Enjoy learning chess! ♟️

