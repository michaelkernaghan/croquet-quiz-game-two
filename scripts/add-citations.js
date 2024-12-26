const fs = require('fs');
const path = require('path');

const citations = {
    // Key verified citations
    'The Work of Art in the Age of Mechanical Reproduction': {
        citation: 'Benjamin, W. (1935). Das Kunstwerk im Zeitalter seiner technischen Reproduzierbarkeit. Zeitschrift für Sozialforschung',
        category: 'Critical Theory'
    },
    'Institutional Critique': {
        citation: 'Haacke, H. (1970). Shapolsky et al. Manhattan Real Estate Holdings, A Real Time Social System',
        category: 'Art Theory'
    },
    'The Origin of the Work of Art': {
        citation: 'Heidegger, M. (1935). Der Ursprung des Kunstwerkes. Holzwege, Frankfurt am Main: Vittorio Klostermann',
        category: 'Critical Theory'
    },
    'Modernist Painting': {
        citation: 'Greenberg, C. (1960). Modernist Painting. Forum Lectures, Voice of America',
        category: 'Art Theory'
    },
    'The Society of the Spectacle': {
        citation: 'Debord, G. (1967). La Société du Spectacle. Paris: Buchet-Chastel',
        category: 'Critical Theory'
    },
    'Ways of Seeing': {
        citation: 'Berger, J. (1972). Ways of Seeing. London: BBC and Penguin Books',
        category: 'Art Theory'
    },
    'Why Have There Been No Great Women Artists?': {
        citation: 'Nochlin, L. (1971). Why Have There Been No Great Women Artists? ARTnews, January 1971',
        category: 'Art Theory'
    },
    'Simulacra and Simulation': {
        citation: 'Baudrillard, J. (1981). Simulacres et Simulation. Paris: Éditions Galilée',
        category: 'Critical Theory'
    },
    'The Death of the Author': {
        citation: 'Barthes, R. (1967). La mort de l\'auteur. Aspen, No. 5-6',
        category: 'Critical Theory'
    },
    'Studies in Iconology': {
        citation: 'Panofsky, E. (1939). Studies in Iconology. Oxford University Press',
        category: 'Art Theory'
    },
    'Digital Art': {
        citation: 'Paul, C. (2003). Digital Art. London: Thames & Hudson',
        category: 'Digital Theory'
    },
    'Artificial Hells': {
        citation: 'Bishop, C. (2012). Artificial Hells: Participatory Art and the Politics of Spectatorship. London: Verso',
        category: 'Art Theory'
    },
    'The Language of New Media': {
        citation: 'Manovich, L. (2001). The Language of New Media. Cambridge: MIT Press',
        category: 'Digital Theory'
    },
    'Internet Art': {
        citation: 'Greene, R. (2004). Internet Art. London: Thames & Hudson',
        category: 'Digital Theory'
    },
    'Inside the White Cube': {
        citation: 'O\'Doherty, B. (1976). Inside the White Cube. Artforum',
        category: 'Art Theory'
    },
    'Virtual Art': {
        citation: 'Grau, O. (2003). Virtual Art: From Illusion to Immersion. Cambridge: MIT Press',
        category: 'Digital Theory'
    },
    'Gramophone, Film, Typewriter': {
        citation: 'Kittler, F. (1986). Grammophon Film Typewriter. Berlin: Brinkmann & Bose',
        category: 'Media Theory'
    },
    'Protocol': {
        citation: 'Galloway, A. R. (2004). Protocol: How Control Exists After Decentralization. Cambridge: MIT Press',
        category: 'Digital Theory'
    }
    // ... we can add more verified citations
};

function addCitations() {
    const questionsFile = path.join(__dirname, '../src/frontend/art-questions.json');
    const questions = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));

    // Create backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(
        path.join(__dirname, `../backups/pre-citations-${timestamp}.json`),
        JSON.stringify(questions, null, 2)
    );

    // Add citations and categories
    questions.questions = questions.questions.map(q => {
        const title = q.correctTheory.title;
        if (citations[title]) {
            return {
                ...q,
                citation: citations[title].citation,
                category: citations[title].category
            };
        }
        return q;
    });

    // Save updated questions
    fs.writeFileSync(questionsFile, JSON.stringify(questions, null, 2));
}

addCitations(); 