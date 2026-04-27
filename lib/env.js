// Environment variable validation
const requiredEnvVars = {
  server: [
    'GEMINI_API_KEY',
  ],
  client: [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  ],
};

export function validateEnvVars() {
  const missing = [];
  const warnings = [];

  // Check server-side variables
  requiredEnvVars.server.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check client-side variables (only warn, as they might be optional in some contexts)
  requiredEnvVars.client.forEach(varName => {
    if (!process.env[varName] || process.env[varName] === 'undefined') {
      warnings.push(varName);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please add these variables to your .env.local file');
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Missing optional environment variables:', warnings.join(', '));
  }

  return { missing, warnings };
}

// Run validation on import
if (typeof window === 'undefined') {
  validateEnvVars();
}
