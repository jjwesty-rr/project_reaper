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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DecedentInfo } from "@/types/intake";

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
      diedInDomicileState: data?.diedInDomicileState !== undefined ? (data.diedInDomicileState ? "yes" : "no") : undefined,
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
