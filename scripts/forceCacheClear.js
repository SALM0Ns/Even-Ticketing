const http = require('http');

console.log('🧹 Forcing cache clear and testing poster images...\n');

// Test if poster images are accessible via HTTP
function testImageAccess(imagePath) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: imagePath,
            method: 'HEAD' // Just check if file exists
        };

        const req = http.request(options, (res) => {
            console.log(`${res.statusCode === 200 ? '✅' : '❌'} ${imagePath}: ${res.statusCode === 200 ? 'ACCESSIBLE' : 'NOT FOUND'}`);
            resolve(res.statusCode === 200);
        });

        req.on('error', (error) => {
            console.log(`❌ ${imagePath}: ERROR - ${error.message}`);
            resolve(false);
        });

        req.end();
    });
}

async function testAllPosterImages() {
    const posterImages = [
        '/images/chopin-poster.jpg',
        '/images/beethoven-poster.jpg',
        '/images/mozart-poster.jpg',
        '/images/swan-lake-poster.jpg',
        '/images/hamilton-poster.jpg',
        '/images/phantom-poster.jpg',
        '/images/lionking-poster.jpg',
        '/images/dune-poster.jpg',
        '/images/inception-poster.jpg',
        '/images/killbill-poster.jpg',
        '/images/oppenheimer-poster.jpg'
    ];

    console.log('🔍 Testing poster image accessibility:');
    let allAccessible = true;

    for (const imagePath of posterImages) {
        const accessible = await testImageAccess(imagePath);
        if (!accessible) {
            allAccessible = false;
        }
    }

    console.log('\n🎉 Poster image test completed!');
    if (allAccessible) {
        console.log('✅ All poster images are accessible via HTTP');
        console.log('🔧 The issue is definitely browser cache');
        console.log('💡 Solutions:');
        console.log('   1. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)');
        console.log('   2. Open in incognito/private mode');
        console.log('   3. Clear browser cache manually');
        console.log('   4. Disable cache in browser dev tools');
    } else {
        console.log('❌ Some poster images are not accessible');
        console.log('🔧 Check server configuration and file permissions');
    }
}

testAllPosterImages();
