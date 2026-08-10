import { EmployeeType, Genre } from "../types";
import { MALE_FIRST_NAMES, FEMALE_FIRST_NAMES, LAST_NAMES } from "./nameData";
import { EMPLOYEE_MALE_PORTRAITS, EMPLOYEE_FEMALE_PORTRAITS } from "./portraits";
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const PORTRAIT_BASE_URL = "https://www.schnoxcore.com/media/portrait";
const toLocalEmployeePortraitUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("data:image")) return raw;
  const filename = raw.split("/").pop() || raw;
  return `${PORTRAIT_BASE_URL}/${filename}`;
};
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
const getUniquePortrait = (gender, usedPortraits) => {
  const pool = gender === "male" ? EMPLOYEE_MALE_PORTRAITS : EMPLOYEE_FEMALE_PORTRAITS;
  const available = pool.filter((id) => {
    const localPath = `${PORTRAIT_BASE_URL}/${id}.png`;
    return !usedPortraits.has(localPath);
  });
  const selectedId = available.length > 0 ? pickRandom(available) : pickRandom(pool);
  return `${PORTRAIT_BASE_URL}/${selectedId}.png`;
};
const generateSingleEmployee = (id, type, reputation, usedPortraits) => {
  const isMale = Math.random() < 0.5;
  const firstName = isMale ? pickRandom(MALE_FIRST_NAMES) : pickRandom(FEMALE_FIRST_NAMES);
  const lastName = pickRandom(LAST_NAMES);
  const name = `${firstName} ${lastName}`;
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
  const hatedGenre = pickRandom(allGenres.filter((g) => !favoriteGenres.includes(g)));
  const salary = Math.round((1200 + talent * talent * 1.6) / 50) * 50;
  const portraitUrl = getUniquePortrait(isMale ? "male" : "female", usedPortraits);
  usedPortraits.add(portraitUrl);
  return {
    id,
    name,
    type,
    talent,
    salary,
    genreFocus: type === EmployeeType.Autor ? favoriteGenres : void 0,
    hatedGenre: type === EmployeeType.Autor ? hatedGenre : void 0,
    speed: type === EmployeeType.Autor ? parseFloat((0.8 + Math.random() * 0.7).toFixed(2)) : void 0,
    experience: Math.floor(Math.random() * 10),
    satisfaction: 80,
    portraitUrl,
    lastTrainingDate: void 0
    // Explicitly undefined for clarity
  };
};
const generateInitialEmployees = () => {
  const employees = [];
  let currentId = 1e4;
  const usedPortraits = /* @__PURE__ */ new Set();
  for (const type of Object.values(EmployeeType)) {
    for (let i = 0; i < 2; i++) {
      employees.push(generateSingleEmployee(currentId++, type, 10, usedPortraits));
    }
  }
  return employees;
};
const generateEmployeeMarket = (hiredIds, reputation, allEmployees) => {
  const market = [];
  let nextId = Math.max(1e4, ...allEmployees.map((e) => e.id), ...hiredIds) + 1;
  const usedPortraits = /* @__PURE__ */ new Set();
  allEmployees.forEach((e) => {
    if (e.portraitUrl) usedPortraits.add(toLocalEmployeePortraitUrl(e.portraitUrl));
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
const refreshEmployeeMarket = (hiredEmployees, reputation) => {
  const market = [];
  const maxHiredId = hiredEmployees.reduce((max, e) => Math.max(max, e.id), 1e4);
  let nextId = maxHiredId + 1;
  const usedPortraits = /* @__PURE__ */ new Set();
  hiredEmployees.forEach((e) => {
    if (e.portraitUrl) usedPortraits.add(toLocalEmployeePortraitUrl(e.portraitUrl));
  });
  for (const type of Object.values(EmployeeType)) {
    const count = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < count; i++) {
      market.push(generateSingleEmployee(nextId++, type, reputation, usedPortraits));
    }
  }
  return shuffleArray(market);
};
export {
  generateEmployeeMarket,
  generateInitialEmployees,
  generateSingleEmployee,
  refreshEmployeeMarket
};
