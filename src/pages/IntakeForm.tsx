import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FormProgress } from "@/components/intake/FormProgress";
import { ContactInfoStep } from "@/components/intake/ContactInfoStep";
import { DecedentInfoStep } from "@/components/intake/DecedentInfoStep";
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
      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">Step {currentStep} Coming Soon</h3>
            <p className="text-muted-foreground mb-6">This step is under construction.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={handleBack} className="px-4 py-2 border rounded">
                Back
              </button>
              <button onClick={handleNext} className="px-4 py-2 bg-primary text-primary-foreground rounded">
                Continue
              </button>
            </div>
          </div>
        );
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
