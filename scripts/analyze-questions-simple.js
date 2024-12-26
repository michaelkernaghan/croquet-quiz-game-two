const fs = require('fs');

// Read questions file
const questions = JSON.parse(fs.readFileSync('./src/frontend/art-questions.json'));

// Analyze and output report
function analyzeQuestions() {
    const analysis = {
        total: questions.questions.length,
        startWords: {},
        theorists: {},
        decades: {},
        questionTypes: {}
    };

    // Question patterns
    const patterns = {
        who: /^who/i,
        which: /^which/i,
        what: /^what/i,
        when: /^when/i,
        how: /^how/i,
        whose: /^whose/i
    };

    questions.questions.forEach(q => {
        // Count starting words
        Object.entries(patterns).forEach(([type, pattern]) => {
            if (q.question.match(pattern)) {
                analysis.startWords[type] = (analysis.startWords[type] || 0) + 1;
            }
        });

        // Count theorists (correct answers)
        const correctAnswer = q.answers.find(a => a.correct).answer;
        analysis.theorists[correctAnswer] = (analysis.theorists[correctAnswer] || 0) + 1;

        // Count decades
        const decade = Math.floor(q.correctTheory.year / 10) * 10;
        analysis.decades[decade] = (analysis.decades[decade] || 0) + 1;

        // Count question types
        analysis.questionTypes[q.questionType] = (analysis.questionTypes[q.questionType] || 0) + 1;
    });

    return analysis;
}

// Run analysis and output results
const results = analyzeQuestions();

console.log('\nQuestion Analysis:');
console.log('Total Questions:', results.total);

console.log('\nQuestion Patterns:');
Object.entries(results.startWords)
    .sort((a, b) => b[1] - a[1])
    .forEach(([pattern, count]) => {
        console.log(`${pattern}: ${count} (${Math.round(count/results.total*100)}%)`);
    });

console.log('\nMost Referenced Theorists:');
Object.entries(results.theorists)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([theorist, count]) => {
        console.log(`${theorist}: ${count} questions`);
    });

console.log('\nDecade Distribution:');
Object.entries(results.decades)
    .sort((a, b) => a[0] - b[0])
    .forEach(([decade, count]) => {
        console.log(`${decade}s: ${count} questions`);
    });

console.log('\nQuestion Types:');
Object.entries(results.questionTypes)
    .sort((a, b) => a[0] - b[0])
    .forEach(([type, count]) => {
        console.log(`Type ${type}: ${count} questions`);
    }); 