const puppeteer = require('puppeteer');
const { exec } = require('child_process');

// Start server before tests
function startServer() {
    return new Promise((resolve, reject) => {
        const server = exec('npm start');
        server.stdout.on('data', (data) => {
            if (data.includes('Server running')) {
                resolve(server);
            }
        });
        setTimeout(() => resolve(server), 3000); // Fallback timeout
    });
}

async function testQuiz() {
    const server = await startServer();
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Starting UI tests...');

    try {
        // Test login flow
        await page.goto('http://localhost:3000');
        console.log('Page loaded');
        console.log('Testing login...');
        await page.type('#player-name', 'TestUser');
        await page.type('#password-input', 'banksy');
        console.log('Credentials entered');
        await page.click('#start-button');
        
        // Test quiz gameplay
        console.log('Testing gameplay...');
        for (let i = 0; i < 10; i++) {
            // Verify question elements
            await page.waitForSelector('.question-display');
            await page.waitForSelector('.answers-grid');
            
            // Get question text
            const questionText = await page.$eval('.question-display', el => el.textContent);
            console.log(`\nQuestion ${i + 1}: ${questionText}`);
            
            // Get all answer choices
            const answerButtons = await page.$$('.answer-button');
            const answers = await Promise.all(
                answerButtons.map(button => button.evaluate(el => el.textContent))
            );
            
            // Log all choices
            console.log('Choices:');
            answers.forEach((answer, index) => {
                console.log(`${index + 1}. ${answer}`);
            });
            
            // Answer question
            const randomChoice = Math.floor(Math.random() * answers.length);
            console.log(`Selected answer: ${answers[randomChoice]}`);
            await answerButtons[randomChoice].click();
            
            // Wait for feedback to see correct answer
            await new Promise(resolve => setTimeout(resolve, 500));
            const correctAnswer = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('.answer-button'));
                const correctButton = buttons.find(button => {
                    const style = window.getComputedStyle(button);
                    return style.backgroundColor === 'rgb(76, 175, 80)' || 
                           style.color === 'rgb(76, 175, 80)';
                });
                return correctButton ? correctButton.textContent : 'Could not determine correct answer';
            });
            console.log(`Correct answer was: ${correctAnswer}`);
            
            // Wait for next question
            await new Promise(resolve => setTimeout(resolve, 3000));
            console.log(`Completed question ${i + 1}\n`);
        }
        
        // Verify score display
        console.log('Testing end screen...');
        await page.waitForSelector('.final-score');
        const score = await page.$eval('.final-score', el => el.textContent);
        console.log('Final score:', score);
        
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await browser.close();
        server.kill();
    }
}

// Run tests
testQuiz().catch(console.error); 