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

/*----- sound assets -----*/
const soundMainTheme = new Audio('sound/Main_Theme.mp3');
const soundUltReady1 = new Audio('sound/Ultimate_Ready.mp3');
const soundUltReady2 = new Audio('sound/Minefield_Ready.mp3');
const soundEightBallDeployed = new Audio('sound/8Ball_Wrecking_Ball_Ultimate_Deployed.mp3');
const soundUltDeployed1 = new Audio('sound/Area_Denied.mp3');
const soundUltDeployed2 = new Audio('sound/Minefield_Deployed.mp3');
const soundInit = [
    [soundUltReady1, soundEightBallDeployed, soundUltDeployed1],
    [soundUltReady2, soundEightBallDeployed, soundUltDeployed2]
]
const soundPing1 = new Audio('sound/Ping_Ana.mp3');
const soundPing2 = new Audio('sound/Ping_Ashe.mp3');
const soundPing3 = new Audio('sound/Ping_Brig.mp3');
const soundPing4 = new Audio('sound/Ping_Cass.mp3');
const soundPing5 = new Audio('sound/Ping_Mercy.mp3');
const soundPing6 = new Audio('sound/Ping_Orisa.mp3');
const soundPing7 = new Audio('sound/Ping_Sombra.mp3');
const soundPing8 = new Audio('sound/Ping_Torb.mp3');
const soundPing9 = new Audio('sound/Ping_Tracer.mp3');
const soundPing = [soundPing1, soundPing2, soundPing3, soundPing4, soundPing5, soundPing6, soundPing7,
                   soundPing8, soundPing9]
const soundMineHit = new Audio('sound/Mine_Hit.mp3');
const soundMineHit1 = new Audio('sound/Ally_Lost.mp3');
const soundMineHit2 = new Audio('sound/Destroyed.mp3');
const soundMineHit3 = new Audio('sound/Get_Wrecked.mp3');
const soundMineHit4 = new Audio('sound/No_Hard_Feelings_Eliminated.mp3');
const soundMineHit5 = new Audio('sound/Profanity_Filter_Enabled.mp3');
const soundMineHit6 = new Audio('sound/Rolled.mp3');
const soundMineHit7 = new Audio('sound/Shut_Down.mp3');
const soundMineHit8 = new Audio('sound/Target_Terminated.mp3');
const soundMineHit9 = new Audio('sound/The_Hamster_Sends_His_Regards.mp3');
const soundMineHitArr = [soundMineHit1, soundMineHit2, soundMineHit3, soundMineHit4, soundMineHit5, soundMineHit6,
                         soundMineHit7, soundMineHit8, soundMineHit9]
const soundOvertime = new Audio('sound/Overtime.mp3');
const soundVictory = new Audio('sound/Victory.mp3');
const soundVictoryTheme = new Audio('sound/Victory_Theme.mp3');
//    sonic arrow voicelines

/*----- app's state (variables) -----*/
let gameOver = false;
let difficultySelected;
let boardState = [];
let cellsRemaining;
let flagsPlanted;
let toggleMines;
let audioPointer = 0;
let playList;
let audioIsPlaying;
let firstTimeTheme = true;
let firstMove;

/*----- cached element references -----*/
const diffEl = document.querySelectorAll('.difficulty');
const resetEl = document.getElementById('reset');
const messageEl = document.getElementById('message');
const totalMinesEl = document.getElementById('mines');
const flagsEl = document.getElementById('flags')
const timerEl = document.getElementById('timer');
const gameAreaEl = document.getElementById('gameArea');
const devModeEl = document.getElementById('dev-mode');
let cellEl = document.querySelectorAll('.cell');
let imgFlagsEl = document.querySelectorAll('.imgFlag');
const aboutEl = document.getElementById('about');

/*----- event listeners -----*/
for (let i = 0; i < diffEl.length; i++) {diffEl[i].addEventListener('click', setDifficulty)};
resetEl.addEventListener('click', init);
devModeEl.addEventListener('click', revealMines);
gameAreaEl.addEventListener('click', gridClick);
document.addEventListener('contextmenu', event => event.preventDefault());
gameAreaEl.addEventListener('mouseup', plantFlag);
aboutEl.addEventListener('click', toggleLore);

/*----- functions -----*/
init();

function init() {
    firstMove = true;
    flagsPlanted = 0;
    flagsEl.textContent = 'Flags used: ';
    totalMinesEl.textContent = 'Total mines: ';
    timerEl.textContent = 'Timer';
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
    interruptAudio();
    playList = [];
    audioIsPlaying = false;
    audioPointer = 0;
}

function setDifficulty(evt) {
    interruptAudio();
    difficultySelected = difficultyParameters.find(element => element.difficulty === evt.target.id);
    messageEl.textContent = `You have selected ${evt.target.id} difficulty`;
    //now disable the event listener for difficulty selection until this current game is finished
    for (let i = 0; i < diffEl.length; i++) {
        diffEl[i].removeEventListener('click', setDifficulty);
        diffEl[i].disabled = true;
    }
    cellsRemaining = (difficultySelected.gridSize ** 2) - difficultySelected.mines;
    renderGrid(difficultySelected);
    choosePlaylistMinesDeployed();
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
    renderTotalMines(difficultySelected.mines);
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
    if (evt.target.classList.contains('imgNumber')) {
        messageEl.textContent = 'Pick another cell';
    } else if (evt.target.classList.contains('cell')) {
        if (firstMove) {
            startTimer();
            firstMove = !firstMove;
        }
        placeMarker(evt.target);
    }
    return;
}

function startTimer() {
    let time = 0;
    timer = setInterval(function() {
        time += 1;
        timerEl.textContent = `Timer ${time}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

function placeMarker(targetCell) {
    messageEl.textContent = "";
    let validMove = checkBoardState(targetCell.id);
    if (validMove) {
        checkMine(targetCell.id);
        if (!gameOver) {
            cellsRemaining -= 1;
            let imgNumber = document.createElement('img');
            switch(boardState.find(element => element.id === targetCell.id).numPeripheralMines) {
                case 0:
                    document.getElementById(targetCell.id).style.backgroundColor = '#e6ccb3';
                    break;
                case 1:
                    imgNumber.src = 'images/1.png';
                    imgNumber.classList.add('imgNumber');
                    document.getElementById(targetCell.id).appendChild(imgNumber);
                    break;
                case 2:
                    imgNumber.src = 'images/2.png';
                    imgNumber.classList.add('imgNumber');
                    document.getElementById(targetCell.id).appendChild(imgNumber);
                    break;
                case 3:
                    imgNumber.src = 'images/3.png';
                    imgNumber.classList.add('imgNumber');
                    document.getElementById(targetCell.id).appendChild(imgNumber);
                    break;
                case 4:
                    imgNumber.src = 'images/4.png';
                    imgNumber.classList.add('imgNumber');
                    document.getElementById(targetCell.id).appendChild(imgNumber);
                    break;
                case 5:
                    imgNumber.src = 'images/5.png';
                    imgNumber.classList.add('imgNumber');
                    document.getElementById(targetCell.id).appendChild(imgNumber);
                    break;
                case 6:
                    imgNumber.src = 'images/6.png';
                    imgNumber.classList.add('imgNumber');
                    document.getElementById(targetCell.id).appendChild(imgNumber);
                    break;
                case 7:
                    imgNumber.src = 'images/7.png';
                    imgNumber.classList.add('imgNumber');
                    document.getElementById(targetCell.id).appendChild(imgNumber);
                    break;
                case 8:
                    imgNumber.src = 'images/8.png';
                    imgNumber.classList.add('imgNumber');
                    document.getElementById(targetCell.id).appendChild(imgNumber);
                    break;
            }
            targetCell.classList.toggle('hover');
            updateBoardState(targetCell.id);
            checkWinCondition();
        }
    } else if (!validMove) {
        messageEl.textContent = 'Pick another cell';
    }
 }

function checkBoardState(cellId) {
    return boardState.find(element => element.id === cellId).validMove;
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
        toggleMines = true;
        renderMines(boardState.filter(element => element.hasMine === true));
        messageEl.textContent = 'You hit a mine. Game over';
        stopTimer();
        interruptAudio();
        playList = [soundMineHit, soundMineHitArr[Math.floor(Math.random()*soundMineHitArr.length)]]
        audioPointer = 0;
        playSoundArray();
        shutdownEvtListeners();
        return gameOver = true;
    }
}

function checkWinCondition() {
    if (cellsRemaining < 4) {
        playList = [soundOvertime];
        audioPointer = 0;
        playSoundArray();
    }
    if (cellsRemaining === 0) {
        messageEl.textContent = 'You Win!';
        stopTimer();
        interruptAudio();
        playList = [soundVictory, soundVictoryTheme];
        audioPointer = 0;
        playSoundArray();
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
            imgFlagsEl = document.querySelectorAll('.imgFlag');
            for (let i = 0; i < flagsPlanted; i++) {
                imgFlagsEl[i].addEventListener('mouseup', removeFlag);
            }
            playList = [soundPing[(Math.floor(Math.random()*9))]];
            audioPointer = 0;
            playSoundArray();
        }
    }
}

function removeFlag(evt) {
    if (evt.button ===2) {
        boardState.find(element => element.id === evt.target.parentElement.id).hasFlag = false;
        evt.target.parentElement.innerHTML = '';
        flagsPlanted -= 1;
        flagsEl.textContent = `Flags used: ${flagsPlanted}`;
        imgFlagsEl = document.querySelectorAll('.imgFlag');
        for (let i = 0; i < flagsPlanted; i++) {
            imgFlagsEl[i].addEventListener('mouseup', removeFlag);
        }
    }
}

function revealMines() {
    toggleMines = !toggleMines;
    renderMines(boardState.filter(element => element.hasMine === true));
}

function renderMines(hasMineArray){
    if (toggleMines) {
        hasMineArray.forEach(function(el) {
            if (el.hasFlag) {
                document.getElementById(el.id).removeChild(document.querySelector('.imgFlag'));
            }
            let imgMine = document.createElement('img');
            imgMine.src = 'images/Minefield.png';
            document.getElementById(el.id).appendChild(imgMine);
            imgMine.classList.add('imgMine');
        })
    } else if (!toggleMines) {
        hasMineArray.forEach(function(el) {
            document.getElementById(el.id).removeChild(document.querySelector('.imgMine'));
            if (el.hasFlag) {
                let imgFlag = document.createElement('img');
                imgFlag.src = 'images/Flag.png';
                document.getElementById(el.id).appendChild(imgFlag);
                imgFlag.classList.add('imgFlag');
                imgFlagsEl = document.querySelectorAll('.imgFlag');
                for (let i = 0; i < flagsPlanted; i++) {
                    imgFlagsEl[i].addEventListener('mouseup', removeFlag);
                }
            }
        })
    }
}
function choosePlaylistMinesDeployed() {
    let option = Math.round(Math.random());
    playList = soundInit[option];
    audioPointer = 0;
    playSoundArray();
}

function playSoundArray() {
    if (audioPointer < playList.length) {
        playList[audioPointer].play();
        audioIsPlaying = !playList[audioPointer].paused;
        playList[audioPointer].addEventListener('ended', playSoundArray);
        audioPointer++;
    }
}

function interruptAudio() {
    if (audioIsPlaying) {
        for (i = 0; i < playList.length; i++) {
        playList[i].pause();
        playList[i].currentTime = 0;
        }
    }
}

function toggleLore() {
    if (firstTimeTheme) {
        firstTimeTheme = !firstTimeTheme;
        playList = [soundMainTheme];
        audioPointer = 0;
        playSoundArray();
    }

    // loreEl.classList.toggle('show');
    // if (loreEl.classList.contains('show')) {

    // } else if (!loreEl.classList.contains('show')) {
    //     //hide the lore
    // }
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
// 7.0.1 Layout: revise wireframe and search for appropriately sized images to use as background
        // List of sound clips needed: ping voice lines (up to 3, make it so it doesn't always play)
        //                             minefield deployed (should be 2. "minefield deployed" and "area denied")
        //                             mine hit (Hammond voice lines, find a few and play one at random when gameOver)
        //                              mine explosion sound
                                    //    sonic arrow voicelines
        //                             Overtime music
        //                             OW intro music
        //                             Victory music and voiceline (Narrator)
        //                             Defeat voiceline (Narrator)
// x 7.1 Added functionality to the Dev Mode button to toggle the display of the mines ON/OFF
// 7.2 Replace the numPeripheralMines text-based number with a colourful graphic of the number.
// 8. Cascading logic -> sonic arrow animation?