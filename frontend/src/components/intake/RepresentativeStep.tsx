import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IntakeFormData } from "@/types/intake";

const representativeSchema = z.object({
  relationshipToDecedent: z.string().min(1, "Relationship is required").max(100),
  isExecutor: z.enum(["yes", "no"], { required_error: "Please select an option" }),
  representativeName: z.string().max(100).optional(),
  representativeEmail: z.string().email().max(255).optional().or(z.literal("")),
  representativePhone: z.string().max(20).optional(),
  representativeAddress: z.string().max(500).optional(),
  reasonForRepresenting: z.string().max(1000).optional(),
});

interface RepresentativeStepProps {
  data?: IntakeFormData;
  onNext: (data: Partial<IntakeFormData>) => void;
  onBack: () => void;
  onSkipToReview?: () => void;
}

export const RepresentativeStep = ({ data, onNext, onBack, onSkipToReview }: RepresentativeStepProps) => {
  const form = useForm<z.infer<typeof representativeSchema>>({
    resolver: zodResolver(representativeSchema),
    defaultValues: {
      relationshipToDecedent: data?.contactInfo?.relationshipToDecedent || (data as any)?.relationship_to_deceased || "",
      isExecutor: data?.contactInfo?.isExecutor !== undefined ? (data.contactInfo.isExecutor ? "yes" : "no") : undefined,
      representativeName: data?.representativeInfo?.name || "",
      representativeEmail: data?.representativeInfo?.email || "",
      representativePhone: data?.representativeInfo?.phone || "",
      representativeAddress: data?.representativeInfo?.address || "",
      reasonForRepresenting: data?.representativeInfo?.reasonForRepresenting || "",
    },
  });

  const watchIsExecutor = form.watch("isExecutor");

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    const limitedNumber = phoneNumber.slice(0, 10);
    
    if (limitedNumber.length <= 3) {
      return limitedNumber;
    } else if (limitedNumber.length <= 6) {
      return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3)}`;
    } else {
      return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3, 6)}-${limitedNumber.slice(6)}`;
    }
  };

  const onSubmit = (values: z.infer<typeof representativeSchema>) => {
    const formData: Partial<IntakeFormData> = {
      contactInfo: {
        ...data?.contactInfo!,
        relationshipToDecedent: values.relationshipToDecedent,
        isExecutor: values.isExecutor === "yes",
      },
    };

    if (values.isExecutor === "no") {
      formData.representativeInfo = {
        name: values.representativeName || "",
        email: values.representativeEmail || "",
        phone: values.representativePhone || "",
        address: values.representativeAddress || "",
        reasonForRepresenting: values.reasonForRepresenting || "",
      };
    }

    onNext(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Estate Representative
        </h2>
        <p className="text-muted-foreground">
          Please tell us about your relationship to the decedent and who will represent the estate.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="relationshipToDecedent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Relationship to the Decedent</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Spouse, Child, Sibling, Friend" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isExecutor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Are you intending to be the executor of the estate?
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-medium mb-1">Who Can Represent an Estate?</p>
                        <p className="text-sm">
                          Typically, the executor named in the will, or if there's no will, a close family 
                          member such as a spouse, adult child, or parent can petition to represent the estate. 
                          The court ultimately approves the representative.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="executor-yes" />
                      <label htmlFor="executor-yes" className="cursor-pointer">Yes</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="executor-no" />
                      <label htmlFor="executor-no" className="cursor-pointer">No</label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchIsExecutor === "no" && (
            <Card className="p-4 space-y-4">
              <h3 className="font-semibold text-lg">Representative Information</h3>
              <p className="text-sm text-muted-foreground">
                Please provide information about the person who will represent the estate.
              </p>

              <FormField
                control={form.control}
                name="representativeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Representative Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="representativeEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="representativePhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(555) 123-4567" 
                          value={field.value}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="representativeAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reasonForRepresenting"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why are they representing the estate?</FormLabel>
                    <FormDescription>
                      Please explain their relationship and reason (e.g., "Named in the will", "Closest living relative")
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Explain why this person should represent the estate..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
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
