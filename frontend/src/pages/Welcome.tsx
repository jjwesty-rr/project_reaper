import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TypingMessage } from '@/components/TypingMessage';
import Header from '@/components/Header';

const Welcome = () => {
  const navigate = useNavigate();
  const [showButton, setShowButton] = useState(false);

  const welcomeMessage = `Welcome. We understand this is a difficult time. We're here to guide you through the estate settlement process step by step. Let's get started.`;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <TypingMessage 
            message={welcomeMessage} 
            onComplete={() => setShowButton(true)}
            speed={25}
          />
          
          {showButton && (
            <div className="flex justify-center animate-fade-in">
              <Button 
                size="lg"
                onClick={() => navigate('/intake')}
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