// Global Variables
var winningWord = '';
var currentRow = 1;
var guess = '';
var gamesPlayed = [];
let words;
let percentWon;
let avgGuesses;


// Query Selectors
var inputs = document.querySelectorAll('input'); //all of the boxes
var guessButton = document.querySelector('#guess-button');
var keyLetters = document.querySelectorAll('span');
var errorMessage = document.querySelector('#error-message');
var viewRulesButton = document.querySelector('#rules-button');
var viewGameButton = document.querySelector('#play-button');
var viewStatsButton = document.querySelector('#stats-button');
var gameBoard = document.querySelector('#game-section');
var letterKey = document.querySelector('#key-section');
var rules = document.querySelector('#rules-section');
var stats = document.querySelector('#stats-section');
var gameOverBox = document.querySelector('#game-over-section');
var gameLossBox = document.querySelector('#game-loss-section');
var gameLossWord = document.querySelector('#winning-word');
var gameOverGuessCount = document.querySelector('#game-over-guesses-count');
var gameOverGuessGrammar = document.querySelector('#game-over-guesses-plural');
var statsTotalGames = document.querySelector('#stats-total-games');
var statsPercentWins = document.querySelector('#stats-percent-correct');
var statsAvgGuesses = document.querySelector('#stats-average-guesses');


fetch("http://localhost:3001/api/v1/words")
.then(response => response.json())
.then(data => {
  words = data;
  setGame()})

// Event Listeners

inputs.forEach(input => input.addEventListener('keyup', function() {moveToNextInput(event)}))

keyLetters.forEach(letter => letter.addEventListener('click', function() {clickLetter(event)}))

guessButton.addEventListener('click', submitGuess);

viewRulesButton.addEventListener('click', viewRules);

viewGameButton.addEventListener('click', viewGame);

viewStatsButton.addEventListener('click', viewStats);

// Functions
function setGame() {
  currentRow = 1;         //resets currentRow to 1
  winningWord = getRandomWord();    //sets the winningWord to a random word (weird that it isn't accessible globally)
  // console.log("inside set game", winningWord)
  updateInputPermissions();
}



function getRandomWord() {
  var randomIndex = Math.floor(Math.random() * 2500);
  console.log(words[randomIndex])
  return words[randomIndex];
}

function updateInputPermissions() {  //inputs is all of the boxes that can be typed into, this function decides based on whether the inputs id includes 'currentRow' which is a number
  inputs.forEach(input => {
    if(!input.id.includes(`-${currentRow}-`)) {
      input.disabled = true; //adding a disabled property?
    } else {
      input.disabled = false;
    }
  })
  
  inputs[0].focus();
}

function moveToNextInput(e) {
  var key = e.keyCode || e.charCode;

  if( key !== 8 && key !== 46 ) {
    var indexOfNext = parseInt(e.target.id.split('-')[2]) + 1;
    inputs[indexOfNext].focus();
  }
}

function clickLetter(e) {
  var activeInput = null;
  var activeIndex = null;

  inputs.forEach((input, index) => {
    if(input.id.includes(`-${currentRow}-`) && !input.value && !activeInput) {
      activeInput = input;
      activeIndex = index;
    }
  })
  
  activeInput.value = e.target.innerText;
  inputs[activeIndex + 1].focus();
}

function submitGuess() {
  if (checkIsWord()) {
    errorMessage.innerText = '';
    compareGuess();
    if (checkForWin()) {
      setTimeout(declareWinner, 1000);
    } else if(currentRow === 6 && !checkForWin()){
      setTimeout(declareLoser, 1000)
    } else {
      changeRow();

    }
  } else {
    errorMessage.innerText = 'Not a valid word. Try again!';
  }
}

function checkIsWord() {
  guess = '';

  inputs.forEach(input => {
    if(input.id.includes(`-${currentRow}-`)) {
      guess += input.value;
    }
  })

  return words.includes(guess);
}

function compareGuess() {
  var guessLetters = guess.split('');
  console.log(guessLetters)
  
    guessLetters.forEach((letter, index) => {
      if (winningWord.includes(letter) && winningWord.split('')[index] !== letter) {
        updateBoxColor(index, 'wrong-location');
        updateKeyColor(letter, 'wrong-location-key');
      } else if (winningWord.split('')[index] === letter) {
        updateBoxColor(index, 'correct-location');
        updateKeyColor(letter, 'correct-location-key');
      } else {
        updateBoxColor(index, 'wrong');
        updateKeyColor(letter, 'wrong-key');
      }
    })
}

function updateBoxColor(letterLocation, className) {
  var row = [];

  inputs.forEach(input => {
    if(input.id.includes(`-${currentRow}-`)) {
      row.push(input);
    }
  })

  row[letterLocation].classList.add(className);
}

function updateKeyColor(letter, className) {    //updates the color of the letters of the alphabet on the left
  var keyLetter = null;

  keyLetters.forEach(item =>  {
      if (item.innerText === letter) {
        keyLetter = item;
      }
    });

  keyLetter.classList.add(className);
}

function checkForWin() {
  return guess === winningWord;
}

function changeRow() {
  currentRow++;
  updateInputPermissions();
}

function declareWinner() {
  recordGameStats(); //adds an object literal to the gamesPlayed array 
  changeGameOverText();
  viewGameOverMessageWin();
  setTimeout(startNewGame, 4000);
}

function declareLoser() {
  recordGameStats(); 
  gameLossWord.innerText = winningWord;
  viewGameOverMessageLoss();
  setTimeout(startNewGame, 4000);
}

function recordGameStats() {
  if(checkForWin()){
    gamesPlayed.push({ solved: true, guesses: currentRow });
  } else {
    gamesPlayed.push({solved: false, guesses: 6})
  }
}

function getStats() {
  const gamesWon = gamesPlayed.filter(game => game.solved)
  percentWon = Math.round(gamesWon.length/gamesPlayed.length * 100)
  const numGuesses = gamesPlayed.reduce((acc, game) => {
    acc += game.guesses
    return acc
  }, 0)
  avgGuesses = Math.round(numGuesses/gamesPlayed.length)
}

function changeGameOverText() {
  gameOverGuessCount.innerText = currentRow;
  if (currentRow < 2) {
    gameOverGuessGrammar.classList.add('collapsed');
  } else {
    gameOverGuessGrammar.classList.remove('collapsed');
  }
}

function startNewGame() {
  clearGameBoard();
  clearKey();
  setGame();
  viewGame();
  inputs[0].focus();
}

function clearGameBoard() {
  inputs.forEach(input => {
    input.value = '';
    input.classList.remove('correct-location', 'wrong-location', 'wrong');
  })
}

function clearKey() {
  keyLetters.forEach(item => {
    item.classList.remove('correct-location-key', 'wrong-location-key', 'wrong-key');
  }) 
}

// Change Page View Functions

function viewRules() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.remove('collapsed');
  stats.classList.add('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.add('active');
  viewStatsButton.classList.remove('active');
}

function viewGame() {
  letterKey.classList.remove('hidden');
  gameBoard.classList.remove('collapsed');
  rules.classList.add('collapsed');
  stats.classList.add('collapsed');
  gameOverBox.classList.add('collapsed')
  viewGameButton.classList.add('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.remove('active');
  gameLossBox.classList.add('collapsed')
}

function viewStats() {
  
  getStats()
  statsTotalGames.innerText = gamesPlayed.length;
  statsPercentWins.innerText = percentWon;
  statsAvgGuesses.innerText = avgGuesses;
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.add('collapsed');
  stats.classList.remove('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.add('active');
}

function viewGameOverMessageWin() {
  gameOverBox.classList.remove('collapsed')
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
}
function viewGameOverMessageLoss() {
  gameLossBox.classList.remove('collapsed')
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
}
