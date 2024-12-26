const fs = require('fs');

// Read current questions
const questions = JSON.parse(fs.readFileSync('./src/frontend/art-questions.json'));

// Question format templates
const formatTemplates = {
    'theory': [
        'Which theorist analyzed {concept} in their work "{title}"?',
        'Which philosopher developed the theory of {concept} in {year}?',
        'Who introduced the concept of {concept} to critical theory?',
        'Which Frankfurt School theorist wrote about {concept} and {topic}?'
    ],
    'concept': [
        'What did {author} reveal about the relationship between {concept} and {topic}?',
        'How did "{title}" change our understanding of {concept}?',
        'Which {year} work established {concept} as a critical concept?'
    ]
};

// Add theorist balancing
function shouldUpdateQuestion(q) {
    const correctAnswer = q.answers.find(a => a.correct).answer;
    const shouldUpdate = correctAnswer === "Adorno" || 
        correctAnswer === "Walter Benjamin" ||
        q.question.toLowerCase().includes('who wrote') ||
        q.question.toLowerCase().includes('who developed');
    if (shouldUpdate) {
        console.log(`\nWill update: "${q.question}"`);
        console.log(`Current answer: ${correctAnswer}`);
    }
    return shouldUpdate;
}

// Validate new question
function validateQuestion(newQuestion, oldQuestion) {
    // Check for critical theory terminology
    const criticalTheoryTerms = ['theory', 'concept', 'analysis', 'critique'];
    if (!criticalTheoryTerms.some(term => newQuestion.toLowerCase().includes(term))) {
        console.log('Warning: Missing critical theory terminology');
        return false;
    }

    // Check for missing data
    if (newQuestion.includes('undefined') || newQuestion.includes('null')) {
        console.log('Warning: Missing data in question');
        return false;
    }

    // Check for empty placeholders
    if (newQuestion.includes('{}') || newQuestion.includes('{') || newQuestion.includes('}')) {
        console.log('Warning: Unfilled placeholders');
        return false;
    }

    // Check for repeated terms
    const terms = newQuestion.match(/\b\w+\b/g);
    const uniqueTerms = new Set(terms);
    if (terms.length - uniqueTerms.size > 2) {
        console.log('Warning: Repetitive terms detected');
        return false;
    }

    // Check minimum length
    if (newQuestion.length < 20) {
        console.log('Warning: Question too short');
        return false;
    }

    // Check for proper capitalization
    if (!/^[A-Z]/.test(newQuestion)) {
        console.log('Warning: Question should start with capital letter');
        return false;
    }

    // Check for question mark
    if (!newQuestion.endsWith('?')) {
        console.log('Warning: Question should end with question mark');
        return false;
    }

    return true;
}

// Update question formats
function updateQuestionFormats() {
    let changesCount = 0;
    console.log('\nStarting question updates...');
    const updatedQuestions = questions.questions.map(q => {
        if (shouldUpdateQuestion(q)) {
            changesCount++;
            console.log(`\nUpdating question: "${q.question}"`);
            
            // Alternate between theory and concept templates
            const templateType = changesCount % 2 === 0 ? 'theory' : 'concept';
            const template = formatTemplates[templateType][Math.floor(Math.random() * formatTemplates[templateType].length)];
            
            const data = {
                concept: q.correctTheory.key_concepts.split(',')[0].trim(),
                work: q.correctTheory.title,
                title: q.correctTheory.title,
                year: q.correctTheory.year,
                topic: q.correctTheory.related_concepts.split(',')[0].trim(),
                author: q.correctTheory.author
            };
            
            const newQuestion = template.replace(/{(\w+)}/g, (_, key) => data[key]);
            console.log(`New question: "${newQuestion}"`);
            // Only update if validation passes
            if (validateQuestion(newQuestion, q.question)) {
                q.question = newQuestion;
            } else {
                console.log('Validation failed, keeping original question');
            }
        }
        return q;
    });
    
    console.log(`\nUpdated ${changesCount} questions`);
    return { ...questions, questions: updatedQuestions };
}

// Create backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(
    `./backups/art-questions-${timestamp}.json`,
    JSON.stringify(questions, null, 2)
);

// Update and save
const updatedQuestions = updateQuestionFormats();
fs.writeFileSync(
    './src/frontend/art-questions.json',
    JSON.stringify(updatedQuestions, null, 2)
);

console.log('Questions updated successfully!'); 