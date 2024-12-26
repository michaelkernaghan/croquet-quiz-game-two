function StartScreen({ onStart }) {
  return (
    <div id="start-screen">
      <h2>Art Theory Quiz</h2>
      <p>Test your knowledge of art theory and criticism</p>
      <div className="meta-info">
        Built with assistance from Claude 3.5 Sonnet (anthropic-ai/claude-3-sonnet@20240229)<br/>
        Last Updated: March 2024
      </div>
      <div className="citation-note">
        <p>Some questions inspired by the 
          <a href="https://standardtesting.io/llm-art" target="_blank" rel="noopener noreferrer">
            LLM Conceptual Art Framework
          </a>
        </p>
        <p className="version-info">Version 1.0.0</p>
      </div>
      <div className="name-input-section">
        {/* existing input fields */}
      </div>
    </div>
  );
}

export default StartScreen; 