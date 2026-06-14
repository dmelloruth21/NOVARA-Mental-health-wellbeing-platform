import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Onboarding.css';

export default function Onboarding({ authToken }) {
  const navigate = useNavigate();
  
  // Basic user profile info (Step 0)
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('');
  
  // Step tracker
  // Step 0: Profile Info (Nickname/Gender)
  // Steps 1 to 8: Questionnaire
  // Step 9: Analyzing loader
  const [currentStep, setCurrentStep] = useState(0);

  // User responses
  // Format: { qIndex: { choice: 'Yes'|'No', bother: 'Extremely'|'Considerably'|'Slightly'|'Not at all'|null } }
  const [answers, setAnswers] = useState({});

  // 8 Dynamic Questions from the user
  const questions = [
    {
      id: 1,
      text: "Do you often feel down or lacking in energy?",
      hasBother: true
    },
    {
      id: 2,
      text: "Do you regularly take action to meet goals you have set for work or at home?",
      hasBother: false
    },
    {
      id: 3,
      text: "Do you usually get enough good sleep?",
      hasBother: false
    },
    {
      id: 4,
      text: "Do you often feel tensed, nervous or insecure in new situations?",
      hasBother: true
    },
    {
      id: 5,
      text: "Are you often very critical about yourself?",
      hasBother: true
    },
    {
      id: 6,
      text: "Do you tend to have looping thoughts that seem like problem solving but that never reach a solution?",
      hasBother: true
    },
    {
      id: 7,
      text: "Do you often have conflicts or arguments with others?",
      hasBother: false
    },
    {
      id: 8,
      text: "Are you usually able to maintain a work-life balance?",
      hasBother: false
    }
  ];

  const totalSteps = questions.length + 1; // Basic Info + 8 questions

  // Determine current active question (1-indexed for convenience)
  const isQuestionStep = currentStep > 0 && currentStep <= questions.length;
  const currentQuestion = isQuestionStep ? questions[currentStep - 1] : null;
  const currentAnswer = currentQuestion ? (answers[currentQuestion.id] || { choice: null, bother: null }) : null;

  // Handles primary choice: Yes / No
  const handleChoiceSelect = (choice) => {
    if (!currentQuestion) return;
    
    setAnswers({
      ...answers,
      [currentQuestion.id]: {
        choice: choice,
        // Reset bother if choice changed to 'No'
        bother: choice === 'Yes' && currentQuestion.hasBother ? currentAnswer.bother : null
      }
    });
  };

  // Handles secondary choice: Distress level
  const handleBotherSelect = (level) => {
    if (!currentQuestion) return;
    
    setAnswers({
      ...answers,
      [currentQuestion.id]: {
        ...currentAnswer,
        bother: level
      }
    });
  };

  // State checks for navigation eligibility
  const isNextDisabled = () => {
    if (currentStep === 0) {
      return !nickname.trim() || !gender;
    }
    
    if (isQuestionStep) {
      if (!currentAnswer.choice) return true;
      if (currentAnswer.choice === 'Yes' && currentQuestion.hasBother && !currentAnswer.bother) {
        return true;
      }
    }
    
    return false;
  };

  const handleNext = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Transition to final analysis loader screen
      setCurrentStep(questions.length + 1);
      submitOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitOnboarding = async () => {
    // Formulate payload
    const payload = {
      nickname: nickname,
      gender: gender,
      answers: answers,
      onboarding_completed: true
    };

    // Simulate analysis screen delay for premium feel (1.5 seconds)
    setTimeout(() => {
      // UI-First Mode: Directly navigate to dashboard and save mock state
      localStorage.setItem('mockProfile', JSON.stringify(payload));
      navigate('/dashboard');
    }, 2000);
  };

  // Determine page state style wrapper based on selection
  let pageStyleClass = 'state-neutral';
  if (isQuestionStep && currentAnswer && currentAnswer.choice) {
    pageStyleClass = currentAnswer.choice === 'Yes' ? 'state-yes' : 'state-no';
  }

  return (
    <div className={`onboarding-page ${pageStyleClass}`}>
      <div className="onboarding-card">
        
        {/* Step 0: Basic Demographics */}
        {currentStep === 0 && (
          <div>
            <div className="onboarding-header">
              <h2 className="question-number">Hello there! 👋</h2>
              <h1 className="question-text">We'd love to know you a little better before we begin</h1>
            </div>
            
            <div className="form-input-container">
              <div className="form-field">
                <label htmlFor="nickname">What should I call you?</label>
                <input
                  type="text"
                  id="nickname"
                  placeholder="Enter your nickname..."
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={15}
                />
              </div>

              <div className="form-field">
                <label htmlFor="gender">Gender (for personalized pronouns)</label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select gender...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="navigation-controls" style={{ justifyContent: 'flex-end' }}>
              <button
                className="btn-nav btn-nav--next"
                onClick={handleNext}
                disabled={isNextDisabled()}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Steps 1 to 8: Question Slider */}
        {isQuestionStep && currentQuestion && (
          <div>
            {/* Header progress bar */}
            <div className="onboarding-header">
              <div className="onboarding-progress-container">
                <span className="onboarding-progress-label">
                  Question {currentStep} of {questions.length}
                </span>
              </div>
              <div className="onboarding-progress-bar-bg">
                <div 
                  className="onboarding-progress-bar-fill" 
                  style={{ width: `${(currentStep / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="question-content">
              <h2 className="question-number">Personal Insight</h2>
              <h1 className="question-text">{currentQuestion.text}</h1>

              {/* Yes / No Choices */}
              <div className="choices-container">
                <button
                  className={`choice-btn choice-btn--yes ${currentAnswer.choice === 'Yes' ? 'active' : ''}`}
                  onClick={() => handleChoiceSelect('Yes')}
                >
                  <span className="choice-icon">Yes</span>
                </button>
                <button
                  className={`choice-btn choice-btn--no ${currentAnswer.choice === 'No' ? 'active' : ''}`}
                  onClick={() => handleChoiceSelect('No')}
                >
                  <span className="choice-icon">No</span>
                </button>
              </div>

              {/* Conditional distress level (does it bother you?) */}
              {currentAnswer.choice === 'Yes' && currentQuestion.hasBother && (
                <div className="bothered-panel">
                  <h3 className="bothered-title">Does this bother you?</h3>
                  <div className="bothered-options">
                    {['Extremely', 'Considerably', 'Slightly', 'Not at all'].map((level) => (
                      <button
                        key={level}
                        className={`bothered-btn ${currentAnswer.bother === level ? 'active' : ''}`}
                        onClick={() => handleBotherSelect(level)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigations */}
            <div className="navigation-controls">
              <button className="btn-nav btn-nav--back" onClick={handleBack}>
                ← Back
              </button>
              <button
                className="btn-nav btn-nav--next"
                onClick={handleNext}
                disabled={isNextDisabled()}
              >
                {currentStep === questions.length ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        )}

        {/* Step 9: Final loading analyzer */}
        {currentStep === totalSteps && (
          <div className="analyzing-container">
            <div className="analyzing-spinner" />
            <h1 className="analyzing-title">Curating Your Sanctuary</h1>
            <p className="analyzing-subtitle">
              Analyzing your psychological profile to tailor Nova's tone and configure your personal dashboard...
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
