import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, FileText } from "lucide-react";
import { DecedentInfo } from "@/types/intake";

// 🚩 FEATURE FLAG - Set to false to hide death certificate section
const SHOW_DEATH_CERTIFICATE = true;

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming"
];

const decedentInfoSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  dateOfDeath: z.string().min(1, "Date of death is required"),
  domicileState: z.string().min(1, "State of domicile is required").max(50),
  diedInDomicileState: z.enum(["yes", "no"], { required_error: "Please select an option" }),
  stateOfDeath: z.string().max(50).optional(),
  hasDeathCertificate: z.enum(["yes", "no"]).optional(),
});

interface DecedentInfoStepProps {
  data?: DecedentInfo;
  onNext: (data: Partial<DecedentInfo>) => void;
  onBack: () => void;
  onSkipToReview?: () => void;
}

export const DecedentInfoStep = ({ data, onNext, onBack, onSkipToReview }: DecedentInfoStepProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(
    data?.deathCertificateDocumentName || null
  );

  const form = useForm<z.infer<typeof decedentInfoSchema>>({
    resolver: zodResolver(decedentInfoSchema),
    defaultValues: {
      name: data?.name || "",
      dateOfBirth: data?.dateOfBirth || "",
      dateOfDeath: data?.dateOfDeath || "",
      domicileState: data?.domicileState || "",
      diedInDomicileState: data?.diedInDomicileState !== undefined ? (data.diedInDomicileState ? "yes" : "no") : undefined,
      stateOfDeath: data?.stateOfDeath || "",
      hasDeathCertificate: data?.hasDeathCertificate !== undefined ? (data.hasDeathCertificate ? "yes" : "no") : undefined,
    },
  });

  const watchDiedInDomicile = form.watch("diedInDomicileState");
  const watchHasDeathCertificate = form.watch("hasDeathCertificate");

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
    const fileInput = document.getElementById("death-certificate") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const onSubmit = (values: z.infer<typeof decedentInfoSchema>) => {
    onNext({
      ...values,
      diedInDomicileState: values.diedInDomicileState === "yes",
      hasDeathCertificate: values.hasDeathCertificate === "yes",
      deathCertificateDocument: selectedFile || undefined,
      deathCertificateDocumentName: selectedFile?.name || existingFileName || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Decedent Information
        </h2>
        <p className="text-muted-foreground">
          Please provide information about the deceased person.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name of Deceased</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfDeath"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Death</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="domicileState"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State of Domicile (Primary Residence)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="diedInDomicileState"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Did the decedent die in their state of domicile?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="died-yes" />
                      <label htmlFor="died-yes" className="cursor-pointer">Yes</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="died-no" />
                      <label htmlFor="died-no" className="cursor-pointer">No</label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchDiedInDomicile === "no" && (
            <FormField
              control={form.control}
              name="stateOfDeath"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State Where Death Occurred</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* 🚩 DEATH CERTIFICATE SECTION - Controlled by feature flag */}
          {SHOW_DEATH_CERTIFICATE && (
            <>
              <FormField
                control={form.control}
                name="hasDeathCertificate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Do you have the decedent's death certificate?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="cert-yes" />
                          <label htmlFor="cert-yes" className="cursor-pointer">Yes</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="cert-no" />
                          <label htmlFor="cert-no" className="cursor-pointer">No</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Show upload section if they have the certificate */}
              {watchHasDeathCertificate === "yes" && (
                <div className="space-y-2">
                  <FormLabel>Upload Death Certificate (Optional)</FormLabel>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    {!selectedFile && !existingFileName ? (
                      <div className="space-y-2">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          <label htmlFor="death-certificate" className="cursor-pointer text-primary hover:text-primary/80 font-medium">
                            Click to upload
                          </label>
                          {" "}or drag and drop
                        </div>
                        <p className="text-xs text-gray-500">PDF files only</p>
                        <Input
                          id="death-certificate"
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
            </>
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