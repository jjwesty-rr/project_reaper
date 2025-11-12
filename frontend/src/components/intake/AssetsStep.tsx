import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { IntakeFormData, AssetInfo, AssetType } from "@/types/intake";
import { shouldShowBeneficiaryQuestion } from "@/lib/intakeLogic";

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: "primary_residence", label: "Primary Residence" },
  { value: "other_real_property", label: "Other Real Property" },
  { value: "business", label: "Business" },
  { value: "bank_accounts", label: "Bank Accounts" },
  { value: "investment_accounts", label: "Investment Accounts" },
  { value: "life_insurance", label: "Life Insurance" },
  { value: "annuities", label: "Annuities" },
  { value: "stocks_bonds", label: "Stocks/Bonds" },
  { value: "vehicles", label: "Vehicles" },
  { value: "boats", label: "Boats" },
  { value: "rvs", label: "RVs" },
];

interface AssetsStepProps {
  data?: IntakeFormData;
  onNext: (data: Partial<IntakeFormData>) => void;
  onBack: () => void;
  onSkipToReview?: () => void;
}

export const AssetsStep = ({ data, onNext, onBack, onSkipToReview }: AssetsStepProps) => {
  const [assets, setAssets] = useState<AssetInfo[]>(data?.assets || []);
  const [assetsInDomicileState, setAssetsInDomicileState] = useState<string | undefined>(
    data?.assetsInDomicileState !== undefined ? (data.assetsInDomicileState ? "yes" : "no") : undefined
  );

 const addAsset = () => {
  setAssets([
    ...assets,
    {
      type: "" as AssetType,
      description: "",
      estimatedValue: 0,
      ownership: undefined as any,
      hasNamedBeneficiaries: undefined as any,
      fundedIntoTrust: undefined as any,
    },
  ]);
};

  const removeAsset = (index: number) => {
    setAssets(assets.filter((_, i) => i !== index));
  };

  const updateAsset = (index: number, updates: Partial<AssetInfo>) => {
    const updated = [...assets];
    updated[index] = { ...updated[index], ...updates };
    setAssets(updated);
  };

  const calculateTotalValue = () => {
    return assets.reduce((sum, asset) => sum + (asset.estimatedValue || 0), 0);
  };

  const handleSubmit = () => {
    const totalValue = calculateTotalValue();
    onNext({
      assets,
      totalNetAssetValue: totalValue,
      assetsInDomicileState: assetsInDomicileState === "yes",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Asset Information
        </h2>
        <p className="text-muted-foreground">
          Please list all assets owned by the decedent at the time of death.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Assets</h3>
          <Button type="button" onClick={addAsset} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Asset
          </Button>
        </div>

        {assets.length === 0 && (
          <Card className="p-8 text-center border-dashed">
            <p className="text-muted-foreground">
              No assets added yet. Click "Add Asset" to begin.
            </p>
          </Card>
        )}

        {assets.map((asset, index) => (
          <Card key={index} className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-lg">Asset {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAsset(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Asset Type</Label>
                <Select
                  value={asset.type}
                  onValueChange={(value) => updateAsset(index, { type: value as AssetType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset type"/>
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estimated Value ($)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={asset.estimatedValue || ""}
                  onChange={(e) =>
                    updateAsset(index, { estimatedValue: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="e.g., Chase Bank checking account, 2020 Toyota Camry..."
                value={asset.description}
                onChange={(e) => updateAsset(index, { description: e.target.value })}
              />
            </div>

<div className="space-y-2">
  <Label>Ownership Status</Label>
  <RadioGroup
    value={asset.ownership}
    onValueChange={(value) =>
      updateAsset(index, { ownership: value as "sole" | "co-owned" })
    }
    className="flex gap-4"
  >
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="sole" id={`sole-${index}`} />
      <label htmlFor={`sole-${index}`} className="cursor-pointer">
        Solely Owned
      </label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="co-owned" id={`co-owned-${index}`} />
      <label htmlFor={`co-owned-${index}`} className="cursor-pointer">
        Co-Owned
      </label>
    </div>
  </RadioGroup>
  
  {/* Show text field when co-owned is selected */}
  {asset.ownership === "co-owned" && (
    <div className="space-y-2 mt-4">
      <Label>Co-Owner Information</Label>
      <Input
        placeholder="Enter co-owner name and relationship (e.g., Jane Doe - Spouse)"
        value={asset.coOwnerInfo || ""}
        onChange={(e) => updateAsset(index, { coOwnerInfo: e.target.value })}
      />
    </div>
  )}
</div>

            {data?.hasEstatePlan && data?.estatePlanType === 'trust' && (
  <div className="space-y-2">
    <Label>Was this asset funded into the trust?</Label>
    <RadioGroup
      value={asset.fundedIntoTrust ? "yes" : "no"}
      onValueChange={(value) =>
        updateAsset(index, { fundedIntoTrust: value === "yes" })
      }
      className="flex gap-4"
    >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id={`trust-yes-${index}`} />
                    <label htmlFor={`trust-yes-${index}`} className="cursor-pointer">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id={`trust-no-${index}`} />
                    <label htmlFor={`trust-no-${index}`} className="cursor-pointer">
                      No
                    </label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {shouldShowBeneficiaryQuestion(asset.type, asset.fundedIntoTrust || false) && (
              <div className="space-y-2">
                <Label>Does this asset have named beneficiaries?</Label>
                <RadioGroup
                  value={asset.hasNamedBeneficiaries ? "yes" : "no"}
                  onValueChange={(value) =>
                    updateAsset(index, { hasNamedBeneficiaries: value === "yes" })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id={`beneficiary-yes-${index}`} />
                    <label htmlFor={`beneficiary-yes-${index}`} className="cursor-pointer">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id={`beneficiary-no-${index}`} />
                    <label htmlFor={`beneficiary-no-${index}`} className="cursor-pointer">
                      No
                    </label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </Card>
        ))}
      </div>

      {assets.length > 0 && (
        <Card className="p-4 bg-primary/5">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Estimated Asset Value:</span>
            <span className="text-2xl font-bold text-primary">
              ${calculateTotalValue().toLocaleString()}
            </span>
          </div>
        </Card>
      )}

      {!data?.decedentInfo?.diedInDomicileState && (
        <div className="space-y-2">
          <Label>Were there assets owned by the decedent in their state of domicile?</Label>
          <RadioGroup
            value={assetsInDomicileState}
            onValueChange={setAssetsInDomicileState}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="assets-domicile-yes" />
              <label htmlFor="assets-domicile-yes" className="cursor-pointer">
                Yes
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="assets-domicile-no" />
              <label htmlFor="assets-domicile-no" className="cursor-pointer">
                No
              </label>
            </div>
          </RadioGroup>
        </div>
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
          <Button onClick={handleSubmit} disabled={assets.length === 0}>
            Continue to Review
          </Button>
        </div>
      </div>
    </div>
  );
};
