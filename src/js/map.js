// 1. TOKEN
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNWU0ZjY2Mi1kYzNmLTRmODItYjg0Yy1hOWMxNTI5YzMyOTYiLCJpZCI6MzYwMjk2LCJpYXQiOjE3NjMwOTQ5NDd9.duKVIeBuYP8KMTAGRd_9dWEwRR3YdmwOSoAY9rLxPcY';

// 2. Viewer
const viewer = new Cesium.Viewer('cesiumContainer', {
    terrain: Cesium.Terrain.fromWorldTerrain(), 
    baseLayerPicker: false, geocoder: false, homeButton: false, infoBox: false, 
    sceneModePicker: false, selectionIndicator: false, timeline: false, 
    animation: false, navigationHelpButton: false, fullscreenButton: false
});

viewer.scene.globe.depthTestAgainstTerrain = false;

// 3. ŞEHİR YÜKLE
async function loadRealCity() {
    try {
        const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(2275207);
        viewer.scene.primitives.add(tileset);
        flyToDrone(); 
    } catch (error) { console.log("HATA:", error); }
}
loadRealCity();

// --- DEĞİŞKENLER ---
let gameActive = false;
let score = 0;
let timeLeft = 60; 
let timerInterval;
let taxiEntities = [];
let infectionChart; 
let lastCatchTime = 0;
let comboCounter = 0; 
let mistakeCount = 0; 

let currentLevel = 1;
let lives = 3;
let totalTaxis = 50; 
let infectionThreshold = 40; 

// --- KAMERA ---
window.flyToDrone = function() {
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-73.9857, 40.7484, 2000), 
        orientation: { heading: 0.0, pitch: Cesium.Math.toRadians(-60.0), roll: 0.0 },
        duration: 2
    });
};
window.flyToStreet = function() {
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-73.985428, 40.748817, 600),
        orientation: { heading: Cesium.Math.toRadians(200.0), pitch: Cesium.Math.toRadians(-20.0), roll: 0.0 },
        duration: 2
    });
};
viewer.scene.globe.enableLighting = true;

// --- CHART.JS ---
function initChart() {
    const canvas = document.getElementById('infectionChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if(infectionChart) infectionChart.destroy();

    infectionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(60).fill(''), 
            datasets: [
                { label: 'Infected', data: Array(60).fill(0), borderColor: 'red', backgroundColor: 'rgba(255,0,0,0.8)', fill: true, pointRadius: 0 },
                { label: 'Healthy', data: Array(60).fill(totalTaxis), borderColor: 'green', backgroundColor: 'rgba(0,255,0,0.4)', fill: true, pointRadius: 0 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            scales: { x: { display: false }, y: { display: false, stacked: true, min: 0, max: totalTaxis } },
            plugins: { legend: { display: false } }
        }
    });
}

// --- OYUNU BAŞLAT ---
function initGame() {
    console.log("Oyun Başlatılıyor...");
    initChart(); 
    
    if(!window.GameData) { alert("Veri dosyası eksik!"); return; }

    const taxis = window.GameData.generateTaxis(totalTaxis);

    taxis.forEach(taxi => {
        const taxiColor = taxi.isInfected ? Cesium.Color.RED : Cesium.Color.YELLOW;
        const entity = viewer.entities.add({
            id: 'taxi_' + taxi.id,
            position: Cesium.Cartesian3.fromDegrees(taxi.position[0], taxi.position[1], 300), 
            
            box: {
                dimensions: new Cesium.Cartesian3(40.0, 20.0, 20.0), 
                material: taxiColor, 
                outline: true, outlineColor: Cesium.Color.BLACK
            },
            point: {
                pixelSize: 10, color: taxiColor,
                outlineColor: Cesium.Color.WHITE, outlineWidth: 2,
                scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 100000, 0.5)
            }
        });
        taxiEntities.push({ data: taxi, entity: entity, progress: 0 });
    });

    viewer.zoomTo(viewer.entities);
    viewer.clock.onTick.addEventListener(animateTaxis);
    
    gameActive = true;
    startTimer();
    spawnInfection(3); 
    
    // Level 1 Hedefi: 1000 Puan
    setStatus("LEVEL 1 START! (Target: 1000 pts)", "cyan");
}

// --- ZAMANLAYICI ---
function startTimer() {
    timerInterval = setInterval(() => {
        if (!gameActive) return;
        timeLeft--;
        const tEl = document.getElementById('timer-display');
        if(tEl) tEl.innerText = timeLeft;

        const infectedCount = taxiEntities.filter(t => t.data.isInfected).length;
        const healthyCount = totalTaxis - infectedCount;
        updateChart(infectedCount, healthyCount);

        if (infectedCount > infectionThreshold) { 
            loseLife("INFECTION CRITICAL!"); 
            healRandomTaxis(10); 
        }
        
        // Virüs çıkma şansı: Maksimum %40'ta kalacak.
        let spawnChance = Math.min(0.80, 0.05 + (currentLevel * 0.05));
        
        if (Math.random() < spawnChance) {
            spawnInfection(1); 
        }

        if (timeLeft <= 0) endGame("TIME'S UP!");
    }, 1000);
}

function updateChart(i, h) {
    if (!infectionChart) return;
    infectionChart.data.datasets[0].data.shift(); infectionChart.data.datasets[0].data.push(i);
    infectionChart.data.datasets[1].data.shift(); infectionChart.data.datasets[1].data.push(h);
    infectionChart.update();
}

function loseLife(reason) {
    lives--;
    let icons = ""; for(let i=0; i<lives; i++) icons += "☣️ "; 
    const lEl = document.getElementById('lives-display');
    if(lEl) lEl.innerText = icons;
    
    setStatus(`⚠️ LIFE LOST! ${reason || ""}`, "red");
    triggerComboVisual("🦠LIFE LOST!", true);
    
    if (lives <= 0) endGame("INFECTION WON!");
}

// --- YENİ LEVEL SİSTEMİ (Üçgensel Sayı Kuralı ile İstenen Artış Farkı) ---
function getTargetScore(level) {
    // Toplam Skor Hedefi = (N * (N + 1) / 2) * 1000
    // Level 1 Hedef: 1000
    // Level 2 Hedef: 3000 (Fark +2000)
    // Level 3 Hedef: 6000 (Fark +3000)
    // Level 4 Hedef: 10000 (Fark +4000)
    if (level === 1) return 1000;
    return (level * (level + 1) / 2) * 1000;
}

function checkLevelUp() {
    const targetScore = getTargetScore(currentLevel);
    if (score >= targetScore) {
        levelUp(currentLevel + 1);
    }
}

function levelUp(lvl) {
    currentLevel = lvl;
    document.getElementById('level-display').innerText = currentLevel;
    
    timeLeft += 25; // Ödül süre
    let nextTarget = getTargetScore(lvl + 1); // Bir sonraki levelin hedef skorunu hesapla
    
    setStatus(`😷 LEVEL UP! NEXT TARGET: ${nextTarget} PTS`, "cyan");
    triggerComboVisual(`😷 LEVEL ${lvl}`, false);
    
    // Zorluğu artır (Virüs çıkma miktarını yavaşça artırır)
    spawnInfection(3 + Math.min(lvl, 10)); 
}

function spawnInfection(amount) {
    const clean = taxiEntities.filter(t => !t.data.isInfected);
    for(let i=0; i<amount; i++) {
        if (clean.length > 0) {
            const r = Math.floor(Math.random() * clean.length);
            clean[r].data.isInfected = true;
            clean.splice(r, 1);
        }
    }
}

function healRandomTaxis(amount) {
    const inf = taxiEntities.filter(t => t.data.isInfected);
    for(let i=0; i<amount; i++) if (inf.length>0) inf[i].data.isInfected = false;
}

function endGame(reason) {
    gameActive = false;
    clearInterval(timerInterval);
    document.getElementById('game-over-modal').classList.remove('hidden');
    document.getElementById('game-result-title').innerText = "GAME OVER";
    document.getElementById('final-score').innerHTML = `${score}<br><small>${reason}</small>`;
}

// --- HIZ LİMİTİ ---
function animateTaxis() {
    if (!gameActive) return;
    taxiEntities.forEach(item => {
        
        // HIZ LİMİTİ: Max 8.0'da kalır. Level arttıkça yavaşça artar.
        let speedMultiplier = Math.min(8.0, 4.0 + (currentLevel * 0.5));
        
        if (item.data.isInfected) speedMultiplier *= 1.2; // Virüslüler %20 daha hızlı

        item.progress += item.data.speed * speedMultiplier;

        if (item.progress >= 1) {
            item.progress = 0;
            const temp = item.data.start; item.data.start = item.data.end; item.data.end = temp;
        }
        const start = item.data.start; const end = item.data.end;
        const lng = start[0] + (end[0] - start[0]) * item.progress;
        const lat = start[1] + (end[1] - start[1]) * item.progress;
        
        item.entity.position = Cesium.Cartesian3.fromDegrees(lng, lat, 300); 

        const finalColor = item.data.isInfected ? Cesium.Color.RED : Cesium.Color.YELLOW;
        item.entity.box.material = finalColor;
        item.entity.point.color = finalColor;
    });
}

// --- ETKİLEŞİM & PUANLAMA (DENGELENDİ) ---
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

function createQuarantineVisual(pos) {
    // Yakalama Çapı: Başlangıçta 700m, her levelde 50m küçülür (Hassasiyet Artışı)
    let visualRadius = Math.max(300.0, 700.0 - (currentLevel * 50.0));
    
    const q = viewer.entities.add({
        position: pos,
        cylinder: { length: 1500.0, topRadius: visualRadius, bottomRadius: visualRadius, material: Cesium.Color.LIME.withAlpha(0.4), outline: true }
    });
    setTimeout(() => viewer.entities.remove(q), 500);
}

function checkQuarantineZone(lng, lat) {
    const radius = Math.max(0.2, 0.6 - (currentLevel * 0.05)); 
    const clickPoint = turf.point([lng, lat]);
    
    let caughtInfected = 0;
    let caughtHealthy = 0;

    taxiEntities.forEach(item => {
        const start = item.data.start; const end = item.data.end;
        const currLng = start[0] + (end[0] - start[0]) * item.progress;
        const currLat = start[1] + (end[1] - start[1]) * item.progress;
        const dist = turf.distance(clickPoint, turf.point([currLng, currLat]), {units: 'kilometers'});
        
        if (dist <= radius) {
            if (item.data.isInfected) {
                item.data.isInfected = false;
                caughtInfected++;
            } else {
                caughtHealthy++;
            }
        }
    });

    // --- SONUÇLAR ---
    if (caughtInfected > 0) {
        // BAŞARILI
        mistakeCount = 0; 
        
        const now = Date.now();
        if (now - lastCatchTime < 2500) { comboCounter++; } 
        else { comboCounter = 1; }
        lastCatchTime = now;

        let pts = caughtInfected * 100; // Yakalanan taksi başına 100 temel puan
        
        // --- PUANLAMA DÜZELTMESİ: COMBO ETKİSİ AZALTILDI ---
        if (comboCounter >= 2) {
            // Eski: pts *= comboCounter (Çok hızlı artış)
            // Yeni: Combo sadece %25'lik bir katman ekler (Dengeli Artış)
            const comboMultiplier = (1 + (comboCounter - 1) * 0.25);
            pts = Math.floor(pts * comboMultiplier);

            triggerComboVisual(`🔥 COMBO x${comboCounter}!`);
            setStatus("CHAIN REACTION!", "orange");
        } else {
            if(caughtInfected > 1) triggerComboVisual(`⚡ MULTI x${caughtInfected}!`);
            else setStatus(`CURED! +${pts}`, "#00ff00");
        }

        score += pts;
        document.getElementById('score-display').innerText = Math.floor(score);
        
        checkLevelUp();

    } else if (caughtHealthy > 0) {
        // SAĞLIKLI VURMA HATASI
        // ... (Puan kaybı aynı kalır)
        mistakeCount++;
        score -= 50; 
        if(score<0) score=0;
        document.getElementById('score-display').innerText = score;
        
        if (mistakeCount >= 2) {
            loseLife("TOO MANY MISTAKES!");
            triggerComboVisual("🦠 LIFE LOST!", true); 
            mistakeCount = 0;
        } else {
            setStatus(`⚠️ WRONG TARGET! (${mistakeCount}/2)`, "red");
        }
    } else {
        // BOŞ TIKLAMA HATASI
        // ... (Can kaybı aynı kalır)
        mistakeCount++;
        if (mistakeCount >= 2) {
            loseLife("MISSED TOO MANY!");
            triggerComboVisual("🦠 LIFE LOST!", true);
            mistakeCount = 0;
        } else {
            setStatus(`⚠️ MISSED! (${mistakeCount}/2)`, "red");
        }
    }
}

function triggerComboVisual(text, isDanger = false) {
    const el = document.getElementById('combo-popup');
    if(!el) return;

    el.innerText = text;
    el.classList.remove('hidden');
    el.classList.remove('combo-anim');
    el.classList.remove('danger-text'); 
    
    if (isDanger) el.classList.add('danger-text'); 

    void el.offsetWidth; 
    el.classList.add('combo-anim');

    setTimeout(() => { el.classList.add('hidden'); }, 1000);
}

function setStatus(text, color) {
    const el = document.getElementById('status-text');
    if(el) {
        el.innerText = text; el.style.color = color || "white";
        setTimeout(() => { if(gameActive) el.innerText = "SCANNING..."; el.style.color="white"; }, 2000);
    }
}

setTimeout(initGame, 4000);