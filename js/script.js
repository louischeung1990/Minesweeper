/*----- constants -----*/
const cellWidth = 30; //px
const difficultyParameters = [
    {difficulty: 'easy', gridSize: 9, mines: 10},
    {difficulty: 'medium', gridSize: 16, mines: 40},
    {difficulty: 'hard', gridSize: 22, mines: 99},
];

/*----- image assets -----*/
//Mine => imgMine.src = 'images/Minefield.png';
// https://overwatch.fandom.com/wiki/Wrecking_Ball

// exclamation mark -> imgFlag.src = 'images/Flag.png;
// https://favpng.com/png_view/symbol-exclamation-mark-symbol-interjection-png/GQYJBeF8

/*----- app's state (variables) -----*/
let gameOver = false;
let difficultySelected;
let boardState = [];
let cellsRemaining;
let flagsPlanted;
let toggleMines;

/*----- cached element references -----*/
const diffEl = document.querySelectorAll('.difficulty');
const resetEl = document.getElementById('reset');
const messageEl = document.getElementById('message');
const totalMinesEl = document.getElementById('mines');
const flagsEl = document.getElementById('flags')
const gameAreaEl = document.getElementById('gameArea');
const devModeEl = document.getElementById('dev-mode');
let cellEl = document.querySelectorAll('.cell');
let imgFlagsEl = document.querySelectorAll('.imgFlag')

/*----- event listeners -----*/
for (let i = 0; i < diffEl.length; i++) {diffEl[i].addEventListener('click', setDifficulty)};
resetEl.addEventListener('click', init);
devModeEl.addEventListener('click', revealMines);
gameAreaEl.addEventListener('click', gridClick);
document.addEventListener('contextmenu', event => event.preventDefault());
gameAreaEl.addEventListener('mouseup', plantFlag);
// imgFlagsEl.addEventListener('mouseup', removeFlag)

/*----- functions -----*/
init();

function init() {
    flagsPlanted = 0;
    flagsEl.textContent = 'Flags used: ';
    totalMinesEl.textContent = 'Total mines: ';
    toggleMines = false;
    gameOver = false;
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
    gameAreaEl.addEventListener('mouseup', plantFlag);
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
        if (boardState.find(element => element.id === targetCell.id).hasFlag) {
            messageEl.textContent = 'Clear the flag first';
            return;
        }
        checkMine(targetCell.id);
        if (!gameOver) {
        targetCell.textContent = boardState.find(element => element.id === targetCell.id).numPeripheralMines;
        targetCell.style.fontSize = '25px';
        targetCell.style.textAlign = 'center';
        targetCell.classList.toggle('hover');
        updateBoardState(targetCell.id);
        checkWinCondition();
        }
    } else {
        messageEl.textContent = 'Pick another cell';
    }
 }

function checkBoardState(cellId) {
    return boardState.find(element => element.id === cellId).validMove
}

function updateBoardState(cellId) {
    boardState.find(element => element.id === cellId).validMove = false;
}

function gridHoverOn(evt) {
    if (evt.target.className === 'cell' && boardState.find(element => element.id === evt.target.id).validMove) {
        evt.target.classList.toggle('hover');
    }
}

function gridHoverOff(evt) {
    if (evt.target.className === 'cell hover') {
        evt.target.classList.toggle('hover');
    }
}

function checkMine(cellId) {
    if (boardState.find(element => element.id === cellId).hasMine) {
        //Remove all flags so flag and mine images don't crowd each other out
        toggleMines = true;
        renderMines(boardState.filter(element => element.hasMine === true));
        messageEl.textContent = 'You hit a mine. Game over';
        shutdownEvtListeners();
        return gameOver = true;
    }
}

function checkWinCondition() {
    if (boardState.filter(element => element.validMove === false).length === cellsRemaining) {
        messageEl.textContent = 'You Win!';
        shutdownEvtListeners();
    }
}

function shutdownEvtListeners() {
    gameAreaEl.removeEventListener('click', gridClick);
    for (let i = 0; i < difficultySelected.gridSize ** 2; i++) {
        cellEl[i].removeEventListener('mouseover', gridHoverOn);
        cellEl[i].removeEventListener('mouseout', gridHoverOff);
    }
    gameAreaEl.removeEventListener('mouseup', plantFlag);
}

function plantFlag(evt) {
    if (evt.button === 2 && evt.target.classList.contains('cell')) {
        const cellState = boardState.find(element => element.id === evt.target.id);
        if (!cellState.hasFlag && cellState.validMove) {
            cellState.hasFlag = true;
            let imgFlag = document.createElement('img');
            imgFlag.src = 'images/Flag.png';
            imgFlag.classList.add('imgFlag');
            document.getElementById(cellState.id).appendChild(imgFlag);
            
            flagsPlanted += 1;
            flagsEl.textContent = `Flags used: ${flagsPlanted}`;
            evt.target.classList.toggle('hover');
            imgFlagsEl = document.querySelectorAll('.imgFlag')
            for (let i = 0; i < flagsPlanted; i++) {
                imgFlagsEl[i].addEventListener('mouseup', removeFlag)
            }
        }
    }
}

function removeFlag(evt) {
    boardState.find(element => element.id === evt.target.parentElement.id).hasFlag = false;
    evt.target.parentElement.innerHTML = '';
    flagsPlanted -= 1;
    flagsEl.textContent = `Flags used: ${flagsPlanted}`;
    imgFlagsEl = document.querySelectorAll('.imgFlag')
    for (let i = 0; i < flagsPlanted; i++) {
        imgFlagsEl[i].addEventListener('mouseup', removeFlag)
    }
}

function revealMines() {
    toggleMines = !toggleMines;
    renderMines(boardState.filter(element => element.hasMine === true));
}

function renderMines(hasMineArray){
    if (toggleMines) {
        hasMineArray.forEach(function(el) {
        let imgMine = document.createElement('img');
        imgMine.src = 'images/Minefield.png';
        document.getElementById(el.id).appendChild(imgMine);
        imgMine.classList.add('imgMine');
        })
    } else if (!toggleMines) {
        hasMineArray.forEach(function(el) {
        document.getElementById(el.id).removeChild(document.querySelector('.imgMine'));
        })
    }
}


// Next steps:
// x 1. Display Total no of bombs to be cleared
// x 2. add boardState property of validMove, default is true, once clicked it should be false -> change cell colour for now
// x 3. add hover effect for validMove = true cells

// x 4. detect if bomb is triggered -> triggers game win loss condition
// x 5. reveal number of bombs in surrounding cells

// x 5.5. Added a function to check win condition -> has the player revealed ALL non-mine tiles? if so then game is won
// x 6. right click to place flags -> toggle right-clickable status but only if cell is validMove = true

// 7. Work on visual and sound effects -> graphics to replace the mine and flag (new OW2 ping and voiceline) placeholders, 
// and play sound clips on certain events: mine hit, overtime music when one or two mines left, minefied deployed
// x 7.1 Added functionality to the Dev Mode button to toggle the display of the mines ON/OFF
// 7.2 Replace the numPeripheralMines text-based number with a colourful graphic of the number.
// 8. Cascading logic -> sonic arrow animation?