import { EmployeeType, Genre } from '../types';
import { MALE_FIRST_NAMES, FEMALE_FIRST_NAMES, LAST_NAMES } from './nameData';
import { EMPLOYEE_MALE_PORTRAITS, EMPLOYEE_FEMALE_PORTRAITS } from './portraits';
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};
// Helper to get a unique portrait that isn't in the used set
const getUniquePortrait = (gender, usedPortraits) => {
    const pool = gender === 'male' ? EMPLOYEE_MALE_PORTRAITS : EMPLOYEE_FEMALE_PORTRAITS;
    // Filter out portraits that are already used (by checking if the ID exists in the set)
    const available = pool.filter(id => {
        // Construct the full path to check against usedPortraits which stores full paths
        const fullPath = `https://www.schnoxcore.com/media/portraits/${id}.png`;
        return !usedPortraits.has(fullPath);
    });
    // Fallback if all 100 are taken (unlikely but safe) -> pick any random
    const selectedId = available.length > 0 ? pickRandom(available) : pickRandom(pool);
    return `https://www.schnoxcore.com/media/portraits/${selectedId}.png`;
};
// Modified signature to accept usedPortraits set
export const generateSingleEmployee = (id, type, reputation, usedPortraits) => {
    const isMale = Math.random() < 0.5;
    const firstName = isMale ? pickRandom(MALE_FIRST_NAMES) : pickRandom(FEMALE_FIRST_NAMES);
    const lastName = pickRandom(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    // Talent calculation: Minimum = Reputation, Maximum = Reputation + 10
    const minTalent = Math.max(1, reputation);
    const maxTalent = Math.min(100, reputation + 10);
    const talent = Math.floor(Math.random() * (maxTalent - minTalent + 1)) + minTalent;
    const allGenres = Object.values(Genre);
    const favoriteGenres = [];
    while (favoriteGenres.length < 2) {
        const genre = pickRandom(allGenres);
        if (!favoriteGenres.includes(genre)) {
            favoriteGenres.push(genre);
        }
    }
    const hatedGenre = pickRandom(allGenres.filter(g => !favoriteGenres.includes(g)));
    const salary = Math.round((1200 + (talent * talent * 1.6)) / 50) * 50;
    // Select unique portrait
    const portraitUrl = getUniquePortrait(isMale ? 'male' : 'female', usedPortraits);
    usedPortraits.add(portraitUrl); // Mark as used for subsequent calls in same batch
    return {
        id,
        name,
        type,
        talent,
        salary,
        genreFocus: type === EmployeeType.Autor ? favoriteGenres : undefined,
        hatedGenre: type === EmployeeType.Autor ? hatedGenre : undefined,
        speed: type === EmployeeType.Autor ? parseFloat((0.8 + Math.random() * 0.7).toFixed(2)) : undefined,
        experience: Math.floor(Math.random() * 10),
        satisfaction: 80,
        portraitUrl,
        lastTrainingDate: undefined, // Explicitly undefined for clarity
    };
};
export const generateInitialEmployees = () => {
    const employees = [];
    let currentId = 10000;
    const usedPortraits = new Set();
    for (const type of Object.values(EmployeeType)) {
        for (let i = 0; i < 2; i++) {
            employees.push(generateSingleEmployee(currentId++, type, 10, usedPortraits));
        }
    }
    return employees;
};
export const generateEmployeeMarket = (hiredIds, reputation, allEmployees) => {
    const market = [];
    let nextId = Math.max(10000, ...allEmployees.map(e => e.id), ...hiredIds) + 1;
    // Collect currently used portraits from ALL employees (hired + market so far)
    const usedPortraits = new Set();
    allEmployees.forEach(e => {
        if (e.portraitUrl)
            usedPortraits.add(e.portraitUrl);
    });
    for (const type of Object.values(EmployeeType)) {
        const count = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < count; i++) {
            const newEmp = generateSingleEmployee(nextId++, type, reputation, usedPortraits);
            market.push(newEmp);
        }
    }
    return shuffleArray(market);
};
// New function to refresh the market weekly - Completely replaces old market
export const refreshEmployeeMarket = (hiredEmployees, reputation) => {
    const market = [];
    const maxHiredId = hiredEmployees.reduce((max, e) => Math.max(max, e.id), 10000);
    let nextId = maxHiredId + 1;
    // Track portraits used by CURRENTLY HIRED employees to avoid duplicates
    // Since we wipe the market, we don't care about old market portraits
    const usedPortraits = new Set();
    hiredEmployees.forEach(e => {
        if (e.portraitUrl)
            usedPortraits.add(e.portraitUrl);
    });
    // Generate fresh employees for every type
    for (const type of Object.values(EmployeeType)) {
        // 1 to 2 employees per type
        const count = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < count; i++) {
            market.push(generateSingleEmployee(nextId++, type, reputation, usedPortraits));
        }
    }
    return shuffleArray(market);
};
