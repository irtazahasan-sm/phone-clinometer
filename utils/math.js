/**
 * Calculate the height of an object using clinometer principles
 * @param {number} baseAngle - The angle measured at the base/ground level (in degrees)
 * @param {number} topAngle - The angle measured when pointing at the top of the object (in degrees) 
 * @param {number} distance - The horizontal distance to the object (in feet)
 * @param {number} eyeHeight - The height of the observer's eye level (in feet, default 5.5)
 * @returns {number} The calculated height of the object in feet
 */
export function calculateHeight(baseAngle, topAngle, distance, eyeHeight = 5.5) {
    // Calculate the elevation angle (difference between top and base measurements)
    const elevationAngle = topAngle - baseAngle;
    
    // Convert degrees to radians for trigonometric calculation
    const angleRadians = elevationAngle * (Math.PI / 180);
    
    // Use trigonometry: height = tan(angle) * distance + eye_height
    const height = Math.tan(angleRadians) * distance + eyeHeight;
    
    return height;
}
