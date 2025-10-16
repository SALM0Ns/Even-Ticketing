/**
 * Environment Variables Validation and Configuration
 * Validates required environment variables and provides fallbacks
 */

const requiredEnvVars = [
  'MONGODB_URI'
];

const optionalEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY', 
  'CLOUDINARY_API_SECRET',
  'PORT',
  'NODE_ENV',
  'SESSION_SECRET'
];

/**
 * Validate environment variables
 * @returns {Object} Validation result
 */
function validateEnvironment() {
  const result = {
    isValid: true,
    missing: [],
    warnings: [],
    config: {}
  };

  // Check required variables
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      result.missing.push(envVar);
      result.isValid = false;
    } else {
      result.config[envVar] = process.env[envVar];
    }
  });

  // Check optional variables
  optionalEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      result.config[envVar] = process.env[envVar];
      
      // Check for default/placeholder values
      if (envVar.includes('CLOUDINARY') && 
          (process.env[envVar].includes('your-actual') || 
           process.env[envVar].includes('your-api'))) {
        result.warnings.push(`${envVar} is set to default value`);
      }
    } else {
      result.warnings.push(`${envVar} is not set (optional)`);
    }
  });

  return result;
}

/**
 * Get environment configuration with defaults
 * @returns {Object} Environment configuration
 */
function getEnvironmentConfig() {
  const validation = validateEnvironment();
  
  return {
    // Database
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/Event',
      name: process.env.DB_NAME || 'Event'
    },
    
    // Cloudinary
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      isConfigured: !!(process.env.CLOUDINARY_CLOUD_NAME && 
                      process.env.CLOUDINARY_API_KEY && 
                      process.env.CLOUDINARY_API_SECRET &&
                      !process.env.CLOUDINARY_CLOUD_NAME.includes('your-actual') &&
                      !process.env.CLOUDINARY_API_KEY.includes('your-api'))
    },
    
    // Server
    server: {
      port: process.env.PORT || 3000,
      nodeEnv: process.env.NODE_ENV || 'development',
      sessionSecret: process.env.SESSION_SECRET || 'default-session-secret-change-in-production'
    },
    
    // Validation
    validation
  };
}

/**
 * Log environment status
 */
function logEnvironmentStatus() {
  const config = getEnvironmentConfig();
  const { validation } = config;
  
  console.log('\n🔧 Environment Configuration:');
  console.log('================================');
  
  // Database
  console.log('📊 Database:');
  console.log(`   URI: ${config.mongodb.uri ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Name: ${config.mongodb.name}`);
  
  // Cloudinary
  console.log('\n☁️ Cloudinary:');
  if (config.cloudinary.isConfigured) {
    console.log('   Status: ✅ Configured');
    console.log(`   Cloud Name: ${config.cloudinary.cloudName}`);
  } else {
    console.log('   Status: ⚠️ Not configured (using local storage fallback)');
  }
  
  // Server
  console.log('\n🚀 Server:');
  console.log(`   Port: ${config.server.port}`);
  console.log(`   Environment: ${config.server.nodeEnv}`);
  console.log(`   Session Secret: ${config.server.sessionSecret ? '✅ Set' : '⚠️ Using default'}`);
  
  // Validation results
  if (validation.missing.length > 0) {
    console.log('\n❌ Missing Required Variables:');
    validation.missing.forEach(envVar => {
      console.log(`   - ${envVar}`);
    });
  }
  
  if (validation.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    validation.warnings.forEach(warning => {
      console.log(`   - ${warning}`);
    });
  }
  
  if (validation.isValid) {
    console.log('\n✅ Environment validation passed!');
  } else {
    console.log('\n❌ Environment validation failed!');
  }
  
  console.log('================================\n');
}

module.exports = {
  validateEnvironment,
  getEnvironmentConfig,
  logEnvironmentStatus
};
