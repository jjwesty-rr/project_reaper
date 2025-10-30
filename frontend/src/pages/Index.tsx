import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, DollarSign, MapPin, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { api } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Submission {
  id: number;
  decedent_name: string;
  decedent_state: string;
  estate_value: number;
  referral_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await api.getMySubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load your submissions');
    } finally {
      setLoading(false);
    }
  };

 const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'secondary';
      case 'in_progress': return 'default';
      case 'completed': return 'default';  // ✅ Changed to 'default'
      default: return 'secondary';
    }
  };

  const getReferralTypeLabel = (type: string) => {
    switch (type) {
      case 'affidavit': return 'Small Estate Affidavit';
      case 'informal': return 'Informal Probate';
      case 'formal': return 'Formal Probate';
      case 'trust': return 'Trust Administration';
      default: return type;
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.first_name || 'User'}!
            </p>
          </div>

          {/* My Submissions Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">My Submissions</h2>
              <Button onClick={() => navigate("/intake")}>
                <FileText className="mr-2 h-4 w-4" />
                New Intake Form
              </Button>
            </div>

            {loading ? (
              <Card className="p-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading your submissions...</span>
                </div>
              </Card>
            ) : error ? (
              <Card className="p-8">
                <p className="text-destructive text-center">{error}</p>
              </Card>
            ) : submissions.length === 0 ? (
              <Card className="p-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by creating your first estate settlement form.
                  </p>
                  <Button onClick={() => navigate("/intake")}>
                    <FileText className="mr-2 h-4 w-4" />
                    Start New Intake Form
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {submissions.map((submission) => (
                  <Card 
                    key={submission.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/status/${submission.id}`)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">
                            {submission.decedent_name}
                          </CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {submission.decedent_state}
                          </CardDescription>
                        </div>
                        <Badge variant={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Estate Value: ${submission.estate_value?.toLocaleString()}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <FileText className="h-4 w-4 mr-2" />
                          {getReferralTypeLabel(submission.referral_type)}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          Submitted {new Date(submission.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

        
        </div>
      </div>
    </>
  );
};

export default Index;