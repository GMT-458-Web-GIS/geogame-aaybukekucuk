// --- src/js/sim_data.js ---

const GameState = {
    taxis: [],
    totalInfected: 0,
    gameTime: 0
};

const LOCATIONS = {
    TIMES_SQUARE: [-73.9851, 40.7580],
    CENTRAL_PARK_S: [-73.9730, 40.7644],
    EMPIRE_STATE: [-73.9857, 40.7484],
    WALL_STREET: [-74.0090, 40.7060],
    BROOKLYN_BRIDGE: [-73.9969, 40.7061],
    PENN_STATION: [-73.9935, 40.7505],
    SOHO: [-74.0024, 40.7233],
    CHINATOWN: [-73.9970, 40.7158],
    UN_HEADQUARTERS: [-73.9680, 40.7489],
    HUDSON_YARDS: [-74.0017, 40.7530]
};

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Taksi Oluşturucu
function generateTaxis(count = 100) {
    const taxiFleet = [];
    const pointKeys = Object.keys(LOCATIONS);

    for (let i = 0; i < count; i++) {
        const startKey = pointKeys[randomInt(0, pointKeys.length - 1)];
        let endKey = pointKeys[randomInt(0, pointKeys.length - 1)];

        while (startKey === endKey) {
            endKey = pointKeys[randomInt(0, pointKeys.length - 1)];
        }

        taxiFleet.push({
            id: i,
            start: LOCATIONS[startKey],
            end: LOCATIONS[endKey],
            position: [...LOCATIONS[startKey]],
            isInfected: false,
            
            // --- HIZ AYARI (GAME DESIGN FIX) ---
            // Taban Hız: 0.00005 (Yeterince yavaş ama hareketli)
            // Rastgelelik: Sadece %20 fark eder.
            // Sonuç: Hepsi akıcı bir trafik gibi hareket eder.
            speed: 0.0001 + (Math.random() * 0.0001) 
        });
    }
    
    const patientZeroIndex = randomInt(0, taxiFleet.length - 1);
    taxiFleet[patientZeroIndex].isInfected = true;
    console.log(`⚠️ HASTA SIFIR: Taksi #${patientZeroIndex}`);

    GameState.taxis = taxiFleet;
    return taxiFleet;
}

window.GameData = {
    state: GameState,
    generateTaxis: generateTaxis,
    locations: LOCATIONS
};