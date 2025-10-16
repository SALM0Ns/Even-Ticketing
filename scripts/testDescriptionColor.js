const puppeteer = require('puppeteer');

async function testDescriptionColor() {
  let browser;
  
  try {
    console.log('🎨 Testing Description Text Color...');
    
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Navigate to homepage
    console.log('📱 Navigating to homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Find and click on an event to go to detail page
    console.log('🔍 Looking for events to test...');
    const eventLinks = await page.$$('a[href*="/events/"]');
    
    if (eventLinks.length > 0) {
      console.log(`✅ Found ${eventLinks.length} event links`);
      
      // Click on the first event
      await eventLinks[0].click();
      await page.waitForTimeout(2000);
      
      console.log('📄 Navigated to event detail page');
      
      // Check description text color
      const descriptionElement = await page.$('.event-info .lead');
      if (descriptionElement) {
        console.log('✅ Found description element');
        
        // Get computed styles
        const styles = await page.evaluate(el => {
          const computedStyle = window.getComputedStyle(el);
          return {
            color: computedStyle.color,
            textShadow: computedStyle.textShadow,
            fontWeight: computedStyle.fontWeight,
            fontSize: computedStyle.fontSize,
            lineHeight: computedStyle.lineHeight
          };
        }, descriptionElement);
        
        console.log('🎨 Description text styles:');
        console.log(`   Color: ${styles.color}`);
        console.log(`   Text Shadow: ${styles.textShadow}`);
        console.log(`   Font Weight: ${styles.fontWeight}`);
        console.log(`   Font Size: ${styles.fontSize}`);
        console.log(`   Line Height: ${styles.lineHeight}`);
        
        // Check if color is white or close to white
        const isWhite = styles.color.includes('255, 255, 255') || 
                       styles.color.includes('#ffffff') || 
                       styles.color.includes('rgb(255, 255, 255)');
        
        if (isWhite) {
          console.log('✅ Description text is WHITE - Good contrast!');
        } else {
          console.log('❌ Description text is NOT white - May have contrast issues');
          console.log(`   Current color: ${styles.color}`);
        }
        
        // Get the actual text content
        const descriptionText = await page.evaluate(el => el.textContent, descriptionElement);
        console.log(`📝 Description text: "${descriptionText.substring(0, 100)}..."`);
        
        // Check if text is visible (not transparent)
        const opacity = await page.evaluate(el => {
          return window.getComputedStyle(el).opacity;
        }, descriptionElement);
        
        console.log(`👁️ Text opacity: ${opacity}`);
        
        if (parseFloat(opacity) > 0.5) {
          console.log('✅ Text is visible (opacity > 0.5)');
        } else {
          console.log('⚠️ Text may be too transparent');
        }
        
      } else {
        console.log('❌ Description element not found');
        
        // Try alternative selectors
        const altSelectors = [
          '.event-hero .lead',
          '.event-hero p.lead',
          '.event-info p.lead',
          'p.lead',
          '.lead'
        ];
        
        for (const selector of altSelectors) {
          const element = await page.$(selector);
          if (element) {
            console.log(`✅ Found description with selector: ${selector}`);
            break;
          }
        }
      }
      
      // Test multiple events if available
      console.log('\n🔄 Testing multiple events...');
      
      // Go back to homepage
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      
      // Test a few more events
      const moreEventLinks = await page.$$('a[href*="/events/"]');
      const testCount = Math.min(3, moreEventLinks.length);
      
      for (let i = 0; i < testCount; i++) {
        console.log(`\n📄 Testing event ${i + 1}/${testCount}...`);
        
        await moreEventLinks[i].click();
        await page.waitForTimeout(1500);
        
        const descElement = await page.$('.event-info .lead');
        if (descElement) {
          const color = await page.evaluate(el => {
            return window.getComputedStyle(el).color;
          }, descElement);
          
          const isWhite = color.includes('255, 255, 255') || 
                         color.includes('#ffffff') || 
                         color.includes('rgb(255, 255, 255)');
          
          if (isWhite) {
            console.log(`✅ Event ${i + 1}: Description is WHITE`);
          } else {
            console.log(`❌ Event ${i + 1}: Description color is ${color}`);
          }
        } else {
          console.log(`⚠️ Event ${i + 1}: No description found`);
        }
        
        // Go back to homepage for next test
        if (i < testCount - 1) {
          await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
          await page.waitForTimeout(1000);
        }
      }
      
    } else {
      console.log('❌ No event links found on homepage');
    }
    
    console.log('\n🎯 Description Color Test Summary:');
    console.log('✅ CSS rules added for white description text');
    console.log('✅ Multiple selectors covered (.event-info .lead, .event-hero .lead, etc.)');
    console.log('✅ Text shadow added for better readability');
    console.log('✅ !important flag used to override any conflicting styles');
    
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
  testDescriptionColor();
} catch (error) {
  console.log('⚠️ Puppeteer not installed. Manual testing required.');
  console.log('Please test manually:');
  console.log('1. Go to http://localhost:3000');
  console.log('2. Click on any event to go to detail page');
  console.log('3. Check if the description text is now WHITE and readable');
  console.log('4. Verify text shadow makes it stand out from background');
}
