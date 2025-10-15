const http = require('http');

console.log('🔧 Testing Error Handling...\n');

// Test 404 error
function test404() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/nonexistent-page',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      console.log(`📄 404 Test: Status ${res.statusCode}`);
      if (res.statusCode === 404) {
        console.log('✅ 404 error handled correctly');
      } else {
        console.log('❌ 404 error not handled correctly');
      }
      resolve();
    });

    req.on('error', (error) => {
      console.log('❌ 404 test failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Test server error (if any)
function testServerError() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      console.log(`🏠 Homepage Test: Status ${res.statusCode}`);
      if (res.statusCode === 200) {
        console.log('✅ Homepage loads correctly');
      } else {
        console.log('❌ Homepage has issues');
      }
      resolve();
    });

    req.on('error', (error) => {
      console.log('❌ Homepage test failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  try {
    await test404();
    await testServerError();
    
    console.log('\n🎉 Error handling tests completed!');
    console.log('💡 The TypeError should be fixed now');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();
