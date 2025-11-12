import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { IntakeFormData } from "@/types/intake";
import { Upload, X, FileText } from "lucide-react";

const estatePlanSchema = z.object({
  hasEstatePlan: z.enum(["yes", "no"], { required_error: "Please select an option" }),
  estatePlanType: z.enum(["trust", "will", "unknown"]).optional(),
  hasContestingBeneficiaries: z.enum(["yes", "no"], { required_error: "Please select an option" }),
  contestingBeneficiariesInfo: z.string().max(1000).optional(),
});

interface TrustBeneficiaryStepProps {
  data?: IntakeFormData;
  onNext: (data: Partial<IntakeFormData>) => void;
  onBack: () => void;
  onSkipToReview?: () => void;
}

export const TrustBeneficiaryStep = ({ data, onNext, onBack, onSkipToReview }: TrustBeneficiaryStepProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(
    data?.trustDocumentName || null
  );

  const form = useForm<z.infer<typeof estatePlanSchema>>({
    resolver: zodResolver(estatePlanSchema),
    defaultValues: {
      hasEstatePlan: data?.hasEstatePlan !== undefined ? (data.hasEstatePlan ? "yes" : "no") : undefined,
      estatePlanType: data?.estatePlanType || undefined,
      hasContestingBeneficiaries: data?.hasContestingBeneficiaries !== undefined ? (data.hasContestingBeneficiaries ? "yes" : "no") : undefined,
      contestingBeneficiariesInfo: data?.contestingBeneficiariesInfo || "",
    },
  });

  const watchHasEstatePlan = form.watch("hasEstatePlan");
  const watchEstatePlanType = form.watch("estatePlanType");
  const watchHasContesting = form.watch("hasContestingBeneficiaries");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setExistingFileName(null);
    } else if (file) {
      alert("Please select a PDF file");
      e.target.value = "";
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setExistingFileName(null);
    const fileInput = document.getElementById("trust-document") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const onSubmit = (values: z.infer<typeof estatePlanSchema>) => {
    onNext({
      hasEstatePlan: values.hasEstatePlan === "yes",
      estatePlanType: values.estatePlanType,
      hasContestingBeneficiaries: values.hasContestingBeneficiaries === "yes",
      contestingBeneficiariesInfo: values.contestingBeneficiariesInfo,
      trustDocument: selectedFile || undefined,
      trustDocumentName: selectedFile?.name || existingFileName || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Estate Plan
        </h2>
        <p className="text-muted-foreground">
          Please enter information about the decedent's estate plan.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Question 1: Did they have an estate plan? */}
          <FormField
            control={form.control}
            name="hasEstatePlan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Did the decedent have an estate plan?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="estate-plan-yes" />
                      <label htmlFor="estate-plan-yes" className="cursor-pointer">Yes</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="estate-plan-no" />
                      <label htmlFor="estate-plan-no" className="cursor-pointer">No</label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Question 2: What type? (Only shows if they answered YES) */}
          {watchHasEstatePlan === "yes" && (
            <FormField
              control={form.control}
              name="estatePlanType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What type of estate plan did they have?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select estate plan type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="trust">Trust</SelectItem>
                      <SelectItem value="will">Will</SelectItem>
                      <SelectItem value="unknown">I Don't Know</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Document Upload (Only shows if they picked Trust or Will) */}
          {/* Document Upload (Shows if they picked Trust, Will, or Unknown) */}
          {watchHasEstatePlan === "yes" && watchEstatePlanType && (
            <div className="space-y-2">
              <FormLabel>
                  Upload {watchEstatePlanType === "trust" ? "Trust" : watchEstatePlanType === "will" ? "Will" : "Estate Plan"} Document (Optional)
              </FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {!selectedFile && !existingFileName ? (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      <label htmlFor="trust-document" className="cursor-pointer text-primary hover:text-primary/80 font-medium">
                        Click to upload
                      </label>
                      {" "}or drag and drop
                    </div>
                    <p className="text-xs text-gray-500">PDF files only</p>
                    <Input
                      id="trust-document"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {selectedFile?.name || existingFileName}
                        </p>
                        {selectedFile && (
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contesting Beneficiaries Question */}
          <FormField
            control={form.control}
            name="hasContestingBeneficiaries"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Are there any contesting beneficiaries?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="contesting-yes" />
                      <label htmlFor="contesting-yes" className="cursor-pointer">Yes</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="contesting-no" />
                      <label htmlFor="contesting-no" className="cursor-pointer">No</label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contesting Details (Only if they answered YES) */}
          {watchHasContesting === "yes" && (
            <FormField
              control={form.control}
              name="contestingBeneficiariesInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contesting Beneficiary Details</FormLabel>
                  <FormDescription>
                    Please provide names, relationships, and reasons for contestation.
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Example: John Doe (son) believes the will was signed under duress..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

         <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <div className="flex gap-2">
              {onSkipToReview && (
                <Button 
  type="button" 
  variant="outline"
  onClick={form.handleSubmit((values) => {
    onSubmit(values);  // Save the data
    onSkipToReview();   // Then skip to review
  })}
>
  Skip to Review
</Button>
              )}
              <Button type="submit" >
                Continue
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};