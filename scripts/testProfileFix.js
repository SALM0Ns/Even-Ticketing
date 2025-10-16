const puppeteer = require('puppeteer');

async function testProfileFix() {
  let browser;
  
  try {
    console.log('🚀 Testing profile fix...');
    
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
    
    // Check if profile link exists and has correct styling
    console.log('👤 Checking profile link...');
    const profileLink = await page.$('.profile-link');
    if (profileLink) {
      console.log('✅ Profile link found with correct class');
      
      // Get profile link text
      const profileText = await page.evaluate(el => el.textContent, profileLink);
      console.log(`📝 Profile link text: "${profileText}"`);
      
      // Click profile link
      console.log('👆 Clicking profile link...');
      await profileLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // Check if we're on user dashboard
      const currentUrl = page.url();
      if (currentUrl.includes('/user-dashboard')) {
        console.log('✅ Successfully navigated to user dashboard');
        
        // Test name change without JavaScript errors
        console.log('✏️ Testing name change...');
        const nameInput = await page.$('#userName');
        if (nameInput) {
          const currentName = await page.evaluate(el => el.value, nameInput);
          console.log(`📝 Current name: "${currentName}"`);
          
          // Clear and type new name
          await nameInput.click({ clickCount: 3 });
          await nameInput.type('Fixed Test User');
          
          // Submit form
          console.log('💾 Submitting name change...');
          await page.click('#save-profile-btn');
          
          // Wait for response
          await page.waitForTimeout(3000);
          
          // Check for JavaScript errors
          const errors = await page.evaluate(() => {
            return window.errors || [];
          });
          
          if (errors.length === 0) {
            console.log('✅ No JavaScript errors detected!');
          } else {
            console.log('❌ JavaScript errors found:', errors);
          }
          
          // Check if name was updated
          const updatedName = await page.evaluate(el => el.value, nameInput);
          console.log(`📝 Updated name: "${updatedName}"`);
          
          if (updatedName === 'Fixed Test User') {
            console.log('✅ Name change successful!');
          } else {
            console.log('❌ Name change failed');
          }
        }
      } else {
        console.log('❌ Failed to navigate to user dashboard');
        console.log(`Current URL: ${currentUrl}`);
      }
    } else {
      console.log('❌ Profile link not found');
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
  testProfileFix();
} catch (error) {
  console.log('⚠️ Puppeteer not installed. Manual testing required.');
  console.log('Please test manually:');
  console.log('1. Go to http://localhost:3000');
  console.log('2. Login with testuser@cursedticket.com / password123');
  console.log('3. Click on your name in the header');
  console.log('4. Try to change your name');
  console.log('5. Check browser console for errors');
}
