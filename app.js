import { calculateHeight } from './utils/math.js';

// Application state
let currentGamma = 0;
let baseAngle = null;
let topAngle = null;
let isListening = false;
let cameraStream = null;

// DOM elements
const elements = {
    liveAngle: document.getElementById('live-angle'),
    liveAngleFallback: document.getElementById('live-angle-fallback'),
    btnBase: document.getElementById('btn-base'),
    btnTop: document.getElementById('btn-top'),
    btnNext1: document.getElementById('btn-next-1'),
    btnMeasureAgain: document.getElementById('btn-measure-again'),
    distance: document.getElementById('distance'),
    userHeight: document.getElementById('user-height'),
    status: document.getElementById('status'),
    result: document.getElementById('result'),
    viewfinder: document.getElementById('viewfinder'),
    angleFallback: document.getElementById('angle-fallback'),
    camera: document.getElementById('camera'),
    stepIndicator: document.getElementById('step-indicator'),
    completedSteps: document.getElementById('completed-steps'),
    step1: document.getElementById('step-1'),
    step2: document.getElementById('step-2'),
    step3: document.getElementById('step-3'),
    stepResult: document.getElementById('step-result'),
};

/**
 * Navigate to a step (1, 2, 3, or 'result')
 */
function goToStep(step) {
    // Hide all step sections
    for (const s of [elements.step1, elements.step2, elements.step3, elements.stepResult]) {
        s.classList.remove('active');
    }

    // Update step indicator
    if (step === 'result') {
        elements.stepIndicator.classList.add('hidden');
    } else {
        elements.stepIndicator.classList.remove('hidden');
        elements.stepIndicator.textContent = `Step ${step} of 3`;
    }

    // Show/hide viewfinder for angle-recording steps
    if (step === 2 || step === 3) {
        if (cameraStream) {
            elements.viewfinder.classList.remove('hidden');
            elements.angleFallback.classList.add('hidden');
        } else {
            elements.viewfinder.classList.add('hidden');
            elements.angleFallback.classList.remove('hidden');
        }
    } else {
        elements.viewfinder.classList.add('hidden');
        elements.angleFallback.classList.add('hidden');
    }

    // Activate the target step
    const stepEl = { 1: elements.step1, 2: elements.step2, 3: elements.step3, result: elements.stepResult }[step];
    stepEl.classList.add('active');

    if (step === 1) {
        elements.distance.focus();
    } else if (step === 'result') {
        stopCamera();
    }
}

/**
 * Add a completed-step summary pill
 */
function addPill(stepNumber, label, value, onEdit) {
    const pill = document.createElement('div');
    pill.classList.add('step-pill');
    pill.dataset.step = stepNumber;

    pill.innerHTML = `
        <span class="pill-label">${label}</span>
        <span class="pill-value">${value}</span>
    `;

    const editBtn = document.createElement('button');
    editBtn.classList.add('pill-edit');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', onEdit);
    pill.appendChild(editBtn);

    elements.completedSteps.appendChild(pill);
}

/**
 * Remove pills from a given step onward
 */
function clearPillsFrom(stepNumber) {
    for (const pill of [...elements.completedSteps.querySelectorAll('.step-pill')]) {
        if (parseInt(pill.dataset.step) >= stepNumber) {
            pill.remove();
        }
    }
}

/**
 * Start the rear camera and show the viewfinder
 */
async function startCamera() {
    if (cameraStream) return;

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        elements.camera.srcObject = cameraStream;
        elements.viewfinder.classList.remove('hidden');
        elements.angleFallback.classList.add('hidden');
    } catch {
        // Camera unavailable — keep the fallback angle display
        elements.viewfinder.classList.add('hidden');
        elements.angleFallback.classList.remove('hidden');
    }
}

/**
 * Stop the camera and hide the viewfinder
 */
function stopCamera() {
    if (!cameraStream) return;

    for (const track of cameraStream.getTracks()) {
        track.stop();
    }
    cameraStream = null;
    elements.camera.srcObject = null;
    elements.viewfinder.classList.add('hidden');
    elements.angleFallback.classList.add('hidden');
}

/**
 * Start listening to device orientation events
 */
function startListening() {
    if (isListening) return;

    window.addEventListener('deviceorientation', handleOrientationChange);
    isListening = true;
}

/**
 * Handle device orientation changes
 */
function handleOrientationChange(event) {
    currentGamma = event.gamma || 0;

    const text = `Tilt angle: ${currentGamma.toFixed(1)}\u00B0`;
    elements.liveAngle.textContent = text;
    elements.liveAngleFallback.textContent = text;
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
        startListening();
        return true;
    }
}

/**
 * Calculate the height and display the result
 */
function calculateAndDisplayHeight() {
    const distance = parseFloat(elements.distance.value);
    if (!distance || distance <= 0 || baseAngle === null || topAngle === null) {
        updateStatus('Missing data. Please restart the measurement.');
        return;
    }

    try {
        const eyeHeight = parseFloat(elements.userHeight.value) - 0.5;
        const heightFt = calculateHeight(baseAngle, topAngle, distance, eyeHeight);
        const heightM = heightFt * 0.3048;
        elements.result.textContent = `Height: ${heightFt.toFixed(1)} ft (${heightM.toFixed(1)} m)`;
        updateStatus('');
    } catch (error) {
        updateStatus('Calculation error: ' + error.message);
    }
}

/**
 * Update the status display
 */
function updateStatus(message) {
    elements.status.textContent = message;
}

/**
 * Reset all state and go back to step 1
 */
function resetMeasurements() {
    baseAngle = null;
    topAngle = null;
    elements.distance.value = '';
    elements.result.textContent = '';
    elements.completedSteps.innerHTML = '';
    stopCamera();
    goToStep(1);
    updateStatus('');
}

// --- Event listeners ---

// Step 1: Next
elements.btnNext1.addEventListener('click', async () => {
    const distance = parseFloat(elements.distance.value);
    if (!distance || distance <= 0) {
        updateStatus('Please enter a valid distance.');
        elements.distance.focus();
        return;
    }

    const userHeight = parseFloat(elements.userHeight.value);
    if (!userHeight || userHeight <= 0) {
        updateStatus('Please enter your height.');
        elements.userHeight.focus();
        return;
    }

    // Remember height for next time
    localStorage.setItem('clinometer-user-height', userHeight);

    if (!isListening) {
        const granted = await requestPermission();
        if (!granted) return;
    }

    await startCamera();

    addPill(1, 'Distance', `${distance} ft`, () => {
        clearPillsFrom(1);
        baseAngle = null;
        topAngle = null;
        goToStep(1);
    });

    addPill(1, 'Your height', `${userHeight} ft`, () => {
        clearPillsFrom(1);
        baseAngle = null;
        topAngle = null;
        goToStep(1);
    });

    goToStep(2);
    updateStatus('');
});

// Step 1: Enter key advances
elements.distance.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        elements.btnNext1.click();
    }
});

// Step 2: Record base angle
elements.btnBase.addEventListener('click', () => {
    baseAngle = currentGamma;

    addPill(2, 'Base angle', `${baseAngle.toFixed(1)}\u00B0`, async () => {
        clearPillsFrom(2);
        baseAngle = null;
        topAngle = null;
        await startCamera();
        goToStep(2);
        updateStatus('');
    });

    goToStep(3);
    updateStatus('');
});

// Step 3: Record top angle
elements.btnTop.addEventListener('click', () => {
    topAngle = currentGamma;

    addPill(3, 'Top angle', `${topAngle.toFixed(1)}\u00B0`, async () => {
        clearPillsFrom(3);
        topAngle = null;
        await startCamera();
        goToStep(3);
        updateStatus('');
    });

    stopCamera();
    calculateAndDisplayHeight();
    goToStep('result');
});

// Result: Measure again
elements.btnMeasureAgain.addEventListener('click', resetMeasurements);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const savedHeight = localStorage.getItem('clinometer-user-height');
    if (savedHeight) {
        elements.userHeight.value = savedHeight;
    }
    goToStep(1);
    updateStatus('');
});
