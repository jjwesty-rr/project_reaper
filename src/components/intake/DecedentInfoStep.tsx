import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { DecedentInfo } from "@/types/intake";

const decedentInfoSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  dateOfDeath: z.string().min(1, "Date of death is required"),
  domicileState: z.string().min(1, "State of domicile is required").max(50),
  diedInDomicileState: z.enum(["yes", "no"]),
  stateOfDeath: z.string().max(50).optional(),
});

interface DecedentInfoStepProps {
  data?: DecedentInfo;
  onNext: (data: Partial<DecedentInfo>) => void;
  onBack: () => void;
}

export const DecedentInfoStep = ({ data, onNext, onBack }: DecedentInfoStepProps) => {
  const form = useForm<z.infer<typeof decedentInfoSchema>>({
    resolver: zodResolver(decedentInfoSchema),
    defaultValues: {
      name: data?.name || "",
      dateOfBirth: data?.dateOfBirth || "",
      dateOfDeath: data?.dateOfDeath || "",
      domicileState: data?.domicileState || "",
      diedInDomicileState: data?.diedInDomicileState ? "yes" : "no",
      stateOfDeath: data?.stateOfDeath || "",
    },
  });

  const watchDiedInDomicile = form.watch("diedInDomicileState");

  const onSubmit = (values: z.infer<typeof decedentInfoSchema>) => {
    onNext({
      ...values,
      diedInDomicileState: values.diedInDomicileState === "yes",
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
                <FormControl>
                  <Input placeholder="California" {...field} />
                </FormControl>
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
                  <FormControl>
                    <Input placeholder="Texas" {...field} />
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
