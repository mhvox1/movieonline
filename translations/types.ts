
import { Genre } from '../types';

export interface MessageTemplate {
  key: string;
  variables: Record<string, string | number | boolean>;
}

export interface TranslationType {
  common: {
    back: string;
    cancel: string;
    confirm: string;
    close: string;
    yes: string;
    no: string;
    ok: string;
    save: string;
    delete: string;
    new: string;
    locale: string;
  };
  genres: Record<string, string>;
  actorAge: {
    child: string;
    young: string;
    middleAged: string;
    old: string;
  };
  mainMenu: any;
  settings: {
      title: string;
      // ... existing settings keys ...
      dataSource: string;
      dataSourceDesc: string;
      manual: {
          tabs: {
              production: string;
              studio: string;
              finance: string;
              privatelife: string;
          };
          production: {
              title: string;
              intro: string;
              script: string;
              casting: string;
              filming: string;
              post: string;
              release: string;
          };
          studio: {
              title: string;
              intro: string;
              buildings: string;
              employees: string;
              research: string;
          };
          finance: {
              title: string;
              intro: string;
              banking: string;
              stock: string;
              marketing: string;
          };
          privatelife: {
              title: string;
              intro: string;
              energy: string;
              relationships: string;
              assets: string;
          };
      };
      [key: string]: any;
  };
  newGame: any;
  header: any;
  mainScreen: any;
  widgets: any;
  project: any;
  scriptGen: {
      adjectives: string[];
      nouns: string[];
      concepts: string[];
      templates: string[];
      plots: Record<string, { text: string; mainRole?: any; supportingRole?: any }[]>;
  };
  studioEvents: any;
  industryEvents: any;
  worldEvents: any;
  familyEvents: any;
  marketing: {
      screen: any;
      myFilms: any;
      festivals: any;
      festivalData: any;
      awardCategories: any;
      campaigns: any;
      campaignData: any;
      trends: any;
      offerMessage: any;
      negotiation: {
          title: string;
          willingness: string;
          lastOffer: string;
          yourCounter: string;
          lumpSum: string;
          revenueShare: string;
          releaseDate: string;
          monthlyInstallment: string;
          feedbackDefault: string;
          feedbackBroke: string;
          feedbackAccepted: string;
          feedbackCounter: string;
          feedbackRejected: string;
          feedbacks: string[];
          feedbackWarning: string;
          close: string;
          cancel: string;
          accept: string;
          submit: string;
          confirmAcceptTitle: string;
          confirmAcceptTextKino: string;
          confirmAcceptText: string;
          confirmCancelTitle: string;
          confirmCancelTextKino: string;
          confirmCancelText: string;
          contractSubject: string;
          contractBody: string;
          phases: {
              cinema: string;
              home: string;
              pay: string;
              free: string;
          };
          conditions: string;
          statusReport: string;
          originalOffer: string;
          guaranteed: string;
          currentValue: string;
          abortNegotiation: string;
          signContract: string;
          sealDeal: string;
          totalValueLabel: string;
          bonusGain: string;
          start: string;
          binding: string;
          abortTitle: string;
          abortText: string;
          back: string;
          sign: string;
          end: string;
          demandMore: string;
          lifecyclePhase: string;
          distributionPhase: string;
          startLabels: {
              default: string;
              cinema: string;
              home: string;
              pay: string;
              free: string;
          };
      };
      offerGenerator: any;
  };
  office: {
      screen: any;
      contacts: any;
      employees: any;
      casting: any;
      news: any;
      calendar: any;
      messages: {
          cinemaReleaseBody: string[];
          homeReleaseBody: string[];
          payTvReleaseBody: string[];
          freeTvReleaseBody: string[];
          [key: string]: any; 
      };
      birthdaySubject?: string;
      birthdayMessages?: string[];
  };
  agencies: any;
  writingEvents: any;
  productionEvents: any;
  employeeDossier: any;
  talentDossier: any;
  productionOptions: any;
  creativeFocus: any;
  completedProject: any;
  scriptDossier: any;
  studiogelaende: any;
  research: any;
  finanzen: any;
  privatelife: {
      screen: any;
      overview: any;
      status: any; 
      assets: {
          tabs: {
              properties: string;
              luxury: string;
          };
          status: {
              currentResidence: string;
              owned: string;
              rented: string;
              forSale: string;
              standard: string;
              bought: string;
          };
          action: {
              buy: string;
              buyFor: string;
              sell: string;
              moveIn: string;
              rentOut: string;
              stopRent: string;
          };
      };
      properties: Record<string, { name: string; description: string }>;
      luxury: Record<string, { name: string; description: string }>;
      education: {
          tabs: any;
          attributesTitle: string;
          currentStudy: string;
          finishedAt: string;
          seminarsTitle: string;
          leisureTitle: string;
          studiesTitle: string;
          energy: string;
          skill: string;
          days: string;
          alreadyFinished: string;
          luxuryVacation: string;
          luxuryVacationDesc: string;
          enrollmentTitle: string;
          enrollmentText: string;
          secondaryEnrollmentTitle: string;
          secondaryEnrollmentText: string;
          universityEnrollmentTitle: string;
          universityEnrollmentText: string;
          activities?: Record<string, { name: string; description: string }>;
          courses?: Record<string, { name: string; description: string }>;
          seminars?: Record<string, { name: string; description: string }>;
      };
      family: {
        tabs: {
            interaction: string;
            career: string;
            profile: string;
            talents: string;
            development: string;
        };
        labels: {
            relationshipValue: string;
            anniversary: string;
            togetherSince: string;
            date: string;
            job: string;
            age: string;
            born: string;
            dynasty: string;
            progress: string;
            reaction: string;
            roleInStudio: string;
            roleChoose: string;
        };
        actions: {
            endRelationship: string;
            propose: string;
            planWedding: string;
            desireChild: string;
            adopt: string;
            breakContact: string;
            makeOfficial: string;
            hire: string;
            changeRole: string;
            noJob: string;
            employedAs: string;
            worksAs: string;
            positionLocked: string;
            securityQuestion: string;
            reallyFire: string;
            reallyHire: string;
            childStarCareer: string;
            listAsChildStar: string;
        };
        dating: {
            searchTitle: string;
            searchDesc: string;
            encounterTitle: string;
            notInterested: string;
            meet: string;
            acquaintance: string;
            relationshipOfficial: string;
        };
        lifeStages: {
            toddler: string;
            pupil: string;
            student: string;
            graduate: string;
            child: string;
        };
        son: string;
        daughter: string;
        partner: string; 
        childrenTitle: string;
        noChildren: string;
        expecting: string; 
        adoptionPending: string; 
        status: Record<string, string>; 
        jobs: Record<string, string>; 
        breakupConfirmTitle: string;
        breakupConfirmText: string;
        divorceConfirmTitle: string;
        divorceConfirmText: string;
        divorceNoPrenupWarning: string;
        divorceCost: string;
        confirmBreakup: string;
        confirmDivorce: string;
        proposalAcceptedMale: string;
        proposalAcceptedFemale: string;
        proposalRejected: string;
        proposalAcceptedText: string;
        proposalRejectedText: string;
        weddingPlanned: string;
        weddingPlannedText: string;
      };
      birthModal: {
          titleBirth: string;
          titleAdoption: string;
          textBirth: string;
          textAdoption: string;
          boy: string;
          girl: string;
          nameLabel: string;
          placeholder: string;
          welcomeButton: string;
      };
      weddingEvent: {
          title: string;
          text: string;
      };
      interactions?: Record<string, { label: string; description: string }>;
      searchOptions?: Record<string, { name: string; description: string }>;
      wedding?: {
           packages: Record<string, { name: string; description: string }>;
           rings: Record<string, { name: string }>;
      };
  };
  traits: any;
  newspaper: any;
  transactionCategories: any;
  transactionDescriptions: any;
  beta: any;
  gameOver?: {
    title: string;
    text: string;
    button: string;
  };
  editor: {
    title: string;
    tabs: { talents: string, competitors: string, history: string, events: string };
    package: {
        load: string;
        manage: string;
        save: string;
        update: string;
        namePlaceholder: string;
        original: string;
        manageTitle: string;
        noPackages: string;
        confirmDelete: string;
        savedAlert: string;
        nameAlert: string;
        deleteYes: string;
        deleteNo: string;
    };
    talents: {
        actors: string;
        directors: string;
        addNew: string;
        edit: string;
        name: string;
        gender: string;
        male: string;
        female: string;
        birthDate: string;
        skill: string;
        potential: string;
        genres: string;
        favGenre1: string;
        favGenre2: string;
        hatedGenre: string;
        traits: string;
        addTrait: string;
        noTraits: string;
        fame: string;
        discovered: string;
        undiscovered: string;
        portrait: string;
        choose: string;
        uploadTitle: string;
        uploadHint: string;
        standardTitle: string;
        apply: string;
        selectPrompt: string;
        sortById: string;
        sortByName: string;
    };
    events: {
        addNew: string;
        edit: string;
        titleLabel: string;
        category: string;
        frequency: string;
        textLabel: string;
        effects: string;
        capital: string;
        reputation: string;
        research: string;
        catWorld: string;
        catIndustry: string;
        catStudio: string;
        catPersonal: string;
        freqCommon: string;
        freqMedium: string;
        freqRare: string;
        selectPrompt: string;
    };
    history: {
        year: string;
        bestFilm: string;
        bestDirector: string;
        bestActor: string;
    };
    exit: string;
    close: string;
    cancel: string;
  };
  monthlyReport: {
    title: string;
    months: string[];
    totalIncome: string;
    totalExpenses: string;
    netResult: string;
    income: string;
    expenses: string;
    noEntries: string;
    productionFixedCosts: string;
    productionAdditionalCosts: string;
    otherIncome: string;
    maintenance: string;
    salary: string;
    loanPayment: string;
    installment: string;
    incomeFrom: string;
    personnelCostsTotal: string;
    studioCostsTotal: string;
  };
  tutorial: {
      steps: Record<number, { title: string; content: string }>;
      actions: {
          next: string;
          closeTitle: string;
          confirmClose: string;
          cancelClose: string;
          reallyClose: string;
          start: string;
          step: string;
      };
  };
}