import type { PageLoad } from './$types';

export interface Institution {
  id: string;
  name: string;
  cuit: string;
  email: string | null;
  address: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PageData {
  institutions: Institution[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export const load: PageLoad = async ({ parent }) => {
  const data = await parent();
  return data as PageData;
};
