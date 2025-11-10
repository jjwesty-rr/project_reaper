import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
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
import { ContactInfo } from "@/types/intake";

const contactInfoSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().min(10, "Valid phone number required").max(20),
  email: z.string().email("Valid email required").max(255),
  address: z.string().min(1, "Address is required").max(500),
});

interface ContactInfoStepProps {
  data?: ContactInfo;
  onNext: (data: Partial<ContactInfo>) => void;
  onSkipToReview?: () => void;
}

export const ContactInfoStep = ({ data, onNext, onSkipToReview }: ContactInfoStepProps) => {
  const form = useForm<z.infer<typeof contactInfoSchema>>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      name: data?.name || "",
      phone: data?.phone || "",
      email: data?.email || "",
      address: data?.address || "",
    },
  });

  useEffect(() => {
    if (data?.name || data?.email) {
      form.reset({
        name: data?.name || "",
        phone: data?.phone || "",
        email: data?.email || "",
        address: data?.address || "",
      });
    }
  }, [data, form]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedNumber = phoneNumber.slice(0, 10);
    
    // Format as (XXX) XXX-XXXX
    if (limitedNumber.length <= 3) {
      return limitedNumber;
    } else if (limitedNumber.length <= 6) {
      return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3)}`;
    } else {
      return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3, 6)}-${limitedNumber.slice(6)}`;
    }
  };

  const onSubmit = (values: z.infer<typeof contactInfoSchema>) => {
    onNext(values);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Your Contact Information
        </h2>
        <p className="text-muted-foreground">
          Please provide your contact details so we can reach you regarding this estate matter.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
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

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mailing Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, City, ST 12345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between pt-4">
            {onSkipToReview && (
              <Button 
                type="button" 
                variant="outline"
                onClick={onSkipToReview}
              >
                Skip to Review
              </Button>
            )}
            <Button type="submit" size="lg" className={onSkipToReview ? "" : "ml-auto"}>
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};