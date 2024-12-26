const fs = require('fs');

// Read both files
const currentQuestions = JSON.parse(fs.readFileSync('./src/frontend/art-questions.json'));
const backupQuestions = JSON.parse(fs.readFileSync('./src/frontend/art-questions.json.backup'));

// Compare questions
function compareQuestions() {
    // Find questions only in backup
    const backupOnly = backupQuestions.questions.filter(bq => 
        !currentQuestions.questions.some(cq => 
            cq.question === bq.question
        )
    );

    // Find questions only in current
    const currentOnly = currentQuestions.questions.filter(cq => 
        !backupQuestions.questions.some(bq => 
            bq.question === cq.question
        )
    );

    console.log('\n=== Questions Analysis ===');
    console.log('\nBackup file questions:', backupQuestions.questions.length);
    console.log('Current file questions:', currentQuestions.questions.length);
    
    console.log('\nQuestions only in backup:', backupOnly.length);
    backupOnly.forEach(q => {
        console.log('\nQuestion:', q.question);
        console.log('Correct Answer:', q.answers.find(a => a.correct).answer);
    });

    console.log('\nQuestions only in current:', currentOnly.length);
    currentOnly.forEach(q => {
        console.log('\nQuestion:', q.question);
        console.log('Correct Answer:', q.answers.find(a => a.correct).answer);
    });
}

compareQuestions(); 