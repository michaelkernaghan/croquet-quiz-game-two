const fs = require('fs');

const questions = JSON.parse(fs.readFileSync('./src/frontend/art-questions.json'));

const fixMismatches = {
    "How did 'Ways of Seeing' transform our understanding of visual culture?": {
        newQuestion: "Which theorist transformed our understanding of visual culture with 'Ways of Seeing'?",
        keepAnswers: true
    },
    "What did Sarah Friend reveal about the relationship between Prompt design and Prompt engineering?": {
        newQuestion: "Which artist pioneered the connection between prompt design and engineering?",
        keepAnswers: true
    },
    "Whose work \"The Society of the Spectacle\" revolutionized our understanding of Spectacle?": {
        newQuestion: "Which theorist revolutionized our understanding of spectacle?",
        keepAnswers: true
    },
    "Which year was 'Learning to See' published?": {
        newQuestion: "When did Trevor Paglen publish 'Learning to See'?",
        keepAnswers: true
    },
    "Which software artist created 'Every Icon'?": {
        newQuestion: "Who created the software artwork 'Every Icon'?",
        keepAnswers: true
    },
    "Which curator wrote 'Inside the White Cube'?": {
        newQuestion: "Who wrote the influential text 'Inside the White Cube'?",
        keepAnswers: true
    },
    "Which philosopher wrote 'The Origin of the Work of Art'?": {
        newQuestion: "Who wrote the foundational text 'The Origin of the Work of Art'?",
        keepAnswers: true
    },
    "Which theorist developed the concept of Commonness in The Aesthetics of the Common?": {
        newQuestion: "Who developed the concept of commonness in aesthetic theory?",
        keepAnswers: true
    },
    "Which theorist analyzed mechanical reproduction's impact on art?": {
        newQuestion: "Who wrote about mechanical reproduction's impact on art in 1935?",
        keepAnswers: true
    },
    "Which theorist developed key concepts of new media aesthetics?": {
        newQuestion: "Who established the foundational concepts of new media theory?",
        keepAnswers: true
    },
    "Which theorist analyzed how protocols shape network culture?": {
        newQuestion: "Who revealed how protocols shape digital culture?",
        keepAnswers: true
    },
    "Which critic introduced the concept of 'Greenbergian Modernism'?": {
        newQuestion: "Who introduced the concept of medium-specific modernism?",
        keepAnswers: true
    },
    "Which theorist established computational aesthetics as a field?": {
        newQuestion: "Who pioneered the field of computational aesthetics?",
        keepAnswers: true
    },
    "Which artist pioneered 'Smart Contract as Performance'?": {
        newQuestion: "Who first used smart contracts as artistic medium?",
        keepAnswers: true
    },
    "Which theorist challenged traditional notions of cinema in the digital age?": {
        newQuestion: "Who redefined cinema theory for the digital age?",
        keepAnswers: true
    }
};

// Fix mismatched questions
const updatedQuestions = questions.questions.map(q => {
    if (fixMismatches[q.question]) {
        return {
            ...q,
            question: fixMismatches[q.question].newQuestion
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

console.log('Fixed question mismatches'); 