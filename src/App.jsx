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
import "./../node_modules/bootstrap/dist/css/bootstrap.min.css"

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check localStorage for custom session
    const userEmail = localStorage.getItem("quizEmail");
    if (userEmail) {
      setSession({ user: { email: userEmail } });
    }
  }, []);

  useEffect(() => {
    // Keep old connection tests for now
    const testConnections = async () => {
      // Test Supabase connection
      try {
        const { data, error } = await supabase.from('quizzes').select('count');
        if (error) {
          console.error("Supabase connection failed:", error);
        } else {
          console.log("✓ Supabase connected successfully");
        }
      } catch (err) {
        console.error("Supabase error:", err);
      }

      // Test Django connection
      try {
        const response = await fetch("http://localhost:8000/api/");
        const data = await response.json();
        console.log("✓ Django connected:", data);
      } catch (err) {
        console.error("Django connection failed:", err);
      }
    };

    testConnections();
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