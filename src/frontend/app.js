let allQuestions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
const QUESTIONS_PER_GAME = 13;
let questionsLoaded = false;

// Scoring sequence for croquet hoops
const hoopScoring = [
    '1', '2', '3', '4', '5', '6',
    '1B', '2B', '3B', '4B',
    'Pn', 'R', 'Pg', 'Box'
];

// Add color scheme for different achievement levels
const achievementColors = {
    'Box': '#FFD700',      // Gold
    'Pg': '#C0C0C0',      // Silver
    'R': '#CD7F32',       // Bronze
    '4B': '#90EE90',      // Light green
    '3B': '#87CEEB',      // Sky blue
    '2B': '#DDA0DD',      // Plum
    '1B': '#F0E68C',      // Khaki
    '6': '#FFB6C1'        // Light pink
};

// Load Wylie figure mapping
let wylieFigureMap = {};
fetch('wylie-figure-map.json')
    .then(response => response.json())
    .then(data => {
        wylieFigureMap = data;
        console.log('Loaded Wylie figure mapping');
    })
    .catch(error => {
        console.error('Error loading Wylie figure mapping:', error);
    });

// Fetch questions from JSON file
fetch('croquet-questions.json')
    .then(response => response.json())
    .then(data => {
        // Validate the questions file
        if (!data.version || !data.questionCount || data.questionCount !== data.questions.length) {
            console.error('Invalid questions file format');
            alert('Error: Invalid questions file format. Please contact the administrator.');
            return;
        }
        allQuestions = data.questions;
        questionsLoaded = true;
        console.log(`Loaded ${allQuestions.length} total questions (version ${data.version})`);
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
    
    // Initialize score display
    document.getElementById('currentScore').textContent = '0';
    // Update question counter
    document.getElementById('currentQuestion').textContent = '1';
    document.getElementById('totalQuestions').textContent = QUESTIONS_PER_GAME.toString();

    // Hide start screen elements
    document.getElementById('startQuiz').style.display = 'none';
    document.querySelector('.quiz-description').style.display = 'none';
    
    // Show quiz content
    document.getElementById('quizContent').style.display = 'block';
    showQuestion(currentQuestions[currentQuestionIndex]);
}

function showQuestion(question) {
    // Update question counter
    document.getElementById('currentQuestion').textContent = (currentQuestionIndex + 1).toString();
    
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
    
    // Reset the current score display to just show the number
    document.getElementById('currentScore').textContent = score.toString();

    // Handle image if present
    const imageContainer = document.getElementById('question-image-container');
    const image = document.getElementById('question-image');
    
    if (question.image) {
        let imagePath;
        
        // Check if this is a Wylie figure reference
        if (question.image.wylieFigure && wylieFigureMap) {
            const [article, figure] = question.image.wylieFigure.split('.');
            const articleKey = `article${article}`;
            if (wylieFigureMap[articleKey] && wylieFigureMap[articleKey][question.image.wylieFigure]) {
                imagePath = wylieFigureMap[articleKey][question.image.wylieFigure];
            } else {
                console.error('Could not find Wylie figure:', question.image.wylieFigure);
                imageContainer.style.display = 'none';
                return;
            }
        } else if (question.image.path) {
            // Use direct path
            imagePath = question.image.path.startsWith('/') ? 
                question.image.path.slice(1) : 
                question.image.path;
        } else {
            console.error('No valid image reference found:', question.image);
            imageContainer.style.display = 'none';
            return;
        }
        
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
        
        image.src = imagePath;
        image.alt = "Position diagram";
        imageContainer.style.display = 'block';
    } else {
        console.log('No image provided for question:', question);
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
        // Update score display with "You made hoop X" after correct answer
        const currentHoop = hoopScoring[score - 1];
        let hoopText;
        if (currentHoop === 'Pn') {
            hoopText = 'Made Penultimate!';
        } else if (currentHoop === 'R') {
            hoopText = 'Made Rover!';
        } else if (currentHoop === 'Pg') {
            hoopText = 'Made Peg!';
        } else if (currentHoop === 'Box') {
            hoopText = 'Finished the course!';
        } else {
            hoopText = `Made hoop ${currentHoop}`;
        }
        // Add a slight delay to show the achievement after the answer verification
        setTimeout(() => {
            document.getElementById('currentScore').textContent = hoopText;
        }, 500);
    }

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
    
    const achievement = hoopScoring[score - 1] || '0';
    
    // Update the existing elements instead of replacing the entire HTML
    document.getElementById('score').textContent = achievement;
    document.getElementById('rating').textContent = 
        achievement === 'Box' ? 'Congratulations! You completed the full course!' : 
        achievement === '0' ? 'Keep practicing!' : 
        `You made it to hoop ${achievement}!`;
    
    // Save score
    const name = document.getElementById('nameInput').value;
    saveScore(name, achievement);
    updateScoreboards();
}

function saveScore(name, achievement) {
    const today = new Date().toISOString().split('T')[0];
    let displayAchievement;
    
    if (achievement === 'Pn') {
        displayAchievement = 'made Penultimate';
    } else if (achievement === 'R') {
        displayAchievement = 'made Rover';
    } else if (achievement === 'Pg') {
        displayAchievement = 'made Peg';
    } else if (achievement === 'Box') {
        displayAchievement = 'finished the course';
    } else if (achievement === '0') {
        displayAchievement = 'started playing';
    } else {
        displayAchievement = `made hoop ${achievement}`;
    }

    const scoreData = {
        name,
        achievement: displayAchievement,
        date: today,
        rawAchievement: achievement // Keep the raw achievement for sorting
    };

    // Save to today's scores
    let todayScores = {};
    todayScores[today] = [scoreData];
    localStorage.setItem('croquetQuizScores', JSON.stringify(todayScores));

    // Update all-time high scores
    let allTimeScores = [scoreData];
    localStorage.setItem('croquetQuizAllTimeScores', JSON.stringify(allTimeScores));
}

function updateScoreboards() {
    // Update today's scores
    const today = new Date().toISOString().split('T')[0];
    const todayScores = JSON.parse(localStorage.getItem('croquetQuizScores')) || {};
    const todayScoresList = todayScores[today] || [];
    
    const todayScoresHtml = todayScoresList
        .sort((a, b) => hoopScoring.indexOf(b.rawAchievement) - hoopScoring.indexOf(a.rawAchievement))
        .map(score => {
            const color = achievementColors[score.rawAchievement] || '#333333';
            return `<div style="color: ${color}; font-weight: bold;">
                ${score.name}: ${score.achievement}
            </div>`;
        })
        .join('');
    
    document.getElementById('todayScores').innerHTML = todayScoresHtml || 'No scores yet today';

    // Update all-time scores
    const allTimeScores = JSON.parse(localStorage.getItem('croquetQuizAllTimeScores')) || [];
    const allTimeScoresHtml = allTimeScores
        .sort((a, b) => hoopScoring.indexOf(b.rawAchievement) - hoopScoring.indexOf(a.rawAchievement))
        .map(score => {
            const color = achievementColors[score.rawAchievement] || '#333333';
            return `<div style="color: ${color}; font-weight: bold;">
                ${score.name}: ${score.achievement}
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

function resetAllTimeScores() {
    localStorage.setItem('croquetQuizAllTimeScores', JSON.stringify([]));
    updateScoreboards();
}

// Initialize scoreboards
updateScoreboards(); 

// Clear existing scores when the page loads
localStorage.removeItem('croquetQuizScores');
localStorage.removeItem('croquetQuizAllTimeScores'); 