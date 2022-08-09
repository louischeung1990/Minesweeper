/*----- constants -----*/
const cellWidth = 30; //px
const difficultyParameters = [
    {difficulty: 'easy', gridSize: 9, mines: 10},
    {difficulty: 'medium', gridSize: 16, mines: 40},
    {difficulty: 'hard', gridSize: 22, mines: 99},
];

/*----- app's state (variables) -----*/
let gameOver = false;
let difficultySelected;
let boardState = [];
let cellsRemaining;
let flagsPlanted;

/*----- cached element references -----*/
const diffEl = document.querySelectorAll('.difficulty');
const resetEl = document.getElementById('reset');
const messageEl = document.getElementById('message');
const totalMinesEl = document.getElementById('mines');
const flagsEl = document.getElementById('flags')
const gameAreaEl = document.getElementById('gameArea');
const devModeEl = document.getElementById('dev-mode');
let cellEl = document.querySelectorAll('.cell');

/*----- event listeners -----*/
for (let i = 0; i < diffEl.length; i++) {diffEl[i].addEventListener('click', setDifficulty)};
resetEl.addEventListener('click', init);
devModeEl.addEventListener('click', revealMines);
gameAreaEl.addEventListener('click', gridClick);
document.addEventListener('contextmenu', event => event.preventDefault());
gameAreaEl.addEventListener('mouseup', plantFlag);

/*----- functions -----*/
init();

function init() {
    flagsPlanted = 0;
    flagsEl.textContent = 'Flags used: ';
    totalMinesEl.textContent = 'Total mines: ';
    boardState = [];
    if (difficultySelected) {
        for (let i = 0; i < difficultySelected.gridSize; i++) {
            document.querySelector('.row').remove();
        }
    }
    for (let i = 0; i < diffEl.length; i++) {
        diffEl[i].addEventListener('click', setDifficulty);
        diffEl[i].disabled = false;
    };
    messageEl.textContent = 'First, select a difficulty level';
    gameAreaEl.addEventListener('click', gridClick);
}

function setDifficulty(evt) {
    difficultySelected = difficultyParameters.find(element => element.difficulty === evt.target.id);
    messageEl.textContent = `You have selected ${evt.target.id} difficulty`;
    //now disable the event listener for difficulty selection until this current game is finished
    for (let i = 0; i < diffEl.length; i++) {
        diffEl[i].removeEventListener('click', setDifficulty);
        diffEl[i].disabled = true;
    }
    cellsRemaining = (difficultySelected.gridSize ** 2) - difficultySelected.mines;
    renderGrid(difficultySelected);
}

function renderGrid(difficultySelected) {
    let cntI = 0;
    let cntJ = 0;
    let posLeft;
    for (let i = 0; i < difficultySelected.gridSize; i++) {
        let row = document.createElement('div');
        row.className = 'row';
        for (let j = 0; j < difficultySelected.gridSize; j++) {
            let block = document.createElement('div');
            block.classList.add('cell');
            block.id = `${cntI}_${cntJ}`;
            row.append(block);
            posLeft = j*cellWidth + 10;
            block.style.left = posLeft +'px';
            cntJ++;
        }
        document.getElementById('gameArea').append(row);
        cntI += 1;
        cntJ = 0;
        posLeft = 0;
    }
    cellEl  = document.querySelectorAll('.cell');
    for (let i = 0; i < difficultySelected.gridSize ** 2; i++) {
        cellEl[i].addEventListener('mouseover', gridHoverOn);
        cellEl[i].addEventListener('mouseout', gridHoverOff);
    }
    initBoardState(difficultySelected.gridSize);
    placeMines(difficultySelected);
    renderTotalMines(difficultySelected.mines)
}

function initBoardState(boardSize) {
    for (let i = 0; i < boardSize ** 2; i++) {
        boardState.push({});
        boardState[i].id = '';
        boardState[i].hasMine = false; //add more grid properties here as development progresses
        boardState[i].validMove = true;
        boardState[i].numPeripheralMines = 0;
        boardState[i].hasFlag = false;
    }
    let count = 0;
    let cntI = 0;
    let cntJ = 0;
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            boardState[count].id = `${cntI}_${cntJ}`;
            count += 1;
            cntJ += 1;
        }
        cntJ = 0;
        cntI += 1;
    }
}

function placeMines(difficultySelected) {
    for (let i = 1; i <= difficultySelected.mines; i++) {
        let validMinePlacement = false;
        while (!validMinePlacement) {
        let mineLocation = [Math.floor(Math.random()*difficultySelected.gridSize), Math.floor(Math.random()*difficultySelected.gridSize)];
            if (!boardState.find(element => element.id === `${mineLocation[0]}_${mineLocation[1]}`).hasMine) {
                validMinePlacement = true;
                boardState.find(element => element.id === `${mineLocation[0]}_${mineLocation[1]}`).hasMine = true;
            }
        }
    }
    calcPeripheralMines(difficultySelected);
    renderMines(boardState.filter(element => element.hasMine === true));
}

function calcPeripheralMines(difficultySelected) {
    //There are 9 total cases used to calculate the number of surrounding mines for each cell, regardless of grid size
    //Case 1 - inside box
    for (let i = 1; i < difficultySelected.gridSize - 1; i++) {
        for (let j = 1; j < difficultySelected.gridSize - 1; j++) {
            let numMines = 0;
            let currCell = boardState.find(element => element.id === `${i}_${j}`);
            for (let n = -1; n <= 1; n++) {
                if (boardState.find(element => element.id === `${i - 1}_${j + n}`).hasMine) {numMines += 1}
            }
            for (let m = -1; m <= 1; m++) {
                if (boardState.find(element => element.id === `${i + 1}_${j + m}`).hasMine) {numMines += 1}
            }
            if (boardState.find(element => element.id === `${i}_${j - 1}`).hasMine) {numMines += 1}
            if (boardState.find(element => element.id === `${i}_${j + 1}`).hasMine) {numMines += 1}
            currCell.numPeripheralMines = numMines;
        }
    }
    //Case 2 - top row
    for (i = 1; i < difficultySelected.gridSize - 1; i++) {
        let numMines = 0;
        let currCell = boardState.find(element => element.id === `0_${i}`);
        for (let j = -1; j <= 1; j++) {
            if (boardState.find(element => element.id === `1_${i + j}`).hasMine) {numMines += 1}
        }
        if (boardState.find(element => element.id === `0_${i - 1}`).hasMine) {numMines += 1}
        if (boardState.find(element => element.id === `0_${i + 1}`).hasMine) {numMines += 1}
        currCell.numPeripheralMines = numMines;
    }
    //Case 3 - bottom row
    for (i = 1; i < difficultySelected.gridSize - 1; i++) {
        let numMines = 0;
        let currCell = boardState.find(element => element.id === `${difficultySelected.gridSize - 1}_${i}`);
        for (let j = -1; j <= 1; j++) {
            if (boardState.find(element => element.id === `${difficultySelected.gridSize - 2}_${i + j}`).hasMine) {numMines += 1}
        }
        if (boardState.find(element => element.id === `${difficultySelected.gridSize - 1}_${i - 1}`).hasMine) {numMines += 1}
        if (boardState.find(element => element.id === `${difficultySelected.gridSize - 1}_${i + 1}`).hasMine) {numMines += 1}
        currCell.numPeripheralMines = numMines;
    }
    //Case 4 - left-most column
    for (i = 1; i < difficultySelected.gridSize - 1; i++) {
        let numMines = 0;
        let currCell = boardState.find(element => element.id === `${i}_0`);
        for (let j = -1; j <= 1; j++) {
            if (boardState.find(element => element.id === `${i + j}_1`).hasMine) {numMines += 1}
        }
        if (boardState.find(element => element.id === `${i - 1}_0`).hasMine) {numMines += 1}
        if (boardState.find(element => element.id === `${i + 1}_0`).hasMine) {numMines += 1}
        currCell.numPeripheralMines = numMines;
    }
    //Case 5 - right-most column
    for (i = 1; i < difficultySelected.gridSize - 1; i++) {
        let numMines = 0;
        let currCell = boardState.find(element => element.id === `${i}_${difficultySelected.gridSize - 1}`);
        for (let j = -1; j <= 1; j++) {
            if (boardState.find(element => element.id === `${i + j}_${difficultySelected.gridSize - 2}`).hasMine) {numMines += 1}
        }
        if (boardState.find(element => element.id === `${i - 1}_${difficultySelected.gridSize - 1}`).hasMine) {numMines += 1}
        if (boardState.find(element => element.id === `${i + 1}_${difficultySelected.gridSize - 1}`).hasMine) {numMines += 1}
        currCell.numPeripheralMines = numMines;
    }
    //Case 6 - top-left corner
    numMines = 0;
    currCell = boardState.find(element => element.id === `0_0`);
    if (boardState.find(element => element.id === `0_1`).hasMine) {numMines += 1}
    if (boardState.find(element => element.id === `1_0`).hasMine) {numMines += 1}
    if (boardState.find(element => element.id === `1_1`).hasMine) {numMines += 1}
    currCell.numPeripheralMines = numMines;
    //Case 7 - top-right corner
    numMines = 0;
    currCell = boardState.find(element => element.id === `0_${difficultySelected.gridSize - 1}`);
    if (boardState.find(element => element.id === `0_${difficultySelected.gridSize - 2}`).hasMine) {numMines += 1}
    if (boardState.find(element => element.id === `1_${difficultySelected.gridSize - 1}`).hasMine) {numMines += 1}
    if (boardState.find(element => element.id === `1_${difficultySelected.gridSize - 2}`).hasMine) {numMines += 1}
    currCell.numPeripheralMines = numMines;
    //Case 8 - bottom-left corner
    numMines = 0;
    currCell = boardState.find(element => element.id === `${difficultySelected.gridSize - 1}_0`);
    if (boardState.find(element => element.id === `${difficultySelected.gridSize - 1}_1`).hasMine) {numMines += 1}
    if (boardState.find(element => element.id === `${difficultySelected.gridSize - 2}_0`).hasMine) {numMines += 1}
    if (boardState.find(element => element.id === `${difficultySelected.gridSize - 2}_1`).hasMine) {numMines += 1}
    currCell.numPeripheralMines = numMines;
    //Case 9 - bottom-right corner
    numMines = 0;
    currCell = boardState.find(element => element.id === `${difficultySelected.gridSize - 1}_${difficultySelected.gridSize - 1}`);
    if (boardState.find(element => element.id === `${difficultySelected.gridSize - 1}_${difficultySelected.gridSize - 2}`).hasMine) {numMines += 1}
    if (boardState.find(element => element.id === `${difficultySelected.gridSize - 2}_${difficultySelected.gridSize - 1}`).hasMine) {numMines += 1}
    if (boardState.find(element => element.id === `${difficultySelected.gridSize - 2}_${difficultySelected.gridSize - 2}`).hasMine) {numMines += 1}
    currCell.numPeripheralMines = numMines;
}

//might do a class toggle instead (element.classList.toggle(hasMine)), assign hasMine to the HTML element in placeMines function
//, if hasMine is on then display the mine (set this on CSS page)
function renderMines(hasMineArray){
    hasMineArray.forEach(function(el) {
        document.getElementById(el.id).textContent = 'X' //change this to a graphic of a mine later
    })
}

function renderTotalMines(numMines) {
    totalMinesEl.textContent = `Total mines: ${numMines}`;
}

function gridClick(evt) {
    if (evt.target.classList.contains('cell')) {placeMarker(evt.target)};
    return;
}

function placeMarker(targetCell) {
    messageEl.textContent = "";
    let validMove = checkBoardState(targetCell.id)
    if (validMove) {
        if (targetCell.classList.contains('flag')) {
            messageEl.textContent = 'Clear the flag first';
            return;
        }
        checkMine(targetCell.id);
        targetCell.textContent = boardState.find(element => element.id === targetCell.id).numPeripheralMines;
        targetCell.style.fontSize = '25px';
        targetCell.style.textAlign = 'center';
        targetCell.classList.toggle('hover');
        updateBoardState(targetCell.id);
        checkWinCondition();
    if (gameOver) {return};
    } else {
        messageEl.textContent = 'Pick another cell';
    }
 }

function checkBoardState(cellId) {
    const cellState = boardState.find(element => element.id === cellId);
    return cellState.validMove
}

function updateBoardState(cellId) {
    const cellState = boardState.find(element => element.id === cellId);
    cellState.validMove = false;
}

function gridHoverOn(evt) {
    if (evt.target.className === 'cell') {
        const cellState = boardState.find(element => element.id === evt.target.id);
        if (cellState.validMove) {
            evt.target.classList.toggle('hover');
        }
    }
}

function gridHoverOff(evt) {
    if (evt.target.className === 'cell hover') {
        evt.target.classList.toggle('hover');
    }
}

function checkMine(cellId) {
    const cellState = boardState.find(element => element.id === cellId);
    if (cellState.hasMine) {
        //reveal image of mine
        messageEl.textContent = 'You hit a mine. Game over';
        gameAreaEl.removeEventListener('click', gridClick)
        for (let i = 0; i < difficultySelected.gridSize ** 2; i++) {
            cellEl[i].removeEventListener('mouseover', gridHoverOn);
            cellEl[i].removeEventListener('mouseout', gridHoverOff);
        }
    }
}

function checkWinCondition() {
    if (boardState.filter(element => element.validMove === false).length === cellsRemaining) {
        messageEl.textContent = 'You Win!';
        gameAreaEl.removeEventListener('click', gridClick)
        for (let i = 0; i < difficultySelected.gridSize ** 2; i++) {
            cellEl[i].removeEventListener('mouseover', gridHoverOn);
            cellEl[i].removeEventListener('mouseout', gridHoverOff);
        }
    }
}

function plantFlag(evt) {
    if (evt.button === 2 && evt.target.classList.contains('cell')) {
        const cellState = boardState.find(element => element.id === evt.target.id);
        if (!cellState.hasFlag && cellState.validMove) {
            cellState.hasFlag = true;
            evt.target.classList.toggle('flag');
            evt.target.textContent = 'F';
            flagsPlanted += 1;
            flagsEl.textContent = `Flags used: ${flagsPlanted}`;
            evt.target.classList.toggle('hover');
        } else if (cellState.hasFlag && cellState.validMove) {
            cellState.hasFlag = false;
            evt.target.classList.toggle('flag');
            evt.target.textContent = '';
            flagsPlanted -= 1;
            flagsEl.textContent = `Flags used: ${flagsPlanted}`;
        }
    };
}

function revealMines() {

}

// Next steps:
// x 1. Display Total no of bombs to be cleared
// x 2. add boardState property of validMove, default is true, once clicked it should be false -> change cell colour for now
// x 3. add hover effect for validMove = true cells

// x 4. detect if bomb is triggered -> triggers game win loss condition
// x 5. reveal number of bombs in surrounding cells

// x 5.5. Added a function to check win condition -> has the player revealed ALL non-mine tiles? if so then game is won
// x 6. right click to place flags -> toggle right-clickable status but only if cell is validMove = true
