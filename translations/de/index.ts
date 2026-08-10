
import { TranslationType } from '../types';
import { general } from './general';
import { mainScreen } from './mainScreen';
import { projects } from './projects';
import { generators } from './generators';
import { studioEvents } from './studioEvents';
import { industryEvents } from './industryEvents';
import { worldEvents } from './worldEvents';
import { familyEvents } from './familyEvents';
import { marketing } from './marketing';
import { office } from './office';
import { agencies } from './agencies';
import { writingEvents } from './writingEvents';
import { productionEvents } from './productionEvents';
import { studiogelaende } from './studiogelaende';
import { research } from './research';
import { finanzen } from './finanzen';
import { monthlyReport } from './monthlyReport';
import { privatelife } from './privatelife';
import { historyEvents } from './history';
import { tutorial } from './tutorial';

const employeeDossier = {
    interactions: 'Interaktionen',
    status: 'Status',
    busy: 'Beschäftigt',
    available: 'Verfügbar',
    actions: 'Aktionen',
    praise: 'Loben',
    praiseDesc: 'Erhöht die Zufriedenheit. Alle 6 Monate.',
    praiseAvailable: 'Verfügbar: {date}',
    increaseSalary: 'Gehalt erhöhen',
    increaseSalaryDesc: 'Erhöhen Sie das Monatsgehalt um 10%.',
    train: 'Weiterbilden',
    trainDesc: 'Verbessern Sie das Talent. Kosten: {cost}',
    trainingCost: 'Trainingskosten',
    fire: 'Entlassen',
    fireDesc: 'Beenden Sie den Arbeitsvertrag mit diesem Mitarbeiter.',
    hire: 'Einstellen',
    hireDesc: 'Stellen Sie diesen Mitarbeiter für Ihr Studio ein.',
    notEnoughCapital: 'Nicht genügend Kapital.',
    employeeBusy: 'Mitarbeiter ist beschäftigt.',
    alreadyTrained: 'Nächste Weiterbildung ab: {date}',
    hireRequirement: 'Bürogebäude ausbauen für mehr Mitarbeiter.',
    positionFilled: 'Diese Position ist bereits besetzt.',
    confirmHireTitle: 'Mitarbeiter einstellen',
    confirmHireText: 'Möchten Sie {name} wirklich für ein Monatsgehalt von {salary} einstellen?',
    confirmFireTitle: 'Mitarbeiter entlassen',
    confirmFireText: 'Möchten Sie {name} wirklich entlassen? {busyText}',
    confirmTrainTitle: 'Weiterbildung',
    confirmTrainText: 'Möchten Sie {name} wirklich für {duration} Tage auf einen Weiterbildungslehrgang schicken? Kosten: {cost}. Der Mitarbeiter ist während dieser Zeit nicht verfügbar.',
    confirmIncreaseSalaryTitle: 'Gehalt erhöhen',
    confirmIncreaseSalaryText: 'Möchten Sie das Gehalt von {name} wirklich um {amount} erhöhen?',
    satisfaction: 'Zufriedenheit',
    salary: 'Gehalt (Monat):',
    talent: 'Talent',
    busyText: 'Die aktuelle Aufgabe des Mitarbeiters wird dadurch abgebrochen.',
    buildingWarning: 'Ich schätze die Gelegenheit, hier zu arbeiten, aber ohne ein richtiges {building} kann ich meine Aufgaben auf Dauer nicht effizient und zu Ihrer Zufriedenheit erfüllen. Ich bitte Sie, den Bau in Erwägung zu ziehen.'
};

const editor = {
    title: "Datenbank Editor",
    tabs: { talents: "Talente", competitors: "Studios", history: "Historie", events: "Events" },
    package: {
        load: "Laden",
        manage: "Verwalten",
        save: "Speichern",
        update: "Aktualisieren",
        namePlaceholder: "Paketname",
        original: "Originaldaten (Basis)",
        manageTitle: "Gespeicherte Pakete verwalten",
        noPackages: "Keine eigenen Pakete gespeichert.",
        confirmDelete: "Wirklich löschen?",
        savedAlert: "Paket gespeichert!",
        nameAlert: "Bitte Paketnamen eingeben.",
        deleteYes: "JA",
        deleteNo: "NEIN"
    },
    talents: {
        actors: "Schauspieler",
        directors: "Regisseure",
        addNew: "+ Neu",
        edit: "Talent bearbeiten",
        name: "Name",
        gender: "Geschlecht",
        male: "Männlich",
        female: "Weiblich",
        birthDate: "Geburtsdatum",
        skill: "Fähigkeit (0-100)",
        potential: "Potenzial (0-100)",
        genres: "Genres",
        favGenre1: "Lieblingsgenre 1",
        favGenre2: "Lieblingsgenre 2",
        hatedGenre: "Hass-Genre",
        traits: "Eigenschaften (Traits)",
        addTrait: "+ Eigenschaft hinzufügen",
        noTraits: "Keine Eigenschaften",
        fame: "Bekanntheit (0-5 Sterne)",
        discovered: "Bereits entdeckt",
        undiscovered: "Unentdeckt",
        portrait: "Portrait",
        choose: "Wählen",
        uploadTitle: "Eigenes Bild hochladen",
        uploadHint: "Das Bild wird direkt in den Speicherstand eingebettet. Verwende kleine Dateien, um Performance-Probleme zu vermeiden.",
        standardTitle: "Oder Standard-Portrait wählen",
        apply: "Übernehmen",
        selectPrompt: "Wähle oder erstelle ein Talent.",
        sortById: "Nach ID sortieren",
        sortByName: "Nach Namen sortieren"
    },
    events: {
        addNew: "+ Neu",
        edit: "Ereignis bearbeiten",
        titleLabel: "Titel",
        category: "Kategorie",
        frequency: "Häufigkeit",
        textLabel: "Text (Nachricht / Zeitung)",
        effects: "Auswirkungen",
        capital: "Kapital",
        reputation: "Ruf",
        research: "Forschung",
        catWorld: "Weltgeschehen",
        catIndustry: "Filmindustrie",
        catStudio: "Studio (Intern)",
        catPersonal: "Persönlich",
        freqCommon: "Häufig",
        freqMedium: "Mittel",
        freqRare: "Selten",
        selectPrompt: "Wähle oder erstelle ein Ereignis."
    },
    history: {
        year: "Jahr",
        bestFilm: "Bester Film",
        bestDirector: "Bester Regisseur",
        bestActor: "Bester Schauspieler"
    },
    exit: "Beenden",
    close: "Schließen",
    cancel: "Abbrechen"
};

const settingsPatch = {
    ...general.settings,
    dataSource: "Datensatz / Data Source",
    dataSourceDesc: "Für neue Spiele"
};

export const de: TranslationType & { historyEvents: any } = {
    ...general,
    settings: settingsPatch,
    ...mainScreen,
    ...projects,
    ...generators,
    studioEvents,
    industryEvents,
    worldEvents,
    familyEvents,
    ...marketing,
    ...office,
    agencies,
    writingEvents,
    productionEvents,
    employeeDossier: employeeDossier,
    talentDossier: {
        ...general.talentDossier,
        fame: 'Bekanntheit',
        perMonth: '/ Monat',
        contract: {
            ...general.talentDossier.contract,
            durationLabel: 'Vertragslaufzeit',
            negotiateTitle: 'Exklusivvertrag verhandeln'
        }
    },
    studiogelaende,
    research,
    finanzen,
    monthlyReport,
    privatelife,
    editor,
    historyEvents,
    tutorial
};