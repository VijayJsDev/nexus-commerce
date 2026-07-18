import request from 'supertest';
import app from '../../app';
import prisma from '../../prisma';

describe('Organization API', () => {
  const testOrg = {
    name: 'Test Organization',
    slug: 'test-org-' + Date.now(),
    email: `test-${Date.now()}@example.com`,
  };

  afterAll(async () => {
    // Cleanup test data
    await prisma.organization.deleteMany({
      where: {
        slug: { startsWith: 'test-org-' }
      }
    });
  });

  it('should create a new organization', async () => {
    const response = await request(app)
      .post('/api/v1/organizations')
      .send(testOrg)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(testOrg.name);
    expect(response.body.data.slug).toBe(testOrg.slug);
  });

  it('should return validation error for invalid data', async () => {
    const response = await request(app)
      .post('/api/v1/organizations')
      .send({ name: 'A' }) // Invalid: Name too short, missing required fields
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });

  it('should prevent duplicate slug creation', async () => {
    // Try creating same org again
    const response = await request(app)
      .post('/api/v1/organizations')
      .send(testOrg)
      .expect(409);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('already exists');
  });

  it('should get all organizations', async () => {
    const response = await request(app)
      .get('/api/v1/organizations')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
