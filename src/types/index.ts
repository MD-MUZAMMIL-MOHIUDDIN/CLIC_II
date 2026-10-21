export type UserRole =
  | 'CHC'
  | 'FMC'
  | 'Farmer'
  | 'LivestockShop'
  | 'Inputstore'
  | 'Facilitator'
  | 'Admin'
  | 'superadmin';

export type ApprovalStatus =
  | 'pending'
  | 'under_review'
  | 'corrections_requested'
  | 'approved'
  | 'rejected';

export type AccountStatus =
  | 'active'
  | 'inactive'
  | 'suspended';

export interface LocationInfo {
  state: string;
  district: string;
  block?: string;
  village?: string;
  lat?: number;
  lng?: number;
  pincode?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: UserRole;
  approvalStatus: ApprovalStatus;
  accountStatus: AccountStatus;
  location: LocationInfo;
  profileId: string;
  organizationName?: string;
  createdAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  avatarUrl?: string;
  verified?: boolean;
}

export interface RegistrationApplication {
  id: string;
  userId: string;
  applicantName: string;
  applicantEmail: string;
  applicantMobile: string;
  requestedRole: UserRole;
  organizationName?: string;
  location: LocationInfo;
  status: ApprovalStatus;
  submittedAt: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  decisionReason?: string | null;
  assignedFacilitatorId?: string | null;
  documents?: {
    type: string;
    docNumber?: string;
    fileName: string;
    verified?: boolean;
  }[];
  roleSpecificData?: Record<string, any>;
}

export interface CHCCentre {
  id: string;
  userId: string;
  centreName: string;
  registrationNumber: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  location: LocationInfo;
  operatingHours: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  availableEquipmentIds: string[];
  serviceRadiusKm: number;
  description: string;
  imageUrl: string;
}

export interface FarmMachineryCentre {
  id: string;
  userId: string;
  centreName: string;
  contactPerson: string;
  contactPhone: string;
  location: LocationInfo;
  operatingHours: string;
  verified: boolean;
  rating: number;
  equipmentCount: number;
  machineryIds: string[];
  description: string;
  imageUrl: string;
}

export type MachineryCategory =
  | 'Tractors'
  | 'Rotavators'
  | 'Seed Drills'
  | 'Harvesters'
  | 'Cultivators'
  | 'Sprayers'
  | 'Threshers'
  | 'Irrigation'
  | 'Implements';

export type PricingUnit = 'hourly' | 'daily' | 'acre';

export interface FarmMachinery {
  id: string;
  centreId: string;
  centreName: string;
  name: string;
  category: MachineryCategory;
  model: string;
  horsepower?: number;
  capacity?: string;
  fuelType: string;
  operatorProvided: boolean;
  pricePerUnit: number;
  pricingUnit: PricingUnit;
  securityDeposit?: number;
  minimumDuration: string;
  available: boolean;
  specifications: Record<string, string>;
  images: string[];
  location: LocationInfo;
  description: string;
  cancellationPolicy: string;
}

export interface FarmerProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  location: LocationInfo;
  landSizeAcres: number;
  primaryCrops: string[];
  soilType: string;
  irrigationType: string;
}

export interface ScientistProfile {
  id: string;
  userId?: string;
  name: string;
  designation: string;
  institution: string;
  specialization: string;
  domain: 'Crop' | 'Livestock' | 'Soil' | 'Bio-inputs' | 'Horticulture';
  experienceYears: number;
  languages: string[];
  consultationFormats: ('Video Call' | 'Audio Call' | 'Clinic Visit')[];
  rating: number;
  consultationCount: number;
  researchInterests: string[];
  publications: string[];
  availableSlots: string[];
  avatarUrl: string;
  verified: boolean;
  about: string;
}

export interface LivestockShop {
  id: string;
  userId: string;
  shopName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  location: LocationInfo;
  operatingHours: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  categories: string[];
  description: string;
  imageUrl: string;
}

export interface LivestockProduct {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  category:
    | 'Cattle & Buffalo'
    | 'Goat & Sheep'
    | 'Poultry'
    | 'Animal Feed'
    | 'Mineral Mixtures'
    | 'Care Equipment'
    | 'Veterinary';
  price: number;
  priceUnit?: string;
  stockStatus: 'In Stock' | 'Limited' | 'Out of Stock' | 'Available';
  isLiveAnimal: boolean;
  animalDetails?: {
    breed: string;
    age: string;
    gender: string;
    milkYieldPerDay?: string;
    vaccinationStatus: string;
    healthCertificateAvailable: boolean;
  };
  specifications?: Record<string, string>;
  images: string[];
  location: LocationInfo;
  sellerPhone: string;
  verifiedSeller: boolean;
  description: string;
}

export interface BioInput {
  id: string;
  name: string;
  category:
    | 'Biofertilizer'
    | 'Biopesticide'
    | 'Compost & Soil Health'
    | 'Botanical Preparation'
    | 'Biological Control';
  suitableCrops: string[];
  growthStages: string[];
  intendedPurpose: string;
  scientificBasis: string;
  applicationSchedule: string;
  precautions: string;
  officialReference: string;
  compatibility: string;
  availableAtStores: string[];
  imageUrl: string;
}

export interface Booking {
  id: string;
  equipmentId: string;
  equipmentName: string;
  centreId: string;
  centreName: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmLocation: LocationInfo;
  startDate: string;
  endDate: string;
  timeSlot: string;
  durationValue: number;
  durationUnit: PricingUnit;
  totalCost: number;
  depositAmount: number;
  status: 'pending_approval' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  statusReason?: string;
  operatorRequired: boolean;
  createdAt: string;
}

export interface Consultation {
  id: string;
  scientistId: string;
  scientistName: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  crop: string;
  cropStage: string;
  topic: string;
  issueDescription: string;
  photoUrl?: string;
  slot: string;
  format: 'Video Call' | 'Audio Call' | 'Clinic Visit';
  status: 'Submitted' | 'Under Review' | 'Scheduled' | 'Responded' | 'Closed';
  responseNotes?: string;
  prescribedBioInputs?: string[];
  submittedAt: string;
  respondedAt?: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category:
    | 'Soil Health'
    | 'Natural & Bio-inputs'
    | 'Farm Mechanization'
    | 'Livestock Management'
    | 'Crop Practices'
    | 'Integrated Pest Management';
  excerpt: string;
  content: string;
  author: string;
  institution: string;
  publishedDate: string;
  readTime: string;
  tags: string[];
  imageUrl: string;
  featured?: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'consultation' | 'approval' | 'system' | 'weather';
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}

// Location Management Master Types
export interface StateItem {
  StateId: string;
  Value: string;
  Text: string;
}

export interface DistrictItem {
  DistrictId: string;
  Value: string;
  Text: string;
  StateId: string;
}

export interface MandalItem {
  MandalId: string;
  Value: string;
  Text: string;
  DistrictId: string;
}

export interface PanchayatItem {
  PanchayatId: string;
  Value: string;
  Text: string;
  MandalId: string;
}

export interface VillageItem {
  VillageId: string;
  Value: string;
  Text: string;
  PanchayatId: string;
}

// Dropdown Management Types
export interface RefTypeItem {
  RefId: string;
  RefName: string;
}

export interface DropdownItem {
  DropdownId: string;
  Value: string;
  Text: string;
  RefId: string;
  Category?: string;
  Telugu?: string;
}

// Crop Master Entity
export interface Crop {
  CropId: string;
  CropCode: string;
  CropName: string;
  Category: string; // e.g. "Cereals", "Millets", "Pulses", "Oilseeds"
  Telugu: string; // Telugu localized script name
  ScientificName?: string;
  Season?: string;
  Description?: string;
  IsActive: boolean;
}

// Crop Problem Entity Schema
export interface CropProblem {
  CropProblemId: string;
  CropId: string; // FK -> Crop.CropId (e.g. "1" for Paddy, "2" for Maize)
  ProblemCategoryId: string; // FK -> crop_problem_category DropdownId ("36" Pest, "37" Disease, "38" Nutrient Deficiency)
  ProblemName: string;
  ScientificName?: string;
  Description: string;
  Symptoms: string;
  IsActive: boolean;
}

// Problem Media Entity Schema
export type ProblemMediaType = 'IMAGE' | 'VIDEO' | 'INFOGRAPHIC' | 'DOCUMENT';

export interface ProblemMedia {
  ProblemMediaId: string; // Primary Key
  CropProblemId: string; // FK -> CropProblem.CropProblemId
  MediaType: ProblemMediaType | string; // e.g. 'IMAGE' | 'VIDEO'
  MediaUrl: string;
  MediaDescription: string;
  DisplayOrder: number;
  IsActive: boolean;
}

// Problem Management Entity Schema
export type ManagementType = 'Cultural' | 'Biological' | 'Chemical' | 'Mechanical' | 'Physical' | 'Preventive';

export interface ProblemManagement {
  ManagementId: string; // Primary Key
  CropProblemId: string; // FK -> CropProblem.CropProblemId
  PlantGrowthStage: string; // e.g. "Seedling", "Tillering", "Vegetative", "Panicle Initiation", "Flowering", "All Stages"
  PestDevelopmentStage: string; // e.g. "Nymphs & Adults", "Larvae", "Spore Germination", "All Stages"
  SeverityLevel: string; // e.g. "Low (Below ETL)", "Moderate (At ETL)", "Severe (Above ETL)"
  ManagementType: ManagementType | string; // e.g. "Cultural", "Biological", "Chemical", "Mechanical"
  ManagementDetails: string; // Advisory details, dosage, application timing, active ingredient
  IsActive: boolean;
}

// Problem Management Media Entity Schema
export interface ProblemManagementMedia {
  ManagementMediaId: string; // Primary Key
  ManagementId: string; // FK -> ProblemManagement.ManagementId
  MediaType: ProblemMediaType | string;
  MediaUrl: string;
  MediaDescription: string;
  DisplayOrder: number;
  IsActive: boolean;
}


