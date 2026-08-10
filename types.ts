export enum GameState {
  MainMenu = 'MainMenu',
  NewGame = 'NewGame',
  LoadGame = 'LoadGame',
  MainScreen = 'MainScreen',
  Projects = 'Projects',
  Office = 'Office',
  Research = 'Research',
  Studiogelaende = 'Studiogelaende',
  Finanzen = 'Finanzen',
  Marketing = 'Marketing',
  Settings = 'Settings',
  Privatleben = 'Privatleben',
  CompletedProject = 'CompletedProject',
  Editor = 'Editor',
}

export interface SaveFile {
  slotId: number;
  timestamp: string;
  data: PlayerData | null;
}

export interface HistoricalEventDef {
    id: string;
    day: number;
    month: number; // 0-11 (Jan-Dec)
    year: number;
    category: 'World' | 'Industry' | 'Culture' | 'Tech';
    imageUrl?: string;
}

export enum GameSpeed {
  PAUSED = 'PAUSED',
  NORMAL = 'NORMAL',
  FAST = 'FAST',
  FASTER = 'FASTER',
  ULTRA = 'ULTRA',
}

export enum ProjectPhase {
  Planning = 'Planning',
  Scriptwriting = 'Scriptwriting',
  ScriptFinished = 'ScriptFinished',
  CastingSetup = 'CastingSetup',
  Casting = 'Casting',
  CastingFinished = 'CastingFinished',
  ProductionSetup = 'ProductionSetup',
  Production = 'Production',
  PostProductionSetup = 'PostProductionSetup',
  PostProduction = 'PostProduction',
  Completed = 'Completed',
}

export enum ProjectType {
    Movie = 'movie',
    Series = 'series',
}

export enum Genre {
  Action = 'Action',
  Adventure = 'Abenteuer',
  Comedy = 'Komödie',
  Crime = 'Krimi',
  Dokumentation = 'Dokumentation',
  Drama = 'Drama',
  Fantasy = 'Fantasy',
  Horror = 'Horror',
  Musical = 'Musical',
  Romance = 'Romanze',
  SciFi = 'Sci-Fi',
  Thriller = 'Thriller',
  War = 'Kriegsfilm',
  Western = 'Western',
}

export enum BuildingType {
  Burogebaude = 'Burogebaude',
  Autorenbuero = 'Autorenbuero',
  CastingOffice = 'CastingOffice',
  MarketingDepartment = 'MarketingDepartment',
  ResearchLab = 'ResearchLab',
  Planungsbuero = 'Planungsbuero',
  Studio = 'Studio',
  Studio1 = 'Studio1',
  Studio2 = 'Studio2',
  Studio3 = 'Studio3',
  Bauhof = 'Bauhof',
  Kino = 'Kino',
  Restaurant = 'Restaurant',
  Filmmuseum = 'Filmmuseum',
    Backlot = 'Backlot',
    Postproduktionshaus = 'Postproduktionshaus',
    Sicherheitszentrale = 'Sicherheitszentrale',
    KostuemUndMaskenatelier = 'KostuemUndMaskenatelier',
    Betriebskita = 'Betriebskita',
    Studiohotel = 'Studiohotel',
    Eventhalle = 'Eventhalle',
    Fanshop = 'Fanshop',
}

export enum EmployeeType {
  Autor = 'Autor',
  CastingMitarbeiter = 'CastingMitarbeiter',
  Forscher = 'Forscher',
  Marketingmanager = 'Marketingmanager',
  ProjektPlaner = 'ProjektPlaner',
}

export enum TalentTrait {
  Publikumsliebling = 'Publikumsliebling',
  Sparfuchs = 'Sparfuchs',
  Teamplayer = 'Teamplayer',
  Arbeitstier = 'Arbeitstier',
  UnentdecktesJuwel = 'Unentdecktes Juwel',
  Diva = 'Diva',
  Perfektionist = 'Perfektionist',
  Unzuverlässig = 'Unzuverlässig',
  Kassengift = 'Kassengift',
}

export enum MaritalStatus {
  Single = 'Single',
  Acquaintance = 'Bekanntschaft',
  Dating = 'In einer Beziehung',
  Engaged = 'Verlobt',
  Married = 'Verheiratet',
  Divorced = 'Geschieden',
  Widowed = 'Verwitwet',
}

export enum ActorAge {
  Child = 'Kind',
  Young = 'Jung',
  MiddleAged = 'Mittelalt',
  Old = 'Alt',
}

export enum MovieSize {
    B = 'B-Movie',
    BPlus = 'B+ Movie',
    A = 'A-Movie',
    AA = 'AA-Movie',
    AAA = 'AAA-Movie'
}

export enum Era {
    Ancient = 'Antike',
    Medieval = 'Mittelalter',
    Present = 'Gegenwart',
    Future = 'Zukunft'
}

export enum AgeRating {
    FSK0 = '0',
    FSK6 = '6',
    FSK12 = '12',
    FSK16 = '16',
    FSK18 = '18'
}

// Interfaces

export type MarketingTab = 'my_films' | 'campaign' | 'analysis' | 'charts' | 'festivals' | 'current_film';
export type OfficeTabType = 'nachrichten' | 'kontakte' | 'talent_management' | 'employees' | 'charts' | 'calendar' | 'news' | 'scripts' | 'competition';
export type DistributionPhaseTab = 'kino' | 'home_entertainment' | 'pay_tv' | 'free_tv';
export type Language = 'de' | 'en';
export type ScalingMode = 'maintain-ratio' | 'stretch';
export type GameDifficulty = 'leicht' | 'normal' | 'schwer';

export interface ContractOffer {
    id: string;
    stationName: string;
    title: string;
    genre: Genre;
    minQuality: number;
    payout: number;
    penalty: number;
    description?: string;
    upfrontPayment?: number;
    maxDurationMonths: number; 
}

export interface GenreTrendData {
  [key: string]: {
    popularity: number;
    momentum: number;
    peakDuration: number;
  };
}

export interface GenreProfile {
    action: number;
    humor: number;
    romance: number;
    dialogues: number;
    violence: number;
    costumes: number;
    makeup: number;
    stunts: number;
}

export interface Distributor {
  id: number;
  name: string;
  tier: number; // 1-5, determines budget and reach
  flavorText: string;
  genrePreference: Genre;
}

export interface LifecycleOffer {
    distributor: Distributor;
    durationMonths: number;
    upfrontPayment: number;
    monthlyPayment: number;
    revenueShare: number;
    phases: {
        cinemaMonths: number;
        homeVideoMonths: number;
        payTvMonths: number;
        freeTvMonths: number;
    };
    totalValueEstimate: number;
    strategyType: 'cinema_release' | 'direct_to_video' | 'tv_premiere' | 'free_tv_dump';
    isRevealed?: boolean;
    dateCreated: Date;
    lastInteractionDate?: Date;
    
    followUpCount: number; 
    nextInteractionDate: Date; 
    status: 'active' | 'rejected' | 'failed' | 'withdrawn'; 

    negotiationState?: {
        willingness: number;
        plannedReleaseDate?: string; 
        currentOffer: {
            lumpSum: number;
            revenueShare: number;
            installments?: { monthlyAmount: number; months: number };
        };
    };
}

export interface DistributionDeal {
    distributorId: number;
    distributorName: string;
    startDate: Date;
    signedDate: Date;
    durationMonths: number;
    endDate: Date;
    upfrontPayment: number;
    monthlyPayment: number;
    revenueShare: number;
    phases: {
        cinemaMonths: number;
        homeVideoMonths: number;
        payTvMonths: number;
        freeTvMonths: number;
    };
    currentPhase: 'waiting_for_release' | 'cinema' | 'transition_to_home' | 'home' | 'payTv' | 'freeTv' | 'ended';
    monthsPassed: number;
    totalEarnings: number;
    
    homeEntertainmentStartDate?: Date;
    payTvStartDate?: Date;
    freeTvStartDate?: Date;
    nextPhaseStartDate?: Date;
    
    weeksOutOfCharts?: number; 
    
    notificationsSent?: {
        cinema?: boolean;
        home?: boolean;
        payTv?: boolean;
        freeTv?: boolean;
        end?: boolean;
    };
}

export interface Loan {
  id: string;
  name: string;
  principal: number;
  interestRate: number; // Annual
  dateTaken: Date;
  totalOwed: number;
  termInYears: number;
  monthlyPayment: number;
}

export interface LoanOption {
  id: string;
  name: string;
  description: string;
  amount: number;
  interestRate: number;
}

export interface Stock {
  ticker: string;
  name: string;
  industry: 'filmProduction' | 'postProduction' | 'cinemaDistribution' | 'productionTechnology' | 'services';
  price: number;
  history: number[];
  volatility: number;
  trend: number;
}

export interface SkillSet {
    acting: number;
    directing: number;
    writing: number;
    scouting: number;
    research: number;
    marketing: number;
    planning: number;
}

export interface TalentBase {
  id: number;
  name: string;
  gender: 'männlich' | 'weiblich';
  birthDate: Date;
  skill: number;
  cost: number;
  bekanntheit: number; // 0-5 Stars
  favoriteGenres: Genre[];
  hatedGenre: Genre;
  traits: TalentTrait[];
  experience: number;
  potential: number;
  loyalty: number; // 0-100
  moral: number; // 0-100
  isDiscovered: boolean;
  isFavorite?: boolean;
  contract?: {
      type: 'exclusive';
      salary: number;
      expiryDate: Date;
  };
  activeTraining?: {
      type: string;
      endDate: Date;
  };
  lastPraised?: Date;
  lastBonusPaid?: Date;
  agencyId?: number;
  portraitUrl?: string;
  unavailableForProjectsUntil?: Date;
  exclusiveContractCooldownUntil?: Date;
  isFamily?: boolean;
  awards?: string[];
  isCustom?: boolean; // Added for Editor
}

export interface Director extends TalentBase {
  speedModifier: number; // Influences production speed
  skin?: 'light' | 'medium' | 'dark';
  hair?: 'blonde' | 'brown' | 'black' | 'red' | 'grey' | 'white' | 'bald' | 'other';
  ethnicity?: string; // z.B. 'European', 'African', 'Asian', 'Middle Eastern', 'Latin American', 'Mixed'
}

export interface Actor extends TalentBase {
  skin?: 'light' | 'medium' | 'dark';
  hair?: 'blonde' | 'brown' | 'black' | 'red' | 'grey' | 'white' | 'bald' | 'other';
  ethnicity?: string; // z.B. 'European', 'African', 'Asian', 'Middle Eastern', 'Latin American', 'Mixed'
}

export interface Employee {
  id: number;
  name: string;
  type: EmployeeType;
  talent: number;
  salary: number;
  genreFocus?: Genre[]; // Only for authors
  hatedGenre?: Genre; // Only for authors
  speed?: number; // Only for authors
  experience: number;
  satisfaction: number; // 0-100
  activeTraining?: {
      startDate?: Date;
      endDate: Date;
  };
  portraitUrl?: string;
  lastPraised?: Date;
  lastTrainingDate?: Date;
  lastSalaryIncreaseDate?: Date;
  lastComplaintDate?: Date;
}

export interface RoleCasting {
    gender: 'männlich' | 'weiblich';
    age: ActorAge;
}

export type TalentGenderPreference = 'any' | 'männlich' | 'weiblich';
export type TalentAgePreference = ActorAge | 'any';
export type TalentQualityPreference = 'any' | 'low' | 'medium' | 'high' | 'top';

export interface CastingTalentPreference {
    gender: TalentGenderPreference;
    age: TalentAgePreference;
    quality: TalentQualityPreference;
}

export interface ProjectCastingPreferences {
    director: CastingTalentPreference;
    mainActor: CastingTalentPreference;
    supportingActor: CastingTalentPreference;
}

export interface Script {
  id: string;
  title: string;
  genre: Genre;
  quality: number;
  description: string;
  price?: number;
  mainRole?: RoleCasting;
  supportingRole?: RoleCasting;
  era?: Era;
  sourcePlotIndex?: number;
  titleStructure?: {
      templateIndex: number;
      adjectiveIndex: number;
      nounIndex: number;
      conceptIndex: number;
  };
  baseQuality?: number; // For writing process
  cost?: number; // For writing process
}

export interface ActiveWriting {
    script: Script;
    writerId: number;
    startDate: Date;
    endDate: Date;
    qualityModifier?: number;
    eventLog: any[];
    nextEventDate?: Date;
}

export interface ActiveResearch {
    techId: string;
    startDate: Date;
    endDate: Date;
    requiredPoints: number;
    progressPoints: number;
}

export interface ActiveConstruction {
    buildingType: BuildingType;
    endDate: Date;
}

export interface ActiveCasting {
    talentId: number;
    casterId: number;
    startDate?: Date;
    endDate: Date;
    cost: number;
    talentName: string;
    targetBekanntheit?: number;
    isGeneralCasting?: boolean;
}

export interface ActiveTalentScouting {
    scoutId: number;
    endDate: Date;
    searchParams: {
        role: 'director' | 'actor';
        qualityTier: 'standard' | 'umfangreich';
    };
}

export interface ActiveCastingCampaign {
    casterId: number;
    startDate: Date;
    endDate: Date;
    scope: 'personal' | 'small' | 'medium' | 'large';
    role: 'director' | 'actor' | 'both';
    targetSkillLevel?: 1 | 2 | 3 | 4 | 5; 
    targetAgeGroup?: ActorAge; // Updated to use Enum
}

export interface ActiveProductionCampaign {
    campaignId: string;
    projectTitle?: string;
    startDate: Date;
    endDate: Date;
}

export interface ActiveMarketScout {
    endDate: Date;
}

// NEW INTERFACE FOR SEMINARS
export interface ActiveSeminar {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    type: 'seminar' | 'leisure';
    skillBonus?: {
        skill: string; 
        amount: number;
    };
    statBonus?: {
        stat: string;
        amount: number;
    };
    energyChange: number; // Net change
}

export interface Transaction {
  date: Date;
  type: 'Einnahme' | 'Ausgabe';
  category: 'Filmproduktion' | 'Studiogelände' | 'Personal' | 'Marketing' | 'Finanzen' | 'Aktienhandel' | 'Privatleben' | 'Zufallsereignis' | 'Festivals' | 'Filmverleih' | 'Talent-Management' | 'Talent-Scouting' | 'Talentagentur' | 'Forschung' | 'Exklusivverträge';
  description: string;
  amount: number;
  descriptionKey?: string;
  descriptionVars?: Record<string, string | number>;
}

export interface Message {
  id: string;
  date: Date;
  sender: string;
  subject?: string;
  body?: string;
  read: boolean;
  readDate?: Date;
  isArchived?: boolean;
  imageUrl?: string; // New field for portraits in emails
  
  linkedProject?: ProjectData; // Optional: Link to a project (e.g. for release notifications to show cover)

  subjectTemplate?: {
      key: string;
      variables: Record<string, string | number | boolean>;
  };
  bodyTemplate?: {
      key: string;
      variables: Record<string, string | number | boolean>;
  };

  offerContext?: {
      filmTitle: string;
      distributorId: number;
      phase: string;
      isAccepted?: boolean;
      isRejected?: boolean;
      isNegotiationFailed?: boolean;
      isSuperseded?: boolean;
      isWithdrawn?: boolean;
      followUpCount?: number;
  };
  productionEventContext?: {
      eventId: string;
      talentId?: number;
      filmTitle: string;
      isResolved: boolean;
      resolvedEffects?: any;
  };
  decisionEventContext?: {
      eventId: string;
      isResolved: boolean;
      resolvedChoice?: string;
  };
}

export interface QualityBreakdown {
    projektPotenzial: { base: number, plannerBonus: number, budgetBonus: number, zufallsBonus: number, total: number };
    talent: { director: number, mainActor: number, supportingActor: number, chemie: number, total: number };
    handwerk: number;
    visionMultiplier: number;
    events: number;
    finalRandom: number;
    finalScore: number;
    log: string[];
}

export interface ProjectData {
  workingTitle: string;
  phase: ProjectPhase;
    projectType?: ProjectType;
  genre: Genre;
  era: Era;
  sequelTo?: string; 
  ageRating?: AgeRating;
  studioId?: string; // studio1, studio2, studio3
  
  // Script
  scriptId?: string;
  scriptTitle?: string;
  scriptQuality: number;
  scriptDescription?: string;
  scriptBudget?: number;
  scriptStartDate: Date;
  scriptEndDate: Date;
  
  mainRole?: RoleCasting;
  supportingRole?: RoleCasting;
  sourcePlotIndex?: number;
  titleStructure?: Script['titleStructure'];

  // Planning
  plannerId?: number;
  movieSize?: MovieSize;
  movieSizeBudget?: number;
  projectPotential?: number;
    seriesName?: string;
    seriesSeasonTitle?: string;
    seasonNumber?: number;
    episodeCount?: number;
    episodeRuntime?: number;
    seriesFormat?: 'short' | 'standard' | 'prestige';
    releaseModel?: 'weekly' | 'binge';
    narrativeFormat?: 'episodic' | 'serial';
    ensembleSize?: 'intimate' | 'small' | 'medium' | 'large' | 'epic';
    productionProfile?: 'lean' | 'efficient' | 'balanced' | 'ambitious' | 'prestige';
    seriesEnsembleCost?: number;
    seriesProductionProfileCost?: number;
    seriesPlanningCost?: number;
  
  // Casting
  directorId?: number;
  directorGage?: number;
  mainActorId?: number;
  mainActorGage?: number;
  supportingActorId?: number;
  supportingActorGage?: number;
  castingLevel?: number;
  castingCost?: number;
  castingStartDate?: Date;
  castingEndDate?: Date;
  castingInvitedActors?: number[];
    castingPreferences?: ProjectCastingPreferences;
  castingDirectorPool?: Director[]; 
  castingActorPool?: Actor[];       

  // Production
  productionStartDate?: Date;
  productionEndDate?: Date;
  productionCost?: number;
  productionQualityModifier?: number;
  productionEventLog?: { eventId: string, choice: string, date: Date }[];
  nextProductionEventDate?: Date;
  totalProductionEvents?: number;
  weeklyProductionCost?: number;
  accumulatedWeeklyCosts?: number;
  
  // Dept Levels
  kameraLevel?: number;
  lichtLevel?: number;
  tonLevel?: number;
  ausstattungLevel?: number;
  sfxLevel?: number;
  cateringLevel?: number;
  locationLevel?: number;
  extrasLevel?: number;
  
  // Focus
  focusAction?: number;
  focusHumor?: number;
  focusRomance?: number;
  focusDialogues?: number;
  focusViolence?: number;
  focusCostumes?: number;
  focusMakeup?: number;
  focusStunts?: number;

  // Post Production
  postProductionStartDate?: Date;
  postProductionEndDate?: Date;
  postProductionCost?: number;
  editingLevel?: number;
  musicLevel?: number;
  soundLevel?: number;

  // Completion
  finalQuality?: number;
  qualityBreakdown?: QualityBreakdown;
  totalCost?: number; 
  isArchived: boolean;
  templateTitle?: string; 
  
  // Marketing & Release
  coverImageId?: number;
  coverTitlePosition?: 'top' | 'top-center' | 'center' | 'bottom-center' | 'bottom';
  coverTitleFontSize?: number;
  coverTitleFontFamily?: string;
  coverTitleColor?: string;
  hype?: number;
  usedProductionCampaigns?: string[];
  
  // Distribution (New)
  activeDeal?: DistributionDeal;
  offers?: LifecycleOffer[];
  nextOfferDate?: Date; 
  
  // Legacy Distribution (for migration/fallback)
  cinemaRelease?: {
      status: 'planning' | 'active' | 'finished';
      distributorName: string;
      distributorId: number;
      lumpSum: number;
      revenueShare: number;
      releaseDate?: Date;
      endDate?: Date;
      viewers?: number;
      totalViewers?: number;
      weeksInCharts?: number;
      chartQuality?: number;
      totalPlayerRevenue?: number;
      monthlyAccumulatedRevenue?: number; // New field for weekly revenue accumulation
      endNotified?: boolean;
  };
  homeEntertainment?: {
      status: 'active' | 'finished';
      distributorName: string;
      distributorId: number;
      lumpSum: number;
      saleDate: Date;
      endDate: Date;
      contractDurationMonths: number;
      installments?: { monthlyAmount: number, months: number };
      endNotified?: boolean;
  };
  payTv?: {
      status: 'active' | 'finished';
      distributorName: string;
      distributorId: number;
      lumpSum: number;
      saleDate: Date;
      endDate: Date;
      contractDurationMonths: number;
      installments?: { monthlyAmount: number, months: number };
      endNotified?: boolean;
  };
  freeTv?: {
      status: 'active' | 'finished';
      distributorName: string;
      distributorId: number;
      lumpSum: number;
      saleDate: Date;
      endDate: Date;
      contractDurationMonths: number;
      installments?: { monthlyAmount: number, months: number };
      endNotified?: boolean;
  };

  // Misc
  cinemaDistributionOffers?: any[]; 
  homeEntertainmentOffers?: any[]; 
  payTvOffers?: any[]; 
  freeTvOffers?: any[]; 
  
  submittedFestival?: {
      festivalId: string;
      year: number;
  };
  awards?: string[];
  testAudienceFeedback?: { viewer: string, text: string }[];
  prestigeAwarded?: boolean;

  // TV Contracts
  contract?: ContractOffer;
  contractDeadline?: Date; 

  // User-uploaded cover (Base64 or Blob URL)
  customCover?: string;
}

export interface CompetitorFilm {
    title: string;
    studioName: string;
    quality: number;
    chartQuality: number;
    viewers: number;
    totalViewers: number;
    releaseDate: Date;
    weeksInCharts: number;
    directorId?: number;
    actorId?: number;
    genre: Genre;
}

export interface CompetitorStudio {
    id: number;
    name: string;
    completedFilms: CompetitorFilm[];
    currentActivity: {
        type: 'producing' | 'break' | 'pending_release';
        filmTitle?: string;
        quality?: number;
        endDate: Date;
        directorId?: number;
        actorId?: number;
        genre?: Genre;
    };
}

export interface TalentAgency {
    id: number;
    name: string;
    description: string;
    cost: number;
    scoutingDurationDays: number;
    specialization: 'newcomers' | 'genre' | 'arthouse' | 'international' | 'comeback' | 'prestige' | 'action' | 'blockbuster';
}

export interface WeddingDetails {
    packageId: string;
    date: Date;
    cost: number;
    reputationBonus: number;
    surnameId: 'player' | 'partner' | 'hyphenated-player' | 'hyphenated-partner';
}

export interface FamilyTraining {
    skill: keyof SkillSet;
    startDate: Date;
    endDate: Date;
    duration: number;
}

export interface Child {
    id: string;
    name: string;
    gender: 'Junge' | 'Mädchen';
    birthDate: Date;
    relationship: number; // 0-100
    isAdopted?: boolean;
    portraitId?: string;
    education?: 'public' | 'private' | 'university';
    
    // Growth
    skills?: SkillSet;
    activeTraining?: FamilyTraining;
    lastCourseDate?: Date;
    
    // Education
    schoolId?: string;
    schoolEnrollmentDate?: Date;
    enrollmentHandled?: boolean; // For Primary
    secondaryEnrollmentHandled?: boolean;
    universityEnrollmentHandled?: boolean;
    universityEnrollmentDate?: Date;
    universityMajor?: string;
    isGraduated?: boolean;
    
    // History
    primarySchoolId?: string;
    secondarySchoolId?: string;

    // Interaction
    lastInteractionDate?: Date;
    
    // Employment (Adult)
    isEmployed?: boolean;
    employedAs?: EmployeeType | 'Actor' | 'Director';
    jobAssignedDate?: Date; // For cooldown
}

export interface RelationshipInteraction {
    id: string;
    name: string;
    cost: number;
    statusGain: number;
    description: string;
    energyModifier: number;
}

export interface WriterEventChoice {
    text: string;
    value: string;
    className?: string;
    effect: {
        qualityModifier?: number;
        durationModifier?: number;
        costModifier?: number;
    };
}

export interface WriterEvent {
    id: string;
    title: string;
    text: string;
    actions: WriterEventChoice[];
}

export interface ProductionEventChoice {
    text: string;
    value: string;
    className?: string;
    effect: {
        qualityModifier?: number;
        hypeModifier?: number;
        reputationModifier?: number;
        durationModifier?: number;
        costModifier?: number;
        dynamicCostRange?: [number, number]; // Percent of total cost e.g. [1, 5]
    };
}

export interface ProductionEvent {
    id: string;
    title: string;
    text: string;
    actions: ProductionEventChoice[];
    isTalentSpecific?: boolean;
    talentRole?: 'director' | 'actor' | 'any';
    talentId?: number; // Runtime
}

export interface RandomEvent {
    id: string;
    category: 'World' | 'Industry' | 'Studio' | 'Personal' | 'Family' | 'Culture' | 'Tech';
    title: string;
    text: string;
    imageUrl?: string;
    backgroundImage?: string;
    sender?: string;
    effect?: (data: PlayerData) => { updatedPlayerData: PlayerData, notification?: string, customVariables?: any };
    customVariables?: any;
    actions?: { text: string, value: string, className?: string, tooltip?: string }[];
}

export interface CustomEventData {
    id: string;
    title: string;
    text: string;
    category: 'World' | 'Industry' | 'Studio' | 'Personal' | 'Family';
    frequency: 'rare' | 'medium' | 'common';
    effects: {
        capitalChange: number;
        reputationChange: number;
        researchPointsChange: number;
    };
}

export interface CustomDataPackage {
    id: string;
    name: string;
    created: number;
    actors: Actor[];
    directors: Director[];
    competitors: { id: number; name: string }[];
    awardHistory: MovieAwardYear[];
    customEvents: CustomEventData[];
}

export interface Technology {
    id: string;
    name: string;
    description: string;
    cost: number;
    monetaryCost?: number;
    duration: number; // days
    tree: ResearchTree;
    dependencies: string[];
    position?: { x: number, y: number };
    category?: 'film_reel' | 'script' | 'casting' | 'theory' | 'genre_action' | 'genre_adventure' | 'genre_western' | 'genre_scifi' | 'genre_fantasy' | 'genre_drama' | 'genre_romance' | 'genre_comedy' | 'genre_musical' | 'genre_horror' | 'genre_thriller' | 'genre_crime' | 'genre_documentary' | 'genre_war' | 'camera' | 'sound' | 'sfx' | 'crew' | 'postprod' | 'music' | 'location' | 'ads' | 'distribution' | 'merch' | 'building' | 'efficiency' | 'finance' | 'light';
}

export enum ResearchTree {
    Vorproduktion = 'Vorproduktion',
    Genres = 'Genres',
    Production = 'Produktion',
    Marketing = 'Marketing',
    Management = 'Management'
}

export interface CastingOption {
    level: number;
    name: string;
    description: string;
    cost: number;
    duration: number;
    actorsMin: number;
    actorsMax: number;
    directorsMin: number;
    directorsMax: number;
    bekanntheitBoost?: number;
}

// Option interfaces for production
export interface KameraOption { level: number; name: string; description: string; cost: number; qualityBonus: number; durationModifier: number; requiredTechs?: string[]; }
export interface LichtOption { level: number; name: string; description: string; cost: number; qualityBonus: number; durationModifier: number; requiredTechs?: string[]; }
export interface TonOption { level: number; name: string; description: string; cost: number; qualityBonus: number; durationModifier: number; requiredTechs?: string[]; }
export interface AusstattungOption { level: number; name: string; description: string; cost: number; qualityBonus: number; durationModifier: number; requiredTechs?: string[]; }
export interface SFXOption { level: number; name: string; description: string; cost: number; qualityBonus: number; durationModifier: number; requiredTechs?: string[]; }
export interface CateringOption { level: number; name: string; description: string; cost: number; qualityBonus: number; durationModifier: number; moralModifier: number; }
export interface LocationOption { level: number; name: string; description: string; cost: number; qualityBonus: number; durationModifier: number; requiredTechs?: string[]; }
export interface ExtrasOption { level: number; name: string; description: string; cost: number; qualityBonus: number; }
export interface PostProductionOption { level: number; name: string; description: string; cost: number; duration: number; qualityBonus: number; requiredTechs?: string[]; }

export interface NomineeData {
    filmTitle: string;
    studioName: string;
    isPlayer: boolean;
    film?: ProjectData;
    talentName?: string;
    portraitUrl?: string;
}

export interface AwardCategory {
   category: string;
   nominees: NomineeData[];
   winnerIdentifier: string;
}

export interface MovieAwardYear {
    year: number;
    bestFilm: string;
    bestDirector: string;
    bestActor: string;
}

export interface PlayerData {
  playerName: string;
  studioName: string;
  gender: 'männlich' | 'weiblich';
  playerBirthDate: Date;
  playerPortraitId?: string;
    gameDifficulty: GameDifficulty;
  
  // Skills
  negotiationSkill: number;
  charisma: number;
  financialSense: number;
  filmSense: number;
  organizationTalent: number;

  capital: number;
  gameDate: Date;
  reputation: number;
  researchPoints: number;
  
  // New Private Attributes
  privateCapital: number;
  privatePortfolio: Record<string, { shares: number, totalCost: number }>;
  ceoSalary: number;
  lastCeoEvaluationYear: number;
  ceoBonusHistory: { year: number, amount: number }[];
  personalReputation: number;
  energy?: number;
  activePropertyId: string;
  
  // Bankruptcy Tracking
  bankruptcyDeadline?: Date;
  isBankrupt?: boolean;

  // Relationships
  maritalStatus: MaritalStatus;
  datingProgress?: number;
  partnerName: string | null;
  partnerGender?: 'männlich' | 'weiblich';
  partnerBirthDate?: Date;
  partnerJob?: string;
  partnerSalary?: number;
  partnerTraits?: string[];
  partnerSkills?: SkillSet; 
  partnerIsEmployed?: boolean;
  partnerEmployedAs?: EmployeeType | 'Actor' | 'Director';
  partnerJobAssignedDate?: Date;
  relationshipStatus: number; // 0-100
  relationshipStartDate: Date | null;
  engagementDate: Date | null;
  weddingDetails: WeddingDetails | null;
  weddingDate?: Date | null;
  prenupSigned?: boolean;
  partnerPregnancy: { dueDate: Date; isAdoption: boolean } | null;
  pendingConception: { conceptionDate: Date } | null;
  children: Child[];
  partnerPortraitId?: string;
  lastPartnerSearchDate?: Date;
  lastRelationshipInteractionDate?: Date;
  partnerActiveTraining?: FamilyTraining;
  partnerLastCourseDate?: Date;
  partnerChildrenAgreementCount: number;
  partnerChildrenAgreementLimit: number;
  schoolEnrollmentRequest?: { childId: string, type: 'primary' | 'secondary' | 'university', major?: string };

  // Assets
  ownedProperties: string[];
  rentedProperties: string[];
  ownedLuxuryGoods: string[];
  
  currentProject: ProjectData | null; // Keep for legacy/compat
  activeProjects: ProjectData[]; // NEW: List of parallel projects
  activePlanning: ProjectData | null;
  completedFilms: ProjectData[];
  
  unlockedTechnologies: string[];
  activeResearch: ActiveResearch | null;
  
  activeMarketingCampaign: { campaignId: string; startDate: Date; endDate: Date; } | null;
    activeProductionCampaign: ActiveProductionCampaign | null; // Deprecated - replaced by activeProductionCampaigns
    activeProductionCampaigns: ActiveProductionCampaign[];
  
  activeConstruction: ActiveConstruction | null; // Legacy
  activeConstructions: ActiveConstruction[]; 
  
  activeCourse: { courseId: string; endDate: Date; weeklyEnergyCost: number } | null;
  completedCourses: string[];
  lastSeminarDate?: Date;
  lastLeisureDate?: Date;
  lastCourseFinishDate?: Date;

  activeCasting: ActiveCasting | null; // Deprecated - replaced by activeCastings
  activeCastings: ActiveCasting[]; // NEW: Array of active castings
  
  activeCastingCampaign: ActiveCastingCampaign | null; // Deprecated - replaced by activeCastingCampaigns
  activeCastingCampaigns: ActiveCastingCampaign[]; // NEW: Array of active campaigns
  
  activeTalentScouting: ActiveTalentScouting | null; // Deprecated - replaced by activeTalentScoutings
  activeTalentScoutings: ActiveTalentScouting[]; // NEW: Array of active scoutings

  activeMarketScout?: ActiveMarketScout | null;

  activeWriting: ActiveWriting | null;

  buildings: { type: BuildingType; level: number; }[];
  loans: Loan[];
  stocks: Stock[];
  portfolio: Record<string, { shares: number; totalCost: number; }>;
  
  transactionLog: Transaction[];
  messages: Message[];
  eventLog: { date: Date, title: string, text: string, category: 'World' | 'Industry' | 'Studio' | 'Personal' | 'Family' | 'Culture' | 'Tech' }[];
  monthlyHistory: { year: number, month: number, income: number, expense: number, profit: number }[];
  lastMonthlyReportDate: Date | null;
  
  nextEventDate?: Date;
  competitors: CompetitorStudio[];
  
  // Lists
  directors: Director[];
  actors: Actor[];
  talentChemie: { talentA_id: number; talentB_id: number; level: number }[];
  genreSpezialisierungen: { talentId: number; genre: Genre; level: number }[];
  agencies: TalentAgency[];
  availableScripts: Script[];
  scriptMarket: Script[];
  
  employees: Employee[];
  employeeMarket: Employee[];
  allEmployees?: Employee[];
  
  // State Trackers
  lastScriptMarketRefresh?: Date;
  lastEmployeeMarketRefresh?: Date;
  lastContractRefreshDate?: Date;
  
  contractOffers: ContractOffer[];

  savedProjectTemplates: ProjectData[];
  
  // Legacy or Migration Fields (optional)
  pendingInstallments: { filmTitle: string; monthlyAmount: number; remainingMonths: number }[];
  
  // Notification States
  pendingNotifications?: {
    type: 'planningFinished' | 'castingFinished' | 'productionFinished' | 'completed';
    title: string;
    quality?: number; // For 'completed'
    justifications?: any; // For 'castingFinished'
  }[];
  lastNotifiedKinoStartTitle?: string;
  lastNotifiedPayTvAvailableTitle?: string; 
  lastNotifiedHomeEntertainmentEndTitle?: string;
  lastNotifiedFreeTvAvailableTitle?: string; 
  lastCampaignYear?: number;
  
  // Trends
  genreTrends: GenreTrendData;
  marketTrend?: { type: 'bull' | 'bear'; duration: number; minFactor: number; maxFactor: number } | null;
  interestRateModifier?: number;

  weeklyPosters?: Record<Genre, number[]>;
  lastWeeklyCostDate?: Date;
  lastNewspaperDate?: Date;
    lastKinoChartsUpdateWeekKey?: string;
  
  learnedGenreFocus?: Record<string, number>;
  lastSatisfactionCheckDate?: Date | null;
  
  // Movie Award History
  movieAwardHistory: MovieAwardYear[];

  // Custom Events from Editor
  customEvents?: RandomEvent[];

  // Tutorial
  tutorialStep?: number;
  tutorialActive?: boolean;
  
  // NEW: Active Seminar for non-blocking time
  activeSeminar: ActiveSeminar | null;

  // NEW: Scratchpad Feature
  scratchpadContent?: string;
  isScratchpadOpen?: boolean;
  scratchpadPosition?: { x: number; y: number; };
}
