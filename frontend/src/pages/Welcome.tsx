import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const Welcome = () => {
  const navigate = useNavigate();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);

  const messages = [
    { text: "Welcome.", pause: 1500 },
    { text: "We know this time isn't easy.", pause: 1500 },
    { text: "We're here to lighten the load.", pause: 3000 },
    { text: "We'll help you take the first steps in settling your loved one's estate.", pause: 3000 },
    { text: "Let's take that first step together.", pause: 3500 }
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
    const words = currentMessage.text.split(' ');
    const animationDuration = words.length * 150; // 150ms per word
    const totalDuration = animationDuration + currentMessage.pause;

    // Small delay before showing message to ensure clean slate
    setTimeout(() => {
      setShowMessage(true);
    }, 50);

    const timer = setTimeout(() => {
      setShowMessage(false);
      setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1);
      }, 700); // Fade out duration
    }, totalDuration);

    return () => clearTimeout(timer);
  }, [currentMessageIndex, isSkipped]);

  const currentWords = currentMessageIndex < messages.length 
    ? messages[currentMessageIndex].text.split(' ') 
    : [];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4 relative pt-32">
        {/* Skip Button */}
        {!showButton && (
          <button
            onClick={handleSkip}
            className="absolute top-24 right-8 text-muted-foreground hover:text-foreground transition-colors text-sm underline"
          >
            Skip
          </button>
        )}

        <div className="max-w-4xl w-full text-center -mt-20">
          {/* Text Display */}
          {!isSkipped && (
            <div 
              className={`min-h-[120px] flex items-center justify-center mb-8 transition-opacity duration-700 ${
                showMessage ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <p className="text-4xl md:text-5xl font-light text-foreground leading-relaxed">
                {currentWords.map((word, index) => (
                  <span
                    key={`${currentMessageIndex}-${index}`}
                    className="inline-block opacity-0 animate-word-appear"
                    style={{ 
                      animationDelay: `${index * 0.15}s`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    {word}
                    {index < currentWords.length - 1 && '\u00A0'}
                  </span>
                ))}
              </p>
            </div>
          )}

          {/* Description and Button appear after all messages or skip */}
          {showButton && (
            <div className="flex flex-col items-center space-y-6 animate-fade-in">
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed px-4">
                Start by answering a few simple questions. Your answers help us understand your needs so we can match you with an attorney who will guide you through the rest of the process.
              </p>
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