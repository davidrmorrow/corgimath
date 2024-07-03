const questionElement = document.getElementById('question');
const answersElement = document.getElementById('answers');
const scoreElement = document.getElementById('score');
let score = 0;
let maxPossibleScore = 0;
let incorrectAnswers; // Total number of incorrect answers
let incorrectAnswersRemaining; // New variable to track remaining incorrect answers
let hearts; // Total hearts
let lastMilestoneReached; // Tracks the highest milestone reached
let milestoneIncrements; // Size of milestone increments
const milestoneTitles = [
    'Great Job!',
    'Amazing!',
    'Incredible!',
    'Unstoppable!',
    'Unbelievable!',
    'Super!!!!!'
    // Add more titles as needed for further milestones
];

let gameSettings = {
    currentDifficulty: 'easy',
    operations: {
        '+': { enabled: true, min: 1, max: 10 },
        '-': { enabled: true, min: 1, max: 10 },
        '×': { enabled: false, min: 1, max: 10 },
        '÷': { enabled: false, min: 1, max: 10 }
    },
    customSettings: {
        '+': { enabled: true, min: 1, max: 10 },
        '-': { enabled: true, min: 1, max: 10 },
        '×': { enabled: false, min: 1, max: 10 },
        '÷': { enabled: false, min: 1, max: 10 }
    }
};

function startGame() {
    lastMilestoneReached = 0;
    milestoneIncrements = 30;
    hearts = 5;
    incorrectAnswers = 3;
    score = 0;
    scoreElement.innerText = 'Score: 0';
    updateHearts();
    generateQuestion();
}

function generateQuestion() {
    const enabledOperations = Object.keys(gameSettings.operations).filter(op => gameSettings.operations[op].enabled);
    const operation = enabledOperations[Math.floor(Math.random() * enabledOperations.length)];

    const min = gameSettings.operations[operation].min;
    const max = gameSettings.operations[operation].max;

    let num1 = Math.floor(Math.random() * (max - min + 1)) + min;
    let num2 = Math.floor(Math.random() * (max - min + 1)) + min;

    let correctAnswer;
    switch (operation) {
        case '+':
            correctAnswer = num1 + num2;
            break;
        case '-':
            if (num1 < num2) {
                [num1, num2] = [num2, num1];
            }
            correctAnswer = num1 - num2;
            break;
        case '×':
            correctAnswer = num1 * num2;
            break;
        case '÷':
            num2 = num1 !== 0 ? num2 : 2;
            correctAnswer = Math.floor(num1 / num2);
            num1 = correctAnswer * num2;
            break;
        default:
            console.error("Unknown mathematical operation requested: " + operation);
            generateQuestion();
            return;
    }

    const question = `What is ${num1} ${operation} ${num2}?`;
    questionElement.innerText = question;
    maxPossibleScore += 4;
    generateAnswers(correctAnswer);
}

function generateAnswers(correctAnswer) {
    answersElement.innerHTML = '';
    const correctPosition = Math.floor(Math.random() * (incorrectAnswers + 1));
    let answers = new Set([correctAnswer]);

    for (let i = 0; i < incorrectAnswers + 1; i++) {
        const button = document.createElement('button');
        let answerValue = i == correctPosition ? correctAnswer : generateAnswerValue(i, correctAnswer, answers);
        button.innerText = answerValue;
        button.addEventListener('click', function () {
            checkAnswer(this, correctAnswer);
        });
        answersElement.appendChild(button);
    }

    incorrectAnswersRemaining = incorrectAnswers;
}

function generateAnswerValue(index, correctAnswer, answers) {
    let incorrectAnswer;
    do {
        if (correctAnswer < 10) {
            incorrectAnswer = correctAnswer + Math.floor((Math.random() * 10)) - 5;
        } else {
            const offset = Math.floor(Math.random() * (correctAnswer * 0.25 + 1));
            incorrectAnswer = correctAnswer + (Math.random() < 0.5 ? -offset : offset);
        }
        if (incorrectAnswer < 0) incorrectAnswer = Math.abs(incorrectAnswer);
    } while (answers.has(incorrectAnswer));
    answers.add(incorrectAnswer);
    return incorrectAnswer;
}

function checkAnswer(clickedButton, correctAnswer) {
    const isCorrect = parseInt(clickedButton.innerText) === correctAnswer;
    const buttons = answersElement.querySelectorAll('button');
    /*
    buttons.forEach(btn => {
        if (parseInt(btn.innerText) === correctAnswer) {
            btn.style.backgroundColor = 'lightgreen'; // Highlight the correct answer
        }
    });
    */

    if (!isCorrect) {
        clickedButton.disabled = true; // Disable the incorrect button
        clickedButton.style.backgroundColor = 'darkred'; // Change the color to dark red
        clickedButton.style.color = 'white'; // Change font color to white
        hearts -= 1;
        //updateHearts();
        if (hearts === 0) {
            showGameOverScreen();
        }
    } else {
        clickedButton.style.backgroundColor = 'lightgreen';
        score += incorrectAnswersRemaining; // Adjust score calculation if needed
        scoreElement.innerText = `Score: ${score}`;
        checkScoreMilestone(); // Check for milestones after updating the score
        setTimeout(generateQuestion, 1000); // Move to the next question after a brief pause
    }
}

function updateHearts() {
    const livesContainer = document.getElementById('lives');
    livesContainer.innerHTML = '';
    for (let i = 0; i < hearts; i++) {
        livesContainer.innerHTML += '<img src="./images/heart.webp" alt="Full Heart" class="heart">';
    }
}

function showGameOverScreen() {
    const gameOverModal = document.createElement('div');
    gameOverModal.innerHTML = `
        <div class="game-over-container">
            <img src="images/game-over-corgi.webp" alt="A Sad Corgi" id="game-over-corgi" />
            <h1>Game Over</h1>
            <p>Your score: ${score}</p>
            <button onclick="restartGame()">Try Again</button>
        </div>
    `;
    gameOverModal.classList.add('modal');
    document.body.appendChild(gameOverModal);
}

function checkScoreMilestone() {
    const currentMilestoneIndex = Math.floor(score / milestoneIncrements);
    if (currentMilestoneIndex > lastMilestoneReached) {
        if (currentMilestoneIndex < milestoneTitles.length) {
            const imageName = `images/HappyCorgi${currentMilestoneIndex + 1}.webp`;
            const title = milestoneTitles[currentMilestoneIndex];
            showMilestoneModal(imageName, title);
            lastMilestoneReached = currentMilestoneIndex;
        }
    }
}

function showMilestoneModal(image, title) {
    const milestoneModal = document.createElement('div');
    milestoneModal.innerHTML = `
        <div class="game-over-container">
            <img src="${image}" alt="Happy Corgi" id="milestone-corgi" />
            <h1>${title}</h1>
            <p>Your score: ${score}</p>
            <button onclick="closeMilestoneModal()">Continue</button>
        </div>
    `;
    milestoneModal.classList.add('modal');
    document.body.appendChild(milestoneModal);
}

function closeMilestoneModal() {
    document.querySelector('.modal').remove();
}

function restartGame() {
    document.querySelector('.modal').remove();
    score = 0;
    hearts = 5;
    scoreElement.innerText = 'Score: 0';
    updateHearts();
    startGame();
}

// Debounce function to limit the rate of function execution
function debounce(func, delay) {
    let debounceTimer;
    return function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, arguments), delay);
    };
}

// Function to show custom toast confirmation
function showCustomToast(message) {
    Toastify({
        text: message,
        duration: 1500, // Duration in milliseconds
        close: true,    // Show close button
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        backgroundColor: "#4caf50", // Green color for success
        stopOnFocus: true, // Prevents dismissing of toast on hover
    }).showToast();
}

/*
// Function to save settings to localStorage
function saveSettings(settings) {
    localStorage.setItem('customSettings', JSON.stringify(settings));
}

// Function to load settings from localStorage
function loadSettings() {
    const settings = localStorage.getItem('customSettings');
    return settings ? JSON.parse(settings) : {};
}

// Function to apply settings
function applySettings(settings) {
    // Apply the settings to the game (this part is customized as needed)
    console.log('Applying settings:', settings);
}
*/

// Function to update and save settings, and show toast notification
const debouncedUpdateSettings = debounce((difficulty) => {
    if (difficulty !== 'custom') {
        gameSettings.currentDifficulty = difficulty;
        switch (difficulty) {
            case "easy":
                updateOperationSettings(true, true, false, false, 1, 10, 1, 10);
                break;
            case "medium":
                updateOperationSettings(true, true, true, true, 1, 10, 1, 10);
                break;
            case "hard":
                updateOperationSettings(true, true, true, true, 1, 99, 1, 12);
                break;
        }
    } else {
        const add = document.getElementById('add').checked;
        const subtract = document.getElementById('subtract').checked;
        const multiply = document.getElementById('multiply').checked;
        const divide = document.getElementById('divide').checked;

        const minAddSub = parseInt(document.querySelector('.operation[data-operation="+"] .min-number').value);
        const maxAddSub = parseInt(document.querySelector('.operation[data-operation="+"] .max-number').value);
        const minSub = parseInt(document.querySelector('.operation[data-operation="-"] .min-number').value);
        const maxSub = parseInt(document.querySelector('.operation[data-operation="-"] .max-number').value);
        const minMul = parseInt(document.querySelector('.operation[data-operation="×"] .min-number').value);
        const maxMul = parseInt(document.querySelector('.operation[data-operation="×"] .max-number').value);
        const minDiv = parseInt(document.querySelector('.operation[data-operation="÷"] .min-number').value);
        const maxDiv = parseInt(document.querySelector('.operation[data-operation="÷"] .max-number').value);

        // Assuming the same range for addition and subtraction, otherwise adjust accordingly
        updateOperationSettings(add, subtract, multiply, divide, minAddSub, maxAddSub, minMul, maxMul, minSub, maxSub, minDiv, maxDiv);
    }

    showCustomToast("Settings updated.");
}, 2000);

// Function to update operation settings
function updateOperationSettings(add, subtract, multiply, divide, minAdd, maxAdd, minMul, maxMul, minSub, maxSub, minDiv, maxDiv) {
    gameSettings.operations['+'].enabled = add;
    gameSettings.operations['-'].enabled = subtract;
    gameSettings.operations['×'].enabled = multiply;
    gameSettings.operations['÷'].enabled = divide;
    gameSettings.operations['+'].min = minAdd;
    gameSettings.operations['-'].min = minSub;
    gameSettings.operations['×'].min = minMul;
    gameSettings.operations['÷'].min = minDiv;
    gameSettings.operations['+'].max = maxAdd;
    gameSettings.operations['-'].max = maxSub;
    gameSettings.operations['×'].max = maxMul;
    gameSettings.operations['÷'].max = maxDiv;
}

// Attach event listeners to difficulty radio buttons
document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
    radio.addEventListener('change', function () {
        const customSettings = document.getElementById('custom-settings');
        debouncedUpdateSettings(this.value);
        if (this.value === 'custom') {
            customSettings.style.display = 'block';
        } else {
            customSettings.style.display = 'none';
        }
    });
});

// Attach event listeners to custom settings inputs
document.querySelectorAll('#custom-settings .operation input, #custom-settings .operation .min-number, #custom-settings .operation .max-number').forEach(element => {
    element.addEventListener('input', () => debouncedUpdateSettings('custom'));
});

// Initial settings load and apply
document.addEventListener('DOMContentLoaded', () => {
    const settings = loadSettings();
    //applySettings(settings);

    // Populate form with loaded settings
    for (const [key, value] of Object.entries(settings)) {
        const element = document.getElementById(key);
        if (element) {
            element.type === 'checkbox' ? element.checked = value : element.value = value;
        }
    }
});

startGame();