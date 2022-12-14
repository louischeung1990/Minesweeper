/*----- constants -----*/
const cellWidth = 30; //px
const difficultyParameters = [
    {difficulty: 'easy', gridSize: 9, mines: 10},
    {difficulty: 'medium', gridSize: 16, mines: 40},
    {difficulty: 'hard', gridSize: 22, mines: 99},
];

/*----- image assets -----*/
//Minesweeper numbers
// commons.wikimedia.org

//Mine => imgMine.src = 'images/Minefield.png';
//Hammond -> imgHammond.src = 'images/Hammond.png';
// https://overwatch.fandom.com/wiki/Wrecking_Ball

// exclamation mark -> imgFlag.src = 'images/Flag.png';
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
                   soundPing8, soundPing9];
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
                         soundMineHit7, soundMineHit8, soundMineHit9];
const soundOvertime = new Audio('sound/Overtime.mp3');
const soundVictory = new Audio('sound/Victory.mp3');
const soundVictoryTheme = new Audio('sound/Victory_Theme.mp3');
const soundImpatient = new Audio('sound/Impatient.mp3');
const soundSonicArrow = new Audio('sound/Sonic_Arrow.mp3');

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
let revealCombo;

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
    let posTop;
    for (let i = 0; i < difficultySelected.gridSize; i++) {
        let row = document.createElement('div');
        row.className = 'row';
        for (let j = 0; j < difficultySelected.gridSize; j++) {
            let block = document.createElement('div');
            block.style.border = '1px solid #663300';
            block.style.borderRadius = '2px';
            block.classList.add('cell');
            block.id = `${cntI}_${cntJ}`;
            row.append(block);
            posLeft = j*cellWidth;
            block.style.left = posLeft +'px';
            posTop = -j*cellWidth;
            block.style.top = posTop + 'px';
            cntJ++;
        }
        document.getElementById('gameArea').append(row);
        cntI += 1;
        cntJ = 0;
        posLeft = 0;
    }
    gameAreaEl.style.width = `${difficultySelected.gridSize*cellWidth}px`;
    gameAreaEl.style.margin = 'auto';
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
        boardState[i].hasMine = false;
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
    totalMinesEl.textContent = `Total mines: \r\n`;
    totalMinesEl.textContent += `${numMines}`;
}

function gridClick(evt) {
    if (evt.target.classList.contains('imgNumber')) {
        messageEl.textContent = 'Pick another cell';
    } else if (evt.target.classList.contains('cell')) {
        if (firstMove) {
            startTimer();
            firstMove = !firstMove;
        }
        revealCombo = 0;
        placeMarker(evt.target.id);
    }
    return;
}

function startTimer() {
    let time = 0;
    timer = setInterval(function() {
        time += 1;
        timerEl.textContent = `Timer ${time}`;
        if (time === 60) {
            playList = [soundImpatient];
            audioPointer = 0;
            playSoundArray();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

function placeMarker(targetCellId) {
    messageEl.textContent = "";
    let splitId = targetCellId.split('_');
    splitId = splitId.map(str => {return Number(str)});
    if (splitId[0] < 0 || splitId[0] >= difficultySelected.gridSize || splitId[1] < 0 || splitId[1] >= difficultySelected.gridSize) {
        return;
    }
    let validMove = checkBoardState(targetCellId);
    if (validMove) {
        updateBoardState(targetCellId);
        checkMine(targetCellId);
        if (!gameOver) {
            cellsRemaining -= 1;
            let imgNumber = document.createElement('img');
            switch(boardState.find(element => element.id === targetCellId).numPeripheralMines) {
                case 0:
                    document.getElementById(targetCellId).style.backgroundColor = '#e6ccb3';
                    placeMarker(`${splitId[0]-1}_${splitId[1]-1}`)
                    placeMarker(`${splitId[0]-1}_${splitId[1]}`)
                    placeMarker(`${splitId[0]-1}_${splitId[1]+1}`)
                    placeMarker(`${splitId[0]}_${splitId[1]-1}`)
                    placeMarker(`${splitId[0]}_${splitId[1]+1}`)
                    placeMarker(`${splitId[0]+1}_${splitId[1]-1}`) 
                    placeMarker(`${splitId[0]+1}_${splitId[1]}`)
                    placeMarker(`${splitId[0]+1}_${splitId[1]+1}`)
                    break;
                case 1:
                    imgNumber.src = 'images/1.png';
                    imgNumber.classList.add('imgNumber');
                    document.getElementById(targetCellId).appendChild(imgNumber);
                    break;
                case 2:
                    imgNumber.src = 'images/2.png';
                    imgNumber.classList.add('imgNumber');
                    document.getElementById(targetCellId).appendChild(imgNumber);
                    break;
                case 3:
                    imgNumber.src = 'images/3.png';
                    imgNumber.classList.add('imgNumber');
                    document.getElementById(targetCellId).appendChild(imgNumber);
                    break;
                case 4:
                    imgNumber.src = 'images/4.png';
                    imgNumber.classList.add('imgNumber');
                    document.getElementById(targetCellId).appendChild(imgNumber);
                    break;
                case 5:
                    imgNumber.src = 'images/5.png';
                    imgNumber.classList.add('imgNumber');
                    document.getElementById(targetCellId).appendChild(imgNumber);
                    break;
                case 6:
                    imgNumber.src = 'images/6.png';
                    imgNumber.classList.add('imgNumber');
                    document.getElementById(targetCellId).appendChild(imgNumber);
                    break;
                case 7:
                    imgNumber.src = 'images/7.png';
                    imgNumber.classList.add('imgNumber');
                    document.getElementById(targetCellId).appendChild(imgNumber);
                    break;
                case 8:
                    imgNumber.src = 'images/8.png';
                    imgNumber.classList.add('imgNumber');
                    document.getElementById(targetCellId).appendChild(imgNumber);
                    break;
            }
            document.getElementById(targetCellId).classList.toggle('hover');
            revealCombo += 1;
            if (revealCombo === 10) {
                playList = [soundSonicArrow];
                audioPointer = 0;
                playSoundArray();
            }
            
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
        messageEl.textContent = 'You hit a mine. Game over';
        stopTimer();
        interruptAudio();
        playList = [soundMineHit, soundMineHitArr[Math.floor(Math.random()*soundMineHitArr.length)]]
        audioPointer = 0;
        playSoundArray();
        shutdownEvtListeners();
        gameOver = true;
        renderMinesFinal(boardState.filter(element => element.hasMine === true));
    }
}

function checkWinCondition() {
    if (cellsRemaining < 5) {
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
        renderMinesFinal(boardState.filter(element => element.hasMine === true));
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
            flagsEl.textContent = `Flags used: \r\n ${flagsPlanted}`;
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
        flagsEl.textContent = `Flags used: \r\n ${flagsPlanted}`;
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
                document.getElementById(el.id).innerHTML = '';
                imgFlagsEl = document.querySelectorAll('.imgFlag');
            }
            let imgMine = document.createElement('img');
            imgMine.src = 'images/Minefield.png';
            document.getElementById(el.id).appendChild(imgMine);
            imgMine.classList.add('imgMine');
        })
    } else if (!toggleMines) {
        hasMineArray.forEach(function(el) {
            document.getElementById(el.id).innerHTML = '';
            if (el.hasFlag) {
                let imgFlag = document.createElement('img');
                imgFlag.src = 'images/Flag.png';
                document.getElementById(el.id).appendChild(imgFlag);
                imgFlag.classList.add('imgFlag');
            }
        })
    }
    imgFlagsEl = document.querySelectorAll('.imgFlag');
    for (let i = 0; i < flagsPlanted; i++) {
        imgFlagsEl[i].addEventListener('mouseup', removeFlag);
    }
}

function renderMinesFinal(hasMineArray) {
    hasMineArray.forEach(function(el) {
        document.getElementById(el.id).innerHTML = '';
        let imgMine = document.createElement('img');
        imgMine.src = 'images/Minefield.png';
        document.getElementById(el.id).appendChild(imgMine);
    })
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
    aboutEl.classList.toggle('show');
    if (aboutEl.classList.contains('show')) {
        let loreBox = document.createElement('div');
        loreBox.classList.add('lore');
        document.getElementById('right').appendChild(loreBox);
        const loreEl = document.querySelector('.lore')
        loreEl.style.width = '280px';
        loreEl.style.margin = 'auto';
        loreEl.style.border = '2px solid black';
        loreEl.style.borderRadius = '5px';
        loreEl.style.backgroundColor = 'white';
        loreEl.style.opacity = '0.85';
        loreEl.style.padding = '12px';
        loreEl.style.marginTop = '10px';
        loreEl.style.fontFamily = 'Aldrich, sans-serif';
        loreEl.style.fontSize = '23px';
        loreEl.style.textAlign = 'center';
        loreEl.textContent = `As we bid adieu to Overwatch 1 and look forward to the sequel, the Blizzard devs \r\n`;
        loreEl.textContent += `have been thinking about ways to make Hammond more viable. In their infinite wisdom, \r\n`;
        loreEl.textContent += `they've made his minefield ultimate invisible and the distribution pattern unpredictable. \r\n`;
        loreEl.textContent += `Can you find all the mines? Thanks for playing!`
        let imgHammond = document.createElement('img');
        imgHammond.src = 'images/Wrecking_Ball.png';
        imgHammond.style.width = '280px';
        imgHammond.style.height = '230px';
        loreEl.append(imgHammond);
    } else if (!aboutEl.classList.contains('show')) {
        document.getElementById('right').removeChild(document.querySelector('.lore'));
    }
}