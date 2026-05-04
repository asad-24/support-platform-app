const MongoDB = require('./core/util/classes/MongoDB');
const { hashPassword } = require('./src/services/auth/credentials');

async function addTestUser() {
  try {
    const db = await MongoDB.default.connect();
    const users = db.collection('users');
    
    // Check if user already exists
    const existing = await users.findOne({ email: 'test@example.com' });
    if (existing) {
      console.log('✓ Test user already exists: test@example.com');
      return;
    }

    // Create password hash
    const { salt, hash } = hashPassword('Test@1234');

    // Insert test user
    const result = await users.insertOne({
      id: await MongoDB.default.nextId('users'),
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      role: 'volunteer',
      passwordSalt: salt,
      passwordHash: hash,
      accessToken: null,
      accessTokenCreatedAt: null,
      refreshToken: null,
      refreshTokenCreatedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✓ Test user added successfully');
    console.log(`  Email: test@example.com`);
    console.log(`  Password: Test@1234`);
    console.log(`  Role: volunteer`);
  } catch (error) {
    console.error('✗ Error adding test user:', error.message);
    process.exitCode = 1;
  } finally {
    await MongoDB.default.close();
  }
}

addTestUser();
