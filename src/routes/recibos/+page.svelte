<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { Receipt } from '$lib/types/receipt';
  
  // Component state
  let searchQuery = '';
  let searchTimeout: ReturnType<typeof setTimeout>;
  
  // Export the page data type from the load function
  export let data: {
    receipts: Receipt[];
    meta: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
    searchQuery: string;
    error?: string;
  };
  
  // Utility functions will be placed at the bottom of the script section

  // Initialize search query from page data
  $: if ($page.data) {
    searchQuery = $page.data.searchQuery || '';
  }
  
  function handleSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    const query = target.value;
    searchQuery = query; // Update local state
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const url = new URL(window.location.href);
      if (query) {
        url.searchParams.set('search', query);
      } else {
        url.searchParams.delete('search');
      }
      url.searchParams.delete('page');
      goto(url.toString(), { replaceState: true });
    }, 300);
  }
  
  // Handle pagination
  function goToPage(page: number) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    if (searchQuery) {
      url.searchParams.set('search', searchQuery);
    }
    goto(url.toString());
  }
  
  
  // Format date for display
  function formatDate(dateString: string, timeOnly = false): string {
    try {
      if (!dateString) return '';
      const date = new Date(dateString);
      
      if (timeOnly) {
        return date.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString || '';
    }
  }
  
  // Format currency
  function formatCurrency(amount: number): string {
    try {
      if (amount === undefined || amount === null) return '';
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
      }).format(amount);
    } catch (e) {
      console.error('Error formatting currency:', e);
      return amount?.toString() || '';
    }
  }
  
  // Get status badge color
  function getStatusColor(status: string): string {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  }
  
  // Get status display text
  function getStatusText(status: string): string {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'pending':
      default:
        return 'Pendiente';
    }
  }
</script>

<div class="px-4 sm:px-6 lg:px-8 py-8">
  <div class="sm:flex sm:items-center sm:justify-between">
    <div class="min-w-0 flex-1">
      <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        Recibos
      </h2>
    </div>
    <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
      <button
        type="button"
        class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        on:click={() => goto('/recibos/nuevo')}
      >
        Nuevo Recibo
      </button>
    </div>
  </div>
  
  <!-- Search and filter -->
  <div class="mt-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <div class="relative mt-2 rounded-md shadow-sm">
          <input
            type="text"
            name="search"
            id="search"
            class="block w-full rounded-md border-0 py-1.5 pl-4 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Buscar por referencia o nombre..."
            bind:value={searchQuery}
            on:keydown={(e) => e.key === 'Enter' && handleSearch(e)}
          />
          <div class="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              type="button"
              class="text-gray-400 hover:text-gray-500"
              on:click={handleSearch}
            >
              <span class="sr-only">Buscar</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div class="mt-4 sm:ml-4 sm:mt-0">
        <select
          id="status"
          name="status"
          class="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobados</option>
          <option value="rejected">Rechazados</option>
        </select>
      </div>
    </div>
  </div>
  
  <!-- Error message -->
  {#if data?.error}
    <div class="mt-4 rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error al cargar los recibos</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{data.error}</p>
          </div>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Receipts table -->
  <div class="mt-8 flow-root">
    <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Fecha
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Tipo
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Socio
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Referencia
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Monto
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Estado
                </th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span class="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              {#if data?.receipts?.length > 0}
                {#each data.receipts as receipt (receipt.id)}
                  <tr class="hover:bg-gray-50">
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      <div class="flex flex-col">
                        <span>{formatDate(receipt.date)}</span>
                        <span class="text-xs text-gray-500">
                          {new Date(receipt.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div class="flex items-center">
                        {#if receipt.type === 'LISTADO_APORTE'}
                          <svg class="mr-2 h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Aporte
                        {:else}
                          <svg class="mr-2 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10V6a2 2 0 012-2h14a2 2 0 012 2v4" />
                          </svg>
                          Comprobante Bancario
                        {/if}
                      </div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                      {receipt.memberName || 'N/A'}
                      {#if receipt.memberId}
                        <span class="block text-xs text-gray-500">ID: {receipt.memberId}</span>
                      {/if}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-mono">
                      {receipt.reference || 'N/A'}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(receipt.amount)}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                      <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusColor(receipt.status)}">
                        {getStatusText(receipt.status)}
                      </span>
                      <span class="block text-xs text-gray-500 mt-1">
                        {formatDate(receipt.updatedAt, true)}
                      </span>
                    </td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div class="flex justify-end space-x-2">
                        <a
                        href="/recibos/{receipt.id}"
                        class="text-indigo-600 hover:text-indigo-900"
                      >
                        Ver<span class="sr-only">, {receipt.reference || 'recibo'}</span>
                      </a>
                    </td>
                  </tr>
                {/each}
              {:else}
                <tr>
                  <td colspan="7" class="px-6 py-12 text-center">
                    <div class="flex flex-col items-center justify-center space-y-4">
                      <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h3 class="text-lg font-medium text-gray-900">
                        {searchQuery ? 'No se encontraron resultados' : 'No hay recibos registrados'}
                      </h3>
                      <p class="text-gray-500 max-w-md">
                        {searchQuery 
                          ? 'No se encontraron recibos que coincidan con tu búsqueda. Intenta con otros criterios.'
                          : 'Comienza subiendo tu primer recibo haciendo clic en el botón "Nuevo Recibo".'
                        }
                      </p>
                      {#if !searchQuery}
                        <button
                          type="button"
                          on:click={() => goto('/recibos/nuevo')}
                          class="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                          </svg>
                          Nuevo Recibo
                        </button>
                      {/if}
                    </div>
                  </td>
                </tr>
              {/if}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Pagination -->
  {#if data?.meta?.totalPages > 1}
    <div class="mt-8 flex items-center justify-between">
      <div class="flex flex-1 justify-between sm:hidden">
        {#if data.meta.page > 1}
          <a
            href="?page={data.meta.page - 1}{searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}"
            class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Anterior
          </a>
        {:else}
          <span class="relative inline-flex items-center rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed">
            Anterior
          </span>
        {/if}
        {#if data.meta.page < data.meta.totalPages}
          <a
            href="?page={data.meta.page + 1}{searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}"
            class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Siguiente
          </a>
        {:else}
          <span class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed">
            Siguiente
          </span>
        {/if}
      </div>
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Mostrando <span class="font-medium">{(data.meta.page - 1) * data.meta.pageSize + 1}</span> a <span class="font-medium">
              {Math.min(data.meta.page * data.meta.pageSize, data.meta.total)}
            </span> de <span class="font-medium">{data.meta.total}</span> resultados
          </p>
        </div>
        <div>
          <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <!-- Previous page -->
            {#if data.meta.page > 1}
              <a
                href="?page={data.meta.page - 1}{searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}"
                class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span class="sr-only">Anterior</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                </svg>
              </a>
            {:else}
              <span class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-300 ring-1 ring-inset ring-gray-300 cursor-not-allowed">
                <span class="sr-only">Anterior</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                </svg>
              </span>
            {/if}
            
            <!-- Page numbers -->
            {#each Array.from({ length: Math.min(5, data.meta.totalPages) }, (_, i) => i + 1) as pageNumber}
              {#if (data.meta.page <= 3 && pageNumber <= 5) ||
                  (data.meta.page >= data.meta.totalPages - 2 && 
                   pageNumber >= data.meta.totalPages - 4) ||
                  (pageNumber >= data.meta.page - 2 && pageNumber <= data.meta.page + 2)}
                {#if pageNumber >= 1 && pageNumber <= data.meta.totalPages}
                <a
                  href="?page={pageNumber}{searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}"
                  class="relative inline-flex items-center px-4 py-2 text-sm font-semibold {data.meta.page === pageNumber 
                    ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' 
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}"
                  aria-current={data.meta.page === pageNumber ? 'page' : undefined}
                >
                  {pageNumber}
                </a>
                {/if}
              {/if}
            {/each}
            
            <!-- Next page -->
            {#if data.meta.page < data.meta.totalPages}
              <a
                href="?page={data.meta.page + 1}{searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}"
                class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span class="sr-only">Siguiente</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                </svg>
              </a>
            {:else}
              <span class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-300 ring-1 ring-inset ring-gray-300 cursor-not-allowed">
                <span class="sr-only">Siguiente</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                </svg>
              </span>
            {/if}
          </nav>
        </div>
      </div>
    </div>
  {/if}
</div>
