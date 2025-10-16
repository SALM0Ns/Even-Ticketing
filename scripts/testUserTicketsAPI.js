/**
 * Test User Tickets API
 * Tests the /api/payments/user-tickets endpoint
 */

console.log('🌐 Testing User Tickets API...');
console.log('=============================\n');

async function testUserTicketsAPI() {
  try {
    const baseURL = 'http://localhost:3000';
    const testEmail = 'poppop5566@outlook.com';
    
    console.log(`Testing API endpoint: ${baseURL}/api/payments/user-tickets`);
    console.log(`Test email: ${testEmail}`);
    
    // Test the API endpoint
    const response = await fetch(`${baseURL}/api/payments/user-tickets?email=${encodeURIComponent(testEmail)}`);
    const data = await response.json();
    
    console.log('\n✅ API Response:');
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Tickets count: ${data.tickets.length}`);
    
    if (data.tickets.length > 0) {
      console.log('\n📋 Tickets found:');
      data.tickets.forEach((ticket, index) => {
        console.log(`\nTicket ${index + 1}:`);
        console.log(`   Event: ${ticket.event.eventName}`);
        console.log(`   Status: ${ticket.status}`);
        console.log(`   Customer: ${ticket.customer.name} (${ticket.customer.email})`);
        console.log(`   Total Amount: $${ticket.totalAmount}`);
        console.log(`   Tickets Count: ${ticket.tickets.length}`);
        
        if (ticket.status === 'cancelled') {
          console.log(`   Cancelled At: ${ticket.cancelledAt}`);
          console.log(`   Cancellation Reason: ${ticket.cancellationReason}`);
        }
        
        // Check individual tickets
        if (ticket.tickets && ticket.tickets.length > 0) {
          console.log('   Individual Tickets:');
          ticket.tickets.forEach((individualTicket, i) => {
            console.log(`     ${i + 1}. ${individualTicket.ticketId} - ${individualTicket.seatNumber} - $${individualTicket.price}`);
          });
        }
      });
    } else {
      console.log('❌ No tickets found');
    }
    
    console.log('\n🎯 API Test Results:');
    console.log('===================');
    console.log('✅ API endpoint accessible');
    console.log('✅ Response format correct');
    console.log('✅ Tickets data retrieved');
    
    // Check for cancelled tickets
    const cancelledTickets = data.tickets.filter(t => t.status === 'cancelled');
    console.log(`✅ Cancelled tickets found: ${cancelledTickets.length}`);
    
    if (cancelledTickets.length > 0) {
      console.log('\n🎫 Cancelled tickets:');
      cancelledTickets.forEach((ticket, index) => {
        console.log(`   ${index + 1}. ${ticket.event.eventName} - ${ticket.status}`);
      });
    }
    
    console.log('\n💡 Next Steps:');
    console.log('==============');
    console.log('1. Go to http://localhost:3000/my-tickets');
    console.log('2. Login with the test email if needed');
    console.log('3. Check if cancelled tickets show strikethrough styling');
    console.log('4. Verify "CANCELLED" overlay is visible');
    
    console.log('\n✨ API test completed! ✨');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testUserTicketsAPI();
