export type ReceiptStatus = 'pending' | 'approved' | 'rejected' | 'processed' | 'error';

export type DocumentCategory = 'COMPROBANTE_BANCARIO' | 'LISTADO_SOCIOS' | 'LISTADO_APORTE' | 'OTRO';

export interface Receipt {
  id: string;
  type: DocumentCategory;
  date: string;
  amount: number;
  reference: string;
  memberName: string;
  memberId: string;
  status: ReceiptStatus;
  fileUrl?: string;
  mimeType?: string;
  size?: number;
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
