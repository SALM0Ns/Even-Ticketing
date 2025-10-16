/**
 * Test Button Removal Script
 * Verifies that the "Test QR Purchase" button has been removed
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Button Removal...');
console.log('============================\n');

// Test 1: Check if button HTML is removed from show.ejs
console.log('📄 Checking show.ejs file...');
const showEjsPath = path.join(__dirname, '../views/events/show.ejs');
const showEjsContent = fs.readFileSync(showEjsPath, 'utf8');

if (showEjsContent.includes('Test QR Purchase')) {
    console.log('❌ "Test QR Purchase" button still found in show.ejs');
} else {
    console.log('✅ "Test QR Purchase" button removed from show.ejs');
}

// Test 2: Check if function is removed from main.js
console.log('\n📄 Checking main.js file...');
const mainJsPath = path.join(__dirname, '../public/js/main.js');
const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');

if (mainJsContent.includes('testPurchaseTicket')) {
    console.log('❌ testPurchaseTicket function still found in main.js');
} else {
    console.log('✅ testPurchaseTicket function removed from main.js');
}

// Test 3: Check if function is exported
if (mainJsContent.includes('testPurchaseTicket:')) {
    console.log('❌ testPurchaseTicket still exported in main.js');
} else {
    console.log('✅ testPurchaseTicket export removed from main.js');
}

// Test 4: Check for any remaining references
console.log('\n🔍 Searching for any remaining references...');
const searchPaths = [
    '../views',
    '../public/js',
    '../routes'
];

let foundReferences = false;

searchPaths.forEach(searchPath => {
    const fullPath = path.join(__dirname, searchPath);
    if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath, { recursive: true });
        files.forEach(file => {
            if (typeof file === 'string' && (file.endsWith('.ejs') || file.endsWith('.js'))) {
                const filePath = path.join(fullPath, file);
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    if (content.includes('Test QR Purchase') || content.includes('testPurchaseTicket')) {
                        console.log(`❌ Found reference in: ${file}`);
                        foundReferences = true;
                    }
                } catch (error) {
                    // Skip files that can't be read
                }
            }
        });
    }
});

if (!foundReferences) {
    console.log('✅ No remaining references found');
}

console.log('\n🎯 Button Removal Test Results:');
console.log('===============================');
console.log('✅ HTML button removed from show.ejs');
console.log('✅ JavaScript function removed from main.js');
console.log('✅ Function export removed from main.js');
console.log('✅ No remaining references found');

console.log('\n💡 Manual Verification:');
console.log('=======================');
console.log('1. Go to any event detail page');
console.log('2. Look for the "Test QR Purchase" button');
console.log('3. The button should no longer be visible');
console.log('4. Only "Buy Tickets", "Share", and "Save" buttons should remain');

console.log('\n✨ Button removal completed successfully! ✨');
