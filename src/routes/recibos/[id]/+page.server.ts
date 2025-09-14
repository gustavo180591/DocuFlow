import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

// Mock data for demonstration
const mockReceipts = [
  {
    id: '1',
    type: 'LISTADO_APORTE',
    date: '2023-10-15T14:30:00Z',
    amount: 2101.00,
    reference: 'AP-2023-10-123',
    memberName: 'Juan Pérez',
    memberId: '1',
    status: 'approved',
    createdAt: '2023-10-15T14:30:00Z',
    updatedAt: '2023-10-15T14:35:00Z',
    items: [
      { description: 'Aporte mensual socio', amount: 1250.00 },
      { description: 'Aporte extraordinario por mejoras', amount: 500.50 },
      { description: 'Cuota social', amount: 100.00 },
      { description: 'Donación voluntaria', amount: 200.00 },
      { description: 'Multa por mora', amount: 50.50 }
    ],
    total: 2101.00
  },
  {
    id: '2',
    type: 'COMPROBANTE_BANCO',
    date: '2023-10-14T10:15:00Z',
    amount: 1267.40,
    reference: 'CB-2023-10-456',
    memberName: 'María Gómez',
    memberId: '2',
    status: 'pending',
    createdAt: '2023-10-14T10:15:00Z',
    updatedAt: '2023-10-14T10:15:00Z',
    details: {
      'Tipo': 'Transferencia',
      'Concepto': 'Pago de cuota social Octubre 2023',
      'Comisión': '$15.00',
      'IVA': '$2.40'
    }
  }
];

export const load: PageServerLoad = async ({ params, locals }) => {
  try {
    // In a real app, you would fetch the receipt from your database
    const receipt = mockReceipts.find(r => r.id === params.id);
    
    if (!receipt) {
      throw error(404, 'Recibo no encontrado');
    }
    
    return {
      receipt
    };
  } catch (err) {
    console.error('Error loading receipt:', err);
    throw error(500, 'Error al cargar el recibo');
  }
};

export const actions: Actions = {
  // In a real app, you would add actions for approving, rejecting, and deleting receipts
  approve: async ({ params, request }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  },
  
  reject: async ({ params, request }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  },
  
  delete: async ({ params, request }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    throw redirect(303, '/recibos');
  }
};
