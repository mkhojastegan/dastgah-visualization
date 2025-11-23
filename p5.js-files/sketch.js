// CONFIGURATION
const orbitRadius = 200;  // How far planets are from the center
const minPlanetSize = 10; // The size of the least common interval
const maxPlanetSize = 80;  // The size of the most common interval

// GLOBAL VARIABLES
let dastgahSelector;
let currentDastgahId;
let processedData = [];
let angleOffset = 0;      // Global offset of entire galaxy
let hoveredPlanet = null;
let stars = [];
let hud;
let pickingGraphics;     // New offscreen buffer for color picking

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

const dastgahNameMap = {
    "D1": "Shur",
    "D2": "Abu’aata",
    "D3": "Zand",
    "D4": "Afshaari",
    "D5": "Dashti",
    "D6": "Bayat-Kord",
    "D7": "Mahur",
    "D8": "Homaayun",
    "D9": "Esfahaan",
    "D10": "Segaah",
    "D11": "Chahaargaah",
    "D12": "Navah",
    "D13": "Raastpanjgaah"
};

const intervalFullNameMap = {
    "P1": "Perfect Unison", "d1": "diminished Unison", "A1": "Augmented Unison",
    "m2": "minor 2nd",      "M2": "Major 2nd",         "A2": "Augmented 2nd",
    "m3": "minor 3rd",      "M3": "Major 3rd",         "d3": "diminished 3rd",
    "P4": "Perfect 4th",    "A4": "Augmented 4th",     "d4": "diminished 4th",
    "P5": "Perfect 5th",    "A5": "Augmented 5th",     "d5": "diminished 5th",
    "m6": "minor 6th",      "M6": "Major 6th",
    "m7": "minor 7th",      "M7": "Major 7th"  
};

function setup() {
    createCanvas(600, 600, WEBGL);
    
    // Create offscreen buffer for color picking
    pickingGraphics = createGraphics(width, height, WEBGL);
    pickingGraphics.noStroke();
    
    hud = createGraphics(width, height);

    dastgahSelector = select('#dastgahSelector');

    const dastgahIds = Object.keys(fullData).sort();

    // Sort for menu
    dastgahIds.sort((a, b) => {
        const numA = parseInt(a.substring(1));
        const numB = parseInt(b.substring(1));
        return numA - numB;
    });

    for (const id of dastgahIds) {
        const name = dastgahNameMap[id] || "";
        const label = `${id} - ${name}`;
        dastgahSelector.option(label, id);
    }

    currentDastgahId = dastgahSelector.value();
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

    // Add camera controls
    orbitControl();

    // Draw to picking buffer (invisible)
    drawPickingScene();

    // Check for hovered planets using color picking
    checkHoverWithPicking();
    
    // Then: Draw main scene
    background(10, 10, 20); // "Space blue"


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
    for (const planet of processedData) {
        planet.currentSize = lerp(planet.currentSize, planet.targetSize, 0.05);

        push();
        const totalAngle = planet.angle + angleOffset;
        rotateY(totalAngle);
        translate(orbitRadius, 0, 0);

        noStroke();

        if (planet === hoveredPlanet) {
            emissiveMaterial(255, 255, 100); // Looks like it's glowing
        } else {
            specularMaterial(150, 180, 255);
            shininess(50);
        }

        sphere(planet.currentSize / 2);
        pop();
    }

    drawHUD();
}

// Draw simplified version of scene to offscreen buffer for picking
function drawPickingScene() {
    pickingGraphics.clear();
    pickingGraphics.background(0); // Black background for "no planet"
    
    // Copy camera state from main canvas
    pickingGraphics.setCamera(_renderer._curCamera);
    
    // Draw each planet with unique color
    for (let i = 0; i < processedData.length; i++) {
        const planet = processedData[i];
        const totalAngle = planet.angle + angleOffset;
        
        pickingGraphics.push();
        pickingGraphics.rotateY(totalAngle);
        pickingGraphics.translate(orbitRadius, 0, 0);
        
        // Assign unique color based on planet index
        const colorValue = i + 1; // Avoid black (0)
        pickingGraphics.fill(colorValue, 0, 0);
        pickingGraphics.sphere(planet.currentSize / 2);
        
        pickingGraphics.pop();
    }
}

// Check hover using color picking buffer
function checkHoverWithPicking() {
    hoveredPlanet = null;
    cursor(ARROW);
    
    // Get color under mouse from picking buffer
    const pixelColor = pickingGraphics.get(mouseX, mouseY);
    
    // Convert red channel to planet index (we stored index+1 in red channel)
    const planetIndex = pixelColor[0] - 1;
    
    if (planetIndex >= 0 && planetIndex < processedData.length) {
        hoveredPlanet = processedData[planetIndex];
        cursor(HAND);
    }
}

// Function to draw the 2D HUD
function drawHUD() {
    hud.clear();

    hud.fill(255, 220, 150);
    hud.noStroke();
    hud.textAlign(CENTER, CENTER);
    hud.textSize(40);
    hud.text(currentDastgahId, width / 2, height / 2);

    if (hoveredPlanet) {
        const shortName = hoveredPlanet.name;
        const fullName = intervalFullNameMap[shortName] || "Unkknown Interval";
        const rawCount = fullData[currentDastgahId][shortName];
        const tooltipText = `${shortName} - ${fullName}\nCount: ${rawCount}`;
        hud.textSize(14);

        const textPadding = 10;
        const textW = hud.textWidth(tooltipText) + textPadding;
        const textH = 45;
        const tooltipX = mouseX + 12;
        const tooltipY = mouseY + 12;

        hud.noStroke();
        hud.fill(0, 0, 0, 200);
        hud.rect(tooltipX, tooltipY, textW, textH, 5);
        hud.fill(255);
        hud.textAlign(LEFT, TOP);
        hud.text(tooltipText, tooltipX + textPadding / 2, tooltipY + textPadding / 2);
    }

    image(hud, -width/2, -height/2);
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

    if (hoveredPlanet) {
        playInterval(hoveredPlanet.name);
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