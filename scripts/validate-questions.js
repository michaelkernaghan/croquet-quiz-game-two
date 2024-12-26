const fs = require('fs');

function validateQuestionAnswerMatch(question, answers) {
    // Year questions
    if (question.toLowerCase().match(/^(when|which year)/)) {
        const validAnswers = answers.every(a => !isNaN(a.answer) || a.answer.match(/^\d{4}$/));
        if (!validAnswers) {
            console.log(`Question type mismatch: "${question}" expects years but has non-year answers`);
            return false;
        }
    }
    
    // Person questions
    if (question.toLowerCase().match(/^(who|which (theorist|philosopher|critic))/)) {
        const validAnswers = answers.every(a => isNaN(a.answer));
        if (!validAnswers) {
            console.log(`Question type mismatch: "${question}" expects names but has non-name answers`);
            return false;
        }
    }
    
    // Check balance of question types
    const questionTypes = {
        who: /^who/i,
        which: /^which/i,
        how: /^how/i,
        what: /^what/i,
        when: /^when/i
    };

    // Check answer distribution
    const theoristCounts = {};
    answers.forEach(a => {
        theoristCounts[a.answer] = (theoristCounts[a.answer] || 0) + 1;
    });

    // Check for proper metadata
    if (!question.correctTheory || 
        !question.correctTheory.key_concepts ||
        !question.correctTheory.summary) {
        console.log('Missing or incomplete metadata');
        return false;
    }

    return true;
}

function validateQuestionAnswerConsistency(question, answers) {
    // If question asks about a work/year, answers should be works/years
    if (question.match(/which (work|book|text)/i)) {
        const hasWorkAnswers = answers.every(a => 
            a.answer.includes("'") || // Has quotes around title
            a.answer.includes(":") || // Has a title colon
            a.answer.match(/^(The|A|An)\s/) // Starts with article
        );
        if (!hasWorkAnswers) {
            console.log(`Question type mismatch: "${question}" asks about work but has author answers`);
            return false;
        }
    }
    // If question asks about theorist/author, answers should be names
    if (question.match(/which (theorist|author|philosopher|critic)/i)) {
        const hasNameAnswers = answers.every(a => 
            !a.answer.includes("'") && // No quotes (not a title)
            !a.answer.match(/^\d{4}$/) // Not a year
        );
        if (!hasNameAnswers) {
            console.log(`Question type mismatch: "${question}" asks about person but has non-name answers`);
            return false;
        }
    }
    return true;
}

function validateAnswerVariety(questions) {
    // Track answer sets
    const answerSets = new Map();
    
    questions.forEach((q, index) => {
        // Create a sorted string of answers to use as key
        const answerKey = q.answers
            .map(a => a.answer)
            .sort()
            .join('|');
            
        if (answerSets.has(answerKey)) {
            console.log(`\nDuplicate answer set found:`);
            console.log(`Question ${index + 1}: "${q.question}"`);
            console.log(`Previous usage: Question ${answerSets.get(answerKey) + 1}`);
            console.log(`Answers: ${q.answers.map(a => a.answer).join(', ')}`);
        } else {
            answerSets.set(answerKey, index);
        }
        
        // Also check for Frankfurt School / Critical Theory overuse
        const commonTheorists = ['Marx', 'Benjamin', 'Adorno', 'Heidegger', 'Marcuse'];
        const commonCount = q.answers.filter(a => 
            commonTheorists.includes(a.answer)
        ).length;
        
        if (commonCount >= 3) {
            console.log(`\nToo many common theorists in one question:`);
            console.log(`Question ${index + 1}: "${q.question}"`);
            console.log(`Consider diversifying answers`);
        }
    });
}

// Read questions
const questions = JSON.parse(fs.readFileSync('./src/frontend/art-questions.json'));

// Validate all questions
const invalidQuestions = questions.questions.filter(q => 
    !validateQuestionAnswerMatch(q.question, q.answers)
);

console.log('\nFound', invalidQuestions.length, 'questions with type mismatches:');
invalidQuestions.forEach(q => {
    console.log('\nQuestion:', q.question);
    console.log('Answers:', q.answers.map(a => a.answer).join(', '));
});

// Check for answer variety
console.log('\nChecking answer variety...');
validateAnswerVariety(questions.questions); 