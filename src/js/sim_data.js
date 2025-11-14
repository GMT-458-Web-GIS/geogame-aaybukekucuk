// --- src/js/sim_data.js (GÜNCELLENMİŞ VERSİYON) ---

// Oyunun Genel Durumu
const GameState = {
    taxis: [], // Tüm taksiler burada tutulacak
    totalInfected: 0,
    gameTime: 0
};

// Manhattan Önemli Noktaları (Gerçek Koordinatlar)
// Taksiler bu noktalar arasında gidip gelecek.
const LOCATIONS = {
    TIMES_SQUARE: [-73.9851, 40.7580],
    CENTRAL_PARK_S: [-73.9730, 40.7644], // Parkın güney girişi
    EMPIRE_STATE: [-73.9857, 40.7484],
    WALL_STREET: [-74.0090, 40.7060],
    BROOKLYN_BRIDGE: [-73.9969, 40.7061],
    PENN_STATION: [-73.9935, 40.7505],
    SOHO: [-74.0024, 40.7233],
    CHINATOWN: [-73.9970, 40.7158],
    UN_HEADQUARTERS: [-73.9680, 40.7489],
    HUDSON_YARDS: [-74.0017, 40.7530]
};

// Yardımcı: Rastgele Sayı Üretici
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Taksi Filosu Oluşturucu
function generateTaxis(count = 100) {
    const taxiFleet = [];
    const pointKeys = Object.keys(LOCATIONS);

    for (let i = 0; i < count; i++) {
        // Rastgele Başlangıç ve Bitiş noktası seç
        const startKey = pointKeys[randomInt(0, pointKeys.length - 1)];
        let endKey = pointKeys[randomInt(0, pointKeys.length - 1)];

        // Başlangıç ve bitiş aynı olmasın
        while (startKey === endKey) {
            endKey = pointKeys[randomInt(0, pointKeys.length - 1)];
        }

        taxiFleet.push({
            id: i,
            start: LOCATIONS[startKey], // Koordinat [lon, lat]
            end: LOCATIONS[endKey],     // Koordinat [lon, lat]
            position: [...LOCATIONS[startKey]], // Anlık konum (Kopyala)
            isInfected: false, // Hepsi sağlıklı başlar
            
            // HIZ AYARI: (GÜNCELLENDİ)
            // Eskiden çok hızlıydı. Şimdi 0.0001 yaparak yavaşlattık.
            // Böylece taksiler ağır ağır ilerleyecek ve yakalaması kolay olacak.
            speed: 0.0001 + (Math.random() * 0.0001) 
        });
    }
    
    // HASTA SIFIR (PATIENT ZERO)
    // Rastgele bir taksiyi seç ve enfekte et
    const patientZeroIndex = randomInt(0, taxiFleet.length - 1);
    taxiFleet[patientZeroIndex].isInfected = true;
    console.log(`⚠️ ALARM: Taksi #${patientZeroIndex} HASTA SIFIR olarak belirlendi!`);

    GameState.taxis = taxiFleet;
    return taxiFleet;
}

// Bu verileri map.js'in kullanabilmesi için window nesnesine ekliyoruz
window.GameData = {
    state: GameState,
    generateTaxis: generateTaxis,
    locations: LOCATIONS
};