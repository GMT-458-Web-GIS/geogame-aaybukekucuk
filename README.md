# ☣️ QuarantineRush: GMT458 Advanced GeoGame Project

**Author:** [Senin Adın/Numaran]  
**Course:** GMT458 - Web GIS

**Live Demo (GitHub Pages):** [**https://GMT-458-Web-GIS.github.io/geogame-aaybukekucuk/**](https://GMT-458-Web-GIS.github.io/geogame-aaybukekucuk/)

---

## 1. Project Aim & Concept

This project is an advanced 3D interactive GeoGame developed to meet the requirements of the GMT458 assignment.

**`QuarantineRush`** is a high-stakes, time-based survival game. The player acts as a crisis manager in New York City, tasked with stopping a rapidly spreading virus that infects the city's taxi fleet.

Using a 3D photorealistic map, the player must identify infected taxis (Red Boxes) and deploy "Quarantine Buffers" (Green Cylinders) to cure them. The goal is to achieve the highest score possible by curing taxis, surviving for 60 seconds, and managing limited lives and resources.

## 2. Design of the GeoGame (Answers to Assignment Questions)

This section directly addresses the core questions from the assignment brief.

### ▪️ How the game will progress?
The game progresses based on a dynamic **Level and Score System** built to challenge the player.

1.  **Time-Based:** The core game loop is a **60-second** sprint. The player's score determines their progression.
2.  **Levels (Difficulty):** The game is not just one minute; it's a "complete as many tasks as possible" challenge.
    * **Level 1 Target:** 1000 Points.
    * **Level 2 Target:** 3000 Points (Requires +2000 more).
    * **Level 3 Target:** 6000 Points (Requires +3000 more).
    * The score required to level up increases progressively.
3.  **Difficulty Scaling:** As the player levels up:
    * Infected taxis spawn **more frequently**.
    * All taxis (especially infected ones) move **faster**.
    * The player's quarantine buffer **shrinks**, requiring higher precision.
    * The player receives a small **time bonus** as a reward.

### ▪️ How many questions will there be?
This is a real-time strategy game, not a quiz. There are no static "questions." The **tasks are the dynamically spawning infected taxis**. The number of tasks is unlimited; the challenge is to cure as many as possible within the time and life limits.

### ▪️ How many lives, if any, does a user have?
Yes, the player has **3 Immunity Lives (☣️)**. This makes the game challenging and punishes careless clicking. A life is lost in two ways:

1.  **Mistake Penalty:** If the player clicks incorrectly 2 times (hitting an empty area OR a healthy-only zone), they lose 1 life.
2.  **Infection Overload:** If the player ignores the virus and the number of infected taxis on the map exceeds a critical threshold (40+), they are penalized 1 life.

---

## 3. Technology Stack & Bonus Point Justification

This project fully embraces the "advanced packages" objective for **bonus points**.

### ▪️ Which JS library are you planning to use?

* **HTML5, CSS3, JavaScript (ES6+):** The foundation of the project.
* **CesiumJS (Advanced Geovisualisation - BONUS):** This is the game's 3D engine. Instead of Leaflet/OpenLayers, we use Cesium to render Google's **Photorealistic 3D Tiles** of NYC. It also renders all game objects (taxis, cylinders) in a real-world 3D coordinate system.
* **Turf.js (Data Analysis Package - BONUS):** This is the "Geo" brain of the game. When the player clicks, `Turf.js` performs a real-time **geospatial analysis** (`turf.distance()`) to calculate which taxis are inside the quarantine buffer. This is a core "Point-in-Polygon" operation.
* **Chart.js (Data Analysis Package - BONUS):** The HUD features a live-updating **Stacked Area Chart**. This chart visualizes the real-time ratio of Healthy vs. Infected taxis, providing critical statistical feedback to the player.

### ▪️ Explore NYC taxi data.
Yes. The `sim_data.js` file creates a **procedural simulation based on real-world NYC taxi data patterns**. Taxis are spawned at and routed between known hotspots (Times Square, Central Park, Wall Street, etc.) to mimic realistic city traffic.

---

## 4. Frontend Layout & Sketch

The layout is a futuristic "Heads-Up Display (HUD)" designed for instant readability.

* **Top Panel:** Displays critical stats (Lives ☣️, Time, Level, Score).
* **Bottom Panel:** Shows the `Chart.js` live infection graph and status messages (e.g., "🔥 COMBO!", "💔 LIFE LOST!").
* **Camera Controls:** Allows switching between "Drone View" and "Street View".

### Screenshot (Layout Sketch)
*(This screenshot fulfills the "drawings or sketches" requirement)*

![QuarantineRush HUD and 3D Gameplay]([BURAYA OYUNUN EKRAN GÖRÜNTÜSÜNÜ EKLE])

---

## 5. Promo Video

A promotional video demonstrating the 3D graphics, advanced analysis features, and fast-paced gameplay has been prepared.

*(Buraya videoyu yükledikten sonra linki koyacaksın)*
[**Click here to watch the QuarantineRush Gameplay Demo Video**](https://youtu.be/Dzlzh6Tgex0)

---

## 6. Project Management (Git Usage)
Regular commits were made to the repository to track design and implementation phases, fulfilling the "Regular use of Git" requirement.