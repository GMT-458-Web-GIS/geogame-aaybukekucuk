# ☣️ QuarantineRush: GMT458 GeoGame Project

**Course:** GMT458 - Web GIS  
**Project:** QuarantineRush (A 3D Real-Time Geospatial Game) 

---

## 1. Project Aim & Concept

**QuarantineRush** is a fast-paced, 3D interactive GeoGame developed for the GMT458 Web GIS assignment. The game is built on a photorealistic 3D model of New York City.

The player acts as a crisis manager during a viral outbreak. The objective is to monitor the city from a 3D perspective, identify infected taxis (Red Boxes), and "cure" them by deploying a quarantine buffer before the time runs out or the infection overwhelms the city.

## 2. Game Mechanics & Design (Answers to Assignment Questions)

This section directly answers the questions specified in the assignment objectives.

### ▪️ How the game will progress? (Difficulty & Progression)

The game's progression is based on **Time, Levels, and Score**.

* **Time (Temporal Component):** The game starts with **60 seconds**. The player must achieve the highest score possible. As the player levels up, they receive a small time bonus to extend the game.
* **Difficulty (Levels):** The game's difficulty increases with each level:
    * **Level 1 (Target: 1000 Pts):** Slow taxis, low infection spawn rate.
    * **Level 2 (Target: 3000 Pts):** Taxis move faster.
    * **Level 3+ (Progressive Target):** The score required for the next level increases, taxis get even faster, infection spawn rates increase, and the **quarantine buffer radius shrinks**, forcing the player to be more precise.
* **Scoring:** Players get +100 points for each cured taxi. The score is multiplied based on a **"Combo" system** (curing multiple taxis in quick succession).

### ▪️ How many questions will there be?

This is a real-time strategy game, not a quiz. There are no "questions." The **task is continuous**: the player must react to an unlimited number of randomly spawning infected taxis until the game ends (either by running out of time or lives).

### ▪️ How many lives, if any, does a user have?

Yes, the player has **3 Immunity Lives (☣️)**. A life is lost in two ways:

1.  **Negligence:** If the total number of infected taxis on the map exceeds a critical threshold (e.g., 40).
2.  **Mistakes:** If the player deploys a quarantine buffer incorrectly 2 times (hitting an empty area or *only* healthy taxis). This punishes random clicking and forces spatial precision.

---

## 3. Tech Stack (Bonus Point Libraries)

This project explores advanced JavaScript libraries beyond Leaflet/OpenLayers to meet the **bonus** criteria:

* ### 1. CesiumJS (Advanced Geovisualisation)
    * This is the **core 3D engine** of the game.
    * It renders Google's **Photorealistic 3D Tiles** of New York City.
    * It manages all 3D game objects (taxis as `Box` entities, quarantine zones as `Cylinder` entities) in a real-world geographic coordinate system.

* ### 2. Turf.js (Data Analysis Package)
    * This is the "Geo" in the GeoGame. It performs all real-time spatial analysis.
    * When the player clicks, **`turf.distance()`** is used to calculate the distance between the quarantine buffer's center and every taxi on the map.
    * It instantly determines which taxis are "inside" the buffer, which is a classic **Point-in-Polygon (Buffer)** analysis.

* ### 3. Chart.js (Data Analysis Package)
    * This provides real-time statistical visualization.
    * A **Stacked Area Chart** on the HUD (Heads-Up Display) dynamically plots the **Healthy vs. Infected** taxi population, giving the player immediate feedback on their performance.

---

## 4. Data Source (NYC Taxi Data)

The assignment requirement to `Explore NYC taxi data` is met by simulating taxi movement patterns based on real-world NYC hotspots. The `sim_data.js` file generates randomized routes between key locations (Times Square, Wall Street, Central Park, etc.) to mimic the behavior of a live taxi fleet.

## 5. Frontend Layout & Sketch

The frontend is designed as a clean, futuristic "Crisis HUD" overlaying the 3D map.

* **Top-Center Panel:** Contains critical game stats (Lives, Time, Level, Score).
* **Bottom-Center Panel:** Contains the live `Chart.js` graph and status messages (e.g., "COMBO!", "LIFE LOST!").
* **Top-Right Panel:** Camera controls (Drone View / Street View).

### Layout Sketch

*(A screenshot of the game running, showing the HUD elements and 3D taxis, fulfills this requirement.)*

![Game Layout Screenshot]([BURAYA OYUNUN EKRAN GÖRÜNTÜSÜNÜ EKLE])