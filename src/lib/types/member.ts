export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  membershipType: string;
  documents?: string[]; // Array of document IDs
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status?: 'active' | 'inactive' | 'suspended';
  membershipType: string;
  notes?: string;
}

export interface UpdateMemberInput extends Partial<CreateMemberInput> {
  id: string;
}
