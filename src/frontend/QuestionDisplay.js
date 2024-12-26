function QuestionDisplay({ question, onAnswer }) {
  return (
    <div className="question-container">
      <h2 className="question-text">{question.question}</h2>
      {question.isLLMArt && (
        <div className="bonus-note">
          <span className="bonus-icon">🎨</span>
          {question.bonusNote}
        </div>
      )}
      <div className="answers-grid">
        {question.answers.map((answer) => (
          // ... existing answer buttons
        ))}
      </div>
    </div>
  );
}

export default QuestionDisplay; 