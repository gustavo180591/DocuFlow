export interface Member {
  id: string;
  name: string;
  email?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  status: 'Procesado' | 'Pendiente' | 'Error';
  uploadedAt: string;
  size: string;
  member: Member;
  fileUrl?: string;
  mimeType?: string;
  description?: string;
  tags?: string[];
}

export interface DocumentFilters {
  status?: string;
  type?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  memberId?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
