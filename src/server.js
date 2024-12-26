const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/rag', express.static(path.join(__dirname, '..', 'rag')));

// Route to save dubious questions
app.post('/api/dubious-questions', async (req, res) => {
    try {
        const dubiousQuestionsPath = path.join(__dirname, 'frontend', 'dubious-questions.json');
        
        // Read existing data
        let data = { dubious_questions: [] };
        try {
            const fileContent = await fs.readFile(dubiousQuestionsPath, 'utf8');
            data = JSON.parse(fileContent);
        } catch (error) {
            // If file doesn't exist or is invalid, use default empty array
            console.log('Creating new dubious-questions.json file');
        }

        // Add new report
        const report = {
            question: req.body.question,
            questionId: req.body.questionId,
            timestamp: req.body.timestamp,
            category: req.body.category
        };
        
        data.dubious_questions.push(report);

        // Write updated data back to file
        await fs.writeFile(dubiousQuestionsPath, JSON.stringify(data, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving dubious question:', error);
        res.status(500).json({ error: 'Failed to save dubious question' });
    }
});

// Route to get dubious questions
app.get('/api/dubious-questions', async (req, res) => {
    try {
        const dubiousQuestionsPath = path.join(__dirname, 'frontend', 'dubious-questions.json');
        const data = await fs.readFile(dubiousQuestionsPath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading dubious questions:', error);
        res.status(500).json({ error: 'Failed to read dubious questions' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});