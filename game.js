const canvas = document.getElementById("jigsawCanvas");
const ctx = canvas.getContext("2d");

// List of random image URLs
const imageUrls = [
    "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
    "https://picsum.photos/500/500?random=1",
    "https://picsum.photos/500/500?random=2",
    "https://picsum.photos/500/500?random=3",
    "https://picsum.photos/500/500?random=4"
];

const rows = 3; // Number of rows in the jigsaw (3)
const cols = 3; // Number of columns in the jigsaw (3)
let pieces = []; // Array to hold pieces
let selectedPiece = null; // Currently selected piece
let originalPieces = []; // Original order of pieces
let pieceWidth, pieceHeight; // Dimensions of each piece
let img = new Image(); // Image object
let usedImages = []; // Array to track used images

img.crossOrigin = "anonymous"; // Enable CORS
resizeCanvas();
loadRandomImage();

// Resize canvas to fit the screen
// Resize canvas to fit the screen, but within limits
function resizeCanvas() {
    const width = window.innerWidth * 0.9; // Canvas width 90% of window width
    const height = window.innerHeight * 0.6; // Canvas height 60% of window height
    const maxWidth = Math.min(width, 500); // Limit the max width of the canvas to 500px
    const maxHeight = Math.min(height, 500); // Limit the max height of the canvas to 500px

    canvas.width = maxWidth;
    canvas.height = maxHeight;
}


// Load random image
function loadRandomImage() {
    let randomImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];

    // Make sure the selected image hasn't been used before
    while (usedImages.includes(randomImage)) {
        randomImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];
    }

    // Add this image to the used images list
    usedImages.push(randomImage);

    img.src = randomImage;
    img.onload = () => {
        pieceWidth = canvas.width / cols;
        pieceHeight = canvas.height / rows;
        initializePieces(); // Create the pieces
        placePiecesInGrid(); // Place pieces randomly in the 3x3 grid
        drawPieces();
    };
}

// Create pieces
function initializePieces() {
    pieces = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            pieces.push({
                sx: col * pieceWidth, // Source X
                sy: row * pieceHeight, // Source Y
                row: row,
                col: col,
            });
        }
    }
    originalPieces = [...pieces];
}

// Place pieces randomly in the 3x3 grid
function placePiecesInGrid() {
    let gridPositions = [];
    for (let i = 0; i < rows * cols; i++) {
        gridPositions.push(i);
    }

    gridPositions = gridPositions.sort(() => Math.random() - 0.5);

    for (let i = 0; i < pieces.length; i++) {
        const position = gridPositions[i];
        const gridRow = Math.floor(position / cols);
        const gridCol = position % cols;
        
        pieces[i].x = gridCol * pieceWidth;
        pieces[i].y = gridRow * pieceHeight;
    }
}

// Draw the pieces on the canvas (no full image is drawn)
function drawPieces() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let piece of pieces) {
        ctx.drawImage(
            img,
            piece.sx, piece.sy, pieceWidth, pieceHeight, // Source
            piece.x, piece.y, pieceWidth, pieceHeight // Destination
        );
        ctx.strokeRect(piece.x, piece.y, pieceWidth, pieceHeight);
    }
}

// Draw the full image on the canvas
function showRealImage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw the real image
}

// Find a piece at a given position
function findPiece(x, y) {
    return pieces.find(piece => 
        x >= piece.x &&
        x <= piece.x + pieceWidth &&
        y >= piece.y &&
        y <= piece.y + pieceHeight
    );
}

// Swap positions of two pieces
function swapPieces(piece1, piece2) {
    const tempX = piece1.x;
    const tempY = piece1.y;
    piece1.x = piece2.x;
    piece1.y = piece2.y;
    piece2.x = tempX;
    piece2.y = tempY;
}

// Check if the puzzle is solved
function isSolved() {
    return pieces.every(piece => 
        piece.x === piece.col * pieceWidth &&
        piece.y === piece.row * pieceHeight
    );
}

// Handle mouse click
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedPiece = findPiece(x, y);
    if (clickedPiece) {
        if (!selectedPiece) {
            selectedPiece = clickedPiece;
            ctx.strokeStyle = "red";
            ctx.lineWidth = 3;
            ctx.strokeRect(clickedPiece.x, clickedPiece.y, pieceWidth, pieceHeight);
        } else {
            swapPieces(selectedPiece, clickedPiece);
            selectedPiece = null;
            drawPieces();
            if (isSolved()) {
                showWinModal(); // Show win popup when solved
            }
        }
    }
});

// Show the "You won!" popup modal
function showWinModal() {
    const modal = document.getElementById("winModal");
    modal.style.display = "block";
}

// Close the modal when the user clicks on the close button
document.getElementById("closeBtn").addEventListener("click", () => {
    const modal = document.getElementById("winModal");
    modal.style.display = "none";
});

// Reset button to load a new image and shuffle pieces
document.getElementById("resetButton").addEventListener("click", () => {
    usedImages = []; // Clear the used images array
    loadRandomImage(); // Load a new random image
});

// Show Real Image button
document.getElementById("showRealImageButton").addEventListener("click", showRealImage);

// Adjust canvas size on window resize
window.addEventListener("resize", resizeCanvas);
