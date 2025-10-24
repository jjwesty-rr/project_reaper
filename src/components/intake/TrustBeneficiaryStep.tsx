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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { IntakeFormData } from "@/types/intake";

const trustBeneficiarySchema = z.object({
  hasTrust: z.enum(["yes", "no"]),
  hasContestingBeneficiaries: z.enum(["yes", "no"]),
  contestingBeneficiariesInfo: z.string().max(1000).optional(),
});

interface TrustBeneficiaryStepProps {
  data?: IntakeFormData;
  onNext: (data: Partial<IntakeFormData>) => void;
  onBack: () => void;
}

export const TrustBeneficiaryStep = ({ data, onNext, onBack }: TrustBeneficiaryStepProps) => {
  const form = useForm<z.infer<typeof trustBeneficiarySchema>>({
    resolver: zodResolver(trustBeneficiarySchema),
    defaultValues: {
      hasTrust: data?.hasTrust ? "yes" : "no",
      hasContestingBeneficiaries: data?.hasContestingBeneficiaries ? "yes" : "no",
      contestingBeneficiariesInfo: data?.contestingBeneficiariesInfo || "",
    },
  });

  const watchHasContesting = form.watch("hasContestingBeneficiaries");

  const onSubmit = (values: z.infer<typeof trustBeneficiarySchema>) => {
    onNext({
      hasTrust: values.hasTrust === "yes",
      hasContestingBeneficiaries: values.hasContestingBeneficiaries === "yes",
      contestingBeneficiariesInfo: values.contestingBeneficiariesInfo,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Trust & Beneficiaries
        </h2>
        <p className="text-muted-foreground">
          Information about trusts and potential estate disputes.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="hasTrust"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Did the decedent have a trust?</FormLabel>
                <FormDescription>
                  A trust is a legal arrangement where assets are held by a trustee for beneficiaries.
                </FormDescription>
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

          <FormField
            control={form.control}
            name="hasContestingBeneficiaries"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Are there any contesting beneficiaries?</FormLabel>
                <FormDescription>
                  Contesting beneficiaries are individuals who dispute the distribution of assets 
                  or validity of the will/trust.
                </FormDescription>
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
            <Button type="submit" size="lg">
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
