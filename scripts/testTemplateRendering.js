const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

console.log('🔧 Testing Template Rendering...\n');

try {
  // Test data similar to what homepage route would send
  const testData = {
    title: 'CursedTicket - Premium Entertainment',
    user: null,
    featuredEvents: [
      {
        _id: 'test1',
        name: 'Test Movie',
        date: new Date(),
        location: { name: 'Test Theater' },
        pricing: { basePrice: 20 },
        poster: 'https://example.com/poster.jpg',
        category: 'movies'
      }
    ]
  };

  console.log('📄 Reading index.ejs template...');
  const templatePath = path.join(__dirname, '../views/index.ejs');
  const template = fs.readFileSync(templatePath, 'utf8');
  console.log('✅ Template read successfully');

  console.log('\n🎨 Rendering template...');
  const rendered = ejs.render(template, testData, {
    views: [path.join(__dirname, '../views')],
    filename: templatePath
  });
  console.log('✅ Template rendered successfully');

  console.log('\n📊 Rendering stats:');
  console.log(`   Template size: ${template.length} characters`);
  console.log(`   Rendered size: ${rendered.length} characters`);
  console.log(`   Contains title: ${rendered.includes('CursedTicket') ? 'Yes' : 'No'}`);
  console.log(`   Contains test data: ${rendered.includes('Test Movie') ? 'Yes' : 'No'}`);

  console.log('\n🎉 Template rendering working correctly!');

} catch (error) {
  console.error('❌ Template rendering failed:', error.message);
  console.error('Stack:', error.stack);
}
