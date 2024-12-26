const fs = require('fs');

// Read questions
const questions = JSON.parse(fs.readFileSync('./src/frontend/art-questions.json'));

// Export the data
const data = {
    historicalData: {
        'Walter Benjamin': { active: [1914, 1940], major_works: { 'The Work of Art in the Age of Mechanical Reproduction': 1935 }},
        'Martin Heidegger': { active: [1913, 1976], major_works: { 'The Origin of the Work of Art': 1936 }},
        'Clement Greenberg': { active: [1939, 1994], major_works: { 'Modernist Painting': 1961 }},
        'Guy Debord': { active: [1957, 1994], major_works: { 'The Society of the Spectacle': 1967 }},
        'Lev Manovich': { active: [1986, null], major_works: { 'The Language of New Media': 2001 }},
        'Nicolas Bourriaud': { active: [1990, null], major_works: { 'Relational Aesthetics': 1998 }},
        'Herbert Marcuse': { active: [1932, 1979], major_works: { 'One-Dimensional Man': 1964 }},
        'John Berger': { active: [1950, 2017], major_works: { 'Ways of Seeing': 1972 }},
        'Roland Barthes': { active: [1950, 1980], major_works: { 'Death of the Author': 1967, 'Camera Lucida': 1980 }},
        'Jean Baudrillard': { active: [1960, 2007], major_works: { 'Simulacra and Simulation': 1981 }},
        'Linda Nochlin': { active: [1960, 2017], major_works: { 'Why Have There Been No Great Women Artists?': 1971 }},
        'Hans Haacke': { active: [1960, 2024], major_works: { 'Shapolsky et al.': 1971 }},
        'Marcel Duchamp': { active: [1910, 1968], major_works: { 'Fountain': 1917 }},
        'Friedrich Kittler': { active: [1970, 2011], major_works: { 'Discourse Networks': 1985 }},
        'John Cage': { active: [1930, 1992], major_works: { 'Silence': 1961 }},
        'Brian O\'Doherty': { active: [1960, 2024], major_works: { 'Inside the White Cube': 1976 }},
        'Rosalind Krauss': { active: [1965, 2024], major_works: { 'The Optical Unconscious': 1993 }},
        'John Maeda': { active: [1990, 2024], major_works: { 'The Creative Code': 2004 }},
        'Claire Bishop': { active: [2000, null], major_works: { 'Artificial Hells': 2012 }},
        'Marina Abramović': { active: [1970, 2024], major_works: { 'Walk Through Walls': 2016 }},
        'Erwin Panofsky': { active: [1920, 1968], major_works: { 'Studies in Iconology': 1939 }},
        'Sol LeWitt': { active: [1960, 2007], major_works: { 'Paragraphs on Conceptual Art': 1967 }},
        'Gene Youngblood': { active: [1965, 2021], major_works: { 'Expanded Cinema': 1970 }},
        'Jack Burnham': { active: [1960, 2019], major_works: { 'Beyond Modern Sculpture': 1968 }},
        'Thierry de Duve': { active: [1970, 2024], major_works: { 'Kant After Duchamp': 1996 }},
        'Marisa Olson': { active: [2000, 2024], major_works: { 'Post-Internet Art': 2008 }},
        'Jay David Bolter & Richard Grusin': { active: [1985, null], major_works: { 'Remediation': 1999 }},
        'Oliver Grau': { active: [1990, 2024], major_works: { 'Virtual Art': 2003 }},
        'Alexander R. Galloway': { active: [2000, 2024], major_works: { 'Protocol': 2004 }},
        'Jacques Rancière': { active: [1965, null], major_works: { 
            'The Politics of Aesthetics': 2004,
            'The Ignorant Schoolmaster': 1987,
            'The Emancipated Spectator': 2009
        }},
        'Casey Reas': { active: [2000, 2024], major_works: { 'Processing': 2007 }},
        'Siegfried Zielinski': { active: [1980, 2024], major_works: { 'Deep Time of the Media': 2006 }},
        'Roy Ascott': { active: [1960, 2024], major_works: { 'Telematic Embrace': 2003 }},
        'D.N. Rodowick': { active: [1980, 2024], major_works: { 'The Virtual Life of Film': 2007 }},
        'Thomas Elsaesser': { active: [1970, 2024], major_works: { 'Film Theory: An Introduction': 2002 }},
        'Wendy Hui Kyong Chun': { active: [2000, 2024], major_works: { 'Control and Freedom': 2006 }},
        'N. Katherine Hayles': { active: [1980, 2024], major_works: { 'How We Became Posthuman': 1999 }},
        'George Maciunas': { active: [1950, 1978], major_works: { 'Fluxus Manifesto': 1963 }},
        'Manfred Mohr': { active: [1960, 2024], major_works: { 'Artificiata I': 1969 }},
        'Mikhail Bakhtin': { active: [1920, 1975], major_works: { 'Rabelais and His World': 1965 }},
        'Frank Popper': { active: [1960, 2024], major_works: { 'Origins and Development of Kinetic Art': 1968 }},
        'Max Bense': { active: [1950, 1990], major_works: { 'Aesthetica': 1965 }},
        'Edward Shanken': { active: [1990, 2024], major_works: { 'Art and Electronic Media': 2009 }},
        'Victor Margolin': { active: [1970, 2019], major_works: { 'World History of Design': 2015 }},
        'Nick Srnicek': { active: [2010, 2024], major_works: { 'Platform Capitalism': 2016 }},
        'Theodor Adorno': { active: [1931, 1969], major_works: { 'Dialectic of Enlightenment': 1944 }},
        'Jasia Reichardt': { active: [1960, 2024], major_works: { 'Cybernetic Serendipity': 1968 }},
        'Alexei Shulgin': { active: [1990, 2024], major_works: { 'Form Art': 1997 }},
        'Yael Kanarek': { active: [1995, 2024], major_works: { 'World of Awe': 2000 }},
        'Stephen Ramsay': { active: [2000, 2024], major_works: { 'Reading Machines': 2011 }},
        'John F. Simon Jr.': { active: [1990, 2024], major_works: { 'Every Icon': 1997 }},
        'Steven Shaviro': { active: [1985, 2024], major_works: { 'Connected': 2003 }},
        'Ian Goodfellow': { active: [2010, 2024], major_works: { 'Generative Adversarial Networks': 2014 }},
        'Margaret Boden': { active: [1970, 2024], major_works: { 'The Creative Mind': 1990 }},
        'Anna Ridler': { active: [2015, 2024], major_works: { 'Mosaic Virus': 2019 }},
        'Herbert W. Franke': { active: [1950, 2022], major_works: { 'Computer Graphics': 1971 }},
        'Jussi Parikka': { active: [2000, 2024], major_works: { 'What is Media Archaeology?': 2012 }},
        'Raymond Bellour': { active: [1960, 2024], major_works: { 'The Analysis of Film': 2000 }},
        'David Norman Rodowick': { active: [1980, 2024], major_works: { 'The Virtual Life of Film': 2007 }},
        'Allucquère Rosanne Stone': { active: [1980, 2024], major_works: { 'The War of Desire and Technology': 1995 }}
    },
    theoristCategories: {
        'media_archaeology': ['Jussi Parikka', 'Siegfried Zielinski', 'Friedrich Kittler'],
        'software_studies': ['Wendy Hui Kyong Chun', 'Alexander Galloway', 'Lev Manovich'],
        'net_art': ['Alexei Shulgin', 'Yael Kanarek', 'John F. Simon Jr.'],
        'ai_art': ['Anna Ridler', 'Ian Goodfellow', 'Margaret Boden'],
        'film_theory': ['Raymond Bellour', 'David Norman Rodowick', 'Thomas Elsaesser']
    },
    alternativeTheorists: {
        modernism: ['Clement Greenberg', 'Harold Rosenberg', 'Michael Fried', 'Leo Steinberg'],
        postmodern: ['Jean Baudrillard', 'Jacques Derrida', 'Gilles Deleuze', 'Roland Barthes'],
        media: ['Marshall McLuhan', 'Friedrich Kittler', 'Vilém Flusser', 'Paul Virilio'],
        digital: ['Lev Manovich', 'Katherine Hayles', 'Alexander Galloway', 'Wendy Chun'],
        feminist: ['Donna Haraway', 'Julia Kristeva', 'Lucy Lippard', 'Linda Nochlin'],
        contemporary: ['Boris Groys', 'Nicolas Bourriaud', 'Claire Bishop', 'Hal Foster'],
        newMedia: ['Peter Weibel', 'Roy Ascott', 'Gene Youngblood', 'Jack Burnham'],
        aesthetics: ['Arthur Danto', 'George Dickie', 'Richard Wollheim', 'Nelson Goodman'],
        cultural: ['Stuart Hall', 'Raymond Williams', 'Dick Hebdige', 'Lawrence Grossberg']
    },
    llmArtConcepts: {
        concepts: ['Neural Assemblage', 'Digital Atelier', 'Prompt as Performance', 
                  'Hallucination as Critical Practice', 'DAOs as Social Sculpture'],
        theorists: ['Sarah Friend', 'Holly Herndon', 'Lauren Lee McCarthy', 'Simon Denny']
    }
};

// Export the data and functions
module.exports = {
    ...data,
    validateHistoricalAccuracy,
    validateQuestion,
    determineCategory,
    getAllCategoryAnswers
};

// Name mappings for shortened references
const nameAliases = {
    'Benjamin': 'Walter Benjamin',
    'Heidegger': 'Martin Heidegger',
    'Adorno': 'Theodor Adorno',
    'Rancière': 'Jacques Rancière',
    'Bolter': 'Jay David Bolter & Richard Grusin',
    'Jay David Bolter': 'Jay David Bolter & Richard Grusin',
    'Richard Grusin': 'Jay David Bolter & Richard Grusin'
};

function validateHistoricalAccuracy(theorist, year) {
    // Check for name aliases and compound names
    if (theorist.includes('&')) {
        const authors = theorist.split('&').map(t => t.trim());
        return authors.some(author => {
            const fullName = nameAliases[author] || author;
            return validateSingleAuthor(fullName, year);
        });
    }
    
    // Check if this is part of a compound name first
    if (nameAliases[theorist] && nameAliases[theorist].includes('&')) {
        return validateHistoricalAccuracy(nameAliases[theorist], year);
    }
    
    const fullName = nameAliases[theorist] || theorist;
    return validateSingleAuthor(fullName, year);
}

function validateSingleAuthor(author, year) {
    // Handle year-only answers
    if (!isNaN(author)) {
        return true;
    }

    // Skip validation for LLM art theorists
    if (data.llmArtConcepts.theorists.includes(author)) {
        return true;
    }

    // Check if we have historical data for this theorist
    if (data.historicalData[author]) {
        const authorData = data.historicalData[author];
        
        // Check if year falls within active period
        if (year >= authorData.active[0] && (authorData.active[1] === null || year <= authorData.active[1])) {
            return true;
        }
        
        // Check if it's a known publication year
        if (Object.values(authorData.major_works).includes(year)) {
            return true;
        }
        
        return false;
    }
    
    // If we don't have data, assume it's valid but log a warning
    console.log(`Warning: No historical data for ${author}`);
    return true;
}

// Track used answers to prevent repetition
const usedAnswerSets = new Map();

function validateQuestion(q) {
    // Check for duplicate answers within the same question
    const answerTexts = q.answers.map(a => a.answer);
    const uniqueAnswers = new Set(answerTexts);
    if (uniqueAnswers.size !== answerTexts.length) {
        console.log(`Warning: Duplicate answers found in question "${q.question}"`);
        
        // Fix duplicate answers
        const correctAnswer = q.answers.find(a => a.correct).answer;
        const category = determineCategory(q.correctTheory);
        const availableAnswers = getAllCategoryAnswers(category);
        
        // Create new answer set without duplicates
        const newAnswers = [];
        newAnswers.push(q.answers.find(a => a.correct)); // Keep correct answer
        
        // Fill remaining slots with unique alternatives
        while (newAnswers.length < 4) {
            const newAnswer = availableAnswers.find(a => 
                a !== correctAnswer && 
                !newAnswers.some(existing => existing.answer === a)
            );
            if (newAnswer) {
                newAnswers.push({
                    id: `q${q.questionType}a${newAnswers.length + 1}`,
                    answer: newAnswer,
                    correct: false
                });
            }
        }
        
        q.answers = newAnswers;
        return true;
    }
    
    // Check if it's a language model art joke question
    const isLLMArtQuestion = q.question.toLowerCase().includes('prompt') || 
                            data.llmArtConcepts.concepts.some(c => q.question.includes(c));
    
    if (isLLMArtQuestion) {
        console.log(`Note: Question "${q.question}" is from LLM Conceptual Art framework`);
        // Add LLM art flags to question
        q.isLLMArt = true;
        q.bonusNote = "Conceptual Bonus Points Available: LLM Art Framework Question";
        return true;
    }
    
    // Validate year matches historical record
    if (q.correctTheory.year) {
        // Add historical validation here
        const theorist = q.answers.find(a => a.correct).answer;
        if (!validateHistoricalAccuracy(theorist, q.correctTheory.year)) {
            console.log(`Warning: Year ${q.correctTheory.year} may be incorrect for ${theorist}`);
            return false;
        }
    }
    
    return true;
}

// Fix duplicate Frankfurt School answers
questions.questions.forEach((q, index) => {
    // Validate question first
    validateQuestion(q);
    
    const answers = q.answers.map(a => a.answer);
    const commonTheorists = ['Marx', 'Benjamin', 'Adorno', 'Heidegger', 'Marcuse'];
    const hasCommonSet = answers.filter(a => commonTheorists.includes(a)).length >= 3;
    
    // Check for both common sets and duplicates
    const answerKey = answers.sort().join('|');
    if (hasCommonSet || usedAnswerSets.has(answerKey)) {
        // Keep the correct answer
        const correctAnswer = q.answers.find(a => a.correct).answer;
        
        // Determine appropriate category based on multiple factors
        const category = determineCategory(q.correctTheory);
        
        // Replace incorrect answers with alternatives
        q.answers = q.answers.map(a => {
            if (!a.correct) {
                const availableAnswers = getAllCategoryAnswers(category);
                const newAnswer = availableAnswers.find(t => 
                    t !== correctAnswer && !q.answers.find(existing => existing.answer === t)
                );
                return { ...a, answer: newAnswer };
            }
            return a;
        });
        
        // Track new answer set
        usedAnswerSets.set(q.answers.map(a => a.answer).sort().join('|'), index);
    }
});

function determineCategory(theory) {
    const concepts = theory.key_concepts.toLowerCase();
    const year = theory.year;
    
    // Default mappings
    if (concepts.includes('digital') || concepts.includes('computer')) return 'digital';
    if (concepts.includes('gender') || concepts.includes('feminist')) return 'feminist';
    if (concepts.includes('media') || concepts.includes('technology')) return 'newMedia';
    if (year > 1990) return 'contemporary';
    if (year > 1960) return 'postmodern';
    return 'modernism';
}

function getAllCategoryAnswers(mainCategory) {
    // Fallback category if the main one isn't found
    if (!data.alternativeTheorists[mainCategory]) {
        console.log(`Warning: Category "${mainCategory}" not found, using "contemporary" as fallback`);
        mainCategory = 'contemporary';
    }
    
    // Get answers from main category and related categories
    const related = {
        'digital': ['technology', 'contemporary'],
        'modernism': ['aesthetics', 'cultural'],
        'postmodern': ['contemporary', 'cultural'],
        'contemporary': ['digital', 'newMedia'],
        'newMedia': ['digital', 'contemporary'],
        'feminist': ['contemporary', 'cultural'],
        'aesthetics': ['modernism', 'postmodern']
    };
    
    let answers = [...data.alternativeTheorists[mainCategory]];
    
    // Add related category answers
    if (related[mainCategory]) {
        related[mainCategory].forEach(cat => {
            if (data.alternativeTheorists[cat]) {
                answers = answers.concat(data.alternativeTheorists[cat]);
            }
        });
    }
    
    // Add theorists from related specialized categories
    Object.entries(data.theoristCategories).forEach(([cat, theorists]) => {
        if (cat.includes(mainCategory.toLowerCase()) || 
            mainCategory.toLowerCase().includes(cat)) {
            answers = answers.concat(theorists);
        }
    });
    
    // Ensure we have enough unique answers
    if (answers.length < 3) {
        console.log(`Warning: Not enough answers in category ${mainCategory}, adding from other categories`);
        Object.values(data.alternativeTheorists).forEach(theorists => {
            answers = answers.concat(theorists);
        });
    }
    
    return [...new Set(answers)];
}

// Save updated questions
fs.writeFileSync(
    './src/frontend/art-questions.json',
    JSON.stringify({ questions: questions.questions }, null, 2)
); 