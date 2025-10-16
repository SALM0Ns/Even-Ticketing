/**
 * Test Checkout Order System
 * Tests the checkout order creation and validation
 */

const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');
const Order = require('../models/Order');

console.log('🛒 Testing Checkout Order System...');
console.log('===================================\n');

async function testCheckoutOrder() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');

    // Test 1: Create test checkout order data
    console.log('\n📋 Creating Test Checkout Order Data...');
    
    // Find a test event
    const testEvent = await Movie.findOne();
    if (!testEvent) {
      console.log('❌ No test event found. Please create an event first.');
      return;
    }
    
    console.log('✅ Test event found:', testEvent.name);

    // Create test checkout order data
    const testCheckoutOrder = {
      eventId: testEvent._id.toString(),
      eventType: 'Movie',
      showDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      selectedSeats: [
        {
          seatNumber: 'A1',
          seatType: 'standard',
          price: testEvent.pricing.basePrice || 250
        },
        {
          seatNumber: 'A2',
          seatType: 'standard',
          price: testEvent.pricing.basePrice || 250
        }
      ]
    };

    const testCustomerInfo = {
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '0123456789',
      address: '123 Test Street',
      city: 'Bangkok'
    };

    console.log('✅ Test checkout order data created');
    console.log('   Event ID:', testCheckoutOrder.eventId);
    console.log('   Event Type:', testCheckoutOrder.eventType);
    console.log('   Show Date:', testCheckoutOrder.showDate);
    console.log('   Selected Seats:', testCheckoutOrder.selectedSeats.length);
    console.log('   Customer Info:', testCustomerInfo.name);

    // Test 2: Test order creation endpoint
    console.log('\n🔗 Testing Order Creation Endpoint...');
    const http = require('http');
    
    const orderData = {
      eventId: testCheckoutOrder.eventId,
      eventType: testCheckoutOrder.eventType,
      showDate: testCheckoutOrder.showDate,
      selectedSeats: testCheckoutOrder.selectedSeats,
      customerInfo: testCustomerInfo
    };

    try {
      const response = await new Promise((resolve, reject) => {
        const postData = JSON.stringify(orderData);
        
        const options = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/payments/create-order',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          },
          timeout: 10000
        };

        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve({ 
                statusCode: res.statusCode, 
                data: JSON.parse(data),
                headers: res.headers
              });
            } catch (e) {
              resolve({ 
                statusCode: res.statusCode, 
                data: data,
                headers: res.headers
              });
            }
          });
        });
        
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Request timeout')));
        req.write(postData);
        req.end();
      });
      
      console.log('📊 Response Status:', response.statusCode);
      console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));
      
      if (response.statusCode === 200 && response.data.success) {
        console.log('✅ Order creation successful');
        console.log('   Order ID:', response.data.order.id);
        console.log('   Order Number:', response.data.order.orderNumber);
        console.log('   Total:', response.data.order.formattedTotal);
      } else {
        console.log('❌ Order creation failed');
        console.log('   Error:', response.data.message || 'Unknown error');
      }
    } catch (error) {
      console.log('❌ Order creation endpoint error:', error.message);
    }

    // Test 3: Test validation scenarios
    console.log('\n🔍 Testing Validation Scenarios...');
    
    const validationTests = [
      {
        name: 'Missing eventId',
        data: { ...orderData, eventId: null },
        expectedError: 'Missing required fields'
      },
      {
        name: 'Missing eventType',
        data: { ...orderData, eventType: null },
        expectedError: 'Missing required fields'
      },
      {
        name: 'Missing showDate',
        data: { ...orderData, showDate: null },
        expectedError: 'Missing required fields'
      },
      {
        name: 'Missing selectedSeats',
        data: { ...orderData, selectedSeats: null },
        expectedError: 'Missing required fields'
      },
      {
        name: 'Missing customerInfo',
        data: { ...orderData, customerInfo: null },
        expectedError: 'Missing required fields'
      },
      {
        name: 'Invalid eventType',
        data: { ...orderData, eventType: 'InvalidType' },
        expectedError: 'Invalid event type'
      },
      {
        name: 'Non-existent eventId',
        data: { ...orderData, eventId: '507f1f77bcf86cd799439011' },
        expectedError: 'Event not found'
      }
    ];

    for (const test of validationTests) {
      try {
        const response = await new Promise((resolve, reject) => {
          const postData = JSON.stringify(test.data);
          
          const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/payments/create-order',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 5000
          };

          const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              try {
                resolve({ 
                  statusCode: res.statusCode, 
                  data: JSON.parse(data)
                });
              } catch (e) {
                resolve({ 
                  statusCode: res.statusCode, 
                  data: data
                });
              }
            });
          });
          
          req.on('error', reject);
          req.on('timeout', () => reject(new Error('Request timeout')));
          req.write(postData);
          req.end();
        });
        
        if (response.statusCode === 400 && response.data.message) {
          console.log(`✅ ${test.name}: ${response.data.message}`);
        } else {
          console.log(`⚠️ ${test.name}: Unexpected response (${response.statusCode})`);
        }
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }

    // Test 4: Check existing orders
    console.log('\n📊 Checking Existing Orders...');
    const existingOrders = await Order.find().limit(5);
    console.log(`✅ Found ${existingOrders.length} existing orders`);
    
    existingOrders.forEach((order, index) => {
      console.log(`   Order ${index + 1}: ${order.orderNumber} - ${order.customer.name} - ${order.formattedTotal}`);
    });

    console.log('\n🎯 Checkout Order System Test Results:');
    console.log('=====================================');
    console.log('✅ Test checkout order data created');
    console.log('✅ Order creation endpoint tested');
    console.log('✅ Validation scenarios tested');
    console.log('✅ Existing orders checked');

    console.log('\n💡 Debugging Tips:');
    console.log('==================');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Verify sessionStorage contains checkoutOrder data');
    console.log('3. Check network tab for request/response details');
    console.log('4. Ensure all required fields are filled in checkout form');
    console.log('5. Verify event exists in database');

    console.log('\n✨ Checkout order system test completed! ✨');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testCheckoutOrder();
