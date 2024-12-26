const fs = require('fs');
const path = require('path');

// Read data files
const questions = JSON.parse(fs.readFileSync('./src/frontend/art-questions.json'));
const { historicalData } = require('../fix-duplicate-answers.js');

function validateReferences() {
    const errors = [];
    const warnings = [];
    
    // Track all citations and references
    const citations = new Set();
    const references = new Set();
    
    questions.questions.forEach((q, index) => {
        // Check if theory has required citation fields
        if (q.correctTheory) {
            const theory = q.correctTheory;
            
            // Check basic citation format
            if (theory.citation) {
                citations.add(theory.citation);
                validateCitationFormat(theory.citation, errors, index);
            } else if (!q.isLLMArt) {
                warnings.push(`Question ${index + 1} missing citation: "${q.question}"`);
            }
            
            // Validate year consistency
            validateYearConsistency(theory, errors, index);
            
            // Check publisher info
            if (theory.publisher && !theory.citation?.includes(theory.publisher)) {
                errors.push(`Question ${index + 1}: Publisher "${theory.publisher}" not found in citation`);
            }
            
            // Cross-reference with historical data
            validateAgainstHistoricalData(theory, historicalData, errors, index);
        }
    });
    
    // Report results
    if (errors.length > 0) {
        console.error('\nValidation Errors:');
        errors.forEach(err => console.error(`- ${err}`));
    }
    
    if (warnings.length > 0) {
        console.warn('\nValidation Warnings:');
        warnings.forEach(warn => console.warn(`- ${warn}`));
    }
    
    if (errors.length === 0 && warnings.length === 0) {
        console.log('All citations and references validated successfully!');
    }
    
    return { errors, warnings };
}

function validateCitationFormat(citation, errors, questionIndex) {
    // Basic citation format check (Author, Year, Title, Publisher)
    const citationRegex = /^[A-Za-z\s,\.]+\([0-9]{4}\)\.\s.+\.\s.+$/;
    if (!citationRegex.test(citation)) {
        errors.push(`Question ${questionIndex + 1}: Invalid citation format - "${citation}"`);
    }
}

function validateYearConsistency(theory, errors, questionIndex) {
    const years = [
        theory.year,
        theory.citation?.match(/\((\d{4})\)/)?.[1],
        ...Object.values(theory.major_works || {})
    ].filter(Boolean);
    
    // Check if all years match
    const uniqueYears = new Set(years);
    if (uniqueYears.size > 1) {
        errors.push(`Question ${questionIndex + 1}: Inconsistent years found - ${Array.from(uniqueYears).join(', ')}`);
    }
}

function validateAgainstHistoricalData(theory, historicalData, errors, questionIndex) {
    const author = theory.author;
    if (historicalData[author]) {
        const historicalEntry = historicalData[author];
        
        // Check if year falls within active period
        if (theory.year < historicalEntry.active[0] || 
            (historicalEntry.active[1] && theory.year > historicalEntry.active[1])) {
            errors.push(`Question ${questionIndex + 1}: Year ${theory.year} outside author's active period (${historicalEntry.active.join('-')})`);
        }
        
        // Check if work is listed in historical data
        const workYears = Object.values(historicalEntry.major_works);
        if (!workYears.includes(theory.year)) {
            errors.push(`Question ${questionIndex + 1}: Work year ${theory.year} not found in historical data`);
        }
    }
}

// Run validation
validateReferences();

module.exports = { validateReferences }; 