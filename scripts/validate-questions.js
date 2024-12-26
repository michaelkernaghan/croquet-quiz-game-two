const fs = require('fs');

// Known problematic questions to flag
const problematicQuestions = [
    {
        pattern: /standard opening with a supershot/i,
        reason: "Potentially confusing - needs clearer context about what a supershot is"
    },
    {
        pattern: /optimal mallet weight/i,
        reason: "Subjective - depends on player preference and style"
    },
    {
        pattern: /recommended grip pressure/i,
        reason: "Too subjective - varies by player and condition"
    },
    {
        pattern: /recommended position for ball/i,
        reason: "May need more tactical context"
    },
    {
        pattern: /recommended approach/i,
        reason: "Too general - needs more specific context"
    },
    {
        pattern: /(best|better|worse|worst|most|least|usually|typically|generally|often|sometimes)/i,
        reason: "Contains subjective or non-factual qualifiers - needs more specific, verifiable criteria",
        ignoreIf: /(who|which person|what) (wrote|recommended|thought|suggested|advocated|argued|proposed)/i
    },
    {
        pattern: /should|could|might|may/i,
        reason: "Contains conditional language - needs to be more definitive and factual",
        ignoreIf: /(who|which person|what) (wrote|recommended|thought|suggested|advocated|argued|proposed)/i
    }
];

// Required citation sources for different question types
const requiredSources = {
    'Rules and Regulations': ['Laws of Association Croquet', 'World Croquet Federation'],
    'Tournament and Competition': ['World Croquet Federation Tournament Regulations', 'MacRobertson Shield'],
    'History': ['Croquet Association Archives', 'Official Records'],
    'Equipment': ['Equipment Standards', 'Laws of Association Croquet']
};

function validateQuestionAnswerMatch(question, answers) {
    // Year questions
    if (question.toLowerCase().match(/^(when|which year)/)) {
        const validAnswers = answers.every(a => !isNaN(a.answer) || a.answer.match(/^\d{4}$/));
        if (!validAnswers) {
            console.log(`Question type mismatch: "${question}" expects years but has non-year answers`);
            return false;
        }
    }
    
    // Person questions
    if (question.toLowerCase().match(/^(who|which (player|champion))/)) {
        const validAnswers = answers.every(a => isNaN(a.answer));
        if (!validAnswers) {
            console.log(`Question type mismatch: "${question}" expects names but has non-name answers`);
            return false;
        }
    }
    
    // Measurement questions (yards, inches, etc.)
    if (question.toLowerCase().includes('distance') || question.toLowerCase().includes('measurement')) {
        const hasUnitPattern = /(yards?|inches|meters?|feet)/i;
        const validAnswers = answers.every(a => hasUnitPattern.test(a.answer));
        if (!validAnswers) {
            console.log(`Question type mismatch: "${question}" expects measurements but answers don't include units`);
            return false;
        }
    }

    return true;
}

function checkForProblematicContent(question) {
    const warnings = [];
    problematicQuestions.forEach(pq => {
        if (question.match(pq.pattern)) {
            // Skip warning if it's a documented opinion question and matches the ignore pattern
            if (pq.ignoreIf && question.match(pq.ignoreIf)) {
                return;
            }
            warnings.push(pq.reason);
        }
    });
    return warnings;
}

function validateFactualBasis(q) {
    const warnings = [];
    
    // Check citation matches category
    if (requiredSources[q.category]) {
        const hasValidSource = requiredSources[q.category].some(source => 
            q.citation.includes(source)
        );
        if (!hasValidSource) {
            warnings.push(`Citation "${q.citation}" may not be authoritative for category "${q.category}"`);
        }
    }

    // Check for verifiable content in theory
    if (!q.correctTheory.summary.includes(q.answers.find(a => a.correct).answer)) {
        // Skip this warning for documented opinion questions
        if (!q.question.match(/(who|which person|what) (wrote|recommended|thought|suggested|advocated|argued|proposed)/i)) {
            warnings.push("Correct answer is not explicitly supported in the theory summary");
        }
    }

    // For opinion/recommendation questions, ensure there's a citation
    if (q.question.match(/(who|which person|what) (wrote|recommended|thought|suggested|advocated|argued|proposed)/i)) {
        if (!q.citation || q.citation.trim() === '') {
            warnings.push("Opinion/recommendation question must have a specific citation to the source");
        }
        // Check if the theory summary includes the context of the opinion/recommendation
        if (!q.correctTheory.summary.toLowerCase().includes('wrote') && 
            !q.correctTheory.summary.toLowerCase().includes('recommended') &&
            !q.correctTheory.summary.toLowerCase().includes('suggested') &&
            !q.correctTheory.summary.toLowerCase().includes('argued') &&
            !q.correctTheory.summary.toLowerCase().includes('proposed')) {
            warnings.push("Theory summary should explain the context of the opinion/recommendation");
        }
    }

    // Check for consistent measurements
    const measurementUnits = ['yard', 'yards', 'inch', 'inches', 'meter', 'meters', 'feet', 'foot'];
    const hasUnits = measurementUnits.some(unit => q.question.toLowerCase().includes(unit));
    if (hasUnits) {
        const answersHaveUnits = q.answers.every(a => 
            measurementUnits.some(unit => a.answer.toLowerCase().includes(unit))
        );
        if (!answersHaveUnits) {
            warnings.push("Question mentions measurements but not all answers include units");
        }
    }

    return warnings;
}

function validateQuestion(q) {
    const errors = [];
    const warnings = [];

    // Check for known problematic patterns
    const contentWarnings = checkForProblematicContent(q.question);
    if (contentWarnings.length > 0) {
        warnings.push(...contentWarnings);
    }

    // Check factual basis
    const factualWarnings = validateFactualBasis(q);
    if (factualWarnings.length > 0) {
        warnings.push(...factualWarnings);
    }

    // Required fields
    if (!q.question) errors.push('Missing question text');
    if (!q.answers || !Array.isArray(q.answers)) errors.push('Missing or invalid answers array');
    if (!q.correctTheory) errors.push('Missing correctTheory');
    if (!q.citation) errors.push('Missing citation');
    if (!q.category) errors.push('Missing category');
    if (!q.questionType) errors.push('Missing questionType');

    if (errors.length > 0) {
        console.log(`\nErrors in question: "${q.question}"`);
        errors.forEach(e => console.log(`- ${e}`));
        return false;
    }

    // Output warnings if any
    if (warnings.length > 0) {
        console.log(`\nWarnings for question: "${q.question}"`);
        warnings.forEach(w => console.log(`- Warning: ${w}`));
    }

    // Validate answers
    if (q.answers) {
        // Check for exactly one correct answer
        const correctCount = q.answers.filter(a => a.correct).length;
        if (correctCount !== 1) {
            console.log(`\nQuestion has ${correctCount} correct answers (should be 1): "${q.question}"`);
            return false;
        }

        // Check answer format
        for (const a of q.answers) {
            if (!a.hasOwnProperty('correct')) {
                console.log(`\nAnswer missing 'correct' property: "${a.answer}" in question "${q.question}"`);
                return false;
            }
            if (!a.answer) {
                console.log(`\nEmpty answer text in question: "${q.question}"`);
                return false;
            }
            if (!a.id) {
                console.log(`\nAnswer missing ID in question: "${q.question}"`);
                return false;
            }
        }

        // Validate question-answer match
        if (!validateQuestionAnswerMatch(q.question, q.answers)) {
            return false;
        }
    }

    // Validate correctTheory
    const theory = q.correctTheory;
    if (!theory.title) errors.push('Missing correctTheory.title');
    if (!theory.summary) errors.push('Missing correctTheory.summary');
    if (!theory.significance) errors.push('Missing correctTheory.significance');
    if (!theory.key_concepts) errors.push('Missing correctTheory.key_concepts');
    if (!theory.related_concepts) errors.push('Missing correctTheory.related_concepts');

    if (errors.length > 0) {
        console.log(`\nErrors in question: "${q.question}"`);
        errors.forEach(e => console.log(`- ${e}`));
        return false;
    }

    return true;
}

// Read and validate questions
try {
    const questions = JSON.parse(fs.readFileSync('./src/frontend/croquet-questions.json'));
    console.log(`\nValidating ${questions.questions.length} questions...`);

    let validCount = 0;
    let invalidCount = 0;
    let warningCount = 0;

    questions.questions.forEach((q, i) => {
        const warnings = checkForProblematicContent(q.question);
        if (warnings.length > 0) warningCount++;
        
        if (validateQuestion(q)) {
            validCount++;
        } else {
            invalidCount++;
            console.log(`Question index: ${i}`);
        }
    });

    console.log(`\nValidation complete:`);
    console.log(`- Valid questions: ${validCount}`);
    console.log(`- Invalid questions: ${invalidCount}`);
    console.log(`- Questions with warnings: ${warningCount}`);
    console.log(`- Total questions: ${questions.questions.length}`);

} catch (error) {
    console.error('Error reading or parsing questions file:', error);
} 