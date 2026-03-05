# 📐 Phone Clinometer

A smartphone app that uses your phone's built-in tilt sensors to measure the height of trees, buildings, and other tall objects using trigonometry.

## How to Run the App
Go to https://irtazahasan-sm.github.io/phone-clinometer/ on your phone

## How to Use the Clinometer

### Step-by-Step Instructions

1. **Open the app on your smartphone** (must be on mobile device for sensors)
2. **Allow sensor permissions** when prompted (required for iOS)
3. **Measure your distance** to the target object and enter it in feet
4. **Hold your phone vertically** in portrait mode
5. **Record base angle:**
   - Stand at your measured distance from the object
   - Hold phone at eye level, pointing horizontally at the base of the object
   - Tap "Record Base Angle"
6. **Record top angle:**
   - Without moving your feet, tilt phone up to point at the top of the object
   - Keep your arm in the same position as step 5
   - Tap "Record Top Angle"
7. **Get your result!** The height appears instantly

### Tips for Accurate Measurements

**Distance Measurement:**
- Use a measuring tape, paced steps, or range finder
- More distance = better accuracy (stand back when possible)
- Measure horizontal distance, not diagonal

**Angle Measurement:**
- Hold phone steady in portrait orientation
- Keep your arm extended the same way for both measurements
- Make sure you're pointing at the exact base and top of the object
- Avoid windy conditions that might shake your hand

**Example: Measuring a Tree**
- Stand 50 feet from the tree trunk
- Enter "50" in the distance field
- Point phone at base of trunk → Record Base Angle
- Point phone at top of tree → Record Top Angle  
- Result: "Tree height: 47.3 ft"

**Example: Measuring a Building**
- Stand across the street, measure distance (e.g., 120 feet)
- Enter "120" in distance field
- Point at building foundation → Record Base
- Point at roofline → Record Top
- Result shows building height

### Reset and Retry
- **Double-tap the result** to reset and start a new measurement
- The app remembers your distance between measurements

### ⚠️ Important Notes

- **Must use on a smartphone** - laptops/desktops don't have tilt sensors
- **Works best outdoors** with clear line of sight
- **Accuracy improves with distance** - stand as far back as practical
- **Default eye height is 5.5 feet** - this is added to all calculations

## How It Works

The app uses **clinometer principles** and trigonometry:

1. **Measures two angles** using your phone's gyroscope
2. **Calculates elevation angle** (top angle - base angle)  
3. **Applies trigonometry:** `height = tan(elevation_angle) × distance + eye_height`
4. **Returns total height** of the measured object

---

## Technical Documentation

### File Structure

```
phone-clinometer/
│
├── index.html          ← Main entry point (UI structure)
├── style.css           ← All visual styling
├── app.js              ← All JavaScript logic
├── package.json        ← Project configuration
│
├── /utils
│   └── math.js         ← Height calculation formula (isolated)
│
└── /tests
    └── math.test.js    ← Unit tests for the calculation logic
```

### What Goes in Each File

**`index.html`** — The skeleton. 
- Distance input field
- Live angle display
- "Record Base" and "Record Top" buttons
- Result display div
- Links to `style.css` and `app.js`

**`style.css`** — Visual design only:
- High-contrast colors (important for outdoor sunlight readability)
- Large buttons (easy to tap with one hand while holding phone)
- Readable font sizes for the live angle display

**`app.js`** — The brain. Contains all three logic layers:
- `requestPermission()` — handles iOS sensor access
- `startListening()` — reads `gamma` from `deviceorientation` event
- Button click handlers — stores `baseAngle` and `topAngle`
- Calls `calculateHeight()` from `math.js`

**`/utils/math.js`** — Just the formula, nothing else:

```javascript
export function calculateHeight(baseAngle, topAngle, distance, eyeHeight = 5.5) {
  const theta = (topAngle - baseAngle) * (Math.PI / 180);
  return Math.tan(theta) * distance + eyeHeight;
}
```

**Why isolate this?** Because this is the function you'll test and verify most. Keeping it separate means you can change the UI without ever touching the math, and vice versa. In systems thinking terms, it **decouples two subsystems** that have no reason to be coupled.

**`/tests/math.test.js`** — Verification tests:
- Input known angles and distances, assert expected heights
- This is your **verification step** from the design process — does the math do what you designed it to do?