import type { PageData as BasePageData } from './$types';

declare global {
  namespace App {
    interface PageData extends BasePageData {
      members: Array<{
        id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        createdAt: string;
        updatedAt: string;
      }>;
      meta: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      };
      searchQuery: string;
      error?: string;
    }
  }
}

export {};
