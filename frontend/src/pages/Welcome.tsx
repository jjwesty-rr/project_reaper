import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const Welcome = () => {
  const navigate = useNavigate();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const [showButton, setShowButton] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);

  const messages = [
    "Welcome.",
    "We understand this is a difficult time.",
    "Let us help you.",
    "We will guide you through the estate settlement process step by step.",
    "Let's get started."
  ];

  const handleSkip = () => {
    setIsSkipped(true);
    setShowButton(true);
  };

  useEffect(() => {
    if (isSkipped || currentMessageIndex >= messages.length) {
      if (!isSkipped) setShowButton(true);
      return;
    }

    const currentMessage = messages[currentMessageIndex];
    const words = currentMessage.split(' ');
    let wordIndex = 0;
    setDisplayedWords([]);

    // Word-by-word fade-in
    const wordInterval = setInterval(() => {
      if (wordIndex < words.length) {
        setDisplayedWords(prev => [...prev, words[wordIndex]]);
        wordIndex++;
      } else {
        clearInterval(wordInterval);
        
        // Pause, then fade out and move to next message
        setTimeout(() => {
          setDisplayedWords([]);
          setCurrentMessageIndex(prev => prev + 1);
        }, 1500);
      }
    }, 100); // 100ms per word

    return () => clearInterval(wordInterval);
  }, [currentMessageIndex, isSkipped]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4 relative">
        {/* Skip Button */}
        {!showButton && (
          <button
            onClick={handleSkip}
            className="absolute top-24 right-8 text-muted-foreground hover:text-foreground transition-colors text-sm underline"
          >
            Skip
          </button>
        )}

        <div className="max-w-3xl w-full text-center">
          {/* Text Display */}
          {!isSkipped && (
            <div className="min-h-[120px] flex items-center justify-center mb-8">
              <p className="text-4xl md:text-5xl font-light text-foreground leading-relaxed">
                {displayedWords.map((word, index) => (
                  <span
                    key={index}
                    className="inline-block animate-fade-in-word mr-2"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {word}
                  </span>
                ))}
              </p>
            </div>
          )}

          {/* Button appears after all messages or skip */}
          {showButton && (
            <div className="flex justify-center animate-fade-in">
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