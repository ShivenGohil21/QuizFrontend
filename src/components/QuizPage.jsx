import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import './Quiz.css';
import { supabase } from "../supabaseClient";
import ScientificCalculator from "./ScientificCalc";
import { FaCalculator } from "react-icons/fa6"; // Standard professional icon

const QuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { username, quizId } = location.state || {};
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [attemptValid, setAttemptValid] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    if (quizId) {
      const fetchQuizData = async () => {
        try {
          const { data: quizRow, error: quizError } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', quizId)
            .single();

          if (quizError || !quizRow) {
            setError("Examination not found.");
            setLoading(false);
            return;
          }

          const { data: questionsRaw, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('quiz_id', quizId)
            .order('order_num', { ascending: true });

          if (questionsError) {
            setError("Failed to load questions.");
            setLoading(false);
            return;
          }

          const questionIds = questionsRaw.map(q => q.id);
          const { data: optionsRaw, error: optionsError } = await supabase
            .from('options')
            .select('*')
            .in('question_id', questionIds);

          if (optionsError) {
            setError("Failed to load options.");
            setLoading(false);
            return;
          }

          const builtQuiz = {
            id: quizRow.id,
            title: quizRow.title,
            duration: quizRow.duration || 60,
            questions: questionsRaw.map(q => ({
              id: q.id,
              question_text: q.text,
              options: (optionsRaw || [])
                .filter(o => o.question_id === q.id)
                .map(o => ({
                  id: o.id,
                  text: o.text,
                  is_correct: o.is_correct === true || o.is_correct === 'true' || o.is_correct === 'True'
                }))
            }))
          };

          setQuizData(builtQuiz);
          setTimeLeft(builtQuiz.duration * 60);
          setLoading(false);
        } catch (err) {
          setError("An error occurred while loading the examination.");
          setLoading(false);
        }
      };
      fetchQuizData();
    }
  }, [quizId]);

  useEffect(() => {
    if (timeLeft <= 0 || loading) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading]);

  // Lockdown Mode & Fullscreen logic
  useEffect(() => {
    if (loading) return;

    // 1. Security: Monitor for any keyboard interactions
    const handleSecurityViolation = (e) => {
      // Any key press redirects immediately to login
      navigate("/");
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };

    // 2. Security: Detection for tab switching
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        navigate("/");
      }
    };

    // 3. Attempt Fullscreen immediately
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn("Fullscreen request might be blocked until user interacts.");
      }
    };

    window.addEventListener("keydown", handleSecurityViolation);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    enterFullscreen();

    // Also trigger on first click to handle browser blocks
    const handleFirstClick = () => {
      enterFullscreen();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);

    return () => {
      window.removeEventListener("keydown", handleSecurityViolation);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener('click', handleFirstClick);
    };
  }, [loading, navigate]);

  const handleAnswerChange = (questionId, optionId) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = (isAutoSubmit = false) => {
    if (!isAutoSubmit && Object.keys(userAnswers).length < quizData.questions.length) {
      if (!window.confirm("You have not answered all questions. Do you still want to submit?")) {
        return;
      }
    }

    let score = 0;
    const detailedResults = quizData.questions.map((question) => {
      const userAnswerId = userAnswers[question.id];
      const selectedOption = question.options.find(opt => opt.id === userAnswerId);
      const correctAnswer = question.options.find(opt => opt.is_correct)?.text;

      if (selectedOption?.is_correct) score += 1;

      return {
        question: question.question_text,
        correct_answer: correctAnswer,
        user_answer: selectedOption?.text || "Not Answered"
      };
    });

    navigate('/result', {
      state: {
        username: username || localStorage.getItem("quizUsername"),
        score,
        total: quizData.questions.length,
        detailedResults,
        attemptValid,
        timeUp: isAutoSubmit
      }
    });
  };

  const formatTime = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="quiz-container align-items-center justify-content-center">
      <div className="loading-spinner"></div>
      <p className="mt-3 text-secondary">Preparing your examination...</p>
    </div>
  );

  if (error) return (
    <div className="quiz-container align-items-center justify-content-center p-4">
      <div className="error-card">{error}</div>
      <button className="btn-logout mt-3" onClick={() => navigate('/main')}>Return to Home</button>
    </div>
  );

  const currentQuestion = quizData.questions[currentQuestionIndex];

  return (
    <div className="quiz-container no-select">
      <header className="quiz-header">
        <div className="quiz-header-title">
          Exam<span>Portal</span> / {quizData.title}
        </div>
        <div className="quiz-header-right">
          <FaCalculator 
            style={{ 
              fontSize: '18px', 
              color: 'var(--accent)', 
              cursor: 'pointer', 
              transition: 'transform 0.2s',
              marginRight: '15px'
            }}
            className="calc-trigger-icon"
            onClick={(e) => {
              e.stopPropagation(); // Don't trigger lockdown on calc click
              setShowCalculator(!showCalculator);
            }}
            title="Open Scientific Calculator"
          />
          <div className="quiz-user-info">
            Candidate: <strong>{username || localStorage.getItem("quizUsername") || "Guest"}</strong>
          </div>
          <div className="timer-box">{formatTime()}</div>
        </div>
      </header>

      <div className="quiz-body">
        <aside className="quiz-sidebar">
          <div className="sidebar-title">Questions</div>
          <div className="question-grid">
            {quizData.questions.map((q, idx) => (
              <div 
                key={q.id}
                className={`question-indicator ${currentQuestionIndex === idx ? 'active' : ''} ${userAnswers[q.id] ? 'answered' : ''}`}
                onClick={() => setCurrentQuestionIndex(idx)}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </aside>

        <main className="quiz-main">
          <div className="question-card">
            <div className="question-header">
              <div className="question-number">Question {currentQuestionIndex + 1} of {quizData.questions.length}</div>
              <div className="question-text">{currentQuestion.question_text.split('\n')[0]}</div>
              {currentQuestion.question_text.includes('\n') && (
                <div className="question-content">
                  {currentQuestion.question_text.split('\n').slice(1).join('\n')}
                </div>
              )}
            </div>

            <div className="option-list">
              {currentQuestion.options.map(opt => (
                <label key={opt.id} className="option-item">
                  <input 
                    type="radio" 
                    name={`q-${currentQuestion.id}`}
                    checked={userAnswers[currentQuestion.id] === opt.id}
                    onChange={() => handleAnswerChange(currentQuestion.id, opt.id)}
                  />
                  <div className="option-label">
                    <div className="option-radio-custom" />
                    {opt.text}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="quiz-actions">
            {currentQuestionIndex < quizData.questions.length - 1 ? (
              <button className="btn-quiz btn-next" onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                Next Question
              </button>
            ) : (
              <button className="btn-quiz btn-submit" onClick={() => handleSubmit(false)}>
                Submit Examination
              </button>
            )}
          </div>
        </main>
      </div>

      {showCalculator && <ScientificCalculator onClose={() => setShowCalculator(false)} />}
    </div>
  );
};

export default QuizPage;
