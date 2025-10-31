import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { FormProgress } from "@/components/intake/FormProgress";
import { ContactInfoStep } from "@/components/intake/ContactInfoStep";
import { DecedentInfoStep } from "@/components/intake/DecedentInfoStep";
import { FamilyInfoStep } from "@/components/intake/FamilyInfoStep";
import { RepresentativeStep } from "@/components/intake/RepresentativeStep";
import { TrustBeneficiaryStep } from "@/components/intake/TrustBeneficiaryStep";
import { AssetsStep } from "@/components/intake/AssetsStep";
import { ReviewStep } from "@/components/intake/ReviewStep";
import { IntakeFormData } from "@/types/intake";
import { api } from "@/integrations/supabase/client";
import { toast } from "sonner";

const steps = [
  { id: 1, name: "Contact", description: "Your information" },
  { id: 2, name: "Decedent", description: "Deceased information" },
  { id: 3, name: "Estate Plan", description: "Estate planning" },
  { id: 4, name: "Family", description: "Family structure" },
  { id: 5, name: "Representative", description: "Estate representative" },
  { id: 6, name: "Assets", description: "Asset details" },
  { id: 7, name: "Review", description: "Final review" },
];

const IntakeForm = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<IntakeFormData>({});
  const [submissionId, setSubmissionId] = useState<number | null>(null);

  useEffect(() => {
    // Check if we're in edit mode
    const editId = searchParams.get('edit');
    if (editId) {
      loadExistingSubmission(parseInt(editId));
    }
  }, [searchParams]);

 const loadExistingSubmission = async (id: number) => {
  setLoading(true);
  try {
    const submission = await api.getSubmission(id);
    
    console.log("=== LOADED SUBMISSION ===");
    console.log("Full submission:", submission);
    console.log("Form data:", submission.form_data);
    console.log("========================");
    
    if (submission.form_data) {
      // Check if form_data already has the nested structure
      if (submission.form_data.contactInfo) {
        // New format - already nested, use as-is
        setFormData(submission.form_data);
      } else {
        // Old format - flat structure, needs transformation
const transformedData: IntakeFormData = {
 contactInfo: {
  email: submission.form_data.contact_email || submission.contact_email,
  phone: submission.form_data.contact_phone || submission.contact_phone,
  name: submission.form_data.contact_name || '',
  relationshipToDecedent: submission.form_data.relationship_to_deceased || submission.relationship_to_deceased || '',
  address: submission.form_data.contact_address || '',
  isExecutor: submission.form_data.is_executor || false
},
  decedentInfo: {
    name: `${submission.decedent_first_name || ''} ${submission.decedent_last_name || ''}`.trim(),
    dateOfDeath: submission.form_data.decedent_date_of_death || submission.decedent_date_of_death,
    domicileState: submission.form_data.decedent_state || submission.decedent_state,
    dateOfBirth: "",
    diedInDomicileState: false
  },
  hasEstatePlan: submission.form_data.has_trust || submission.has_trust,
  estatePlanType: submission.form_data.estate_plan_type || undefined,
  trustDocumentName: submission.form_data.trust_document_name || undefined,
  hasContestingBeneficiaries: submission.form_data.has_disputes || submission.has_disputes,
  contestingBeneficiariesInfo: undefined,
  isMarried: undefined,
  spouseInfo: undefined,
  hasChildren: undefined,
  children: undefined,
  representativeInfo: undefined,
  assets: undefined,
  totalNetAssetValue: submission.form_data.estate_value || submission.estate_value,
};
setFormData(transformedData);
      }
      
      setSubmissionId(id);
      toast.success('Loaded existing submission for editing');
    } else {
      toast.error('Could not load submission data');
    }
  } catch (error: any) {
    console.error('Error loading submission:', error);
    toast.error('Failed to load submission');
  } finally {
    setLoading(false);
  }
};

  const updateFormData = (data: Partial<IntakeFormData>) => {
    console.log("=== UPDATING FORM DATA ===");
    console.log("New data:", data);
    setFormData((prev) => {
      const updated = { ...prev, ...data };
      console.log("Updated formData:", updated);
      return updated;
    });
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSkipToReview = () => {
    setCurrentStep(7);
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading submission...</p>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ContactInfoStep
            data={formData.contactInfo}
            onNext={(data) => {
              updateFormData({ contactInfo: data as any });
              handleNext();
            }}
            onSkipToReview={submissionId ? handleSkipToReview : undefined}
          />
        );
     case 2:
        return (
          <DecedentInfoStep
            data={formData.decedentInfo}
            onNext={(data) => {
              updateFormData({ decedentInfo: data as any });
              handleNext();
            }}
            onBack={handleBack}
            onSkipToReview={submissionId ? handleSkipToReview : undefined}
          />
        );
      case 3:
        return (
          <TrustBeneficiaryStep
            data={formData}
            onNext={(data) => {
              updateFormData(data);
              handleNext();
            }}
            onBack={handleBack}
            onSkipToReview={submissionId ? handleSkipToReview : undefined}
          />
        );
      case 4:
        return (
          <FamilyInfoStep
            data={formData}
            onNext={(data) => {
              updateFormData(data);
              handleNext();
            }}
            onBack={handleBack}
            onSkipToReview={submissionId ? handleSkipToReview : undefined}
          />
        );
      case 5:
        return (
          <RepresentativeStep
            data={formData}
            onNext={(data) => {
              updateFormData(data);
              handleNext();
            }}
            onBack={handleBack}
            onSkipToReview={submissionId ? handleSkipToReview : undefined}
          />
        );
      case 6:
        return (
          <AssetsStep
            data={formData}
            onNext={(data) => {
              updateFormData(data);
              handleNext();
            }}
            onBack={handleBack}
            onSkipToReview={submissionId ? handleSkipToReview : undefined}
          />
        );
case 7:
        return (
          <ReviewStep
            data={formData}
            onBack={handleBack}
            submissionId={submissionId?.toString() || null}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {submissionId ? 'Edit Estate Settlement Form' : 'Estate Settlement Intake Form'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {submissionId 
              ? 'Update your estate settlement information' 
              : 'Help us understand your estate settlement needs'}
          </p>
        </div>

        <Card className="p-8">
          <FormProgress steps={steps} currentStep={currentStep} />
          {renderStep()}
        </Card>
      </div>
    </div>
  );
};

export default IntakeForm;