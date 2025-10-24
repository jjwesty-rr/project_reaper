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
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { IntakeFormData } from "@/types/intake";

const familyInfoSchema = z.object({
  isMarried: z.enum(["yes", "no"], { required_error: "Please select an option" }),
  spouseName: z.string().max(100).optional(),
  spouseEmail: z.string().email().max(255).optional().or(z.literal("")),
  spousePhone: z.string().max(20).optional(),
  spouseAddress: z.string().max(500).optional(),
  hasChildren: z.enum(["yes", "no"], { required_error: "Please select an option" }),
});

interface FamilyInfoStepProps {
  data?: IntakeFormData;
  onNext: (data: Partial<IntakeFormData>) => void;
  onBack: () => void;
}

export const FamilyInfoStep = ({ data, onNext, onBack }: FamilyInfoStepProps) => {
  const [children, setChildren] = useState(data?.children || []);

  const form = useForm<z.infer<typeof familyInfoSchema>>({
    resolver: zodResolver(familyInfoSchema),
    defaultValues: {
      isMarried: data?.isMarried !== undefined ? (data.isMarried ? "yes" : "no") : undefined,
      spouseName: data?.spouseInfo?.name || "",
      spouseEmail: data?.spouseInfo?.email || "",
      spousePhone: data?.spouseInfo?.phone || "",
      spouseAddress: data?.spouseInfo?.address || "",
      hasChildren: data?.hasChildren !== undefined ? (data.hasChildren ? "yes" : "no") : undefined,
    },
  });

  const watchIsMarried = form.watch("isMarried");
  const watchHasChildren = form.watch("hasChildren");

  const addChild = () => {
    setChildren([...children, { name: "", email: "", phone: "", address: "" }]);
  };

  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChild = (index: number, field: string, value: string) => {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };
    setChildren(updated);
  };

  const onSubmit = (values: z.infer<typeof familyInfoSchema>) => {
    const formData: Partial<IntakeFormData> = {
      isMarried: values.isMarried === "yes",
      hasChildren: values.hasChildren === "yes",
    };

    if (values.isMarried === "yes") {
      formData.spouseInfo = {
        name: values.spouseName || "",
        email: values.spouseEmail || "",
        phone: values.spousePhone || "",
        address: values.spouseAddress || "",
      };
    }

    if (values.hasChildren === "yes") {
      formData.children = children;
    }

    onNext(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Family Information
        </h2>
        <p className="text-muted-foreground">
          Please provide information about the decedent's spouse and children.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="isMarried"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Was the decedent married at the time of death?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="married-yes" />
                      <label htmlFor="married-yes" className="cursor-pointer">Yes</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="married-no" />
                      <label htmlFor="married-no" className="cursor-pointer">No</label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchIsMarried === "yes" && (
            <Card className="p-4 space-y-4">
              <h3 className="font-semibold text-lg">Spouse Information</h3>
              
              <FormField
                control={form.control}
                name="spouseName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spouse Name</FormLabel>
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
                  name="spouseEmail"
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
                  name="spousePhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="spouseAddress"
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
            </Card>
          )}

          <FormField
            control={form.control}
            name="hasChildren"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Did the decedent have children?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="children-yes" />
                      <label htmlFor="children-yes" className="cursor-pointer">Yes</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="children-no" />
                      <label htmlFor="children-no" className="cursor-pointer">No</label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchHasChildren === "yes" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Children Information</h3>
                <Button type="button" onClick={addChild} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Child
                </Button>
              </div>

              {children.map((child, index) => (
                <Card key={index} className="p-4 space-y-4 relative">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Child {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChild(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <Input
                    placeholder="Full name"
                    value={child.name}
                    onChange={(e) => updateChild(index, "name", e.target.value)}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={child.email}
                      onChange={(e) => updateChild(index, "email", e.target.value)}
                    />
                    <Input
                      placeholder="Phone"
                      value={child.phone}
                      onChange={(e) => updateChild(index, "phone", e.target.value)}
                    />
                  </div>

                  <Input
                    placeholder="Address"
                    value={child.address}
                    onChange={(e) => updateChild(index, "address", e.target.value)}
                  />
                </Card>
              ))}
            </div>
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
