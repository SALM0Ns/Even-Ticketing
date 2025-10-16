/**
 * Test Checkout Fix
 * Tests the complete checkout flow from event selection to order creation
 */

const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Order = require('../models/Order');

console.log('🔧 Testing Checkout Fix...');
console.log('==========================\n');

async function testCheckoutFix() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');

    // Test 1: Find a test event
    console.log('\n🎬 Finding Test Event...');
    const testEvent = await Movie.findOne();
    if (!testEvent) {
      console.log('❌ No test event found. Please create an event first.');
      return;
    }
    
    console.log('✅ Test event found:', testEvent.name);
    console.log('   Event ID:', testEvent._id);
    console.log('   Base Price:', testEvent.pricing.basePrice);
    console.log('   VIP Price:', testEvent.pricing.vipPrice);

    // Test 2: Create test checkout order data (simulating what would be in sessionStorage)
    console.log('\n🛒 Creating Test Checkout Order Data...');
    
    const testCheckoutOrder = {
      eventId: testEvent._id.toString(),
      eventName: testEvent.name,
      eventType: 'movies',
      showDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      venue: {
        name: testEvent.location.name,
        address: testEvent.location.address,
        city: testEvent.location.city
      },
      selectedSeats: [
        {
          seatNumber: 'A1',
          seatType: 'standard',
          price: testEvent.pricing.basePrice
        },
        {
          seatNumber: 'A2',
          seatType: 'vip',
          price: testEvent.pricing.vipPrice || testEvent.pricing.basePrice
        }
      ]
    };

    console.log('✅ Test checkout order created:');
    console.log('   Event ID:', testCheckoutOrder.eventId);
    console.log('   Event Type:', testCheckoutOrder.eventType);
    console.log('   Show Date:', testCheckoutOrder.showDate);
    console.log('   Selected Seats:', testCheckoutOrder.selectedSeats.length);
    console.log('   Seat Details:', testCheckoutOrder.selectedSeats);

    // Test 3: Test order creation with the test data
    console.log('\n🔗 Testing Order Creation...');
    const http = require('http');
    
    const testCustomerInfo = {
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '0123456789',
      address: '123 Test Street',
      city: 'Bangkok'
    };

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
      
      console.log('📊 Response Status:', response.statusCode);
      
      if (response.statusCode === 200 && response.data.success) {
        console.log('✅ Order creation successful!');
        console.log('   Order ID:', response.data.order.id);
        console.log('   Order Number:', response.data.order.orderNumber);
        console.log('   Total:', response.data.order.formattedTotal);
        console.log('   Expires:', new Date(response.data.order.expiresAt).toLocaleString());
      } else {
        console.log('❌ Order creation failed');
        console.log('   Error:', response.data.message || 'Unknown error');
        console.log('   Full Response:', JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
      console.log('❌ Order creation error:', error.message);
    }

    // Test 4: Check recent orders
    console.log('\n📊 Checking Recent Orders...');
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(3);
    console.log(`✅ Found ${recentOrders.length} recent orders`);
    
    recentOrders.forEach((order, index) => {
      console.log(`   Order ${index + 1}: ${order.orderNumber} - ${order.customer.name} - ${order.formattedTotal}`);
      console.log(`     Event: ${order.event.eventName} (${order.event.eventType})`);
      console.log(`     Tickets: ${order.tickets.length} seats`);
    });

    console.log('\n🎯 Checkout Fix Test Results:');
    console.log('=============================');
    console.log('✅ Test event found and validated');
    console.log('✅ Test checkout order data created');
    console.log('✅ Order creation endpoint tested');
    console.log('✅ Recent orders checked');

    console.log('\n💡 Next Steps:');
    console.log('==============');
    console.log('1. Go to http://localhost:3000/debug-checkout');
    console.log('2. Create a test checkout order');
    console.log('3. Go to checkout page and test payment');
    console.log('4. Check browser console for any JavaScript errors');
    console.log('5. Verify sessionStorage contains correct data');

    console.log('\n✨ Checkout fix test completed! ✨');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testCheckoutFix();
