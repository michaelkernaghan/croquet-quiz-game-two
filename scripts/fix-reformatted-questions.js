const fs = require('fs');

// Read current questions
const questions = JSON.parse(fs.readFileSync('./src/frontend/art-questions.json'));

// Questions that need fixing with their replacements
const fixQuestions = {
    "Which Frankfurt School theorist wrote about Mechanical reproduction and Mechanical reproduction?": {
        newQuestion: "Which theorist analyzed mechanical reproduction's impact on art?",
        keepAnswers: true
    },
    "Which philosopher explored Digital media through their analysis of Digital aesthetics?": {
        newQuestion: "Which theorist developed key concepts of new media aesthetics?",
        keepAnswers: true
    },
    "Which philosopher explored Post-capitalist art through their analysis of Post-capitalist art?": {
        newQuestion: "Which theorist analyzed art's role in post-capitalist society?",
        keepAnswers: true
    },
    "Which philosopher explored Digital cinema through their analysis of Digital cinema?": {
        newQuestion: "Which theorist challenged traditional notions of cinema in the digital age?",
        keepAnswers: true
    },
    "Which theorist developed the concept of Visual culture in Ways of Seeing?": {
        newQuestion: "How did 'Ways of Seeing' transform our understanding of visual culture?",
        keepAnswers: true
    },
    "Which philosopher explored Electronic art through their analysis of Media art?": {
        newQuestion: "Which theorist pioneered the study of electronic media in art?",
        keepAnswers: true
    },
    "Which philosopher explored Network protocols through their analysis of Protocol studies?": {
        newQuestion: "Which theorist analyzed how protocols shape network culture?",
        keepAnswers: true
    },
    "Which philosopher explored Computational design through their analysis of Code art?": {
        newQuestion: "Which theorist established computational aesthetics as a field?",
        keepAnswers: true
    },
    "Which critical theorist challenged Art in their 1936 work?": {
        newQuestion: "Which theorist revolutionized art theory in 1936?",
        keepAnswers: true
    }
};

// Fix the questions
const updatedQuestions = questions.questions.map(q => {
    if (fixQuestions[q.question]) {
        return {
            ...q,
            question: fixQuestions[q.question].newQuestion
        };
    }
    return q;
});

// Create backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(
    `./backups/art-questions-${timestamp}.json`,
    JSON.stringify(questions, null, 2)
);

// Save updated questions
fs.writeFileSync(
    './src/frontend/art-questions.json',
    JSON.stringify({ questions: updatedQuestions }, null, 2)
);

// Show changes
Object.entries(fixQuestions).forEach(([oldQ, {newQuestion}]) => {
    console.log('\nFixed question:');
    console.log('Old:', oldQ);
    console.log('New:', newQuestion);
}); 