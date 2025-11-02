import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TypingMessage } from '@/components/TypingMessage';
import Header from '@/components/Header';

const SubmissionComplete = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showButton, setShowButton] = useState(false);

  const completionMessage = `Thank you for completing the intake form. We're reviewing your information and will connect you with an attorney who can help. You'll hear from us within 1-2 business days.`;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <TypingMessage 
            message={completionMessage} 
            onComplete={() => setShowButton(true)}
            speed={25}
          />
          
          {showButton && (
            <div className="flex justify-center animate-fade-in">
              <Button 
                size="lg"
                onClick={() => navigate(`/status/${id}`)}
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