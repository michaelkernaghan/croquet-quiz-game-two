const fs = require('fs');
const questions = JSON.parse(fs.readFileSync('./src/frontend/art-questions.json'));

// Basic counts
console.log('\nTotal questions:', questions.questions.length);

// Count by question type
const typeCount = {};
questions.questions.forEach(q => {
    typeCount[q.questionType] = (typeCount[q.questionType] || 0) + 1;
});

console.log('\nQuestions by type:');
Object.entries(typeCount)
    .sort((a, b) => a[0] - b[0])
    .forEach(([type, count]) => {
        console.log(`Type ${type}: ${count} questions`);
    });

// Count by starting word
const patternCount = {};
questions.questions.forEach(q => {
    const firstWord = q.question.split(' ')[0].toLowerCase();
    patternCount[firstWord] = (patternCount[firstWord] || 0) + 1;
});

console.log('\nQuestions by pattern:');
Object.entries(patternCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([pattern, count]) => {
        console.log(`${pattern}: ${count} questions`);
    }); 