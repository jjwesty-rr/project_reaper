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
      <ol className="flex items-start justify-between w-full">
        {steps.map((step, stepIdx) => (
          <li
            key={step.id}
            className="flex flex-col items-center flex-1 relative"
          >
            {/* Circle */}
            <div 
              className={cn(
                "flex flex-col items-center z-10",
                allowClickableSteps && "cursor-pointer group"
              )}
              onClick={() => handleStepClick(step.id)}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all bg-background",
                  step.id < currentStep
                    ? "border-primary bg-primary"
                    : step.id === currentStep
                    ? "border-primary"
                    : "border-border",
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
              
              {/* Label */}
              <div className="mt-3 text-center px-1">
                <span
                  className={cn(
                    "text-xs font-medium block",
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
            
            {/* Connecting line - positioned absolutely behind the circles */}
            {stepIdx !== steps.length - 1 && (
              <div
                className={cn(
                  "absolute top-5 left-1/2 right-0 h-0.5 -translate-y-1/2",
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