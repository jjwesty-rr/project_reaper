import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, FileText, ArrowLeft, Edit, Mail } from "lucide-react";
import Header from "@/components/Header";

const Status = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchSubmission();
    }
  }, [id]);

  const fetchSubmission = async () => {
    try {
      const data = await api.getSubmission(Number(id));
      setSubmission(data);
    } catch (error: any) {
      console.error("Error fetching submission:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const getNextSteps = (referralType: string) => {
    switch (referralType) {
      case "affidavit":
        return [
          "Our team will review your submission within 1-2 business days",
          "We'll match you with attorneys specializing in small estate affidavits",
          "You'll receive attorney recommendations via email",
          "The attorney will guide you through the affidavit process",
        ];
      case "informal":
        return [
          "Our team will review your submission within 1-2 business days",
          "We'll connect you with experienced probate attorneys",
          "You'll receive a personalized consultation to discuss informal probate",
          "The attorney will help you navigate the court process",
        ];
      case "formal":
        return [
          "Our team will conduct a detailed review within 2-3 business days",
          "We'll match you with attorneys experienced in formal probate proceedings",
          "You'll receive attorney recommendations and initial consultation options",
          "The attorney will represent you through the formal probate process",
        ];
      case "trust":
        return [
          "Our team will review your trust details within 1-2 business days",
          "We'll connect you with attorneys specializing in trust administration",
          "You'll receive guidance on trust settlement procedures",
          "The attorney will assist with proper trust administration and distribution",
        ];
      default:
        return [
          "Our team will review your submission",
          "We'll match you with appropriate legal professionals",
          "You'll receive next steps via email",
        ];
    }
  };

  const getReferralTitle = (referralType: string) => {
    const titles: Record<string, string> = {
      'affidavit': 'Small Estate Affidavit',
      'informal': 'Informal Probate',
      'formal': 'Formal Probate',
      'trust': 'Trust Administration'
    };
    return titles[referralType] || referralType;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading your submission...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return null;
  }

  const nextSteps = getNextSteps(submission.referral_type);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4 md:p-8">
        <div className="container mx-auto max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/home")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>

          <div className="space-y-6">
            <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-3xl">Submission Received!</CardTitle>
                <CardDescription className="text-base">
                  Your estate settlement intake form has been successfully submitted
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Submission Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Submission ID</p>
                    <p className="font-mono text-sm">#{submission.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Submitted On</p>
                    <p className="text-sm">{new Date(submission.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Recommended Path</p>
                  <Badge variant="outline" className="text-base px-4 py-1">
                    {getReferralTitle(submission.referral_type)}
                  </Badge>
                </div>

                {submission.estate_value && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Estate Value</p>
                    <p className="text-lg font-semibold">
                      ${submission.estate_value.toLocaleString()}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Status</p>
                  <Badge className="bg-blue-500">
                    <Clock className="mr-1 h-3 w-3" />
                    {submission.status}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Decedent</p>
                  <p className="font-medium">{submission.decedent_name}</p>
                  <p className="text-sm text-muted-foreground">{submission.decedent_state}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Contact Email</p>
                  <p className="text-sm">{submission.contact_email}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>
                  Here's what happens next in your estate settlement process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {nextSteps.map((step, index) => (
                    <li key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {index + 1}
                      </div>
                      <p className="pt-1">{step}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have any questions about your submission or need to provide additional information,
                  please don't hesitate to contact us.
                </p>
                <div className="flex gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/intake?edit=${submission.id}`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Submission
                  </Button>
                  <Button 
                    variant="outline"
                    asChild
                  >
                    <a href="mailto:support@estateguru.com?subject=Support Request - Submission #${submission.id}">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Support
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Status;