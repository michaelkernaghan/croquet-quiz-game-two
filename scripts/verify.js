const fs = require('fs');

// Read the questions file
const questionsFile = fs.readFileSync('./src/frontend/art-questions.json');
const questions = JSON.parse(questionsFile);

// 1. Count total questions
console.log('\nTotal questions:', questions.questions.length);

// 2. Check for duplicates
const titles = questions.questions.map(q => q.question);
const duplicates = titles.filter((item, index) => titles.indexOf(item) !== index);
console.log('\nDuplicate questions:', duplicates);

// 3. Check Adorno questions
console.log('\nAll questions mentioning Adorno (correct or incorrect):');
const adornoQuestions = questions.questions.filter(q => 
    q.answers.some(a => a.answer === "Theodor Adorno")
);
console.log('Total mentions:', adornoQuestions.length);
console.log('As correct answer:', adornoQuestions.filter(q => 
    q.answers.find(a => a.answer === "Theodor Adorno" && a.correct === true)
).length);
console.log('As incorrect answer:', adornoQuestions.filter(q => 
    q.answers.find(a => a.answer === "Theodor Adorno" && a.correct === false)
).length);

// 4. Show all questions about critical theorists
console.log('\nAll Critical Theory questions:');
const criticalTheoryQuestions = questions.questions.filter(q => 
    q.answers.some(a => [
        "Theodor Adorno", 
        "Walter Benjamin", 
        "Max Horkheimer",
        "Herbert Marcuse",
        "Jürgen Habermas"
    ].includes(a.answer))
);
criticalTheoryQuestions.forEach(q => {
    console.log(`\nQuestion: ${q.question}`);
    console.log('Answers:', q.answers.map(a => a.answer).join(', '));
});

// 5. Analyze question distribution
console.log('\nQuestion Type Distribution:');
const questionTypes = questions.questions.reduce((acc, q) => {
    acc[q.questionType] = (acc[q.questionType] || 0) + 1;
    return acc;
}, {});
console.log(questionTypes);

// 6. Check answer options distribution
console.log('\nTheorists mentioned (as answers):');
const theorists = new Set();
questions.questions.forEach(q => 
    q.answers.forEach(a => theorists.add(a.answer))
);
console.log([...theorists].sort().join('\n'));

// 7. Check "Who wrote" questions with Adorno as answer
console.log('\nChecking "Who wrote" questions with Adorno as correct answer:');
const whoWroteAdorno = questions.questions.filter(q => 
    q.question.toLowerCase().includes('who wrote') && 
    q.answers.some(a => a.answer === "Theodor Adorno" && a.correct === true)
);
console.log('Count:', whoWroteAdorno.length);
console.log('Questions:');
whoWroteAdorno.forEach(q => {
    console.log(`\nQuestion: ${q.question}`);
    console.log('Answers:', q.answers.map(a => 
        `${a.answer}${a.correct ? ' (✓)' : ''}`
    ).join(', '));
});

// 8. Analyze all question patterns
console.log('\nAnalyzing question patterns:');
const patterns = {
    whoWrote: 0,
    whichYear: 0,
    whichTheory: 0,
    other: 0
};

const whoWroteQuestions = questions.questions.filter(q => 
    q.question.toLowerCase().includes('who wrote')
);

console.log('\nAll "Who wrote" questions:');
whoWroteQuestions.forEach(q => {
    console.log(`\nQuestion: ${q.question}`);
    console.log('Correct Answer:', q.answers.find(a => a.correct).answer);
});

// Count frequency of each author as correct answer
console.log('\nFrequency of authors as correct answers in "Who wrote" questions:');
const authorFrequency = {};
whoWroteQuestions.forEach(q => {
    const correctAnswer = q.answers.find(a => a.correct).answer;
    authorFrequency[correctAnswer] = (authorFrequency[correctAnswer] || 0) + 1;
});

Object.entries(authorFrequency)
    .sort((a, b) => b[1] - a[1])
    .forEach(([author, count]) => {
        console.log(`${author}: ${count} questions`);
    });
  