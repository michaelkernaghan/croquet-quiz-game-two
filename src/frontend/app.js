let allQuestions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
const QUESTIONS_PER_GAME = 10;
let questionsLoaded = false;

// Add color scheme for different achievement levels
const achievementColors = {
    'Robert Fulford': '#FFD700',    // Gold
    'Reg Bamford': '#C0C0C0',       // Silver
    'John Solomon': '#CD7F32',      // Bronze
    'Keith Wylie': '#90EE90',       // Light green
    'Chris Clarke': '#87CEEB',      // Sky blue
    'John Prince': '#DDA0DD',       // Plum
    'Pat Cotter': '#F0E68C',        // Khaki
    'David Openshaw': '#FFB6C1'     // Light pink
};

// Fetch questions from JSON file
fetch('croquet-questions.json')
    .then(response => response.json())
    .then(data => {
        allQuestions = data.questions;
        questionsLoaded = true;
        console.log(`Loaded ${allQuestions.length} total questions`);
    })
    .catch(error => {
        console.error('Error loading questions:', error);
        alert('Error loading questions. Please refresh the page.');
    });

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function selectRandomQuestions() {
    if (!questionsLoaded || !allQuestions.length) {
        console.error('Questions not loaded yet');
        return [];
    }
    let shuffledQuestions = [...allQuestions];
    shuffleArray(shuffledQuestions);
    return shuffledQuestions.slice(0, QUESTIONS_PER_GAME);
}

function startQuiz() {
    const nameInput = document.getElementById('nameInput').value;

    if (!nameInput) {
        alert('Please enter your name');
        return;
    }

    if (!questionsLoaded) {
        alert('Please wait for questions to load');
        return;
    }

    // Select random questions for this game
    currentQuestions = selectRandomQuestions();
    if (!currentQuestions.length) {
        alert('Error loading questions. Please refresh the page.');
        return;
    }

    currentQuestionIndex = 0;
    score = 0;
    
    // Initialize score and update display
    document.getElementById('currentScore').textContent = '0';
    document.getElementById('currentTotal').textContent = '0';

    // Hide start screen elements
    document.getElementById('startQuiz').style.display = 'none';
    document.querySelector('.quiz-description').style.display = 'none';
    
    // Show quiz content
    document.getElementById('quizContent').style.display = 'block';
    showQuestion(currentQuestions[currentQuestionIndex]);
}

function showQuestion(question) {
    // Remove any reference to Wylie in the question text
    const questionText = question.question.replace(/from Wylie's text|according to Wylie,?/gi, '');
    
    // Add context for diagram questions if available
    let displayText;
    if (question.correctTheory) {
        const context = [];
        if (question.correctTheory.activePlayer && question.correctTheory.currentHoop) {
            context.push(`Playing ${question.correctTheory.activePlayer} for ${question.correctTheory.currentHoop}`);
        }
        if (question.correctTheory.ballContext) {
            // Remove redundant ball position information
            const ballContext = question.correctTheory.ballContext
                .replace(new RegExp(`${question.correctTheory.activePlayer} is for ${question.correctTheory.currentHoop},?\\s*`), '')
                .replace(new RegExp(`${question.correctTheory.activePlayer} for ${question.correctTheory.currentHoop},?\\s*`), '');
            if (ballContext.trim()) {
                context.push(ballContext);
            }
        }
        displayText = context.length > 0 ? `[${context.join('\n')}]\n\n<i>${questionText}</i>` : `<i>${questionText}</i>`;
    } else {
        // For non-diagram questions, make the entire question italic
        displayText = `<i>${questionText}</i>`;
    }
    
    document.getElementById('question-text').innerHTML = displayText;
    
    // Handle image if present
    const imageContainer = document.getElementById('question-image-container');
    const image = document.getElementById('question-image');
    
    if (question.image && question.image.path) {
        // Use path relative to the frontend directory
        const imagePath = question.image.path.startsWith('/') ? 
            question.image.path.slice(1) : 
            question.image.path;
        
        console.log('Attempting to load image:', imagePath);
        
        image.onload = () => {
            console.log('Image loaded successfully:', imagePath);
            imageContainer.style.display = 'block';
        };
        
        image.onerror = (e) => {
            console.error('Failed to load image:', imagePath);
            console.error('Error details:', e);
            console.error('Full image URL:', image.src);
            imageContainer.style.display = 'none';
        };
        
        // Use the actual path from the question object
        image.src = imagePath;
        image.alt = "Position diagram";
        imageContainer.style.display = 'block';
    } else {
        console.log('No image path provided for question:', question);
        imageContainer.style.display = 'none';
    }

    // Clear previous answers
    const answersContainer = document.getElementById('answers-container');
    answersContainer.innerHTML = '';

    // Add new answer buttons
    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.className = 'answer-button';
        button.textContent = answer.answer;
        button.onclick = () => selectAnswer(index);
        answersContainer.appendChild(button);
    });

    // Hide the next button until an answer is selected
    document.getElementById('nextButton').style.display = 'none';
    document.getElementById('dubiousButton').style.display = 'none';
}

function selectAnswer(selectedIndex) {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const buttons = document.querySelectorAll('.answer-button');
    const correctAnswerIndex = currentQuestion.answers.findIndex(a => a.correct);

    buttons.forEach((button, index) => {
        button.disabled = true;
        if (index === correctAnswerIndex) {
            button.classList.add('correct');
            // Show explanation for correct answer
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'answer-explanation';
            let explanationText = `Source: ${currentQuestion.citation}`;
            if (currentQuestion.correctTheory && currentQuestion.correctTheory.summary) {
                explanationText += `\n\n${currentQuestion.correctTheory.summary}`;
            }
            explanationDiv.innerText = explanationText;
            button.appendChild(explanationDiv);
        } else if (index === selectedIndex && selectedIndex !== correctAnswerIndex) {
            button.classList.add('incorrect');
        }
    });

    if (selectedIndex === correctAnswerIndex) {
        score++;
    }
    document.getElementById('currentScore').textContent = score;
    document.getElementById('currentTotal').textContent = currentQuestionIndex + 1;

    // Show both next and dubious buttons
    document.getElementById('nextButton').style.display = 'inline-block';
    document.getElementById('dubiousButton').style.display = 'inline-block';
}

function handleNext() {
    currentQuestionIndex++;
    if (currentQuestionIndex < QUESTIONS_PER_GAME) {
        showQuestion(currentQuestions[currentQuestionIndex]);
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('quizContent').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    
    const rating = getRating(score);
    
    // Create results HTML
    const resultsHTML = `
        <h2>Quiz Complete!</h2>
        <div class="score-display">
            <span>Your final score: </span>
            <span class="score-number">${score}/${QUESTIONS_PER_GAME}</span>
        </div>
        <div class="achievement-status">
            You have achieved ${rating} status!
        </div>
        <button onclick="restartQuiz()" class="play-again-button">Play Again</button>
    `;
    
    document.getElementById('results').innerHTML = resultsHTML;
    
    // Save score
    const name = document.getElementById('nameInput').value;
    saveScore(name, score);
    updateScoreboards();
}

function getRating(score) {
    const percentage = (score / QUESTIONS_PER_GAME) * 100;
    if (percentage >= 90) return 'Robert Fulford';      // World Champion level
    if (percentage >= 80) return 'Reg Bamford';        // Grandmaster level
    if (percentage >= 70) return 'John Solomon';       // Master level
    if (percentage >= 60) return 'Keith Wylie';        // Expert level
    if (percentage >= 50) return 'Chris Clarke';       // Advanced level
    if (percentage >= 40) return 'John Prince';        // Intermediate level
    if (percentage >= 30) return 'Pat Cotter';         // Improving level
    return 'David Openshaw';                           // Beginner level
}

function saveScore(name, score) {
    const today = new Date().toISOString().split('T')[0];
    const rating = getRating(score);
    const scoreData = {
        name,
        score,
        rating,
        date: today
    };

    // Save to today's scores
    let todayScores = JSON.parse(localStorage.getItem('croquetQuizScores')) || {};
    if (!todayScores[today]) {
        todayScores[today] = [];
    }
    todayScores[today].push(scoreData);
    localStorage.setItem('croquetQuizScores', JSON.stringify(todayScores));

    // Update all-time high scores
    let allTimeScores = JSON.parse(localStorage.getItem('croquetQuizAllTimeScores')) || [];
    allTimeScores.push(scoreData);
    allTimeScores.sort((a, b) => b.score - a.score);
    allTimeScores = allTimeScores.slice(0, 10); // Keep only top 10
    localStorage.setItem('croquetQuizAllTimeScores', JSON.stringify(allTimeScores));
}

function updateScoreboards() {
    // Update today's scores
    const today = new Date().toISOString().split('T')[0];
    const todayScores = JSON.parse(localStorage.getItem('croquetQuizScores')) || {};
    const todayScoresList = todayScores[today] || [];
    
    const todayScoresHtml = todayScoresList
        .sort((a, b) => b.score - a.score)
        .map(score => {
            const color = achievementColors[score.rating];
            return `<div style="color: ${color}; font-weight: bold;">
                ${score.name}: ${score.score}/${QUESTIONS_PER_GAME}
            </div>`;
        })
        .join('');
    
    document.getElementById('todayScores').innerHTML = todayScoresHtml || 'No scores yet today';

    // Update all-time scores
    const allTimeScores = JSON.parse(localStorage.getItem('croquetQuizAllTimeScores')) || [];
    const allTimeScoresHtml = allTimeScores
        .map(score => {
            const color = achievementColors[score.rating];
            return `<div style="color: ${color}; font-weight: bold;">
                ${score.name}: ${score.score}/${QUESTIONS_PER_GAME}
            </div>`;
        })
        .join('');
    
    document.getElementById('allTimeScores').innerHTML = allTimeScoresHtml || 'No scores yet';
}

function resetScores() {
    const today = new Date().toISOString().split('T')[0];
    let todayScores = JSON.parse(localStorage.getItem('croquetQuizScores')) || {};
    todayScores[today] = [];
    localStorage.setItem('croquetQuizScores', JSON.stringify(todayScores));
    updateScoreboards();
}

function restartQuiz() {
    // Select new random questions for the new game
    currentQuestions = selectRandomQuestions();
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('results').style.display = 'none';
    document.getElementById('startQuiz').style.display = 'block';
    document.querySelector('.quiz-description').style.display = 'block';
    // Don't clear the name input
    startQuiz(); // Automatically start the quiz since we have the name
}

function handleDubious() {
    // Get current question
    const currentQuestion = currentQuestions[currentQuestionIndex];
    
    // Create report
    const report = {
        question: currentQuestion.question,
        questionId: currentQuestionIndex,
        timestamp: new Date().toISOString(),
        category: currentQuestion.category
    };
    
    // Save dubious question report
    fetch('/api/dubious-questions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
    })
    .catch(error => console.error('Error saving dubious question:', error));
    
    // Increment score and move to next question
    score++;
    document.getElementById('currentScore').textContent = score;
    document.getElementById('currentTotal').textContent = currentQuestionIndex + 1;
    
    // Move to next question immediately
    handleNext();
}

// Initialize scoreboards
updateScoreboards(); 