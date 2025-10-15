const fs = require('fs');
const path = require('path');

console.log('🖼️  Testing poster file accessibility...\n');

const posterFiles = [
    'public/images/chopin-poster.jpg',
    'public/images/beethoven-poster.jpg', 
    'public/images/mozart-poster.jpg',
    'public/images/swan-lake-poster.jpg',
    'public/images/hamilton-poster.jpg',
    'public/images/phantom-poster.jpg',
    'public/images/lionking-poster.jpg',
    'public/images/dune-poster.jpg',
    'public/images/inception-poster.jpg',
    'public/images/killbill-poster.jpg',
    'public/images/oppenheimer-poster.jpg'
];

let allExist = true;

posterFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, '..', filePath);
    const exists = fs.existsSync(fullPath);
    const fileName = path.basename(filePath);
    
    console.log(`${exists ? '✅' : '❌'} ${fileName}: ${exists ? 'EXISTS' : 'MISSING'}`);
    
    if (exists) {
        const stats = fs.statSync(fullPath);
        console.log(`    Size: ${(stats.size / 1024).toFixed(2)} KB`);
    }
    
    if (!exists) {
        allExist = false;
    }
    console.log('');
});

console.log('🎉 Poster file test completed!');
if (allExist) {
    console.log('✅ All poster files exist and are accessible');
    console.log('🔍 The issue might be browser cache or JavaScript fallback');
    console.log('💡 Try hard refresh (Ctrl+F5) or clear browser cache');
} else {
    console.log('❌ Some poster files are missing');
    console.log('🔧 Please check the file paths and copy missing files');
}
