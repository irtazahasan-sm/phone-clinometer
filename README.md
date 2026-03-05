## Full File Structure

```
accelerometer-clinometer/
│
├── index.html          ← Main entry point (UI structure)
├── style.css           ← All visual styling
├── app.js              ← All JavaScript logic
│
├── /utils
│   └── math.js         ← Height calculation formula (isolated)
│
└── /tests
    └── math.test.js    ← Unit tests for the calculation logic
```

***

## What Goes in Each File

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

***

## Why This Structure Works

Think of it like **Meadows' stocks and flows** — each file is a clearly bounded stock with defined inputs and outputs. `app.js` *reads* the sensor and *calls* `math.js`. `math.js` *returns* a number to `app.js`. `index.html` *displays* what `app.js` sends it. Nothing bleeds across boundaries, which makes debugging straightforward and testing clean.