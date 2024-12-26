const fs = require('fs');

function balanceTheorists() {
    const questions = JSON.parse(fs.readFileSync('./src/frontend/art-questions.json'));
    
    // List of fake/duplicate Adorno works to remove
    const fakeWorks = [
        'The Philosophy of Technology',
        'The Philosophy of the Unactual',
        'The Philosophy of the Unconcept',
        'The Philosophy of History',
        'The Philosophy of the Present',
        'The Philosophy of the Unfinished',
        'The Philosophy of the Unpresent',
        'The Philosophy of the Unthought',
        'The Jargon of Authenticity',
        'The Philosophy of Modern Music',
        'Notes to Literature'
    ];
    
    // Keep only these major Adorno works
    const keepWorks = [
        'Dialectic of Enlightenment',
        'Minima Moralia',
        'Aesthetic Theory'
    ];
    
    // Filter out fake works first
    let filteredQuestions = questions.questions.filter(q => 
        !fakeWorks.includes(q.correctTheory.title) &&
        (q.answers.find(a => a.correct).answer !== "Theodor Adorno" ||
         keepWorks.includes(q.correctTheory.title))
    );
    
    // Count questions by author
    const authorCount = {};
    filteredQuestions.forEach(q => {
        const correctAnswer = q.answers.find(a => a.correct).answer;
        authorCount[correctAnswer] = (authorCount[correctAnswer] || 0) + 1;
    });

    // Then apply the max per theorist limit
    const MAX_PER_THEORIST = 2;
    filteredQuestions = filteredQuestions.filter(q => {
        const correctAnswer = q.answers.find(a => a.correct).answer;
        if (correctAnswer === "Theodor Adorno" || correctAnswer === "Adorno") {
            authorCount[correctAnswer]--;
            return authorCount[correctAnswer] >= MAX_PER_THEORIST;
        }
        return true;
    });

    // Create backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(
        `./backups/pre-balance-${timestamp}.json`,
        JSON.stringify(questions, null, 2)
    );

    // Save balanced questions
    fs.writeFileSync(
        './src/frontend/art-questions.json',
        JSON.stringify({ questions: filteredQuestions }, null, 2)
    );

    console.log('Original question count:', questions.questions.length);
    console.log('New question count:', filteredQuestions.length);
    console.log('Questions removed:', questions.questions.length - filteredQuestions.length);
}

balanceTheorists(); 