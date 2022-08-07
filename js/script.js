/*----- constants -----*/
const cellWidth = 15; //px
const diffParameters = [
    {difficulty: "easy", gridSize: 9, mines: 10},
    {difficulty: "medium", gridSize: 16, mines: 40},
    {difficulty: "hard", gridSize: 22, mines: 99},
];

/*----- app's state (variables) -----*/
let gameOver = false;
let validMove;
let diffSelected;
let boardState = [];

/*----- cached element references -----*/
const diffEl = document.querySelectorAll(".diff");
const resetEl = document.getElementById("reset");
const messageEl = document.getElementById("message");

/*----- event listeners -----*/
for (let i = 0; i < diffEl.length; i++) {diffEl[i].addEventListener("click", setDifficulty)};
resetEl.addEventListener("click",init);

/*----- functions -----*/
init();

function init() {
    for (let i = 0; i < diffEl.length; i++) {diffEl[i].addEventListener("click", setDifficulty)};
    messageEl.textContent = "First, select a difficulty level";
    // for (let i = 0; i < diffSelected.length; i++) {diffSelected[i] = false};
}

function setDifficulty(evt) {
    diffSelected = diffParameters.find(element => element.difficulty === evt.target.id);
    messageEl.textContent = `You have selected ${evt.target.id} difficulty`;
    //now disable the event listener for difficulty selection until this current game is finished
    for (let i = 0; i < diffEl.length; i++) {
        diffEl[i].removeEventListener("click", setDifficulty);
    }
    // makeGrid();
}