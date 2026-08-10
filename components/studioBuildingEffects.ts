import { BuildingType, PlayerData, ProjectData } from '../types';
import { BUILDING_DATA, BuildingLevel } from './buildings';

const getCurrentLevelData = (playerData: PlayerData, type: BuildingType): BuildingLevel | null => {
    const building = playerData.buildings.find(entry => entry.type === type);
    if (!building || building.level <= 0) return null;

    return BUILDING_DATA[type].levels[building.level - 1] || null;
};

export const getProductionDurationMultiplier = (playerData: PlayerData): number => {
    return getCurrentLevelData(playerData, BuildingType.Backlot)?.bonusEffect?.productionDurationMultiplier || 1;
};

export const getPostProductionDurationMultiplier = (playerData: PlayerData): number => {
    return getCurrentLevelData(playerData, BuildingType.Postproduktionshaus)?.bonusEffect?.postProductionDurationMultiplier || 1;
};

export const getMonthlySatisfactionBonus = (playerData: PlayerData): number => {
    return getCurrentLevelData(playerData, BuildingType.Betriebskita)?.bonusEffect?.monthlySatisfactionBonus || 0;
};

export const getSecurityEventProtection = (playerData: PlayerData): number => {
    return getCurrentLevelData(playerData, BuildingType.Sicherheitszentrale)?.bonusEffect?.eventProtection || 0;
};

export const getStudioQualityBonuses = (project: ProjectData, playerData: PlayerData): { totalBonus: number; logLines: string[] } => {
    const bonuses: string[] = [];
    let totalBonus = 0;

    const backlotData = getCurrentLevelData(playerData, BuildingType.Backlot);
    const backlotGenreBonus = backlotData?.bonusEffect?.genreQualityBonuses?.[project.genre] || 0;
    if (backlotGenreBonus > 0) {
        totalBonus += backlotGenreBonus;
        bonuses.push(`Backlot-Bonus (${project.genre}): +${backlotGenreBonus}`);
    }

    const costumeData = getCurrentLevelData(playerData, BuildingType.KostuemUndMaskenatelier);
    const costumeGenreBonus = costumeData?.bonusEffect?.genreQualityBonuses?.[project.genre] || 0;
    if (costumeGenreBonus > 0) {
        totalBonus += costumeGenreBonus;
        bonuses.push(`Kostuem- & Maskenatelier (${project.genre}): +${costumeGenreBonus}`);
    }

    const postData = getCurrentLevelData(playerData, BuildingType.Postproduktionshaus);
    const postBonus = postData?.bonusEffect?.qualityBonus || 0;
    if (postBonus > 0) {
        totalBonus += postBonus;
        bonuses.push(`Postproduktionshaus: +${postBonus}`);
    }

    return { totalBonus, logLines: bonuses };
};

export const SECURITY_EVENT_IDS = [
    'studio_05',
    'studio_51',
    'dec_03_security',
    'dec_10_spy',
    'dec_11_ransomware',
    'dec_15_leak',
    'dec_22_paparazzi',
    'dec_35_espionage',
];