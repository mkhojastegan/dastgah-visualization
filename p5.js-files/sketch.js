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
let stars = [];

// AUDIO ENGINE VARIABLES
let osc1, osc2;           // Sound generators
let envelope;             // Sound's volume
let audioStarted = false;

const semitoneMap = {
    "P1": 0, "A1": 1, "m2": 1, "d2": 0,
    "M2": 2, "A2": 3, "d3": 2,
    "m3": 3, "M3": 4, "d4": 4,
    "P4": 5, "A4": 6,
    "d5": 6, "P5": 7, "A5": 8,
    "m6": 8, "M6": 9,
    "d7": 9, "m7": 10, "M7": 11
};

function setup() {
    createCanvas(600, 600, WEBGL);

    dastgahSelector = select('#dastgahSelector');

    const dastgahIds = Object.keys(fullData).sort();
    for (const id of dastgahIds) {
        dastgahSelector.option(id);
    }

    currentDastgahId = dastgahIds[0];
    dastgahSelector.changed(changeDastgah); // When user selects new option

    // Create starfield
    for (let i = 0; i < 500; i++) {
        stars.push(createVector(random(-1000, 1000), random(-1000, 1000), random(-1000, 1000)));
    }

    envelope = new p5.Env(0.01, 0.5, 0.1, 0.2); // "Pluck" sound
    osc1 = new p5.Oscillator('sine');
    osc2 = new p5.Oscillator('sine');

    osc1.amp(envelope);
    osc2.amp(envelope);

    initializeGalaxy();
}

function draw() {
    background(10, 10, 20); // "Space blue"

    // Add camera controls
    orbitControl();

    // Draw atmosphere
    stroke(255);
    strokeWeight(1.5);
    for (const star of stars) {
        point(star.x, star.y, star.z);
    }

    // Add lighting
    ambientLight(100);
    pointLight(255, 255, 255, 200, 200, 200);

    // Slow orbiting effect
    angleOffset += 0.005;

    // Draw 3D Planets

    // Calculate (x, y) position of each planet
    for (const planet of processedData) {
        planet.currentSize = lerp(planet.currentSize, planet.targetSize, 0.05);

        push();
        const totalAngle = planet.angle + angleOffset;
        rotateY(totalAngle);
        translate(orbitRadius, 0, 0);

        noStroke();
        specularMaterial(150, 180, 255);
        shininess(50);
        sphere(planet.currentSize / 2);
        pop();
    }

}

// Automatically called by p5.js whenever mouse is clicked
function mousePressed() {
    // Unlock sound on first click, for browsers
    if (!audioStarted) {
        userStartAudio();
        audioStarted = true;
        osc1.start();
        osc2.start();
    }
}

function playInterval(intervalName) {
    const baseFreq = 261.63; // Middle C
    const semitones = semitoneMap[intervalName];

    if (semitones === undefined) {
        return;
    }

    // Calculate the frequency of the second note with
    // equal temperament formula.
    const secondFreq = baseFreq * Math.pow(2, semitones / 12);
    osc1.freq(baseFreq);
    osc2.freq(secondFreq);

    envelope.play();
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


