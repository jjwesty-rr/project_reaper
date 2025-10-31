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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { IntakeFormData } from "@/types/intake";
import { Upload, X, FileText } from "lucide-react";

const trustBeneficiarySchema = z.object({
  hasTrust: z.enum(["yes", "no"], { required_error: "Please select an option" }),
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

  const form = useForm<z.infer<typeof trustBeneficiarySchema>>({
    resolver: zodResolver(trustBeneficiarySchema),
    defaultValues: {
      hasTrust: data?.hasTrust !== undefined ? (data.hasTrust ? "yes" : "no") : undefined,
      hasContestingBeneficiaries: data?.hasContestingBeneficiaries !== undefined ? (data.hasContestingBeneficiaries ? "yes" : "no") : undefined,
      contestingBeneficiariesInfo: data?.contestingBeneficiariesInfo || "",
    },
  });

  const watchHasContesting = form.watch("hasContestingBeneficiaries");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setExistingFileName(null); // Clear existing file name when new file selected
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

  const onSubmit = (values: z.infer<typeof trustBeneficiarySchema>) => {
    onNext({
      hasTrust: values.hasTrust === "yes",
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
          Trust & Will Information
        </h2>
        <p className="text-muted-foreground">
          Information about trusts, wills, and potential estate disputes.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="hasTrust"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Did the decedent have a trust or will?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="trust-yes" />
                      <label htmlFor="trust-yes" className="cursor-pointer">Yes</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="trust-no" />
                      <label htmlFor="trust-no" className="cursor-pointer">No</label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Document Upload Section */}
          <div className="space-y-2">
            <FormLabel>Upload Trust or Will Document (Optional)</FormLabel>
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
                  onClick={onSkipToReview}
                >
                  Skip to Review
                </Button>
              )}
              <Button type="submit" size="lg">
                Continue
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};