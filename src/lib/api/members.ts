import type { Member, CreateMemberInput, UpdateMemberInput } from '$lib/types/member';

const API_BASE_URL = '/api/members';

export async function fetchMembers(): Promise<Member[]> {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch members');
  }
  return await response.json();
}

export async function fetchMember(id: string): Promise<Member> {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch member ${id}`);
  }
  return await response.json();
}

export async function createMember(member: CreateMemberInput): Promise<Member> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(member),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create member');
  }
  
  return await response.json();
}

export async function updateMember(member: UpdateMemberInput): Promise<Member> {
  const { id, ...updateData } = member;
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update member ${id}`);
  }
  
  return await response.json();
}

export async function deleteMember(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete member ${id}`);
  }
}

export async function searchMembers(query: string): Promise<Member[]> {
  const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search members');
  }
  return await response.json();
}
