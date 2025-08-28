import type { Document } from './types/document';

const API_BASE_URL = '/api';

export async function fetchDocuments(): Promise<Document[]> {
  const response = await fetch(`${API_BASE_URL}/documents`);
  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }
  return await response.json();
}

export async function deleteDocuments(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete documents');
  }
}

export async function updateDocumentStatus(id: string, status: string): Promise<Document> {
  const response = await fetch(`${API_BASE_URL}/documents/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update document status');
  }
  
  return await response.json();
}
