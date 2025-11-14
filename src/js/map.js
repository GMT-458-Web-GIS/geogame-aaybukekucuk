// 1. TOKEN
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNWU0ZjY2Mi1kYzNmLTRmODItYjg0Yy1hOWMxNTI5YzMyOTYiLCJpZCI6MzYwMjk2LCJpYXQiOjE3NjMwOTQ5NDd9.duKVIeBuYP8KMTAGRd_9dWEwRR3YdmwOSoAY9rLxPcY';

// 2. Viewer
const viewer = new Cesium.Viewer('cesiumContainer', {
    terrain: Cesium.Terrain.fromWorldTerrain(), 
    baseLayerPicker: false, geocoder: false, homeButton: false, infoBox: false, 
    sceneModePicker: false, selectionIndicator: false, timeline: false, 
    animation: false, navigationHelpButton: false, fullscreenButton: false
});

// 3. Şehir Yükle
async function loadRealCity() {
    try {
        const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(2275207);
        viewer.scene.primitives.add(tileset);
        flyToDrone(); 
    } catch (error) { console.log("HATA:", error); }
}
loadRealCity();

// --- OYUN DEĞİŞKENLERİ ---
let gameActive = false;
let score = 0;
let timeLeft = 60; 
let timerInterval;
let taxiEntities = [];
let infectionChart; 
let lastCatchTime = 0;

// YENİ DEĞİŞKENLER
let currentLevel = 1;
let lives = 3;
let totalTaxis = 100; // Level 1 için başlangıç sayısı
let infectionThreshold = 40; // Eğer 40 taksi aynı anda hasta olursa can gider!

// --- KAMERA ---
window.flyToDrone = function() {
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-73.9857, 40.7484, 1200),
        orientation: { heading: 0.0, pitch: Cesium.Math.toRadians(-45.0), roll: 0.0 },
        duration: 2
    });
};
window.flyToStreet = function() {
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-73.985428, 40.748817, 200),
        orientation: { heading: Cesium.Math.toRadians(200.0), pitch: Cesium.Math.toRadians(-10.0), roll: 0.0 },
        duration: 2
    });
};
viewer.scene.globe.enableLighting = true;

// --- CHART.JS ---
function initChart() {
    const ctx = document.getElementById('infectionChart').getContext('2d');
    if(infectionChart) infectionChart.destroy();

    infectionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(60).fill(''), 
            datasets: [
                {
                    label: 'Infected ☣️', 
                    data: Array(60).fill(0),
                    borderColor: '#ff0000',
                    backgroundColor: 'rgba(255, 0, 0, 0.8)', 
                    fill: true, pointRadius: 0, tension: 0.3
                },
                {
                    label: 'Healthy 🛡️', 
                    data: Array(60).fill(totalTaxis), 
                    borderColor: '#00ff00',
                    backgroundColor: 'rgba(0, 255, 0, 0.4)', 
                    fill: true, pointRadius: 0, tension: 0.3
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            interaction: { mode: 'nearest', axis: 'x', intersect: false },
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { display: false }, y: { display: false, stacked: true, min: 0, max: totalTaxis } }
        }
    });
}

// --- OYUN BAŞLATMA ---
function initGame() {
    console.log("Oyun Başlatılıyor...");
    initChart(); 
    
    // Taksileri oluştur
    const taxis = window.GameData.generateTaxis(totalTaxis);

    taxis.forEach(taxi => {
        const entity = viewer.entities.add({
            id: 'taxi_' + taxi.id,
            position: Cesium.Cartesian3.fromDegrees(taxi.position[0], taxi.position[1], 50),
            point: {
                pixelSize: 10, 
                color: taxi.isInfected ? Cesium.Color.RED : Cesium.Color.YELLOW,
                outlineColor: Cesium.Color.BLACK, outlineWidth: 1,
                scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 100000, 0.5)
            }
        });
        taxiEntities.push({ data: taxi, entity: entity, progress: 0 });
    });

    viewer.clock.onTick.addEventListener(animateTaxis);
    
    gameActive = true;
    startTimer();
    spawnInfection(5); // Başlangıçta 5 hasta
    setStatus("LEVEL 1 STARTED! GOOD LUCK!", "cyan");
}

// --- ZAMANLAYICI VE LEVEL SİSTEMİ ---
function startTimer() {
    timerInterval = setInterval(() => {
        if (!gameActive) return;

        // Süreyi azalt
        timeLeft--;
        document.getElementById('timer-display').innerText = timeLeft;

        // 1. Chart Güncelle
        const infectedCount = taxiEntities.filter(t => t.data.isInfected).length;
        const healthyCount = totalTaxis - infectedCount;
        updateChart(infectedCount, healthyCount);

        // 2. CAN KONTROLÜ (LIVES SYSTEM)
        // Eğer enfekte sayısı eşiği geçerse canın gider!
        if (infectedCount > infectionThreshold) {
            loseLife();
            // Cezadan sonra biraz temizle ki anında tekrar can gitmesin
            healRandomTaxis(10); 
        }

        // 3. LEVEL ATLAMAK İÇİN VİRÜS ÜRETİMİ
        // Level arttıkça virüs çıkma şansı artar
        let spawnChance = 0.10 + (currentLevel * 0.10); // Lvl 1: %20, Lvl 2: %30...
        if (Math.random() < spawnChance) { 
            spawnInfection(currentLevel); // Level kadar virüs çıkar
        }

        // 4. SÜRE BİTERSE
        if (timeLeft <= 0) {
            endGame("TIME'S UP!");
        }
    }, 1000);
}

function updateChart(infected, healthy) {
    if (!infectionChart) return;
    const iData = infectionChart.data.datasets[0].data; iData.shift(); iData.push(infected);
    const hData = infectionChart.data.datasets[1].data; hData.shift(); hData.push(healthy);
    infectionChart.update();
}

// CAN KAYBETME FONKSİYONU
function loseLife() {
    lives--;
    
    // Ekranı güncelle
    let hearts = "";
    for(let i=0; i<lives; i++) hearts += "❤️";
    document.getElementById('lives-display').innerText = hearts;

    setStatus("⚠️ CRITICAL INFECTION! LIFE LOST!", "red");
    
    // Ekranı sars (CSS efekti eklenebilir, şimdilik alert sesi gibi düşün)
    console.log("CAN KAYBEDİLDİ!");

    if (lives <= 0) {
        endGame("INFECTION TOOK OVER NYC!");
    }
}

// LEVEL ATLAMA FONKSİYONU
function checkLevelUp() {
    // 2000 Puan -> Level 2
    if (currentLevel === 1 && score >= 2000) {
        levelUp(2);
    }
    // 5000 Puan -> Level 3
    else if (currentLevel === 2 && score >= 5000) {
        levelUp(3);
    }
}

function levelUp(lvl) {
    currentLevel = lvl;
    document.getElementById('level-display').innerText = currentLevel;
    
    // Süre bonusu
    timeLeft += 30; 
    setStatus(`LEVEL UP! WELCOME TO LEVEL ${lvl}`, "cyan");
    
    // Büyük bir salgın başlatarak zorluğu artır
    triggerOutbreak();
}

function spawnInfection(amount) {
    const cleanTaxis = taxiEntities.filter(t => !t.data.isInfected);
    for(let i=0; i<amount; i++) {
        if (cleanTaxis.length > 0) {
            const rnd = Math.floor(Math.random() * cleanTaxis.length);
            cleanTaxis[rnd].data.isInfected = true;
            cleanTaxis.splice(rnd, 1);
        }
    }
}

function healRandomTaxis(amount) {
    const infected = taxiEntities.filter(t => t.data.isInfected);
    for(let i=0; i<amount; i++) {
        if (infected.length > 0) {
            infected[i].data.isInfected = false;
        }
    }
}

function triggerOutbreak() {
    setStatus("⚠️ MASSIVE OUTBREAK DETECTED!", "red");
    spawnInfection(10 * currentLevel); // Level ile orantılı salgın
}

function endGame(reason) {
    gameActive = false;
    clearInterval(timerInterval);
    document.getElementById('game-over-modal').classList.remove('hidden');
    document.getElementById('game-result-title').innerText = "GAME OVER";
    document.getElementById('final-score').innerHTML = `${score}<br><small>${reason}</small>`;
}

function animateTaxis() {
    if (!gameActive) return;

    taxiEntities.forEach(item => {
        // LEVEL ETKİSİ: Level arttıkça taksiler hızlanır
        let speedMultiplier = 5.0 + (currentLevel * 2.0); 
        item.progress += item.data.speed * speedMultiplier;

        if (item.progress >= 1) {
            item.progress = 0;
            const temp = item.data.start;
            item.data.start = item.data.end;
            item.data.end = temp;
        }

        const start = item.data.start;
        const end = item.data.end;
        const currentLng = start[0] + (end[0] - start[0]) * item.progress;
        const currentLat = start[1] + (end[1] - start[1]) * item.progress;

        item.entity.position = Cesium.Cartesian3.fromDegrees(currentLng, currentLat, 50);

        if (item.data.isInfected) {
            item.entity.point.color = Cesium.Color.RED;
            item.entity.point.pixelSize = 20; 
            item.entity.point.outlineColor = Cesium.Color.WHITE;
        } else {
            item.entity.point.color = Cesium.Color.YELLOW;
            item.entity.point.pixelSize = 8;
            item.entity.point.outlineColor = Cesium.Color.BLACK;
        }
    });
}

setTimeout(initGame, 4000);

// --- ETKİLEŞİM ---
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction(function(movement) {
    if (!gameActive) return;
    const cartesian = viewer.scene.pickPosition(movement.position);
    if (cartesian) {
        const c = Cesium.Cartographic.fromCartesian(cartesian);
        createQuarantineVisual(cartesian);
        checkQuarantineZone(Cesium.Math.toDegrees(c.longitude), Cesium.Math.toDegrees(c.latitude));
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

function createQuarantineVisual(position) {
    const q = viewer.entities.add({
        position: position,
        cylinder: {
            length: 1000.0, topRadius: 400.0, bottomRadius: 400.0,
            material: Cesium.Color.LIME.withAlpha(0.4),
            outline: true, outlineColor: Cesium.Color.LIME
        }
    });
    setTimeout(() => viewer.entities.remove(q), 800); 
}

function checkQuarantineZone(zoneLng, zoneLat) {
    // Level arttıkça karantina alanı daralır (Zorlaşır!)
    const radius = 0.6 - (currentLevel * 0.1); 
    const clickPoint = turf.point([zoneLng, zoneLat]);
    let hitCount = 0;

    taxiEntities.forEach(item => {
        const start = item.data.start;
        const end = item.data.end;
        const currentLng = start[0] + (end[0] - start[0]) * item.progress;
        const currentLat = start[1] + (end[1] - start[1]) * item.progress;

        const taxiPoint = turf.point([currentLng, currentLat]);
        const distance = turf.distance(clickPoint, taxiPoint, {units: 'kilometers'});

        if (distance <= radius && item.data.isInfected) {
            item.data.isInfected = false; 
            hitCount++;
        }
    });

    if(hitCount > 0) {
        let points = hitCount * 100;
        const now = Date.now();
        if (now - lastCatchTime < 2000) { 
            points *= 2; 
            setStatus("🔥 COMBO! DOUBLE POINTS!", "orange");
        } else {
            setStatus(`CURED! +${points}`, "#00ff00");
        }
        score += points;
        lastCatchTime = now;
        document.getElementById('score-display').innerText = score;
        
        // Level Kontrolü Yap
        checkLevelUp();
    }
}

function setStatus(text, color) {
    const el = document.getElementById('status-text');
    el.innerText = text;
    el.style.color = color || "white";
    setTimeout(() => { if(gameActive) el.innerText = "SCANNING..."; el.style.color="white"; }, 2000);
}