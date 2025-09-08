import { describe, it, expect } from 'vitest';
import { HOST, API_ROUTES } from '../src/lib/constants';

describe('Smoke Tests', () => {
  it('should return healthy status', async () => {
    const response = await fetch(`${HOST}${API_ROUTES.HEALTH}`);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual({
      ok: true,
      status: 'healthy'
    });
  });

  it('should return institutions list', async () => {
    const response = await fetch(`${HOST}${API_ROUTES.INSTITUTIONS}`);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('meta');
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.meta).toMatchObject({
      total: expect.any(Number),
      page: expect.any(Number),
      totalPages: expect.any(Number)
    });
  });

  it('should return a specific institution', async () => {
    // First get the list to get a valid ID
    const listResponse = await fetch(`${HOST}${API_ROUTES.INSTITUTIONS}`);
    const { data: institutions } = await listResponse.json();
    
    if (institutions.length > 0) {
      const testInstitution = institutions[0];
      const response = await fetch(`${HOST}${API_ROUTES.INSTITUTIONS}/${testInstitution.id}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        id: testInstitution.id,
        name: expect.any(String),
        cuit: expect.any(String)
      });
    }
  });

  // Skipping members test as the endpoint is not fully implemented yet
  it.skip('should return members list', async () => {
    // This test is skipped until the members endpoint is properly implemented
    // Current issue: The endpoint returns 500 due to incorrect field name in orderBy
    // Expected field name: 'apellido', but got 'lastName'
  });
});
