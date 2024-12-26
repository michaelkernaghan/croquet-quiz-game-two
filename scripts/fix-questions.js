const fs = require('fs');
const path = require('path');

function fixQuestions() {
    const questionsFile = path.join(__dirname, '../src/frontend/art-questions.json');
    const questions = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));

    // Fix categories
    questions.questions.forEach(q => {
        if (!q.category) {
            // Assign categories based on content
            if (q.correctTheory.key_concepts.toLowerCase().includes('digital') || 
                q.correctTheory.key_concepts.toLowerCase().includes('computer')) {
                q.category = 'Digital Theory';
            } else if (q.correctTheory.author === 'Theodor Adorno' || 
                      q.correctTheory.author === 'Adorno') {
                q.category = 'Critical Theory';
            } else {
                q.category = 'Art Theory';
            }
        }
    });

    // Fix Adorno name consistency
    questions.questions.forEach(q => {
        if (q.correctTheory.author === 'Adorno') {
            q.correctTheory.author = 'Theodor Adorno';
        }
    });

    // Add back LLM Art questions
    const llmQuestions = [
        {
            "question": "Which theorist established 'Generative Adversarial Practice' as methodology?",
            "isLLMArt": true,
            "bonusNote": "Conceptual Bonus Points Available: LLM Art Framework Question",
            "answers": [
                {
                    "id": "gap1",
                    "answer": "Helena Sarin",
                    "correct": true
                },
                // ... other answers
            ],
            // ... rest of question data
        },
        // ... other LLM questions
    ];

    // Create backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(
        path.join(__dirname, `../backups/art-questions-${timestamp}.json`),
        JSON.stringify(questions, null, 2)
    );

    // Save fixed questions
    fs.writeFileSync(questionsFile, JSON.stringify(questions, null, 2));
}

fixQuestions(); 