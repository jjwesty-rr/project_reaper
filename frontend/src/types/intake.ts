export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  relationshipToDecedent: string;
   otherRelationship?: string;
  isExecutor: boolean;
}

export interface DecedentInfo {
  name: string;
  dateOfBirth: string;
  dateOfDeath: string;
  domicileState: string;
  diedInDomicileState: boolean;
  stateOfDeath?: string;
}

export interface SpouseInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface ChildInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface RepresentativeInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  reasonForRepresenting: string;
}

export type AssetType = 
  | 'primary_residence'
  | 'other_real_property'
  | 'business'
  | 'bank_accounts'
  | 'investment_accounts'
  | 'life_insurance'
  | 'annuities'
  | 'stocks_bonds'
  | 'vehicles'
  | 'boats'
  | 'rvs';

export interface AssetInfo {
  type: AssetType;
  description: string;
  estimatedValue: number;
  ownership: 'sole' | 'co-owned';
  hasNamedBeneficiaries: boolean;
  fundedIntoTrust?: boolean;
  coOwnerInfo?: string;
  beneficiaryInfo?: string;
}

export interface IntakeFormData {
  // Step 1: Contact Info
  contactInfo?: ContactInfo;
  
  // Step 2: Decedent Info
  decedentInfo?: DecedentInfo;
  
  // Step 3: Estate Plan (MOVED UP)
  hasEstatePlan?: boolean;
  estatePlanType?: 'trust' | 'will' | 'unknown';
  trustDocument?: File;
  trustDocumentName?: string;
  hasContestingBeneficiaries?: boolean;
  contestingBeneficiariesInfo?: string;
  
  // Step 4: Family Structure (MOVED DOWN)
  isMarried?: boolean;
  spouseInfo?: SpouseInfo;
  hasChildren?: boolean;
  children?: ChildInfo[];
  
  // Step 5: Representative
  representativeInfo?: RepresentativeInfo;
  
  // Step 6: Assets
  assets?: AssetInfo[];
  totalNetAssetValue?: number;
  assetsInDomicileState?: boolean;
  
  // Determination
  referralType?: 'affidavits' | 'informal_probate' | 'formal_probate' | 'trust_administration';

}

export interface DecedentInfo {
  name: string;
  dateOfBirth: string;
  dateOfDeath: string;
  domicileState: string;
  diedInDomicileState: boolean;
  stateOfDeath?: string;
  // Add these new fields:
  hasDeathCertificate?: boolean;
  deathCertificateDocument?: File;
  deathCertificateDocumentName?: string;
}