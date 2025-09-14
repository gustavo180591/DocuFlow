export type ReceiptStatus = 'pending' | 'approved' | 'rejected';

export interface Receipt {
  id: string;
  type: string;
  date: string;
  amount: number;
  reference: string;
  memberName: string;
  memberId: string;
  status: ReceiptStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ReceiptsPageData {
  receipts: Receipt[];
  meta: PaginationMeta;
  searchQuery: string;
  error?: string;
}
