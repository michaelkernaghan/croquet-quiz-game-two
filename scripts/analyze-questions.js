const fs = require('fs');
const path = require('path');

function createBarChart(data, title, maxWidth = 50) {
    const maxValue = Math.max(...Object.values(data));
    const scale = maxWidth / maxValue;

    console.log(`\n${title}:`);
    console.log('='.repeat(maxWidth + 30));
    
    Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .forEach(([label, value]) => {
            const barLength = Math.round(value * scale);
            const percentage = ((value / Object.values(data).reduce((a, b) => a + b, 0)) * 100).toFixed(1);
            const bar = '█'.repeat(barLength);
            console.log(`${label.padEnd(20)} ${bar} ${value} (${percentage}%)`);
        });
}

function createTimelineChart(data, title, maxWidth = 50) {
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    const maxValue = Math.max(...Object.values(data));
    const scale = maxWidth / maxValue;

    console.log(`\n${title}:`);
    console.log('='.repeat(maxWidth + 30));
    
    Object.entries(data)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .forEach(([decade, value]) => {
            const barLength = Math.round(value * scale);
            const percentage = ((value / total) * 100).toFixed(1);
            const bar = '█'.repeat(barLength);
            console.log(`${decade}s`.padEnd(20) + `${bar} ${value} (${percentage}%)`);
        });
}

function analyzeQuestions() {
    const mainFile = path.join(__dirname, '../src/frontend/croquet-questions.json');
    
    // Check for duplicates
    function findDuplicates(questions) {
        const seen = new Map();
        const duplicates = [];
        
        questions.forEach((q, index) => {
            if (seen.has(q.question)) {
                duplicates.push({
                    question: q.question,
                    firstIndex: seen.get(q.question),
                    secondIndex: index
                });
            } else {
                seen.set(q.question, index);
            }
        });
        
        return duplicates;
    }
    
    console.log('\nAnalyzing croquet questions file:', mainFile);
    const questions = JSON.parse(fs.readFileSync(mainFile, 'utf8')).questions;
    
    // Check for duplicates
    const duplicates = findDuplicates(questions);
    
    console.log('\nDuplicates found:', duplicates.length);
    duplicates.forEach(d => {
        console.log(`Question "${d.question}" appears at indices ${d.firstIndex} and ${d.secondIndex}`);
    });

    // Log raw data
    console.log('\nRaw Data:');
    console.log('File size:', fs.statSync(mainFile).size, 'bytes');
    console.log('Total questions:', questions.length);
    console.log('JSON structure:', Object.keys(questions[0]));
    console.log('First question:', questions[0].question);
    console.log('Last question:', questions[questions.length - 1].question);

    // Initialize counters
    const typeCount = {};
    const categoryCount = {};
    const yearDistribution = {};
    const decadeCount = {};
    const sourceCount = {};
    const conceptCount = {};

    // Count everything
    questions.forEach((q, index) => {
        // Log any malformed questions
        if (!q.question || !q.answers || !q.correctTheory) {
            console.log(`Warning: Malformed question at index ${index}`);
            console.log('Missing properties:', {
                question: !q.question,
                answers: !q.answers,
                correctTheory: !q.correctTheory
            });
            return;
        }

        // Check answer structure
        if (!Array.isArray(q.answers) || q.answers.length !== 4) {
            console.log(`Warning: Invalid answers array at index ${index}`);
            console.log('Answers:', q.answers);
            return;
        }

        // Question types
        typeCount[q.questionType] = (typeCount[q.questionType] || 0) + 1;

        // Categories
        if (q.category) {
            categoryCount[q.category] = (categoryCount[q.category] || 0) + 1;
        }

        // Years/Decades
        if (q.correctTheory && q.correctTheory.year) {
            const decade = Math.floor(q.correctTheory.year / 10) * 10;
            decadeCount[decade] = (decadeCount[decade] || 0) + 1;
        }

        // Sources/Citations
        if (q.citation) {
            sourceCount[q.citation] = (sourceCount[q.citation] || 0) + 1;
        }

        // Key concepts
        if (q.correctTheory && q.correctTheory.key_concepts) {
            q.correctTheory.key_concepts.split(',').forEach(concept => {
                const trimmedConcept = concept.trim();
                conceptCount[trimmedConcept] = (conceptCount[trimmedConcept] || 0) + 1;
            });
        }
    });

    // Print analysis
    console.log('\nQuestion Analysis:');
    console.log('=================');
    console.log(`Total Questions: ${questions.length}`);
    
    // Question Types Distribution
    const typeNames = {
        1: "Historical/Biographical",
        2: "Rules and Regulations",
        3: "Equipment and Setup",
        4: "Strategy and Tactics",
        5: "Tournament and Competition",
        6: "Techniques and Skills",
        7: "Famous Matches and Players"
    };
    
    const namedTypeCount = {};
    Object.entries(typeCount).forEach(([type, count]) => {
        namedTypeCount[typeNames[type] || `Type ${type}`] = count;
    });
    
    createBarChart(namedTypeCount, 'Question Types Distribution');
    createBarChart(categoryCount, 'Category Distribution');
    createTimelineChart(decadeCount, 'Timeline Distribution');

    // Top sources
    createBarChart(
        Object.fromEntries(
            Object.entries(sourceCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
        ),
        'Top 10 Most Referenced Sources'
    );

    // Top concepts
    createBarChart(
        Object.fromEntries(
            Object.entries(conceptCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
        ),
        'Top 10 Key Concepts'
    );

    // Check for missing required fields
    console.log('\nMissing Required Fields:');
    questions.forEach((q, i) => {
        const missing = [];
        if (!q.category) missing.push('category');
        if (!q.citation) missing.push('citation');
        if (!q.correctTheory) missing.push('correctTheory');
        if (missing.length > 0) {
            console.log(`Question ${i + 1} missing: ${missing.join(', ')}`);
            console.log(`Question text: "${q.question}"`);
        }
    });

    // Show full category distribution
    const allCategories = new Set(questions.map(q => q.category).filter(Boolean));
    console.log('\nAll Categories:', Array.from(allCategories).sort());
}

analyzeQuestions(); 