#!/usr/bin/env node

/**
 * Verification script for Issue #523
 * Checks if util._extend deprecation warning appears
 * 
 * This script helps verify whether the deprecated util._extend API
 * is still being used in the application or its dependencies.
 */

const util = require('util');

console.log('=== Issue #523 Verification Script ===\n');
console.log('Checking for util._extend usage...\n');

// Check if util._extend exists
if (util._extend) {
  console.log('⚠️  util._extend is available in this Node.js version');
  console.log(`   Node version: ${process.version}`);
  
  // Test if using it triggers the warning
  console.log('\nTesting if util._extend triggers deprecation warning:');
  const testObj = { a: 1 };
  const extended = util._extend({}, testObj);
  console.log('   Result:', extended);
} else {
  console.log('✅ util._extend is not available (removed in newer Node.js)');
  console.log(`   Node version: ${process.version}`);
}

console.log('\n=== Dependency Check ===');
console.log('To manually check dependencies, run:');
console.log('  Get-ChildItem -Path node_modules -Recurse -Include *.js | Select-String -Pattern "util\\._extend" -List\n');

console.log('=== Recommendation ===');
if (util._extend) {
  console.log('If you see a deprecation warning above, it means:');
  console.log('  1. Some dependency is using util._extend, OR');
  console.log('  2. This test script triggered it (expected)');
  console.log('\nTo identify the source:');
  console.log('  - Run the main application (npm start)');
  console.log('  - If no warning appears, the issue is likely resolved');
} else {
  console.log('✅ This Node.js version has removed util._extend entirely.');
  console.log('   The deprecation issue cannot occur.');
}

console.log('\n=== End of Verification ===\n');
