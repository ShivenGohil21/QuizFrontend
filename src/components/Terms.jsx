import React from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="page-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div className="question-card" style={{ maxWidth: '720px', margin: '0' }}>
        <div className="main-section-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px' }}>Examination Instructions</h2>
          <p>Please read the following guidelines carefully before proceeding</p>
        </div>

        <div className="option-list" style={{ gap: '20px' }}>
          {[
            {
              title: "Fullscreen Requirement",
              desc: "The examination must be taken in full-screen mode. Attempting to exit full-screen will result in immediate disqualification and session termination."
            },
            {
              title: "Scientific Calculator",
              desc: "A digital scientific calculator is provided in the header. You may toggle it as needed during the examination."
            },
            {
              title: "Navigation and Progress",
              desc: "The sidebar indicates your progress. Answered questions are marked distinctly. You can navigate between questions at any time before final submission."
            },
            {
              title: "Automated Submission",
              desc: "The examination will be automatically submitted once the timer reaches zero. Ensure all responses are recorded before time expires."
            }
          ].map((item, i) => (
            <div key={i} style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--accent-light)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {i + 1}. {item.title}
              </h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '48px', gap: '16px' }}>
          <button 
            className="btn-logout" 
            style={{ padding: '12px 32px' }}
            onClick={() => navigate(-1)}
          >
            Return
          </button>
          <button 
            className="btn-start-quiz" 
            style={{ padding: '12px 48px' }}
            onClick={() => navigate(-1)}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default Terms;
