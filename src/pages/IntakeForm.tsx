import { useState } from "react";
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
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<IntakeFormData>({});

  const updateFormData = (data: Partial<IntakeFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

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
            onSubmit={() => {
              // Here you would typically send data to backend
              console.log("Form submitted:", formData);
            }}
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
