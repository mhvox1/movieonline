
import React, { useState, useEffect } from 'react';
import { PlayerData, Child } from '../types';
import { SCHOOL_TYPES, SECONDARY_SCHOOL_TYPES, UNIVERSITY_TYPES, UNIVERSITY_MAJORS } from './privateLifeData';
import { useGame } from '../contexts/GameContext';
import { useTranslation } from '../hooks/useTranslation';
import EducationIcon from './icons/EducationIcon';
import StarIcon from './icons/StarIcon';

const EN_SCHOOL_TEXTS: Record<string, { name: string; description: string }> = {
    school_public: {
        name: 'Municipal Primary School',
        description: 'A solid public school. Free, but with large classes.'
    },
    school_comprehensive: {
        name: 'Comprehensive School "Future"',
        description: 'Modern equipment and dedicated teachers. Better support than standard schools.'
    },
    school_private: {
        name: 'Private School "Athena"',
        description: 'Small classes and individual support. Performance is expected here.'
    },
    school_international: {
        name: 'International School',
        description: 'Multilingual education and a global network. Excellent education.'
    },
    school_elite: {
        name: 'Elite Boarding School "Rosenberg"',
        description: 'The forge of future world leaders. Maximum support, astronomical costs.'
    },
    sec_school_public: {
        name: 'Municipal Secondary School',
        description: 'Solid education without frills. Focus on practical skills.'
    },
    sec_school_gymnasium: {
        name: 'Municipal Grammar School',
        description: 'The classic route to university entrance qualification. Good education, but less individual support.'
    },
    sec_school_private_gym: {
        name: 'Private Grammar School "Humboldt"',
        description: 'Small classes, laptops, and language trips. Premium standard.'
    },
    sec_school_art: {
        name: 'Arts & Media College',
        description: 'Specialized in creative talents. Perfect for aspiring filmmakers.'
    },
    sec_school_elite: {
        name: 'Elite Institute "Schloss Salem"',
        description: 'The country\'s most prestigious boarding school. Tomorrow\'s CEOs are shaped here.'
    },
    uni_state: {
        name: 'State University',
        description: 'Solid academic education. Standard.'
    },
    uni_film: {
        name: 'Film University "Lumière"',
        description: 'Specialized in media careers. Strong industry connections.'
    },
    uni_business: {
        name: 'Business School',
        description: 'Focus on management and marketing. Practice-oriented education.'
    },
    uni_arts: {
        name: 'Academy of Arts',
        description: 'For creative minds. Strong focus on acting and directing.'
    },
    uni_ivy: {
        name: 'Elite University "Harvard"',
        description: 'The best of the best. Opens all doors and offers maximum support.'
    }
};

const EN_UNIVERSITY_MAJORS: Record<string, string> = {
    Actor: 'Performing Arts',
    Director: 'Film Directing & Visual Language',
    Autor: 'Creative Writing & Dramaturgy',
    CastingMitarbeiter: 'Talent Management & HR',
    Forscher: 'Media Studies & Technology',
    Marketingmanager: 'Marketing & Communication',
    ProjektPlaner: 'Project Management & Logistics'
};

// Helper to calculate portrait URL based on age
const getChildPortraitUrl = (portraitId: string | undefined, age: number): string | null => {
    if (!portraitId) return null;
    
    // Baby Stage (ID starts with 'b')
    if (portraitId.startsWith('b') && !portraitId.startsWith('baby_')) { 
        return `https://www.schnoxcore.com/media/kinder/babys/${portraitId}.png`;
    }
    // Toddler Stage (ID starts with '1j')
    if (portraitId.startsWith('1j')) {
        return `https://www.schnoxcore.com/media/kinder/1jahr/${portraitId}.png`;
    }
    
    let suffix = 'k';
    if (age >= 16 && age <= 34) suffix = 'j';
    else if (age >= 35 && age <= 59) suffix = 'm';
    else if (age >= 60) suffix = 'a';

    return `https://www.schnoxcore.com/media/portraits/${portraitId}${suffix}.png`;
};

// Custom Star Rating for Schools (supports halves)
const SchoolStarRating: React.FC<{ stars: number }> = ({ stars }) => {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3].map((index) => {
                let fill = 'text-gray-600'; // Empty
                if (stars >= index) {
                    fill = 'text-yellow-400'; // Full
                } else if (stars >= index - 0.5) {
                    // Half Star logic with SVG
                     return (
                        <div key={index} className="relative w-4 h-4">
                             <StarIcon className="w-4 h-4 text-gray-600 absolute top-0 left-0" />
                             <div className="w-2 h-4 overflow-hidden absolute top-0 left-0">
                                <StarIcon className="w-4 h-4 text-yellow-400" />
                             </div>
                        </div>
                     );
                }
                return <StarIcon key={index} className={`w-4 h-4 ${fill}`} />;
            })}
        </div>
    );
};

const SchoolEnrollmentModal: React.FC = () => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    
    // Default to public school (primary or secondary)
    const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');

    // Fix for conditional hook usage
    useEffect(() => {
        if (playerData && playerData.schoolEnrollmentRequest) {
            const childId = playerData.schoolEnrollmentRequest.childId;
            const type = playerData.schoolEnrollmentRequest.type;
            const child = playerData.children.find(c => c.id === childId);
            if (!child) {
                 setPlayerData(prev => prev ? { ...prev, schoolEnrollmentRequest: undefined } : null);
            } else {
                // Set default based on type
                if (type === 'secondary') {
                    setSelectedSchoolId('sec_school_public');
                } else if (type === 'university') {
                    setSelectedSchoolId('uni_state');
                } else {
                    setSelectedSchoolId('school_public');
                }
            }
        }
    }, [playerData]);

    if (!playerData || !playerData.schoolEnrollmentRequest) return null;

    const { childId, type, major } = playerData.schoolEnrollmentRequest;
    const child = playerData.children.find(c => c.id === childId);
    
    // Determine which list to show
    let schoolList = SCHOOL_TYPES;
    let title = t.privatelife.education.enrollmentTitle;
    let textTemplate = t.privatelife.education.enrollmentText;

    if (type === 'secondary') {
        schoolList = SECONDARY_SCHOOL_TYPES;
        title = t.privatelife.education.secondaryEnrollmentTitle;
        textTemplate = t.privatelife.education.secondaryEnrollmentText;
    } else if (type === 'university') {
        schoolList = UNIVERSITY_TYPES;
        title = t.privatelife.education.universityEnrollmentTitle;
        textTemplate = t.privatelife.education.universityEnrollmentText;
    }

    if (!child) {
        return null;
    }

    const age = Math.floor((new Date(playerData.gameDate).getTime() - new Date(child.birthDate).getTime()) / (1000 * 3600 * 24 * 365.25));
    const portraitSrc = getChildPortraitUrl(child.portraitId, age);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

    const handleConfirm = () => {
        setPlayerData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                schoolEnrollmentRequest: undefined,
                children: prev.children.map(c => c.id === child.id ? { 
                    ...c, 
                    schoolId: selectedSchoolId, // Updates current school ID
                    // Store previous schools in history fields
                    primarySchoolId: type === 'primary' ? selectedSchoolId : c.primarySchoolId,
                    secondarySchoolId: type === 'secondary' ? selectedSchoolId : c.secondarySchoolId,
                    
                    enrollmentHandled: type === 'primary' ? true : c.enrollmentHandled,
                    secondaryEnrollmentHandled: type === 'secondary' ? true : c.secondaryEnrollmentHandled,
                    universityEnrollmentHandled: type === 'university' ? true : c.universityEnrollmentHandled,
                    universityMajor: type === 'university' ? major : undefined,
                    universityEnrollmentDate: type === 'university' ? new Date(prev.gameDate) : undefined,
                    schoolEnrollmentDate: new Date(prev.gameDate)
                } : c)
            };
        });
    };
    
    const majorName = major
        ? (language === 'de'
            ? (UNIVERSITY_MAJORS[major as string] || major)
            : (EN_UNIVERSITY_MAJORS[major as string] || major))
        : (language === 'de' ? 'Unbekannt' : 'Unknown');

    return (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-blue-500 rounded-lg shadow-2xl w-full max-w-3xl p-8 flex flex-col max-h-[90vh]">
                <div className="flex items-center gap-6 mb-6">
                    <div className="w-32 h-32 bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center border-4 border-blue-500 overflow-hidden shadow-lg">
                         {portraitSrc ? (
                            <img src={portraitSrc} alt={child.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl">🎓</span>
                        )}
                    </div>
                    <div>
                         <h2 className="text-3xl font-bold font-cinzel text-blue-400 mb-1">{title}</h2>
                         <p className="text-gray-300 text-lg">{textTemplate.replace('{name}', child.name)}</p>
                         {type === 'university' && (
                             <p className="text-amber-400 mt-2 font-bold">{language === 'de' ? 'Gewählter Studiengang' : 'Selected Major'}: {majorName}</p>
                         )}
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 space-y-3 mb-6 custom-scrollbar">
                    {schoolList.map(school => (
                        (() => {
                            const translatedSchool = language === 'de' ? null : EN_SCHOOL_TEXTS[school.id];
                            const schoolName = translatedSchool?.name || school.name;
                            const schoolDescription = translatedSchool?.description || school.description;
                            return (
                        <button 
                            key={school.id}
                            onClick={() => setSelectedSchoolId(school.id)}
                            className={`w-full p-4 rounded-lg border text-left transition-all hover:bg-gray-700/50 flex justify-between items-center group ${selectedSchoolId === school.id ? 'bg-blue-900/40 border-blue-500 ring-1 ring-blue-500' : 'bg-gray-900/50 border-gray-600'}`}
                        >
                            <div>
                                <h4 className="font-bold text-white text-lg group-hover:text-blue-300">{schoolName}</h4>
                                <p className="text-xs text-gray-400 mt-1">{schoolDescription}</p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4 flex flex-col items-end">
                                <p className={`font-mono font-bold ${school.monthlyCost === 0 ? 'text-green-400' : 'text-amber-400'}`}>
                                    {school.monthlyCost === 0
                                        ? (language === 'de' ? 'Gratis' : 'Free')
                                        : `${formatCurrency(school.monthlyCost)}${language === 'de' ? '/Monat' : '/Month'}`}
                                </p>
                                <div className="mt-1 flex items-center gap-2" title={`${language === 'de' ? 'Talent-Bonus' : 'Talent Bonus'}: x${school.skillGrowthModifier}`}>
                                    <span className="text-xs text-blue-300 font-bold">{language === 'de' ? 'Qualität' : 'Quality'}:</span>
                                    <SchoolStarRating stars={school.stars} />
                                </div>
                            </div>
                        </button>
                            );
                        })()
                    ))}
                </div>
                
                <button 
                    onClick={handleConfirm} 
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded uppercase text-lg shadow-lg"
                >
                    {t.common.confirm}
                </button>
            </div>
        </div>
    );
};

export default SchoolEnrollmentModal;
