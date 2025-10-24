import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Shield, Clock, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [latestSubmission, setLatestSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchLatestSubmission(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchLatestSubmission(session.user.id);
      } else {
        setLatestSubmission(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchLatestSubmission = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("intake_submissions")
        .select("id, created_at, status, referral_type")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setLatestSubmission(data);
    } catch (error) {
      console.error("Error fetching submission:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Estate Settlement Portal</h2>
          {user ? (
            <Button
              variant="outline"
              onClick={() => navigate("/profile")}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/auth")}
            >
              Login / Sign Up
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Estate Settlement Intake Portal
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Simplify the estate settlement process with our guided intake form. 
            We'll connect you with experienced attorneys to help you navigate this important time.
          </p>
          
          {loading ? (
            <Button size="lg" disabled>
              Loading...
            </Button>
          ) : user && latestSubmission ? (
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="gap-2"
                onClick={() => navigate(`/status/${latestSubmission.id}`)}
              >
                View Your Submission Status
                <ArrowRight className="h-5 w-5" />
              </Button>
              <p className="text-sm text-muted-foreground">
                Submitted on {new Date(latestSubmission.created_at).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <Link to={user ? "/intake" : "/auth"}>
              <Button size="lg" className="gap-2">
                {user ? "Start Your Intake Form" : "Get Started"}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
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

export default Index;
