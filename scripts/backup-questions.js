const fs = require('fs');
const path = require('path');

function backupQuestions() {
    // Create backups directory if it doesn't exist
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }

    // Read current questions
    const questionsPath = path.join(__dirname, '../src/frontend/croquet-questions.json');
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

    // Create timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Create backup with timestamp
    const backupPath = path.join(backupDir, `croquet-questions-${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(questions, null, 2));

    // Keep only last 10 backups
    const files = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('croquet-questions-'))
        .sort()
        .reverse();

    if (files.length > 10) {
        files.slice(10).forEach(file => {
            fs.unlinkSync(path.join(backupDir, file));
        });
    }

    console.log(`Backup created: ${backupPath}`);
    console.log(`Total backups: ${Math.min(files.length, 10)}`);
}

backupQuestions(); 