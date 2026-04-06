import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { supabase } from "../supabaseClient";

const MainPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const username = localStorage.getItem("quizUsername") || "User";

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("quizzes").select("*");
        if (error) {
          setErrorMessage(`Failed to load quizzes: ${error.message}`);
          setQuizzes([]);
        } else if (data && data.length > 0) {
          setQuizzes(data);
          setErrorMessage("");
        } else {
          setErrorMessage("No quizzes found.");
          setQuizzes([]);
        }
        setLoading(false);
      } catch (err) {
        setErrorMessage(`Error: ${err.message}`);
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("quizUsername");
    localStorage.removeItem("quizEmail");
    navigate("/");
  };

  return (
    <div className="main-page">
      {/* Header */}
      <header className="main-header">
        <div className="main-header-logo">
          Exam<span>Portal</span>
        </div>
        <div className="main-header-right">
          <span className="main-header-welcome">
            Welcome, <strong>{username}</strong>
          </span>
          <button
            className="btn-header-link"
            onClick={() => navigate("/terms")}
          >
            Instructions
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="main-content">
        <div className="main-section-header">
          <h2>Available Examinations</h2>
          <p>Select a quiz below to begin your timed examination</p>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading examinations...</p>
          </div>
        )}

        {errorMessage && !loading && (
          <div className="error-card">{errorMessage}</div>
        )}

        {!loading && quizzes.length === 0 && !errorMessage && (
          <div className="empty-state">
            <p>No examinations available at this time.</p>
          </div>
        )}

        {quizzes.map((quiz) => (
          <div className="quiz-card" key={quiz.id}>
            <div className="quiz-card-info">
              <h4>{quiz.title}</h4>
              <p>{quiz.description || "No description provided."}</p>
              <div className="quiz-card-meta">
                <span className="quiz-meta-tag">60 Min</span>
                <span className="quiz-meta-tag">MCQ</span>
              </div>
            </div>
            <button
              className="btn-start-quiz"
              onClick={() => navigate("/quiz", { state: { quizId: quiz.id } })}
            >
              Start Exam
            </button>
          </div>
        ))}
      </main>
    </div>
  );
};

export default MainPage;
