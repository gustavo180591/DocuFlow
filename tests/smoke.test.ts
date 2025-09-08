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

  it('should return members list', async () => {
    const response = await fetch(`${HOST}${API_ROUTES.MEMBERS}?page=1&pageSize=10`);
    const data = await response.json();
    
    if (response.status !== 200) {
      console.error('Error response:', data);
    }
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('meta');
    expect(Array.isArray(data.data)).toBe(true);
    
    // Check pagination metadata
    expect(data.meta).toMatchObject({
      total: expect.any(Number),
      page: expect.any(Number),
      pageSize: expect.any(Number),
      totalPages: expect.any(Number)
    });
    
    // If there are members, check their structure
    if (data.data.length > 0) {
      const member = data.data[0];
      expect(member).toMatchObject({
        id: expect.any(String),
        nombre: expect.any(String),
        apellido: expect.any(String),
        dni: expect.any(String),
        email: expect.any(String),
        status: expect.stringMatching(/^(ACTIVE|INACTIVE|PENDING)$/),
        institutionId: expect.any(String)
      });
    } else {
      console.log('No members found in the database');
    }
  });
});
