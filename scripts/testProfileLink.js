const puppeteer = require('puppeteer');

async function testProfileLink() {
  let browser;
  
  try {
    console.log('🚀 Starting profile link test...');
    
    browser = await puppeteer.launch({ 
      headless: false, // Set to true for headless mode
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Navigate to homepage
    console.log('📱 Navigating to homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Check if login link exists
    const loginLink = await page.$('a[href="/auth/login"]');
    if (loginLink) {
      console.log('✅ Login link found');
      
      // Click login
      console.log('🔐 Clicking login...');
      await loginLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // Fill login form
      console.log('📝 Filling login form...');
      await page.type('input[name="email"]', 'testuser@cursedticket.com');
      await page.type('input[name="password"]', 'password123');
      
      // Submit form
      console.log('🚀 Submitting login form...');
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // Check if profile link exists
      const profileLink = await page.$('a[href="/user-dashboard"]');
      if (profileLink) {
        console.log('✅ Profile link found after login');
        
        // Get profile link text
        const profileText = await page.evaluate(el => el.textContent, profileLink);
        console.log(`👤 Profile link text: "${profileText}"`);
        
        // Click profile link
        console.log('👆 Clicking profile link...');
        await profileLink.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        
        // Check if we're on user dashboard
        const currentUrl = page.url();
        if (currentUrl.includes('/user-dashboard')) {
          console.log('✅ Successfully navigated to user dashboard');
          
          // Check if profile form exists
          const profileForm = await page.$('#profile-form');
          if (profileForm) {
            console.log('✅ Profile form found on dashboard');
            
            // Get current name
            const nameInput = await page.$('#userName');
            if (nameInput) {
              const currentName = await page.evaluate(el => el.value, nameInput);
              console.log(`📝 Current name: "${currentName}"`);
              
              // Test name change
              console.log('✏️ Testing name change...');
              await nameInput.click({ clickCount: 3 }); // Select all text
              await nameInput.type('Updated Test User');
              
              // Submit form
              console.log('💾 Submitting name change...');
              await page.click('#save-profile-btn');
              
              // Wait for success message or form update
              await page.waitForTimeout(2000);
              
              // Check if name was updated
              const updatedName = await page.evaluate(el => el.value, nameInput);
              console.log(`📝 Updated name: "${updatedName}"`);
              
              if (updatedName === 'Updated Test User') {
                console.log('✅ Name change successful!');
              } else {
                console.log('❌ Name change failed');
              }
            }
          } else {
            console.log('❌ Profile form not found');
          }
        } else {
          console.log('❌ Failed to navigate to user dashboard');
          console.log(`Current URL: ${currentUrl}`);
        }
      } else {
        console.log('❌ Profile link not found after login');
      }
    } else {
      console.log('❌ Login link not found');
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
  testProfileLink();
} catch (error) {
  console.log('⚠️ Puppeteer not installed. Installing...');
  console.log('Run: npm install puppeteer');
  console.log('Then run this script again.');
}
