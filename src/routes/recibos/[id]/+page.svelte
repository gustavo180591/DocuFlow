<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  // Define the receipt item type
  interface ReceiptItem {
    description: string;
    amount: number;
  }
  
  // Define the receipt type
  interface Receipt {
    id: string;
    type: string;
    date: string;
    amount: number;
    reference: string | null;
    memberName: string | null;
    memberId: string | null;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
    details?: Record<string, any>;
    items?: Array<{
      description: string;
      amount: number;
    }>;
    total?: number;
  }
  
  export let data: {
    receipt: Receipt;
    error?: string;
  };
  
  // Format date for display
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Format currency
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  }
  
  // Get status display text and color
  function getStatusInfo(status: string) {
    switch (status) {
      case 'approved':
        return { text: 'Aprobado', class: 'bg-green-100 text-green-800' };
      case 'rejected':
        return { text: 'Rechazado', class: 'bg-red-100 text-red-800' };
      case 'pending':
      default:
        return { text: 'Pendiente', class: 'bg-yellow-100 text-yellow-800' };
    }
  }
  
  // Get status info for the current receipt
  $: statusInfo = getStatusInfo(data.receipt.status);
  
  // Safely get receipt items with a default empty array
  $: receiptItems = data.receipt.items || [];
  
  // Handle receipt approval
  async function approveReceipt() {
    try {
      // In a real app, you would make an API call to update the receipt status
      console.log('Approving receipt:', data.receipt.id);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, you would update the UI based on the API response
      alert('Recibo aprobado exitosamente');
      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error('Error approving receipt:', error);
      alert('Error al aprobar el recibo');
    }
  }
  
  // Handle receipt rejection
  async function rejectReceipt() {
    try {
      // In a real app, you would make an API call to update the receipt status
      console.log('Rejecting receipt:', data.receipt.id);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, you would update the UI based on the API response
      alert('Recibo rechazado');
      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error('Error rejecting receipt:', error);
      alert('Error al rechazar el recibo');
    }
  }
  
  // Handle receipt deletion
  async function deleteReceipt() {
    if (!confirm('¿Está seguro de que desea eliminar este recibo? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      // In a real app, you would make an API call to delete the receipt
      console.log('Deleting receipt:', data.receipt.id);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, you would redirect to the receipts list
      alert('Recibo eliminado exitosamente');
      goto('/recibos');
    } catch (error) {
      console.error('Error deleting receipt:', error);
      alert('Error al eliminar el recibo');
    }
  }
</script>

<div class="px-4 sm:px-6 lg:px-8 py-8">
  <div class="md:flex md:items-center md:justify-between">
    <div class="min-w-0 flex-1">
      <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        Recibo #{data.receipt.reference || data.receipt.id}
      </h2>
      <div class="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
        <div class="mt-2 flex items-center text-sm text-gray-500">
          <svg class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clip-rule="evenodd" />
          </svg>
          {formatDate(data.receipt.date)}
        </div>
        <div class="mt-2 flex items-center text-sm text-gray-500">
          <svg class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0z" />
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
          </svg>
          {data.receipt.memberName || 'Sin asignar'}
        </div>
        <div class="mt-2 flex items-center text-sm text-gray-500">
          <svg class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 01-1.138-.818zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.048.379.202.592.037.053.08.106.128.157z" />
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.974.85.6.537.99 1.285 1.06 2.123a.75.75 0 01-1.49.178c-.11-.88-.71-1.519-1.543-1.875a3.77 3.77 0 01-1.767-.564V14a.75.75 0 11-1.5 0v-.354a4.37 4.37 0 01-1.767.563 1.25 1.25 0 01-1.15-1.725 2.627 2.627 0 002.77-1.52.75.75 0 00-.73-.942 1 1 0 01-.812-.405 1.5 1.5 0 010-2.105c.239-.248.53-.41.854-.49a.75.75 0 01.813.26z" clip-rule="evenodd" />
          </svg>
          {formatCurrency(data.receipt.amount)}
        </div>
      </div>
    </div>
    <div class="mt-4 flex md:ml-4 md:mt-0
      {data.receipt.status === 'pending' ? 'space-x-3' : 'space-x-2'}">
      {#if data.receipt.status === 'pending'}
        <button
          type="button"
          on:click={approveReceipt}
          class="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        >
          <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
          </svg>
          Aprobar
        </button>
        <button
          type="button"
          on:click={rejectReceipt}
          class="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
          Rechazar
        </button>
      {/if}
      <button
        type="button"
        class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        on:click={() => goto('/recibos')}
      >
        <svg class="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
        </svg>
        Volver
      </button>
      <div class="relative ml-3">
        <button
          type="button"
          class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          id="menu-button"
          aria-expanded="false"
          aria-haspopup="true"
        >
          <span class="sr-only">Opciones</span>
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
          </svg>
        </button>
        <div
          class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabindex="-1"
        >
          <button
            type="button"
            class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
            tabindex="-1"
            id="menu-item-0"
            on:click={() => { /* Add edit functionality */ }}
          >
            Editar
          </button>
          <button
            type="button"
            class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
            tabindex="-1"
            id="menu-item-1"
            on:click={() => { /* Add download functionality */ }}
          >
            Descargar
          </button>
          <button
            type="button"
            class="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
            role="menuitem"
            tabindex="-1"
            id="menu-item-2"
            on:click={deleteReceipt}
            >Eliminar</button
          >
        </div>
      </div>
    </div>
  </div>
  
  <div class="mt-8">
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900">
          Detalles del Recibo
        </h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">
          Información detallada sobre el recibo
        </p>
      </div>
      <div class="border-t border-gray-200">
        <dl>
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">ID</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{data.receipt.id}</dd>
          </div>
          <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Tipo</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {data.receipt.type === 'LISTADO_APORTE' ? 'Aporte' : 'Comprobante Bancario'}
            </dd>
          </div>
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Referencia</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {data.receipt.reference || 'N/A'}
            </dd>
          </div>
          <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Socio</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {data.receipt.memberName || 'No asignado'}
              {#if data.receipt.memberId}
                <a 
                  href="/socios/{data.receipt.memberId}" 
                  class="ml-2 text-indigo-600 hover:text-indigo-900 text-xs"
                >
                  Ver perfil
                </a>
              {/if}
            </dd>
          </div>
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Monto</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {formatCurrency(data.receipt.amount)}
            </dd>
          </div>
          <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Estado</dt>
            <dd class="mt-1 text-sm sm:col-span-2 sm:mt-0">
              <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusInfo.class}">
                {statusInfo.text}
              </span>
            </dd>
          </div>
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Creado el</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {formatDate(data.receipt.createdAt)}
            </dd>
          </div>
          <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Última actualización</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {formatDate(data.receipt.updatedAt)}
            </dd>
          </div>
          
          {#if data.receipt.type === 'LISTADO_APORTE' && receiptItems.length > 0}
            <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-1 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Detalle de ítems</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-1 sm:mt-0">
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-300">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Descripción
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                          Monto
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      {#each receiptItems as item, i}
                        <tr class={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {item.description}
                          </td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      {/each}
                      {#if data.receipt.total !== undefined}
                        <tr class="border-t border-gray-200">
                          <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-semibold text-gray-900 sm:pl-6">
                            Total
                          </td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-900 text-right">
                            {formatCurrency(data.receipt.total)}
                          </td>
                        </tr>
                      {/if}
                    </tbody>
                  </table>
                </div>
              </dd>
            </div>
          {/if}
          
          {#if data.receipt.details && Object.keys(data.receipt.details).length > 0}
            <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-1 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Detalles adicionales</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-1 sm:mt-0">
                <dl class="divide-y divide-gray-200">
                  {#each Object.entries(data.receipt.details) as [key, value], i (i)}
                    <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                      <dt class="text-sm font-medium text-gray-500">{key}</dt>
                      <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        {value}
                      </dd>
                    </div>
                  {/each}
                </dl>
              </dd>
            </div>
          {/if}
          
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-1 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Acciones</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-1 sm:mt-0">
              <div class="flex space-x-3">
                <button
                  type="button"
                  class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <svg class="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                  Vista previa
                </button>
                <button
                  type="button"
                  class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <svg class="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                  Descargar
                </button>
                <button
                  type="button"
                  on:click={() => {}}
                  class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <svg class="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                  </svg>
                  Editar
                </button>
              </div>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
  
  <!-- Activity timeline -->
  <div class="mt-8">
    <h3 class="text-lg font-medium leading-6 text-gray-900">Actividad</h3>
    <div class="mt-6 flow-root">
      <ul role="list" class="-mb-8">
        <li>
          <div class="relative pb-8">
            <span class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
            <div class="relative flex space-x-3">
              <div>
                <span class="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                  <svg class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
                </span>
              </div>
              <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                <div>
                  <p class="text-sm text-gray-500">
                    <span class="font-medium text-gray-900">Sistema</span> creó el recibo
                  </p>
                </div>
                <div class="whitespace-nowrap text-right text-sm text-gray-500">
                  {formatDate(data.receipt.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </li>
        
        {#if data.receipt.updatedAt !== data.receipt.createdAt}
          <li>
            <div class="relative pb-8">
              <span class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
              <div class="relative flex space-x-3">
                <div>
                  <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                    <svg class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                  </span>
                </div>
                <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p class="text-sm text-gray-500">
                      <span class="font-medium text-gray-900">Sistema</span> actualizó el recibo
                    </p>
                  </div>
                  <div class="whitespace-nowrap text-right text-sm text-gray-500">
                    {formatDate(data.receipt.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          </li>
        {/if}
      </ul>
    </div>
  </div>
</div>
