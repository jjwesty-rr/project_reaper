import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

const steps = [
  { id: 1, name: "Contact", description: "Your information" },
  { id: 2, name: "Decedent", description: "Deceased information" },
  { id: 3, name: "Family", description: "Family structure" },
  { id: 4, name: "Representative", description: "Estate representative" },
  { id: 5, name: "Trust", description: "Trust & beneficiaries" },
  { id: 6, name: "Assets", description: "Asset details" },
  { id: 7, name: "Review", description: "Final review" },
];

const IntakeForm = () => {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<IntakeFormData>({});
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    } else {
      const editId = searchParams.get('edit');
      if (editId) {
        await loadExistingSubmission(editId, session.user.id);
      } else {
        setLoading(false);
      }
    }
  };

  const loadExistingSubmission = async (id: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from("intake_submissions")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSubmissionId(data.id);
        setFormData({
          contactInfo: data.contact_info as any,
          decedentInfo: data.decedent_info as any,
          isMarried: (data.family_info as any)?.is_married,
          spouseInfo: (data.family_info as any)?.spouse_info,
          hasChildren: (data.family_info as any)?.has_children,
          children: (data.family_info as any)?.children,
          representativeInfo: data.representative_info as any,
          hasTrust: (data.trust_beneficiary_info as any)?.has_trust,
          hasContestingBeneficiaries: (data.trust_beneficiary_info as any)?.has_contesting_beneficiaries,
          contestingBeneficiariesInfo: (data.trust_beneficiary_info as any)?.contesting_beneficiaries_info,
          assets: data.assets as any,
          totalNetAssetValue: data.total_estimated_value as number,
        });
      }
    } catch (error) {
      console.error("Error loading submission:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (data: Partial<IntakeFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

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
          />
        );
      case 3:
        return (
          <FamilyInfoStep
            data={formData}
            onNext={(data) => {
              updateFormData(data);
              handleNext();
            }}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <RepresentativeStep
            data={formData}
            onNext={(data) => {
              updateFormData(data);
              handleNext();
            }}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <TrustBeneficiaryStep
            data={formData}
            onNext={(data) => {
              updateFormData(data);
              handleNext();
            }}
            onBack={handleBack}
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
          />
        );
      case 7:
        return (
          <ReviewStep
            data={formData}
            onBack={handleBack}
            submissionId={submissionId}
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
            Estate Settlement Intake Form
          </h1>
          <p className="text-lg text-muted-foreground">
            Help us understand your estate settlement needs
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
