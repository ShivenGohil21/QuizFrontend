// App.jsx
import { useState, useEffect } from 'react'
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import ForgotPassword from './components/ForgotPassword';
import VerifyOtp from './components/VerifyOtp';
import ResetPassword from './components/ResetPassword';
import Signup from './components/Signup';
import MainPage from './components/MainPage';
import Terms from './components/Terms';
import QuizPage from "./components/QuizPage";
import QuizResultPage from './components/QuizResultPage';
import { supabase } from './supabaseClient';
import "bootstrap/dist/css/bootstrap.min.css"

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check localStorage for custom session
    const userEmail = localStorage.getItem("quizEmail");
    if (userEmail) {
      setSession({ user: { email: userEmail } });
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/result" element={<QuizResultPage />} />
      </Routes>
    </Router>
  );
}

export default App;