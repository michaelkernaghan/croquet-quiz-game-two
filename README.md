# Croquet Quiz Game

A web-based quiz application for testing and improving croquet knowledge, featuring questions drawn from authoritative sources in the croquet world.

## Features

- Interactive quiz interface with multiple-choice questions in a four-square layout
- Hoop-based scoring system (1, 2, 3, 4, 1B, 2B, etc., through to Peg)
- Achievement messages showing hoop progress after correct answers
- Daily and all-time high score boards
- Question feedback with source citations and theoretical context
- "Dubious Question" feature for flagging questionable content
- Responsive design for desktop and mobile use
- Comprehensive question validation system

## Question Categories

The quiz includes balanced coverage across seven categories:
- Strategy and Tactics
- Rules and Regulations
- Tournament and Competition
- Techniques and Skills
- Equipment
- History
- Famous Matches and Players

## Technology Stack

- Frontend: Vanilla JavaScript, HTML5, SCSS
- Backend: Node.js, Express
- Data Storage: JSON files, Local Storage for scores
- Validation: Custom question validation script

## Setup

1. Clone the repository:
```bash
git clone https://github.com/michaelkernaghan/croquet-quiz-game-two.git
cd croquet-quiz-game-two
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
node src/frontend/server.js
```

4. Open your browser and navigate to `http://localhost:3000`

## Development

### Project Structure

```
croquet-quiz-game-two/
├── src/
│   ├── frontend/
│   │   ├── app.js              # Main application logic
│   │   ├── styles.scss         # SCSS styling
│   │   ├── styles.css          # Compiled CSS
│   │   ├── index.html          # Main HTML
│   │   ├── server.js           # Express server
│   │   ├── croquet-questions.json    # Main questions database
│   │   ├── dubious-questions.json    # Tracked problematic questions
│   │   └── wylie-figure-map.json     # Image mapping for diagrams
├── scripts/
│   └── validate-questions.js    # Question validation script
└── backups/                     # Question database backups
```

### Question Format

Questions are stored in JSON format with the following structure:

```json
{
  "question": "Question text",
  "answers": [
    {
      "id": "unique_id",
      "answer": "Option A",
      "correct": false
    }
  ],
  "correctTheory": {
    "title": "Theory title",
    "year": "Year of relevance",
    "author": "Source author",
    "key_concepts": "Key concepts covered",
    "summary": "Detailed explanation",
    "significance": "Historical/practical significance",
    "related_concepts": "Related croquet concepts"
  },
  "citation": "Source reference",
  "category": "Category name",
  "questionType": "Question type number"
}
```

### Quality Standards

1. All questions must be factually verifiable
2. Citations must come from recognized croquet authorities
3. Each question requires comprehensive theoretical context
4. Questions must avoid subjective language
5. All questions must pass automated validation checks

### Data Sources

Questions are derived from authoritative croquet sources:
- Laws of Association Croquet
- World Croquet Federation Records
- Croquet Association Archives
- Historical Tournament Records
- Equipment Standards Documentation
- Official Championship Records

## Contributing

1. Fork the repository
2. Create a feature branch
3. Ensure all questions pass validation
4. Commit your changes
5. Push to the branch
6. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Questions curated with assistance from AI, verified against authoritative sources
- Special thanks to the croquet community for maintaining comprehensive documentation
- Built with respect for the traditions and technical aspects of croquet