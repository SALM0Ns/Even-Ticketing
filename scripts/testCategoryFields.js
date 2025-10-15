const http = require('http');

console.log('🔍 Testing category fields in API responses...\n');

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
                            console.log(`     - Category: ${event.category || 'UNDEFINED'}`);
                            console.log(`     - Poster: ${event.poster || 'MISSING'}`);
                            console.log(`     - Badge will show: ${event.category === 'movies' ? 'Movie' : 
                                                      event.category === 'stage-plays' ? 'Stage Play' : 
                                                      event.category === 'orchestra' ? 'Live Orchestra' : 'UNDEFINED'}`);
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
        await testAPI('/api/events/movies', 'Movies');
        await testAPI('/api/events/stage-plays', 'Stage Plays');
        await testAPI('/api/events/orchestra', 'Live Orchestra');
        
        console.log('🎉 Category field testing completed!');
        console.log('💡 If all categories are correct, the UNDEFINED badge should be fixed');
        console.log('🔧 Try refreshing the homepage to see the changes');
        
    } catch (error) {
        console.error('❌ API testing failed:', error.message);
    }
}

testAllAPIs();
