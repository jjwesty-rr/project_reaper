import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { IntakeFormData } from "@/types/intake";
import { determineReferralType } from "@/lib/intakeLogic";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ReviewStepProps {
  data: IntakeFormData;
  onBack: () => void;
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

export const ReviewStep = ({ data, onBack }: ReviewStepProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const referralType = determineReferralType(data);
  const referralInfo = REFERRAL_TYPE_INFO[referralType!];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data: submission, error } = await supabase
        .from("intake_submissions")
        .insert([{
          user_id: user.id,
          referral_type: referralInfo.title,
          contact_info: data.contactInfo as any,
          decedent_info: data.decedentInfo as any,
          family_info: {
            is_married: data.isMarried,
            has_children: data.hasChildren,
            spouse_info: data.spouseInfo,
            children: data.children,
          } as any,
          representative_info: data.representativeInfo as any,
          trust_beneficiary_info: {
            has_trust: data.hasTrust,
            has_contesting_beneficiaries: data.hasContestingBeneficiaries,
            contesting_beneficiaries_info: data.contestingBeneficiariesInfo,
          } as any,
          assets: data.assets as any,
          total_estimated_value: data.totalNetAssetValue,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Form Submitted Successfully!",
        description: "Redirecting to your submission status...",
      });

      navigate(`/status/${submission.id}`);
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
            <Badge variant={data.hasTrust ? "default" : "secondary"}>
              {data.hasTrust ? "Yes" : "No"}
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
        <Button onClick={handleSubmit} size="lg" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Form"}
        </Button>
      </div>
    </div>
  );
};
