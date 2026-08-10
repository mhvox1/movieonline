import { useEffect } from 'react';
import { MaritalStatus, EmployeeType } from '../types';
import { dateReached } from './helpers';
import { WEDDING_DAY_EVENT, generateForcedBreakupEvent } from '../components/events';
import { SCHOOL_TYPES, UNIVERSITY_TYPES, SECONDARY_SCHOOL_TYPES } from '../components/privateLifeData';
import { useTranslation } from './useTranslation';
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
// Helper to calculate portrait URL based on age (Copied from utils/components to ensure availability in hook)
const getPortraitUrl = (baseId, birthDate, gameDate) => {
    if (!baseId)
        return null;
    // FIX: Support Custom Images (Base64 Data URLs)
    // If it starts with data:, return it directly without appending path or age suffix
    if (baseId.startsWith('data:')) {
        return baseId;
    }
    if (!birthDate)
        return null;
    const birth = new Date(birthDate);
    const today = new Date(gameDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    let ageSuffix;
    if (age <= 15) {
        ageSuffix = 'k';
    }
    else if (age >= 16 && age <= 34) {
        ageSuffix = 'j';
    }
    else if (age >= 35 && age <= 59) {
        ageSuffix = 'm';
    }
    else { // age >= 60
        ageSuffix = 'a';
    }
    return `./portrait/${baseId}${ageSuffix}.png`;
};
export const usePersonalLifeLoop = ({ playerData, setPlayerData, systemPause, setPregnancyNotification, setBirthModalData, setActiveEvent, setGraduationModalData }) => {
    const gameDate = playerData.gameDate;
    const { t } = useTranslation();
    useEffect(() => {
        setPlayerData(currentData => {
            if (!currentData)
                return null;
            const newDate = new Date(currentData.gameDate);
            let dataChanged = false;
            const newState = { ...currentData };
            const isTestMode = newState.playerName === 'Max Mustermann' && newState.studioName === 'Teststudio';
            // --- DAILY CHECKS ---
            // 1. Relationship Decay (Partner)
            if (newState.maritalStatus !== MaritalStatus.Single && newState.relationshipStatus > 0) {
                newState.relationshipStatus = Math.max(0, newState.relationshipStatus - 0.1);
                dataChanged = true;
            }
            // 1b. Relationship Decay (Children)
            newState.children = newState.children.map(child => {
                let updatedChild = { ...child };
                let childChanged = false;
                if ((updatedChild.relationship || 0) > 0) {
                    updatedChild.relationship = Math.max(0, (updatedChild.relationship || 0) - 0.05);
                    childChanged = true;
                }
                if (childChanged)
                    dataChanged = true;
                return updatedChild;
            });
            // 1c. FORCED BREAKUP CHECK (NEW)
            // If relationship drops below 20 while being in a COMMITTED relationship (Dating, Engaged, Married)
            // Acquaintances do NOT break up automatically.
            const isCommittedRelationship = newState.maritalStatus === MaritalStatus.Dating ||
                newState.maritalStatus === MaritalStatus.Engaged ||
                newState.maritalStatus === MaritalStatus.Married;
            if (isCommittedRelationship && newState.relationshipStatus < 20) {
                const partnerName = newState.partnerName || "Partner";
                const partnerPortraitUrl = getPortraitUrl(newState.partnerPortraitId, newState.partnerBirthDate, newDate);
                const partnerNameVariants = new Set([partnerName, `${partnerName} (Partner)`]);
                newState.actors = newState.actors.filter(actor => !(actor.isFamily && (actor.id === 99901 || partnerNameVariants.has(actor.name))));
                newState.directors = newState.directors.filter(director => !(director.isFamily && (director.id === 99901 || partnerNameVariants.has(director.name))));
                newState.employees = newState.employees.filter(employee => !((employee.id === 99901 || (employee.id >= 50000 && employee.id < 70000)) && partnerNameVariants.has(employee.name)));
                // Full Reset of Partner Data
                newState.maritalStatus = MaritalStatus.Single;
                newState.partnerName = null;
                newState.partnerGender = undefined;
                newState.partnerBirthDate = undefined;
                newState.partnerJob = undefined;
                newState.partnerSalary = undefined;
                newState.partnerTraits = undefined;
                newState.relationshipStatus = 0;
                newState.datingProgress = 0;
                newState.relationshipStartDate = null;
                newState.engagementDate = null;
                newState.weddingDetails = null;
                newState.prenupSigned = false;
                newState.partnerPregnancy = null;
                newState.partnerSkills = undefined;
                newState.partnerIsEmployed = undefined;
                newState.partnerEmployedAs = undefined;
                newState.partnerPortraitId = undefined;
                newState.partnerActiveTraining = undefined;
                newState.partnerLastCourseDate = undefined;
                newState.partnerChildrenAgreementCount = 0;
                newState.partnerJobAssignedDate = undefined;
                // Trigger Event
                const breakupEvent = generateForcedBreakupEvent(partnerName, partnerPortraitUrl || '');
                setActiveEvent({
                    event: breakupEvent,
                    deltas: {
                        capitalChange: 0,
                        reputationChange: -2, // Small reputation hit for breakup
                        researchPointsChange: 0,
                    },
                    resultingState: newState,
                });
                systemPause();
                return newState; // Return immediately with new state and active event
            }
            // 2. Conception / Adoption check
            if (newState.pendingConception && dateReached(newDate, newState.pendingConception.conceptionDate)) {
                const isSameSex = newState.gender === newState.partnerGender;
                let success = false;
                if (isSameSex) {
                    success = Math.random() < 0.9;
                }
                else {
                    const baseChance = 0.5;
                    const relationshipModifier = newState.relationshipStatus / 200;
                    const conceptionChance = baseChance + relationshipModifier;
                    success = Math.random() < conceptionChance;
                }
                if (success) {
                    const dueDate = new Date(newDate);
                    const days = isTestMode ? 10 : (isSameSex ? 45 : 270);
                    dueDate.setDate(dueDate.getDate() + days);
                    newState.partnerPregnancy = { dueDate, isAdoption: isSameSex };
                    setPregnancyNotification({ dueDate, isAdoption: isSameSex });
                    newState.partnerChildrenAgreementCount += 1;
                    systemPause();
                }
                newState.pendingConception = null;
                dataChanged = true;
            }
            // 3. Birth / Adoption Arrival check
            if (newState.partnerPregnancy && dateReached(newDate, newState.partnerPregnancy.dueDate)) {
                const gender = Math.random() < 0.5 ? 'Junge' : 'Mädchen';
                setBirthModalData({ gender, isAdoption: newState.partnerPregnancy.isAdoption });
                dataChanged = true;
                systemPause();
            }
            // 4. Wedding check
            if (newState.weddingDetails && dateReached(newDate, newState.weddingDetails.date)) {
                const details = newState.weddingDetails;
                const playerParts = newState.playerName.split(' ');
                const playerFirstName = playerParts.slice(0, -1).join(' ');
                const playerLastName = playerParts[playerParts.length - 1];
                const partnerParts = (newState.partnerName || "").split(' ');
                const partnerFirstName = partnerParts.slice(0, -1).join(' ');
                const partnerLastName = partnerParts[partnerParts.length - 1];
                let newFamilyName = playerLastName;
                if (details.surnameId === 'partner') {
                    newFamilyName = partnerLastName;
                }
                else if (details.surnameId === 'hyphenated-player') {
                    newFamilyName = `${playerLastName}-${partnerLastName}`;
                }
                else if (details.surnameId === 'hyphenated-partner') {
                    newFamilyName = `${partnerLastName}-${playerLastName}`;
                }
                newState.playerName = `${playerFirstName} ${newFamilyName}`;
                newState.partnerName = `${partnerFirstName} ${newFamilyName}`;
                newState.children = newState.children.map(child => {
                    const childFirst = child.name.split(' ').slice(0, -1).join(' ');
                    return { ...child, name: `${childFirst} ${newFamilyName}` };
                });
                // Generate portrait URLs for the event
                // This uses the updated helper which handles Base64 correctly
                const playerUrl = getPortraitUrl(newState.playerPortraitId, newState.playerBirthDate, newDate) || undefined;
                const partnerUrl = getPortraitUrl(newState.partnerPortraitId, newState.partnerBirthDate, newDate) || undefined;
                // TRANSLATION LOGIC
                const eventTitle = t.privatelife.weddingEvent.title;
                const eventText = t.privatelife.weddingEvent.text.replace('{name}', partnerFirstName);
                const weddingEvent = WEDDING_DAY_EVENT(eventTitle, eventText, playerUrl, partnerUrl);
                const reputationBonus = newState.weddingDetails.reputationBonus;
                newState.maritalStatus = MaritalStatus.Married;
                newState.personalReputation = Math.min(100, newState.personalReputation + reputationBonus);
                newState.reputation += Math.floor(reputationBonus / 10);
                // Store Wedding Date permanently
                newState.weddingDate = new Date(newState.weddingDetails.date);
                newState.weddingDetails = null;
                newState.engagementDate = null;
                setActiveEvent({
                    event: weddingEvent,
                    deltas: {
                        capitalChange: 0,
                        reputationChange: Math.floor(reputationBonus / 10),
                        researchPointsChange: 0,
                    },
                    resultingState: newState,
                });
                dataChanged = true;
                systemPause();
            }
            // --- Wedding Anniversary Check ---
            if (newState.weddingDate && newState.maritalStatus === MaritalStatus.Married) {
                const weddingDate = new Date(newState.weddingDate);
                const currentYear = newDate.getFullYear();
                // Check if today is the day (ignoring year)
                if (newDate.getDate() === weddingDate.getDate() &&
                    newDate.getMonth() === weddingDate.getMonth() &&
                    newDate.getFullYear() > weddingDate.getFullYear()) {
                    // Check if event already triggered this year (to prevent loops if multiple renders happen same day)
                    const eventTitle = "Hochzeitstag";
                    const alreadyCelebrated = newState.eventLog.some(e => (e.title === eventTitle || e.title === "Wedding Anniversary") &&
                        new Date(e.date).getFullYear() === currentYear);
                    if (!alreadyCelebrated) {
                        // 1. Loggen
                        newState.eventLog.push({
                            date: new Date(newDate),
                            title: eventTitle,
                            text: "Heute ist Ihr Hochzeitstag.",
                            category: 'Family'
                        });
                        // 2. Select one of 5 message variants (20% chance for each)
                        const variantIndex = Math.floor(Math.random() * 5) + 1; // 1 to 5
                        const isForgotten = variantIndex === 5; // Variant 5 is the negative "Forgotten" one
                        const relationshipEffect = isForgotten ? -15 : 10;
                        const messageBodyKey = `office.messages.anniversaryBody${variantIndex}`;
                        // 3. E-Mail generieren
                        const partnerUrl = getPortraitUrl(newState.partnerPortraitId, newState.partnerBirthDate, newDate) || undefined;
                        const anniversaryMessage = {
                            id: `msg_anniversary_${currentYear}`,
                            date: new Date(newDate),
                            sender: "Privat",
                            subjectTemplate: {
                                key: 'office.messages.anniversarySubject',
                                variables: {}
                            },
                            bodyTemplate: {
                                key: 'studioEvent', // Triggers variable replacement logic in messages
                                variables: {
                                    textKey: messageBodyKey,
                                    relationshipChange: relationshipEffect
                                }
                            },
                            imageUrl: partnerUrl, // Display Partner Portrait
                            read: false
                        };
                        newState.messages.push(anniversaryMessage);
                        // 4. Update Relationship Status
                        // Clamp between 0 and 100
                        newState.relationshipStatus = Math.max(0, Math.min(100, newState.relationshipStatus + relationshipEffect));
                        dataChanged = true;
                        systemPause();
                    }
                }
            }
            // 5. Training Checks (Partner)
            if (newState.partnerActiveTraining && dateReached(newDate, newState.partnerActiveTraining.endDate)) {
                const { skill } = newState.partnerActiveTraining;
                if (newState.partnerSkills) {
                    const gain = 5 + Math.floor(Math.random() * 6);
                    newState.partnerSkills = {
                        ...newState.partnerSkills,
                        [skill]: Math.min(100, newState.partnerSkills[skill] + gain)
                    };
                    newState.eventLog.push({
                        date: new Date(newDate),
                        title: "Lehrgang beendet",
                        text: `Ihr Partner hat den Lehrgang erfolgreich abgeschlossen. +${gain} ${skill}`,
                        category: 'Personal'
                    });
                    newState.partnerActiveTraining = undefined;
                    newState.partnerLastCourseDate = new Date(newDate);
                    dataChanged = true;
                }
            }
            // 6. Training Checks (Children)
            let childrenUpdated = false;
            newState.children = newState.children.map(child => {
                if (child.activeTraining && dateReached(newDate, child.activeTraining.endDate)) {
                    const { skill } = child.activeTraining;
                    let baseGain = 5 + Math.floor(Math.random() * 6);
                    let modifier = 1.0;
                    if (child.schoolId) {
                        const school = SCHOOL_TYPES.find(s => s.id === child.schoolId) ||
                            SECONDARY_SCHOOL_TYPES.find(s => s.id === child.schoolId) ||
                            UNIVERSITY_TYPES.find(s => s.id === child.schoolId);
                        if (school)
                            modifier = school.skillGrowthModifier;
                    }
                    const finalGain = Math.round(baseGain * modifier);
                    const newSkills = child.skills ? { ...child.skills, [skill]: Math.min(100, child.skills[skill] + finalGain) } : child.skills;
                    newState.eventLog.push({
                        date: new Date(newDate),
                        title: "Lehrgang beendet",
                        text: `${child.name} hat den Lehrgang erfolgreich abgeschlossen.`,
                        category: 'Personal'
                    });
                    childrenUpdated = true;
                    return {
                        ...child,
                        skills: newSkills,
                        activeTraining: undefined,
                        lastCourseDate: new Date(newDate)
                    };
                }
                return child;
            });
            if (childrenUpdated)
                dataChanged = true;
            // 7. School Enrollment Check & Graduation
            newState.children.forEach(child => {
                const birthYear = new Date(child.birthDate).getFullYear();
                const currentYear = newDate.getFullYear();
                const age = currentYear - birthYear;
                // Calculate notification date (Mitte August -> 3. Dienstag)
                const augustFirst = new Date(currentYear, 7, 1);
                const dayOfWeek = augustFirst.getDay();
                let daysUntilFirstTuesday = (2 - dayOfWeek + 7) % 7;
                const schoolStartDate = new Date(currentYear, 7, 1 + daysUntilFirstTuesday + 14);
                const notificationDate = new Date(schoolStartDate);
                notificationDate.setDate(notificationDate.getDate() - 28); // 4 weeks before
                const isNotificationDay = isTestMode ? true : newDate >= notificationDate;
                // A) Primary School (6 Years)
                if (age === 6) {
                    if (isNotificationDay && !child.schoolId && !child.enrollmentHandled && !newState.schoolEnrollmentRequest) {
                        newState.schoolEnrollmentRequest = { childId: child.id, type: 'primary' };
                        systemPause();
                        dataChanged = true;
                        return;
                    }
                }
                // B) Secondary School (10 Years)
                if (age === 10) {
                    if (isNotificationDay && !child.secondaryEnrollmentHandled && !newState.schoolEnrollmentRequest) {
                        newState.schoolEnrollmentRequest = { childId: child.id, type: 'secondary' };
                        systemPause();
                        dataChanged = true;
                        return;
                    }
                }
                // C) University Enrollment (18 Years)
                if (age === 18) {
                    if (isNotificationDay && !child.universityEnrollmentHandled && !newState.schoolEnrollmentRequest) {
                        const possibleMajors = [
                            EmployeeType.Autor,
                            EmployeeType.CastingMitarbeiter,
                            EmployeeType.Forscher,
                            EmployeeType.Marketingmanager,
                            EmployeeType.ProjektPlaner,
                            'Actor',
                            'Director'
                        ];
                        const randomMajor = possibleMajors[Math.floor(Math.random() * possibleMajors.length)];
                        newState.schoolEnrollmentRequest = {
                            childId: child.id,
                            type: 'university',
                            major: randomMajor
                        };
                        systemPause();
                        dataChanged = true;
                        return;
                    }
                }
                // D) Graduation (4 Years after Uni start OR Age 22 in Test Mode)
                if (child.universityEnrollmentDate && !child.isGraduated) {
                    const uniStart = new Date(child.universityEnrollmentDate);
                    const graduationDate = new Date(uniStart);
                    graduationDate.setFullYear(graduationDate.getFullYear() + 4);
                    const targetGraduationDate = isTestMode && age >= 22 ? new Date(newDate) : graduationDate;
                    if (newDate >= targetGraduationDate) {
                        // Calculate Final Skill using History
                        let university = UNIVERSITY_TYPES.find(u => u.id === child.schoolId);
                        // --- 2 YEAR CHECK ---
                        // If child has been at current school (uni) for less than 2 years, apply fallback quality
                        if (child.schoolEnrollmentDate) {
                            const timeAtSchool = newDate.getTime() - new Date(child.schoolEnrollmentDate).getTime();
                            const yearsAtSchool = timeAtSchool / (1000 * 3600 * 24 * 365.25);
                            if (yearsAtSchool < 2) {
                                // Downgrade to lowest tier university as penalty/fallback
                                university = UNIVERSITY_TYPES[0];
                            }
                        }
                        const primarySchool = SCHOOL_TYPES.find(s => s.id === child.primarySchoolId);
                        const secondarySchool = SECONDARY_SCHOOL_TYPES.find(s => s.id === child.secondarySchoolId);
                        // Base from Uni
                        let uniBase = 20;
                        if (university && university.baseSkillRange) {
                            uniBase = randomBetween(university.baseSkillRange.min, university.baseSkillRange.max);
                        }
                        // Bonus from Primary
                        let primaryBonus = 0;
                        if (primarySchool && primarySchool.bonusSkillRange) {
                            primaryBonus = randomBetween(primarySchool.bonusSkillRange.min, primarySchool.bonusSkillRange.max);
                        }
                        // Bonus from Secondary
                        let secondaryBonus = 0;
                        if (secondarySchool && secondarySchool.bonusSkillRange) {
                            secondaryBonus = randomBetween(secondarySchool.bonusSkillRange.min, secondarySchool.bonusSkillRange.max);
                        }
                        const finalMainSkill = Math.min(100, uniBase + primaryBonus + secondaryBonus);
                        // Assign Skills - All non-major skills set to 5
                        const newSkills = {
                            acting: 5, directing: 5, writing: 5,
                            scouting: 5, research: 5, marketing: 5, planning: 5
                        };
                        // Apply to major
                        const major = child.universityMajor;
                        if (major === 'Actor')
                            newSkills.acting = finalMainSkill;
                        else if (major === 'Director')
                            newSkills.directing = finalMainSkill;
                        else if (major === EmployeeType.Autor)
                            newSkills.writing = finalMainSkill;
                        else if (major === EmployeeType.CastingMitarbeiter)
                            newSkills.scouting = finalMainSkill;
                        else if (major === EmployeeType.Forscher)
                            newSkills.research = finalMainSkill;
                        else if (major === EmployeeType.Marketingmanager)
                            newSkills.marketing = finalMainSkill;
                        else if (major === EmployeeType.ProjektPlaner)
                            newSkills.planning = finalMainSkill;
                        // Update Child
                        const childIndex = newState.children.findIndex(c => c.id === child.id);
                        if (childIndex !== -1) {
                            newState.children[childIndex] = {
                                ...child,
                                isGraduated: true,
                                skills: newSkills
                            };
                            if (setGraduationModalData) {
                                setGraduationModalData({
                                    childName: child.name,
                                    major: major,
                                    uniName: university ? university.name : "Universität",
                                    skillLevel: finalMainSkill
                                });
                            }
                            systemPause();
                            dataChanged = true;
                        }
                    }
                }
            });
            if (dataChanged) {
                return newState;
            }
            return currentData;
        });
    }, [gameDate, setPlayerData, systemPause, setBirthModalData, setPregnancyNotification, setActiveEvent, setGraduationModalData, t]);
};
