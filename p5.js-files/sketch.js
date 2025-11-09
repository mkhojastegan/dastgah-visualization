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
let hoveredPlanet = null;

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

    cursor(ARROW); // Assuming we aren't hovered over something
    hoveredPlanet = null;

    // Calculate (x, y) position of each planet
    for (const planet of processedData) {
        const totalAngle = planet.angle + angleOffset;
        const planetScreenX = width / 2 + cos(totalAngle) * orbitRadius;
        const planetScreenY = height / 2 + sin(totalAngle) * orbitRadius;

        // Distance between mouse and planet
        const distance = dist(mouseX, mouseY, planetScreenX, planetScreenY);

        // If the distance is less than half the planet's size, you're hovering
        if (distance < planet.currentSize / 2) {
            hoveredPlanet = planet;
            cursor(HAND);
            break;
        }

    }

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
        let currentStrokeWeight = 1;

        push();
        rotate(planet.angle + angleOffset);
        const x = orbitRadius;
        const y = 0;

        // Draw the planet
        if (planet === hoveredPlanet) {
            fill(255, 255, 100, 220); // Bright yellow
            stroke(255);
            currentStrokeWeight = 2;
        } else {
            fill(150, 180, 255, 200);
            stroke(255);
        }

        strokeWeight(currentStrokeWeight);
        ellipse(x, y, planet.currentSize, planet.currentSize);

        // Draw the planet's label
        fill(255);
        noStroke();
        textSize(14);
        const textOffset = planet.currentSize / 2 + (currentStrokeWeight / 2) + 10;
        text(planet.name, x + textOffset, y); // Place text next to planet

        pop();
    }

    // Draw tooltip
    if (hoveredPlanet) {
        resetMatrix();
        const rawCount = fullData[currentDastgahId][hoveredPlanet.name];
        const tooltipText = `${hoveredPlanet.name}\nRaw Count: ${rawCount}`;

        textSize(14);
        const textPadding = 10;
        const textW = textWidth(tooltipText) + textPadding;
        const textH = 40;
        const tooltipX = mouseX + 12;
        const tooltipY = mouseY + 12;

        noStroke();
        fill(0, 0, 0, 200);
        rect(tooltipX, tooltipY, textW, textH, 5);
        fill(255);
        textAlign(LEFT, TOP);
        text(tooltipText, tooltipX + textPadding / 2, tooltipY + textPadding / 2);
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


