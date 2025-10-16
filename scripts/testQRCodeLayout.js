const puppeteer = require('puppeteer');

async function testQRCodeLayout() {
  let browser;
  
  try {
    console.log('🚀 Testing QR Code layout changes...');
    
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Navigate to homepage
    console.log('📱 Navigating to homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Login
    console.log('🔐 Logging in...');
    await page.click('a[href="/auth/login"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    await page.type('input[name="email"]', 'testuser@cursedticket.com');
    await page.type('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Go to My Tickets
    console.log('🎫 Going to My Tickets...');
    await page.click('a[href="/my-tickets"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Check if QR Code is in the left stub
    console.log('🔍 Checking QR Code position...');
    const stubQR = await page.$('.stub-qr .qr-code-image');
    if (stubQR) {
      console.log('✅ QR Code found in left stub (correct position)');
      
      // Check QR Code size
      const qrSize = await page.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }, stubQR);
      
      console.log(`📏 QR Code size: ${qrSize.width}x${qrSize.height}px`);
      
      if (qrSize.width >= 140 && qrSize.height >= 140) {
        console.log('✅ QR Code size is large enough for scanning (150x150px)');
      } else {
        console.log('⚠️ QR Code might be too small for scanning');
      }
      
      // Check if QR Code has proper styling
      const qrStyles = await page.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          borderRadius: styles.borderRadius,
          border: styles.border,
          background: styles.background
        };
      }, stubQR);
      
      console.log('🎨 QR Code styles:', qrStyles);
      
      // Check if there's no QR Code in the right side
      const rightQR = await page.$('.ticket-qr .qr-code-image');
      if (!rightQR) {
        console.log('✅ No QR Code found in right side (correctly removed)');
      } else {
        console.log('❌ QR Code still exists in right side');
      }
      
      // Check if fake barcode is removed
      const fakeBarcode = await page.$('.stub-barcode .barcode-lines');
      if (!fakeBarcode) {
        console.log('✅ Fake barcode removed (correctly replaced)');
      } else {
        console.log('❌ Fake barcode still exists');
      }
      
    } else {
      console.log('❌ QR Code not found in left stub');
    }
    
    // Test ticket purchase to see new layout
    console.log('🎬 Testing ticket purchase...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Find a movie event
    const movieLink = await page.$('a[href*="/events/movies/"]');
    if (movieLink) {
      await movieLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // Try to select a seat (if available)
      const seatButton = await page.$('.seat.available');
      if (seatButton) {
        await seatButton.click();
        console.log('🎯 Seat selected');
        
        // Try to proceed to checkout
        const checkoutBtn = await page.$('#proceed-to-checkout');
        if (checkoutBtn) {
          await checkoutBtn.click();
          await page.waitForNavigation({ waitUntil: 'networkidle2' });
          
          // Fill checkout form
          await page.type('#firstName', 'QR Test');
          await page.type('#lastName', 'User');
          await page.type('#email', 'qrtest@test.com');
          await page.type('#phone', '1234567890');
          await page.select('#paymentMethod', 'Credit Card');
          await page.type('#cardNumber', '1234567890123456');
          await page.type('#expiryDate', '12/25');
          await page.type('#cvv', '123');
          
          // Submit payment
          await page.click('#complete-payment-btn');
          await page.waitForTimeout(3000);
          
          // Check if we're on tickets page
          const currentUrl = page.url();
          if (currentUrl.includes('/tickets/')) {
            console.log('✅ Successfully purchased ticket');
            
            // Check QR Code in new ticket
            const newStubQR = await page.$('.stub-qr .qr-code-image');
            if (newStubQR) {
              console.log('✅ QR Code found in new ticket stub');
              
              const newQrSize = await page.evaluate(el => {
                const rect = el.getBoundingClientRect();
                return { width: rect.width, height: rect.height };
              }, newStubQR);
              
              console.log(`📏 New QR Code size: ${newQrSize.width}x${newQrSize.height}px`);
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔌 Browser closed');
    }
  }
}

// Check if puppeteer is available
try {
  require.resolve('puppeteer');
  testQRCodeLayout();
} catch (error) {
  console.log('⚠️ Puppeteer not installed. Manual testing required.');
  console.log('Please test manually:');
  console.log('1. Go to http://localhost:3000');
  console.log('2. Login with testuser@cursedticket.com / password123');
  console.log('3. Go to My Tickets');
  console.log('4. Check if QR Code is in the left stub (larger size)');
  console.log('5. Verify no QR Code in right side');
  console.log('6. Test ticket purchase to see new layout');
}
