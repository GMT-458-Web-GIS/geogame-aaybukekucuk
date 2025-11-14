// 1. SENİN CESIUM TOKEN'IN
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNWU0ZjY2Mi1kYzNmLTRmODItYjg0Yy1hOWMxNTI5YzMyOTYiLCJpZCI6MzYwMjk2LCJpYXQiOjE3NjMwOTQ5NDd9.duKVIeBuYP8KMTAGRd_9dWEwRR3YdmwOSoAY9rLxPcY';

// 2. Cesium Viewer'ı Başlat
const viewer = new Cesium.Viewer('cesiumContainer', {
    // HATA DÜZELTİLDİ: Eski 'createWorldTerrain' yerine modern yöntem kullanılıyor.
    terrain: Cesium.Terrain.fromWorldTerrain(), 
    
    // Gereksiz araçları kapat (Temiz ekran)
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    animation: false,
    navigationHelpButton: false,
    fullscreenButton: false
});

// 3. Google Photorealistic 3D Tiles (Gerçek Şehir) Yükle
async function loadRealCity() {
    try {
        console.log("Google 3D Tiles Yükleniyor...");
        
        // Google Photorealistic 3D Tiles Asset ID: 2275207
        const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(2275207);
        
        viewer.scene.primitives.add(tileset);
        
        // Başlangıç Noktasına Git (NYC)
        flyToDrone();

    } catch (error) {
        console.log("HATA: 3D Tiles yüklenemedi.", error);
    }
}

// Fonksiyonu çalıştır
loadRealCity();

// --- KAMERA AYARLARI ---

// DRONE MODU (Kuşbakışı)
window.flyToDrone = function() {
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-73.9857, 40.7484, 1000), // 1000m yüksek
        orientation: {
            heading: Cesium.Math.toRadians(0.0),
            pitch: Cesium.Math.toRadians(-45.0), // 45 derece aşağı
            roll: 0.0
        },
        duration: 2
    });
};

// STREET MODU (Sokak Arası)
window.flyToStreet = function() {
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-73.985428, 40.748817, 200), // 200m (Binaların arası)
        orientation: {
            heading: Cesium.Math.toRadians(200.0),
            pitch: Cesium.Math.toRadians(-10.0), // Hafif karşıya bak
            roll: 0.0
        },
        duration: 2
    });
};

// Işıklandırma (Daha gerçekçi görünmesi için)
viewer.scene.globe.enableLighting = true;