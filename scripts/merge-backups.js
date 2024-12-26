const fs = require('fs');
const path = require('path');

function mergeBackups() {
    // Get all backup files
    const backupDir = path.join(__dirname, '../backups');
    const backupFiles = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('art-questions-'))
        .sort()
        .reverse();

    console.log(`Found ${backupFiles.length} backup files`);

    // Read current questions
    const currentPath = path.join(__dirname, '../src/frontend/art-questions.json');
    const currentQuestions = JSON.parse(fs.readFileSync(currentPath, 'utf8'));

    // Track unique questions by their text to avoid duplicates
    const uniqueQuestions = new Map();
    currentQuestions.questions.forEach(q => {
        uniqueQuestions.set(q.question, q);
    });

    // Merge questions from backups
    let addedCount = 0;
    backupFiles.forEach(file => {
        const backupPath = path.join(backupDir, file);
        const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        
        backupData.questions.forEach(q => {
            if (!uniqueQuestions.has(q.question)) {
                uniqueQuestions.set(q.question, q);
                addedCount++;
                console.log(`Added question: "${q.question}"`);
            }
        });
    });

    // Create merged questions file
    const mergedQuestions = {
        questions: Array.from(uniqueQuestions.values())
    };

    // Create backup of current before overwriting
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `pre-merge-${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(currentQuestions, null, 2));

    // Write merged questions
    fs.writeFileSync(currentPath, JSON.stringify(mergedQuestions, null, 2));

    console.log(`\nMerge complete:`);
    console.log(`- Original questions: ${currentQuestions.questions.length}`);
    console.log(`- Added questions: ${addedCount}`);
    console.log(`- Total unique questions: ${mergedQuestions.questions.length}`);
}

mergeBackups(); 