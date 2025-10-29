import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Shield, Clock, CheckCircle, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [lastSubmissionId, setLastSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has submitted before (stored in localStorage)
    const submissionId = localStorage.getItem('lastSubmissionId');
    if (submissionId) {
      setHasSubmitted(true);
      setLastSubmissionId(submissionId);
    }
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate("/intake");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header with Login Button */}
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Estate Guru Settlement</h2>
        {user ? (
          <Button onClick={() => navigate("/home")}>
            Go to Dashboard
          </Button>
        ) : (
          <Button onClick={() => navigate("/auth")} variant="outline">
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Button>
        )}
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Simplify Your Estate Settlement
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Simplify the estate settlement process with our guided intake form. 
            We'll connect you with experienced attorneys to help you navigate this important time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {hasSubmitted && user ? (
              <>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate("/intake")}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Start New Intake Form
                </Button>
                <Button 
                  size="lg" 
                  onClick={() => navigate(`/status/${lastSubmissionId}`)}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  View My Submission
                </Button>
              </>
            ) : (
              <Button 
                size="lg" 
                onClick={handleGetStarted}
              >
                <FileText className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            )}
          </div>

          {hasSubmitted && user && (
            <p className="text-sm text-muted-foreground mt-4">
              Need to start a new case? Click "Start New Intake Form"
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Guided Process</h3>
            <p className="text-muted-foreground">
              Our step-by-step form guides you through all necessary information with conditional logic based on your unique situation.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Expert Matching</h3>
            <p className="text-muted-foreground">
              We connect you with qualified attorneys specializing in estate settlement for your specific needs.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Save Time</h3>
            <p className="text-muted-foreground">
              Complete the intake form at your own pace and receive attorney recommendations quickly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;