import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';


const SubmissionComplete = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);

  const messages = [
    { text: "Thank you.", pause: 1500 },
    { text: "We're reviewing your information.", pause: 2000 },
    { text: "We'll connect you with an attorney who can help. You'll hear from us within 1-2 business days.", pause: 3000 },
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
    const animationDuration = words.length * 150;
    const totalDuration = animationDuration + currentMessage.pause;

    setTimeout(() => {
      setShowMessage(true);
    }, 50);

    const timer = setTimeout(() => {
      setShowMessage(false);
      setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1);
      }, 700);
    }, totalDuration);

    return () => clearTimeout(timer);
  }, [currentMessageIndex, isSkipped]);

  const currentWords = currentMessageIndex < messages.length 
    ? messages[currentMessageIndex].text.split(' ') 
    : [];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-start justify-center p-4 relative pt-24">
        {/* Skip Button */}
        {!showButton && (
          <button
            onClick={handleSkip}
            className="absolute top-24 right-8 text-muted-foreground hover:text-foreground transition-colors text-sm underline"
          >
            Skip
          </button>
        )}

        <div className="max-w-4xl w-full text-center mt-8">
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

          {/* Button appears after all messages or skip */}
          {showButton && (
            <div className="flex flex-col items-center space-y-6 animate-fade-in">
              <Button 
                size="lg"
                onClick={() => navigate(`/status/${id}`)}
                className="text-lg px-8 py-6"
              >
                View My Submission
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SubmissionComplete;