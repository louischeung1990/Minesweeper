/*----- constants -----*/
const cellWidth = 30; //px
const difficultyParameters = [
    {difficulty: "easy", gridSize: 9, mines: 10},
    {difficulty: "medium", gridSize: 16, mines: 40},
    {difficulty: "hard", gridSize: 22, mines: 99},
];

/*----- app's state (variables) -----*/
let gameOver = false;
let validMove;
let difficultySelected;
let boardState = [];

/*----- cached element references -----*/
const diffEl = document.querySelectorAll(".difficulty");
const resetEl = document.getElementById("reset");
const messageEl = document.getElementById("message");
const gameAreaEl = document.getElementById("gameArea");
const devModeEl = document.getElementById("dev-mode");

/*----- event listeners -----*/
for (let i = 0; i < diffEl.length; i++) {diffEl[i].addEventListener("click", setDifficulty)};
resetEl.addEventListener("click", init);
devModeEl.addEventListener("click", revealMines);

/*----- functions -----*/
init();

function init() {
    boardState = [];
    if (difficultySelected) {
        for (let i = 0; i < difficultySelected.gridSize; i++) {
            document.querySelector('.row').remove();
        }
    }
    for (let i = 0; i < diffEl.length; i++) {
        diffEl[i].addEventListener("click", setDifficulty);
        diffEl[i].disabled = false;
    };
    messageEl.textContent = "First, select a difficulty level";
}

function setDifficulty(evt) {
    difficultySelected = difficultyParameters.find(element => element.difficulty === evt.target.id);
    messageEl.textContent = `You have selected ${evt.target.id} difficulty`;
    //now disable the event listener for difficulty selection until this current game is finished
    for (let i = 0; i < diffEl.length; i++) {
        diffEl[i].removeEventListener("click", setDifficulty);
        diffEl[i].disabled = true;
    }
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
            block.classList.add('block');
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
    initBoardState(difficultySelected.gridSize);
    placeMines(difficultySelected);
}

function initBoardState(boardSize) {
    for (let i = 0; i < boardSize ** 2; i++) {
        boardState.push({});
        boardState[i].id = '';
        boardState[i].hasMine = false; //add more grid properties here as development progresses
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
    renderMines(boardState.filter(element => element.hasMine === true))
}

//might do a class toggle instead (element.classList.toggle(hasMine)), assign hasMine to the HTML element in placeMines function
//, if hasMine is on then display the mine (set this on CSS page)
function renderMines(hasMineArray){
    hasMineArray.forEach(function(el) {
        document.getElementById(el.id).textContent = 'X' //change this to a graphic of a mine later
    })
    console.log(hasMineArray)
}

function checkBoardState() {

}

function updateBoardState() {

}

function revealMines() {

}

// Next steps:
// 1. Display Total no of bombs to be cleared
// 2. add boardState property of validMove, default is true, once clicked it should be false -> change cell colour for now
// 3. add hover effect for validMove = true cells
// 4. detect if bomb is triggered -> triggers game win loss condition
// 5. reveal number of bombs in surrounding cells
// 6. right click to place flags -> toggle right-clickable status but only if cell is validMove = true
