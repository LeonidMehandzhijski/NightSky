import React, { useState } from 'react';
import NightSky from './NightSky';
import './App.css';

export default function App() {
    const [step, setStep] = useState(0);
    const handleNext = () => setStep(prev => prev + 1);

    return (
        <div className="app-container">
            {step === 0 && (
                <button className="button" onClick={handleNext}>
                    Hello Habibi, press the button here and enjoy
                </button>
            )}

            {step === 1 && (
                <div className="message" onClick={handleNext}>
                    This day 1 year and 1 month ago we decided to make things official
                </div>
            )}

            {step === 2 && (
                <button className="button" onClick={handleNext}>
                    So I wanted to do something special for you
                </button>
            )}

            {step === 3 && (
                <div className="night-sky-container">
                    <NightSky />
                    <div className="romantic-message">
                        This is how the night sky looked that very day. I will forever remember
                        the moment and will forever love you. My habibi <span role="img" aria-label="heart">❤️</span>
                    </div>
                </div>
            )}
        </div>
    );
}
