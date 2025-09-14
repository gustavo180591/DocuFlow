// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { Receipt, ReceiptsPageData } from '$lib/types/receipt';

declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    
    // Base page data that all pages can extend
    interface PageData {
      meta?: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      };
      searchQuery?: string;
      error?: string;
      [key: string]: any; // Allow additional properties for different routes
    }

    // For /recibos route
    interface RecibosPageData extends PageData {
      receipts: Receipt[];
    }

    // For /socios route
    interface SociosPageData extends PageData {
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
    }
  }
}

export {};
