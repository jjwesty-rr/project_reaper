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

  // Calculate progress percentage (0% to 100%)
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-start justify-between w-full relative">
        {/* Background line that spans the entire width */}
        <div 
          className="absolute top-5 h-0.5 bg-border" 
          style={{ 
            left: '7.14%',  /* 100% / 14 */
            right: '7.14%'  /* 100% / 14 */
          }} 
        />
        
        {/* Progress line that fills based on current step */}
        <div 
          className="absolute top-5 h-0.5 bg-primary transition-all duration-300"
          style={{ 
            left: '7.14%',
            width: `${progressPercentage * 0.8572}%`  /* 0.8572 = (1 - 2/14) to account for margins */
          }} 
        />
        
        {steps.map((step, stepIdx) => (
          <li
            key={step.id}
            className="flex flex-col items-center flex-1 relative z-10"
          >
            {/* Circle */}
            <div 
              className={cn(
                "flex flex-col items-center",
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
          </li>
        ))}
      </ol>
    </nav>
  );
};