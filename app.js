import { calculateHeight } from './utils/math.js';

// Application state
let currentGamma = 0;
let baseAngle = null;
let topAngle = null;
let isListening = false;

// DOM elements
const elements = {
    liveAngle: document.getElementById('live-angle'),
    btnBase: document.getElementById('btn-base'),
    btnTop: document.getElementById('btn-top'),
    distance: document.getElementById('distance'),
    status: document.getElementById('status'),
    result: document.getElementById('result')
};

/**
 * Start listening to device orientation events
 */
function startListening() {
    if (isListening) return;
    
    window.addEventListener('deviceorientation', handleOrientationChange);
    isListening = true;
    updateStatus('Listening for tilt changes...');
}

/**
 * Handle device orientation changes
 * @param {DeviceOrientationEvent} event 
 */
function handleOrientationChange(event) {
    // Use gamma for tilt (left/right rotation when phone is held vertically)
    currentGamma = event.gamma || 0;
    
    // Update live angle display
    elements.liveAngle.textContent = `Tilt angle: ${currentGamma.toFixed(1)}°`;
}

/**
 * Request permission for device orientation (iOS 13+)
 */
async function requestPermission() {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === 'granted') {
                startListening();
                return true;
            } else {
                updateStatus('Permission denied. Cannot access device orientation.');
                return false;
            }
        } catch (error) {
            updateStatus('Error requesting permission: ' + error.message);
            return false;
        }
    } else {
        // Android and older iOS don't need permission
        startListening();
        return true;
    }
}

/**
 * Record the base angle measurement
 */
function recordBaseAngle() {
    if (!isListening) {
        updateStatus('Please start the sensor first by clicking "Record Base Angle"');
        return;
    }
    
    baseAngle = currentGamma;
    updateStatus(`Base angle recorded: ${baseAngle.toFixed(1)}°`);
    
    // Enable the top angle button
    elements.btnTop.disabled = false;
    elements.btnBase.textContent = 'Update Base Angle';
}

/**
 * Record the top angle measurement and calculate height
 */
function recordTopAngle() {
    if (baseAngle === null) {
        updateStatus('Please record base angle first!');
        return;
    }
    
    topAngle = currentGamma;
    updateStatus(`Top angle recorded: ${topAngle.toFixed(1)}°`);
    
    // Calculate height immediately
    calculateAndDisplayHeight();
}

/**
 * Calculate the height and display the result
 */
function calculateAndDisplayHeight() {
    if (baseAngle === null || topAngle === null) {
        updateStatus('Both base and top angles are required!');
        return;
    }
    
    const distance = parseFloat(elements.distance.value);
    
    if (!distance || distance <= 0) {
        updateStatus('Please enter a valid distance!');
        elements.distance.focus();
        return;
    }
    
    try {
        const height = calculateHeight(baseAngle, topAngle, distance);
        elements.result.textContent = `Height: ${height.toFixed(1)} ft`;
        updateStatus('Calculation complete!');
    } catch (error) {
        updateStatus('Calculation error: ' + error.message);
    }
}

/**
 * Update the status display
 * @param {string} message 
 */
function updateStatus(message) {
    elements.status.textContent = message;
}

/**
 * Reset all measurements
 */
function resetMeasurements() {
    baseAngle = null;
    topAngle = null;
    elements.btnTop.disabled = true;
    elements.btnBase.textContent = 'Record Base Angle';
    elements.result.textContent = 'Height will appear here';
    updateStatus('Ready to start new measurement');
}

// Event listeners
elements.btnBase.addEventListener('click', async () => {
    if (!isListening) {
        const granted = await requestPermission();
        if (granted) {
            recordBaseAngle();
        }
    } else {
        recordBaseAngle();
    }
});

elements.btnTop.addEventListener('click', recordTopAngle);

// Allow Enter key to trigger calculation
elements.distance.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && baseAngle !== null && topAngle !== null) {
        calculateAndDisplayHeight();
    }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    elements.btnTop.disabled = true;
    updateStatus('Click "Record Base Angle" to start');
    
    // Add reset functionality (double-tap result to reset)
    let lastTap = 0;
    elements.result.addEventListener('click', () => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 500 && tapLength > 0) {
            resetMeasurements();
        }
        lastTap = currentTime;
    });
});
