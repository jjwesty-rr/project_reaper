import { IntakeFormData } from '@/types/intake';

// Hardcoded state limits (matching your Flask backend)
const STATE_LIMITS: Record<string, number> = {
  'California': 184500,
  'Texas': 75000,
  'Florida': 75000,
  'New York': 50000,
  'default': 50000
};

export const getStateLimits = async (): Promise<Record<string, number>> => {
  // Return hardcoded limits instead of fetching from Supabase
  return STATE_LIMITS;
};

export const determineReferralType = async (data: IntakeFormData): Promise<IntakeFormData['referralType']> => {
  const { hasTrust, hasContestingBeneficiaries, totalNetAssetValue, decedentInfo, assets } = data;
  
  // Trust Administration: If trust exists
  if (hasTrust) {
    return 'trust_administration';
  }
  
  // Formal Probate: If there are contesting beneficiaries
  if (hasContestingBeneficiaries) {
    return 'formal_probate';
  }
  
  // Calculate assets without named beneficiaries and not co-owned
  const eligibleAssets = assets?.filter(
    asset => !asset.hasNamedBeneficiaries && asset.ownership === 'sole'
  ) || [];
  
  const eligibleAssetValue = eligibleAssets.reduce(
    (sum, asset) => sum + asset.estimatedValue, 
    0
  );
  
  const stateLimits = await getStateLimits();
  const smallEstateLimit = stateLimits[decedentInfo?.domicileState || 'default'] || stateLimits.default || 50000;
  
  // Affidavits: Value is less than or equal to small estate limit
  if (eligibleAssetValue <= smallEstateLimit) {
    return 'affidavits';
  }
  
  // Informal Probate: Everything else
  return 'informal_probate';
};

export const getAssetQuestions = (assetType: string): string[] => {
  const questions = {
    'primary_residence': ['A', 'B', 'C', 'D', 'E'],
    'other_real_property': ['A', 'B', 'C', 'D', 'E'],
    'business': ['A', 'B', 'C', 'D', 'E'],
    'bank_accounts': ['A', 'B', 'C', 'D', 'E'],
    'investment_accounts': ['A', 'B', 'C', 'D', 'E'],
    'life_insurance': ['A', 'B', 'C', 'D', 'E'],
    'annuities': ['A', 'B', 'E'],
    'stocks_bonds': ['A', 'B', 'E'],
    'vehicles': ['B', 'D', 'E'],
    'boats': ['B', 'D', 'E'],
    'rvs': ['A', 'B', 'E'],
  };
  
  return questions[assetType as keyof typeof questions] || ['A', 'B', 'E'];
};

export const shouldShowBeneficiaryQuestion = (assetType: string, fundedIntoTrust: boolean): boolean => {
  // If funded into trust, don't show beneficiary question
  if (fundedIntoTrust) {
    return false;
  }
  return true;
};