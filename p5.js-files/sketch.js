// TO BE REPLACED IN WEB EDITOR

// CONFIGURATION
const orbitRadius = 200;  // How far planets are from the center
const minPlanetSize = 10; // The size of the least common interval
const maxPlanetSize = 80  // The size of the most common interval

// GLOBAL VARIABLES
let dastgahSelector;
let currentDastgahId;
let processedData = [];
let angleOffset = 0;      // Global offset of entire galaxy

function setup() {
    createCanvas(600, 600);

    dastgahSelector = select('#dastgahSelector');

    const dastgahIds = Object.keys(fullData).sort();
    for (const id of dastgahIds) {
        dastgahSelector.option(id);
    }

    currentDastgahId = dastgahIds[0];
    dastgahSelector.changed(changeDastgah); // When user selects new option
    initializeGalaxy();
}

function draw() {
    background(20, 20, 30);

    // Slow orbiting effect
    angleOffset += 0.005;

    // Draw the Center Star (Dastgah Name)
    fill(255, 220, 150);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(40);
    text(currentDastgahId, width / 2, height / 2); // Draw text in the middle

    // Draw the orbiting planets
    translate(width / 2, height / 2);

    for (const planet of processedData) {
        // Smooth transition for planet size
        planet.currentSize = lerp(planet.currentSize, planet.targetSize, 0.05);

        push();
        rotate(planet.angle + angleOffset);
        const x = orbitRadius;
        const y = 0;

        // Draw the planet
        fill(150, 180, 255, 200);
        stroke(255);
        ellipse(x, y, planet.currentSize, planet.currentSize);

        // Draw the planet's label
        fill(255);
        noStroke();
        textSize(14);
        text(planet.name, x + planet.currentSize / 2 + 10, y); // Place text next to planet

        pop();
    }
}

// Event handler for dropdown menu
function changeDastgah() {
    currentDastgahId = dastgahSelector.value();
    recalculateGalaxy();
}

// Creates the planet objects but sets their initial size to 0.
function initializeGalaxy() {
    const intervals = fullData[currentDastgahId];
    const totalIntervals = Object.keys(intervals).length;
    let index = 0;
    for (const intervalName in intervals) {
        processedData.push({
            name: intervalName,
            angle: map(index, 0, totalIntervals, 0, TWO_PI),
            currentSize: 0,
            targetSize: 0 // Until calculated
        });
        index++;
    }
    recalculateGalaxy();
}

function recalculateGalaxy() {
    const intervals = fullData[currentDastgahId];

    let maxCount = 0;
    for (const interval in intervals) {
        if (intervals[interval] > maxCount) {
            maxCount = intervals[interval];
        }
    }

    // Update each planets targetSize
    for(const planet of processedData) {
        const count = intervals[planet.name] || 0;
        planet.targetSize = map(count, 0, maxCount, minPlanetSize, maxPlanetSize);
    }
}


