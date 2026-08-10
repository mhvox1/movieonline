const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};
export const findTalentsForAgency = (agency, allDirectors, allActors) => {
    const undiscoveredDirectors = allDirectors.filter(d => !d.isDiscovered);
    const undiscoveredActors = allActors.filter(a => !a.isDiscovered);
    let directorPool = [];
    let actorPool = [];
    let numDirectors = 0;
    let numActors = 0;
    switch (agency.specialization) {
        case 'newcomers':
            directorPool = undiscoveredDirectors.filter(d => d.skill < 45);
            actorPool = undiscoveredActors.filter(a => a.skill < 45);
            numDirectors = 4 + Math.floor(Math.random() * 2); // 4-5
            numActors = 4 + Math.floor(Math.random() * 3); // 4-6
            break;
        case 'genre':
            directorPool = undiscoveredDirectors.filter(d => d.skill >= 40 && d.skill <= 65);
            actorPool = undiscoveredActors.filter(a => a.skill >= 40 && a.skill <= 65);
            numDirectors = 3 + Math.floor(Math.random() * 2); // 3-4
            numActors = 3 + Math.floor(Math.random() * 3); // 3-5
            break;
        case 'arthouse':
            directorPool = undiscoveredDirectors.filter(d => d.skill >= 40 && d.skill <= 70);
            actorPool = undiscoveredActors.filter(a => a.skill >= 40 && a.skill <= 70);
            numDirectors = 2 + Math.floor(Math.random() * 2); // 2-3
            numActors = 3 + Math.floor(Math.random() * 3); // 3-5
            break;
        case 'international':
            directorPool = undiscoveredDirectors.filter(d => d.skill >= 30 && d.skill <= 70);
            actorPool = undiscoveredActors.filter(a => a.skill >= 30 && a.skill <= 70);
            numDirectors = 3 + Math.floor(Math.random() * 2); // 3-4
            numActors = 4 + Math.floor(Math.random() * 3); // 4-6
            break;
        case 'comeback':
            directorPool = undiscoveredDirectors.filter(d => d.skill >= 55 && d.skill <= 75);
            actorPool = undiscoveredActors.filter(a => a.skill >= 55 && a.skill <= 75);
            numDirectors = 2 + Math.floor(Math.random() * 2); // 2-3
            numActors = 3 + Math.floor(Math.random() * 2); // 3-4
            break;
        case 'prestige':
            directorPool = undiscoveredDirectors.filter(d => d.skill >= 60 && d.skill <= 80);
            actorPool = undiscoveredActors.filter(a => a.skill >= 60 && a.skill <= 80);
            numDirectors = 2 + Math.floor(Math.random() * 2); // 2-3
            numActors = 3 + Math.floor(Math.random() * 2); // 3-4
            break;
        case 'action':
            directorPool = undiscoveredDirectors.filter(d => d.skill >= 50 && d.skill <= 80);
            actorPool = undiscoveredActors.filter(a => a.skill >= 50 && a.skill <= 80);
            numDirectors = 3 + Math.floor(Math.random() * 2); // 3-4
            numActors = 4 + Math.floor(Math.random() * 2); // 4-5
            break;
        case 'blockbuster':
            directorPool = undiscoveredDirectors.filter(d => d.skill >= 75);
            actorPool = undiscoveredActors.filter(a => a.skill >= 75);
            numDirectors = 2 + Math.floor(Math.random() * 2); // 2-3
            numActors = 3 + Math.floor(Math.random() * 2); // 3-4
            break;
    }
    return {
        directorIds: shuffleArray(directorPool).slice(0, numDirectors).map(d => d.id),
        actorIds: shuffleArray(actorPool).slice(0, numActors).map(a => a.id),
    };
};
