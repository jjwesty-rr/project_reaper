import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  name: string;
  description: string;
}

interface FormProgressProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  allowClickableSteps?: boolean;
}

export const FormProgress = ({ 
  steps, 
  currentStep, 
  onStepClick,
  allowClickableSteps = false 
}: FormProgressProps) => {
  const handleStepClick = (stepId: number) => {
    if (allowClickableSteps && onStepClick) {
      onStepClick(stepId);
    }
  };

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step.id}
            className="flex items-center"
          >
            <div 
              className={cn(
                "flex flex-col items-center",
                allowClickableSteps && "cursor-pointer group"
              )}
              onClick={() => handleStepClick(step.id)}
            >
              <div
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                  step.id < currentStep
                    ? "border-primary bg-primary"
                    : step.id === currentStep
                    ? "border-primary bg-background"
                    : "border-border bg-background",
                  allowClickableSteps && "group-hover:scale-110 group-hover:shadow-md"
                )}
              >
                {step.id < currentStep ? (
                  <Check className="h-5 w-5 text-primary-foreground" />
                ) : (
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      step.id === currentStep
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.id}
                  </span>
                )}
              </div>
              <div className="mt-2 text-center min-w-[80px]">
                <span
                  className={cn(
                    "text-xs font-medium",
                    step.id === currentStep
                      ? "text-primary"
                      : step.id < currentStep
                      ? "text-foreground"
                      : "text-muted-foreground",
                    allowClickableSteps && "group-hover:text-primary"
                  )}
                >
                  {step.name}
                </span>
              </div>
            </div>
            
            {/* Connecting line - only show if not the last step */}
            {stepIdx !== steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-16 lg:w-24",
                  step.id < currentStep ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};