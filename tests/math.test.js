// Simple test framework for the math calculations
import { calculateHeight } from '../utils/math.js';

// Test results storage
const testResults = [];

/**
 * Simple test assertion function
 * @param {boolean} condition - The condition to test
 * @param {string} message - Test description
 */
function assert(condition, message) {
    const result = {
        passed: condition,
        message: message,
        timestamp: new Date().toISOString()
    };
    testResults.push(result);
    
    if (condition) {
        console.log(`✅ PASS: ${message}`);
    } else {
        console.error(`❌ FAIL: ${message}`);
    }
}

/**
 * Test if two numbers are approximately equal (within tolerance)
 * @param {number} actual 
 * @param {number} expected 
 * @param {number} tolerance 
 * @returns {boolean}
 */
function approximately(actual, expected, tolerance = 0.1) {
    return Math.abs(actual - expected) <= tolerance;
}

/**
 * Run all math calculation tests
 */
function runMathTests() {
    console.log('🧪 Running clinometer math tests...\n');

    // Test 1: Basic calculation - 45 degree angle
    const height1 = calculateHeight(0, 45, 10, 6);
    const expected1 = 10 + 6; // tan(45°) = 1, so height = 1 * 10 + 6 = 16
    assert(
        approximately(height1, expected1, 0.1), 
        `45° angle test: expected ~${expected1}ft, got ${height1.toFixed(2)}ft`
    );

    // Test 2: Zero angle (level measurement)
    const height2 = calculateHeight(0, 0, 50, 5.5);
    const expected2 = 5.5; // tan(0°) = 0, so height = 0 * 50 + 5.5 = 5.5
    assert(
        approximately(height2, expected2, 0.1), 
        `0° angle test: expected ${expected2}ft, got ${height2.toFixed(2)}ft`
    );

    // Test 3: Negative base angle (looking down first, then up)
    const height3 = calculateHeight(-10, 30, 20, 6);
    const elevationAngle = 30 - (-10); // 40 degrees
    const expected3 = Math.tan(elevationAngle * Math.PI / 180) * 20 + 6;
    assert(
        approximately(height3, expected3, 0.1),
        `Negative base angle test: expected ${expected3.toFixed(2)}ft, got ${height3.toFixed(2)}ft`
    );

    // Test 4: Realistic tree measurement scenario
    const height4 = calculateHeight(0, 60, 30, 5.5);
    const expected4 = Math.tan(60 * Math.PI / 180) * 30 + 5.5; // Should be ~57.4ft
    assert(
        approximately(height4, expected4, 0.5),
        `Tree measurement test: expected ${expected4.toFixed(2)}ft, got ${height4.toFixed(2)}ft`
    );

    // Test 5: Custom eye height
    const height5 = calculateHeight(0, 30, 40, 4);
    const expected5 = Math.tan(30 * Math.PI / 180) * 40 + 4;
    assert(
        approximately(height5, expected5, 0.1),
        `Custom eye height test: expected ${expected5.toFixed(2)}ft, got ${height5.toFixed(2)}ft`
    );

    // Test 6: Very small angle (distant object)
    const height6 = calculateHeight(0, 5, 100, 6);
    const expected6 = Math.tan(5 * Math.PI / 180) * 100 + 6; // Should be ~14.7ft
    assert(
        approximately(height6, expected6, 0.1),
        `Small angle test: expected ${expected6.toFixed(2)}ft, got ${height6.toFixed(2)}ft`
    );

    // Summary
    const passed = testResults.filter(r => r.passed).length;
    const total = testResults.length;
    
    console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 All tests passed! The math calculations are working correctly.');
    } else {
        console.log('⚠️ Some tests failed. Please review the calculations.');
    }
    
    return { passed, total, results: testResults };
}

/**
 * Validate input parameters
 */
function runValidationTests() {
    console.log('\n🔍 Running input validation tests...\n');
    
    try {
        // Test with infinity
        const result1 = calculateHeight(0, 90, 10, 6);
        assert(
            !isFinite(result1) || result1 > 1000,
            'Near-vertical angle handling (should be very large or infinite)'
        );
    } catch (error) {
        console.log('⚠️ Note: 90° angle produces infinite result (expected behavior)');
    }
    
    // Test with reasonable extreme values
    const result2 = calculateHeight(-45, 45, 100, 6);
    assert(
        isFinite(result2) && result2 > 0,
        `Large angle range test: got ${result2.toFixed(2)}ft (should be finite and positive)`
    );
    
    console.log('✅ Input validation tests complete');
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
    // Node.js environment
    runMathTests();
    runValidationTests();
} else {
    // Browser environment - expose functions globally
    window.runMathTests = runMathTests;
    window.runValidationTests = runValidationTests;
    
    // Auto-run tests when page loads (only if in test mode)
    if (window.location.search.includes('test=true')) {
        document.addEventListener('DOMContentLoaded', () => {
            runMathTests();
            runValidationTests();
        });
    }
}

export { runMathTests, runValidationTests };
