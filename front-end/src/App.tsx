import './App.css'
import Login from './component/Login';
import SignUp from './component/SignUp';
import Survey_Form from './component/Survey_Form';
import { useState, useEffect } from 'react'

function App() {
  // Check if user is logged in
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignUpSuccess, setShowSignUpSuccess] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (currentToken !== token) {
        setToken(currentToken);
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [token]);

  // If no token, show login or signup component
  if (!token) {
    if (showSignUp) {
      return <SignUp 
        onSwitchToLogin={() => setShowSignUp(false)} 
        onSignUpSuccess={() => {
          setShowSignUp(false);
          setShowSignUpSuccess(true);
        }}
      />;
    }
    return <Login 
      onSwitchToSignup={() => setShowSignUp(true)} 
      showSignUpSuccess={showSignUpSuccess}
      onDismissSuccess={() => setShowSignUpSuccess(false)}
    />;
  }

  // If user is logged in, show survey form
  return <Survey_Form />;
}

export default App;
