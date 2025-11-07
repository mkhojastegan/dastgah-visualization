// TO BE REPLACED IN WEB EDITOR

// CONFIGURATION
const orbitRadius = 200; // How far planets are from the center
const minPlanetSize = 10; // The size of the least common interval
const maxPlanetSize = 80 // The size of the most common interval

// GLOBAL VARIABLES
let dastgahSelector;
let currentDastgahId;
let processedData = [];

function setup() {
    createCanvas(600, 600);

    dastgahSelector = select('#dastgahSelector');

    const dastgahIds = Object.keys(fullData).sort();

    for (const id of dastgahIds) {
        dastgahSelector.option(id);
    }

    currentDastgahId = dastgahIds[0];
    dastgahSelector.changed(changeDastgah); // When user selects new option
    recalculateGalaxy();
}

function draw() {
    background(20, 20, 30);

    // Draw the Center Star (Dastgah Name)
    fill(255, 220, 150);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(40);
    text(currentDastgahId, width / 2, height / 2); // Draw text in the middle

    // Draw the orbiting planets
    translate(width / 2, height / 2);

    for (const planet of processedData) {
        push();
        rotate(planet.angle);
        const x = orbitRadius;
        const y = 0;

        // Draw the planet
        fill(150, 180, 255, 200);
        stroke(255);
        ellipse(x, y, planet.size, planet.size);

        // Draw the planet's label
        fill(255);
        noStroke();
        textSize(14);
        text(planet.name, x + planet.size / 2 + 10, y); // Place text next to planet

        pop();
    }
}

// Event handler for dropdown menu
function changeDastgah() {
    currentDastgahId = dastgahSelector.value();
    recalculateGalaxy();
}

function recalculateGalaxy() {
    processedData = [];
    const intervals = fullData[currentDastgahId];

    let maxCount = 0;
    for (const interval in intervals) {
        if (intervals[interval] > maxCount) {
            maxCount = intervals[interval];
        }
    }

    let index = 0;
    const totalIntervals = Object.keys(intervals).length;
    for (const intervalName in intervals) {
        const count = intervals[intervalName];
        const planetSize = map(count, 0, maxCount, minPlanetSize, maxPlanetSize);
        const angle = map(index, 0, totalIntervals, 0, TWO_PI);

        processedData.push({
            name: intervalName,
            size: planetSize,
            angle: angle
        });

        index++;
    }
}


