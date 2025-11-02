import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const Welcome = () => {
  const navigate = useNavigate();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showButton, setShowButton] = useState(false);

  const messages = [
    "Welcome.",
    "We understand this is a difficult time.",
    "We're here to guide you through the estate settlement process step by step.",
    "Let's get started."
  ];

  useEffect(() => {
    if (currentMessageIndex >= messages.length) {
      setShowButton(true);
      return;
    }

    const currentMessage = messages[currentMessageIndex];
    let charIndex = 0;

    // Typing animation
    const typingInterval = setInterval(() => {
      if (charIndex < currentMessage.length) {
        setDisplayedText(currentMessage.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        
        // Pause, then fade out and move to next message
        setTimeout(() => {
          setDisplayedText('');
          setIsTyping(true);
          setCurrentMessageIndex(prev => prev + 1);
        }, 1500); // Pause 1.5 seconds before fading
      }
    }, 60); // 60ms per character (slower typing)

    return () => clearInterval(typingInterval);
  }, [currentMessageIndex]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full text-center space-y-8">
          {/* Text Display */}
          <div 
            className={`min-h-[120px] flex items-center justify-center transition-opacity duration-700 ${
              displayedText ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <p className="text-4xl md:text-5xl font-light text-foreground leading-relaxed">
              {displayedText}
              {isTyping && displayedText && <span className="animate-pulse">|</span>}
            </p>
          </div>

          {/* Button appears after all messages */}
          {showButton && (
            <div className="flex justify-center animate-fade-in pt-8">
              <Button 
                size="lg"
                onClick={() => navigate('/intake')}
                className="text-lg px-8 py-6"
              >
                Begin Intake Form
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Welcome;