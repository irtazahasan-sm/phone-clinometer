/**
 * Calculate the height of an object using clinometer principles
 * @param {number} topAngle - The angle measured when pointing at the top of the object (in degrees)
 * @param {number} distance - The horizontal distance to the object (in feet)
 * @param {number} eyeHeight - The height of the observer's eye level (in feet, default 5.5)
 * @returns {number} The calculated height of the object in feet
 */
export function calculateHeight(topAngle, distance, eyeHeight = 5.5) {
    // Convert degrees to radians for trigonometric calculation
    const angleRadians = topAngle * (Math.PI / 180);

    // height above eye level + eye height = total height
    const height = Math.tan(angleRadians) * distance + eyeHeight;

    return height;
}
