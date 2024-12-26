const fs = require('fs');

// Read the current questions file
const questionsFile = fs.readFileSync('./src/frontend/art-questions.json');
const questions = JSON.parse(questionsFile);

// List of fake/duplicate Adorno works to remove
const toRemove = [
    'The End of Art',
    'The Passage of Apollo',
    'The Concept of Irony',
    'The Philosophy of Modern Enlightenment',
    'The Philosophy of History',
    'The Philosophy of the Present',
    'The Philosophy of Technology',
    'The Philosophy of the Unactual',
    'The Philosophy of the Unconcept',
    'The Philosophy of the Unfinished',
    'The Philosophy of the Unpresent',
    'The Philosophy of the Unthought'
];

// Filter out questions about fake works
const filteredQuestions = questions.questions.filter(q => 
    !toRemove.some(title => q.question.includes(title))
);

// Add new replacement questions
const replacementQuestions = [
    {
        "question": "Who wrote 'One-Dimensional Man'?",
        "answers": [
            {
                "id": "repl1a",
                "answer": "Herbert Marcuse",
                "correct": true
            },
            {
                "id": "repl1b",
                "answer": "Max Horkheimer",
                "correct": false
            },
            {
                "id": "repl1c",
                "answer": "Theodor Adorno",
                "correct": false
            },
            {
                "id": "repl1d",
                "answer": "Walter Benjamin",
                "correct": false
            }
        ],
        "correctTheory": {
            "title": "One-Dimensional Man",
            "year": 1964,
            "author": "Herbert Marcuse",
            "key_concepts": "Advanced industrial society, technological rationality, liberation",
            "summary": "Critique of advanced industrial society and consumer culture",
            "significance": "Influential in New Left and student movements",
            "related_concepts": "Consumer society, technological domination, resistance"
        },
        "questionType": 1
    },
    {
        "question": "Who wrote 'The Structural Transformation of the Public Sphere'?",
        "answers": [
            {
                "id": "repl2a",
                "answer": "Jürgen Habermas",
                "correct": true
            },
            {
                "id": "repl2b",
                "answer": "Hannah Arendt",
                "correct": false
            },
            {
                "id": "repl2c",
                "answer": "Richard Sennett",
                "correct": false
            },
            {
                "id": "repl2d",
                "answer": "Nancy Fraser",
                "correct": false
            }
        ],
        "correctTheory": {
            "title": "The Structural Transformation of the Public Sphere",
            "year": 1962,
            "author": "Jürgen Habermas",
            "key_concepts": "Public sphere, communicative action, democracy",
            "summary": "Analysis of the rise and decline of the bourgeois public sphere",
            "significance": "Key text in understanding public discourse and democracy",
            "related_concepts": "Public discourse, democracy, communication"
        },
        "questionType": 2
    },
    {
        "question": "Who wrote 'The Arcades Project'?",
        "answers": [
            {
                "id": "repl3a",
                "answer": "Walter Benjamin",
                "correct": true
            },
            {
                "id": "repl3b",
                "answer": "Siegfried Kracauer",
                "correct": false
            },
            {
                "id": "repl3c",
                "answer": "Ernst Bloch",
                "correct": false
            },
            {
                "id": "repl3d",
                "answer": "Georg Simmel",
                "correct": false
            }
        ],
        "correctTheory": {
            "title": "The Arcades Project",
            "year": 1940,
            "author": "Walter Benjamin",
            "key_concepts": "Modernity, urban experience, commodity culture",
            "summary": "Unfinished study of 19th century Parisian arcades and modern urban life",
            "significance": "Revolutionary approach to cultural analysis and history",
            "related_concepts": "Modernity, urban culture, historical materialism"
        },
        "questionType": 3
    }
];

// Create backup of current file
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(
    `./backups/art-questions-${timestamp}.json`,
    JSON.stringify(questions, null, 4)
);

// Write updated questions
const updatedQuestions = {
    questions: [...filteredQuestions, ...replacementQuestions]
};

fs.writeFileSync(
    './src/frontend/art-questions.json',
    JSON.stringify(updatedQuestions, null, 4)
);

console.log('Questions updated successfully!');
console.log('Original question count:', questions.questions.length);
console.log('Updated question count:', updatedQuestions.questions.length); 