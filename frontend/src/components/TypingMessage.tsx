import { useState, useEffect } from 'react';

interface TypingMessageProps {
  message: string;
  onComplete?: () => void;
  speed?: number;
}

export const TypingMessage = ({ message, onComplete, speed = 30 }: TypingMessageProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < message.length) {
        setDisplayedText(message.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [message, speed, onComplete]);

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-semibold">EG</span>
        </div>
        <div className="flex-1">
          <p className="text-lg leading-relaxed text-foreground">
            {displayedText}
            {!isComplete && <span className="animate-pulse">|</span>}
          </p>
        </div>
      </div>
    </div>
  );
};