import { useState } from "react";
import "./App.css";

export default function App() {
  const [cvFile, setCvFile] = useState(null);
  const [result, setResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState(null);

  const analyzeCv = async () => {
    if (!cvFile) return alert("Please choose a CV file first");

    setLoading(true);
    setModalOpen(false);
    setResult(null);
    setAnswers({});
    setScores(null);

    const formData = new FormData();
    formData.append("cv", cvFile);

    try {
      const res = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      // Simulate 10-second delay for analyzing
      setTimeout(() => {
        setResult(data);
        setModalOpen(true);
        setLoading(false);
      }, 10000);
    } catch (err) {
      alert("Network error: " + err.message);
      setLoading(false);
    }
  };

  const handleAnswerChange = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const evaluateAnswers = () => {
    if (!result || !result.questions) return;

    const total = result.questions.length;
    let score = 0;

    result.questions.forEach((_, index) => {
      const answer = (answers[index] || "").toLowerCase();
      if (answer.length > 10) score += 1;
    });

    setScores({
      total,
      correct: score,
      percentage: Math.round((score / total) * 100),
    });
  };

  return (
    <div className="main-container">
      <div className="center-wrapper">
        <div className="card">
          <div className="header">
            <h1 className="title">🚀 AI CV Analyzer</h1>
            <p className="subtitle">
              Upload your CV and let the AI recommend your best-fit role with
              personalized interview questions.
            </p>
          </div>

          <div className="form-group">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setCvFile(e.target.files?.[0] || null)}
              className="file-input"
            />

            <button onClick={analyzeCv} className="analyze-button">
              Analyze CV
            </button>

            {loading && (
              <p className="loading-text">⏳ Analyzing your CV... hang tight</p>
            )}
          </div>
        </div>
      </div>

      {modalOpen && result && (
        <div className="modal-overlay">
          <div className="modal">
            <button
              onClick={() => setModalOpen(false)}
              className="close-button"
            >
              &times;
            </button>

            <h2 className="modal-title">
              🔍 Suggested Role: <span>{result.suggestedRole}</span>
            </h2>

            <h3 className="modal-subtitle">❓ Answer the following:</h3>
            <ol className="question-list">
              {result.questions.map((q, i) => (
                <li key={i}>
                  <p>{q}</p>
                  <textarea
                    rows="2"
                    className="answer-textarea"
                    value={answers[i] || ""}
                    onChange={(e) => handleAnswerChange(i, e.target.value)}
                  />
                </li>
              ))}
            </ol>

            <button onClick={evaluateAnswers} className="submit-button">
              ✅ Submit Answers
            </button>

            {scores && (
              <div className="score-section">
                <h4>📊 Your Score</h4>
                <p>
                  {scores.correct} out of {scores.total} correct
                </p>
                <p>
                  Percentage: <span>{scores.percentage}%</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
