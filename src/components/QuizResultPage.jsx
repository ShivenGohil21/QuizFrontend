import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import './Quiz.css';

const QuizResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    username: passedUsername,
    detailedResults,
    attemptValid,
    score,
    total
  } = location.state || {};

  const username = passedUsername || localStorage.getItem("quizUsername");

  useEffect(() => {
    if (!username || !detailedResults) {
      navigate('/main');
    }

    // Return to normal screen mode (exit lockdown) on result
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.warn("Failed to exit fullscreen:", err));
    }
  }, [username, detailedResults, navigate]);

  if (!username || !detailedResults) return null;

  const percentage = (score / total) * 100;
  
  const getStatus = () => {
    if (!attemptValid) return "Invalid Attempt";
    if (percentage >= 80) return "Excellent Performance";
    if (percentage >= 60) return "Good Achievement";
    return "Assessment Completed";
  };

  const getMessage = () => {
    if (!attemptValid) return "This examination attempt was flagged as invalid. Scores are not officially recorded.";
    if (percentage >= 80) return "Outstanding result. You have demonstrated a strong mastery of the subject matter.";
    if (percentage >= 60) return "Well done. You have a solid grasp of most concepts, with minor room for improvement.";
    return "You have completed the examination. We recommend regular practice to strengthen your understanding further.";
  };

  const getStatusColor = () => {
    if (!attemptValid) return "var(--danger)";
    if (percentage >= 80) return "var(--success)";
    if (percentage >= 60) return "var(--accent)";
    return "var(--text-secondary)";
  };

  return (
    <div className="page-bg">
      <div className="results-container">
        <div className="result-card-main">
          <div className="result-score-circle" style={{ borderColor: getStatusColor() }}>
            <div className="result-score-val">{score}</div>
            <div className="result-score-total">out of {total}</div>
          </div>
          <h2 className="result-status" style={{ color: getStatusColor() }}>{getStatus()}</h2>
          <p className="result-message">{getMessage()}</p>
          <div className="mt-4 pt-4 border-top border-opacity-10 divider">
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Candidate: <strong>{username}</strong></span>
          </div>
          <button className="btn-quiz btn-next mt-4" style={{ margin: '32px auto 0' }} onClick={() => navigate("/main")}>
            Back to Dashboard
          </button>
        </div>

        <div className="main-section-header">
          <h2>Detailed Performance Review</h2>
          <p>Examine your answers and identify areas for further study</p>
        </div>

        <div className="result-details-section">
          {detailedResults.map((result, index) => {
            const isCorrect = result.user_answer.trim() === result.correct_answer.trim();
            return (
              <div key={index} className={`review-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="review-badge">{isCorrect ? 'Correct' : 'Incorrect'}</div>
                <h4 className="review-question">Question {index + 1}: {result.question}</h4>
                
                <div className="review-answer-box">
                  <div className="row d-flex">
                    <div className="flex-fill">
                      <div className="review-label">Your Response</div>
                      <div className={`review-val ${!isCorrect ? 'user-val-wrong' : 'correct-val'}`}>
                        {result.user_answer || "No response recorded"}
                      </div>
                    </div>
                    {!isCorrect && (
                      <div className="flex-fill border-start border-opacity-10 ps-4">
                        <div className="review-label">Expected Response</div>
                        <div className="review-val correct-val">{result.correct_answer}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;
