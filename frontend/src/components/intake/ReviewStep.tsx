import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { IntakeFormData } from "@/types/intake";
import { determineReferralType } from "@/lib/intakeLogic";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/integrations/supabase/client"; // Now using our Flask API
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReviewStepProps {
  data: IntakeFormData;
  onBack: () => void;
  submissionId?: string | null;
}

const REFERRAL_TYPE_INFO = {
  affidavits: {
    title: "Small Estate Affidavit",
    description: "The estate qualifies for simplified probate using affidavits. Assets are below the state threshold and have no complications.",
    color: "bg-green-100 text-green-800 border-green-300",
  },
  informal_probate: {
    title: "Informal Probate",
    description: "Standard probate process without court supervision. Suitable for straightforward estates without disputes.",
    color: "bg-blue-100 text-blue-800 border-blue-300",
  },
  formal_probate: {
    title: "Formal Probate",
    description: "Court-supervised probate required due to contesting beneficiaries or complex circumstances.",
    color: "bg-orange-100 text-orange-800 border-orange-300",
  },
  trust_administration: {
    title: "Trust Administration",
    description: "Estate includes a trust requiring administration outside of probate court.",
    color: "bg-purple-100 text-purple-800 border-purple-300",
  },
};

export const ReviewStep = ({ data, onBack, submissionId }: ReviewStepProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [referralType, setReferralType] = useState<IntakeFormData['referralType']>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const loadReferralType = async () => {
      setLoading(true);
      const type = await determineReferralType(data);
      setReferralType(type);
      setLoading(false);
    };
    loadReferralType();
  }, [data]);

  if (loading || !referralType) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Analyzing estate information...</p>
        </div>
      </div>
    );
  }

  const referralInfo = REFERRAL_TYPE_INFO[referralType];

const handleActualSubmit = async () => {
  setShowPaymentModal(false); // Close modal
  setSubmitting(true);
  try {
    // Flat fields for backend database columns
    const flatData = {
      contact_email: data.contactInfo?.email || '',
      contact_phone: data.contactInfo?.phone || '',
      relationship_to_deceased: data.contactInfo?.relationshipToDecedent || '',
      decedent_first_name: data.decedentInfo?.name?.split(' ')[0] || '',
      decedent_last_name: data.decedentInfo?.name?.split(' ').slice(1).join(' ') || '',
      decedent_date_of_death: data.decedentInfo?.dateOfDeath || '',
      decedent_state: data.decedentInfo?.domicileState || '',
      estate_value: data.totalNetAssetValue || 0,
      has_will: true,
      has_trust: data.hasEstatePlan || false,
      has_disputes: data.hasContestingBeneficiaries || false,
    };

    // Complete nested form data for form_data column (for editing)
    const completeFormData = {
      ...flatData,
      // Keep ALL nested structure
      contactInfo: data.contactInfo,
      decedentInfo: data.decedentInfo,
      isMarried: data.isMarried,
      spouseInfo: data.spouseInfo,
      hasChildren: data.hasChildren,
      children: data.children,
      representativeInfo: data.representativeInfo,
      hasEstatePlan: data.hasEstatePlan,
      estatePlanType: data.estatePlanType,
      hasContestingBeneficiaries: data.hasContestingBeneficiaries,
      contestingBeneficiariesInfo: data.contestingBeneficiariesInfo,
      assets: data.assets,
      totalNetAssetValue: data.totalNetAssetValue,
      assetsInDomicileState: data.assetsInDomicileState,
      referralType: referralType,
      trustDocumentName: data.trustDocumentName,
    };

    let response;
    
   if (submissionId) {
  // UPDATE existing submission
  response = await api.updateSubmission(parseInt(submissionId), completeFormData);
  
  // Upload document if present
  if (data.trustDocument) {
    await api.uploadDocument(parseInt(submissionId), data.trustDocument);
  }
  
  toast({
    title: "Submission Updated Successfully!",
    description: "Your changes have been saved.",
  });
  
  navigate(`/status/${submissionId}`);  // ✅ RIGHT - goes straight to status
} else {
  // CREATE new submission
  response = await api.createSubmission(completeFormData);
  
  // Upload document if present
  if (data.trustDocument) {
    await api.uploadDocument(response.submission_id, data.trustDocument);
  }

  toast({
    title: "Form Submitted Successfully!",
    description: `Your case has been classified as: ${response.referral_type}`,
  });

  // Store submission ID in localStorage
  localStorage.setItem('lastSubmissionId', response.submission_id.toString());
 navigate(`/submission-complete/${response.submission_id}`);  // ✅ Show animation for new submissions
}
  } catch (error: any) {
    console.error("Error submitting form:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to submit form. Please try again.",
      variant: "destructive",
    });
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Review & Submit
        </h2>
        <p className="text-muted-foreground">
          Please review your information before submitting.
        </p>
      </div>

      <Card className={`p-6 border-2 ${referralInfo.color}`}>
        <div className="flex items-start gap-4">
          <CheckCircle2 className="h-8 w-8 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">{referralInfo.title}</h3>
            <p className="text-sm opacity-90">{referralInfo.description}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Contact Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>
            <p className="font-medium">{data.contactInfo?.name}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>
            <p className="font-medium">{data.contactInfo?.email}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Phone:</span>
            <p className="font-medium">{data.contactInfo?.phone}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Relationship:</span>
            <p className="font-medium">{data.contactInfo?.relationshipToDecedent}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Decedent Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>
            <p className="font-medium">{data.decedentInfo?.name}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Date of Death:</span>
            <p className="font-medium">{data.decedentInfo?.dateOfDeath}</p>
          </div>
          <div>
            <span className="text-muted-foreground">State of Domicile:</span>
            <p className="font-medium">{data.decedentInfo?.domicileState}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Estate Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Married:</span>
            <Badge variant={data.isMarried ? "default" : "secondary"}>
              {data.isMarried ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Has Children:</span>
            <Badge variant={data.hasChildren ? "default" : "secondary"}>
              {data.hasChildren ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Has Trust:</span>
            <Badge variant={data.hasEstatePlan ? "default" : "secondary"}>
              {data.hasEstatePlan ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Contesting Beneficiaries:</span>
            <Badge variant={data.hasContestingBeneficiaries ? "destructive" : "secondary"}>
              {data.hasContestingBeneficiaries ? "Yes" : "No"}
            </Badge>
          </div>
          <Separator />
          <div className="flex justify-between items-center pt-2">
            <span className="font-medium">Total Asset Value:</span>
            <span className="text-2xl font-bold text-primary">
              ${data.totalNetAssetValue?.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Number of Assets:</span>
            <span className="font-medium">{data.assets?.length || 0}</span>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-muted/50">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Next Steps</p>
            <p>
              After submission, we'll review your information and connect you with an attorney 
              specializing in {referralInfo.title.toLowerCase()}. They will contact you within 
              1-2 business days to discuss your case.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button onClick={() => setShowPaymentModal(true)} size="lg" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Form"}
        </Button>
      </div>
      
{/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Information</DialogTitle>
            <DialogDescription>
              Complete your payment to submit your estate settlement intake form.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input 
                id="card-number" 
                placeholder="1234 5678 9012 3456"
                disabled
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input 
                  id="expiry" 
                  placeholder="MM/YY"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input 
                  id="cvc" 
                  placeholder="123"
                  disabled
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Name on Card</Label>
              <Input 
                id="name" 
                placeholder="John Doe"
                disabled
              />
            </div>
            
            <div className="pt-4 space-y-2">
              <Button 
                onClick={handleActualSubmit} 
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Processing..." : "Pay $299"}
              </Button>
              
              <Button 
                onClick={handleActualSubmit}
                variant="outline" 
                className="w-full"
                disabled={submitting}
              >
                Skip Payment (Demo)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};