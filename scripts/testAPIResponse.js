const http = require('http');

console.log('🔍 Testing API response for poster fields...\n');

function testAPI(endpoint, name) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: endpoint,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log(`📡 ${name} API Response:`);
                    if (jsonData.events && jsonData.events.length > 0) {
                        jsonData.events.forEach((event, index) => {
                            console.log(`  ${index + 1}. ${event.name}:`);
                            console.log(`     - Poster: ${event.poster}`);
                            console.log(`     - Image: ${event.image}`);
                            console.log(`     - Using: ${event.poster ? 'POSTER ✓' : 'IMAGE ✗'}`);
                        });
                    } else {
                        console.log('  No events found');
                    }
                    console.log('');
                    resolve(jsonData);
                } catch (error) {
                    console.error(`❌ Error parsing ${name} response:`, error.message);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Error requesting ${name}:`, error.message);
            reject(error);
        });

        req.end();
    });
}

async function testAllAPIs() {
    try {
        await testAPI('/api/events/orchestra', 'Orchestra');
        await testAPI('/api/events/movies', 'Movies');
        await testAPI('/api/events/stage-plays', 'Stage Plays');
        
        console.log('🎉 API testing completed!');
        console.log('💡 If poster fields are correct, the issue is likely browser cache');
        console.log('🔧 Try hard refresh (Ctrl+F5) or open in incognito mode');
        
    } catch (error) {
        console.error('❌ API testing failed:', error.message);
    }
}

testAllAPIs();
