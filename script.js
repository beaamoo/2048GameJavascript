const gridContainer = document.getElementById('grid-container');
const scoreDisplay = document.getElementById('score');
let score = 0;
const gridSize = 4;
let grid = [];

function initGame() {
    // Clear the grid and fill it with zeros
    grid = [...Array(gridSize)].map(() => Array(gridSize).fill(0));
    // Add two random tiles
    addRandomTile();
    addRandomTile();
    // Redraw the grid with initial state
    drawGrid();
    updateProgressBar();
}

function drawGrid() {
    gridContainer.innerHTML = '';
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            const value = grid[i][j];
            if (value > 0) {
                tile.classList.add(`tile-${value}`);
                tile.textContent = value;
            }
            gridContainer.appendChild(tile);
        }
    }
    scoreDisplay.textContent = score;
}


function addRandomTile() {
    let available = [];
    grid.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell === 0) available.push([r, c]);
        });
    });
    if (available.length) {
        let [r, c] = available[Math.floor(Math.random() * available.length)];
        grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
}

function slideTiles(direction) {
    let hasChanged = false;

    const slideRowLeft = (row) => {
        let arr = row.filter(val => val);
        let missing = gridSize - arr.length;
        let zeros = Array(missing).fill(0);
        arr = arr.concat(zeros);
        return arr;
    };

    const combineRowLeft = (row) => {
        for (let i = 0; i < gridSize - 1; i++) {
            if (row[i] !== 0 && row[i] === row[i + 1]) {
                row[i] *= 2;
                score += row[i];
                row[i + 1] = 0;
                hasChanged = true;
            }
        }
        return row;
    };

    const rotateGrid = (grid) => {
        let newGrid = [];
        for (let i = 0; i < gridSize; i++) {
            newGrid[i] = [];
            for (let j = 0; j < gridSize; j++) {
                newGrid[i][j] = grid[j][i];
            }
        }
        return newGrid;
    };

    if (direction === 'ArrowRight') {
        grid = grid.map(row => {
            return slideRowLeft(row.slice().reverse()).reverse();
        }).map(row => {
            return combineRowLeft(row.slice().reverse()).reverse();
        }).map(row => {
            return slideRowLeft(row.slice().reverse()).reverse();
        });
        hasChanged = JSON.stringify(grid) !== JSON.stringify(grid.map(row => slideRowLeft(row.slice().reverse()).reverse()));
    } else if (direction === 'ArrowLeft') {
        grid = grid.map(row => slideRowLeft(row))
                    .map(row => combineRowLeft(row))
                    .map(row => slideRowLeft(row));
        hasChanged = JSON.stringify(grid) !== JSON.stringify(grid.map(row => slideRowLeft(row)));
    } else {
        grid = rotateGrid(grid);
        if (direction === 'ArrowDown') {
            grid = grid.map(row => {
                return slideRowLeft(row.slice().reverse()).reverse();
            }).map(row => {
                return combineRowLeft(row.slice().reverse()).reverse();
            }).map(row => {
                return slideRowLeft(row.slice().reverse()).reverse();
            });
            hasChanged = JSON.stringify(grid) !== JSON.stringify(grid.map(row => slideRowLeft(row.slice().reverse()).reverse()));
        } else if (direction === 'ArrowUp') {
            grid = grid.map(row => slideRowLeft(row))
                        .map(row => combineRowLeft(row))
                        .map(row => slideRowLeft(row));
            hasChanged = JSON.stringify(grid) !== JSON.stringify(grid.map(row => slideRowLeft(row)));
        }
        grid = rotateGrid(grid);
    }

    return hasChanged;
}


function canMakeMove() {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 0) {
                return true; // An empty tile means a move can be made
            }
            if (i !== gridSize - 1 && grid[i][j] === grid[i + 1][j]) {
                return true; // A vertical merge is possible
            }
            if (j !== gridSize - 1 && grid[i][j] === grid[i][j + 1]) {
                return true; // A horizontal merge is possible
            }
        }
    }
    return false; // No moves left
}

function updateProgressBar() {
    let maxTile = Math.max(...grid.flat());
    let progressBarHeight = document.getElementById('progress-bar-container').clientHeight;
    let totalTiles = Math.log2(2048) - 1; // Assuming 2048 is the max tile value

    let tileIndex = Math.log2(maxTile) - 1; // -1 because 2^1 is the first tile (2)
    let progress = (tileIndex / totalTiles) * progressBarHeight;

    let progressLine = document.getElementById('progress-line');
    progressLine.style.bottom = `${progress}px`;
}

document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        let pastGrid = grid.map(row => [...row]); // Copy the current grid state
        slideTiles(e.key);
        let changed = JSON.stringify(pastGrid) !== JSON.stringify(grid); // Check if the grid changed
        
        if (changed) {
            addRandomTile();
        }

        drawGrid();
        updateProgressBar();

        if (!canMakeMove()) {
            setTimeout(() => {
                alert("Game Over! Your score: " + score);
                // Optionally, restart the game or take other actions
            }, 100);
        }
    }
});

document.getElementById('restart-button').addEventListener('click', () => {
    score = 0; // Reset score
    initGame(); // Reinitialize the game
});

initGame();
