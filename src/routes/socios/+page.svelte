<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  // Define the expected shape of our page data
  interface Member {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    createdAt: string;
    updatedAt: string;
  }
  
  interface PageMeta {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  }
  
  export let data: {
    members: Member[];
    meta: PageMeta;
    searchQuery: string;
    error?: string;
  };
  
  // Form state
  let searchInput = data.searchQuery || '';
  let isSearching = $page.url.searchParams.get('search') !== null;
  
  // Extract data from server load with defaults
  const { 
    members = [], 
    meta = { page: 1, pageSize: 10, total: 0, totalPages: 1 }, 
    searchQuery = '',
    error: loadError 
  } = data;
  const { page: currentPage = 1, pageSize = 10, total = 0, totalPages = 1 } = meta || {};
  
  // Update URL with new search parameters
  function updateQuery(params: Record<string, string | number | null | undefined>) {
    const url = new URL($page.url);
    for (const [k, v] of Object.entries(params)) {
      if (v === null || v === undefined || v === '') {
        url.searchParams.delete(k);
      } else {
        url.searchParams.set(k, String(v));
      }
    }
    // Reset to first page when searching
    if ('search' in params) {
      url.searchParams.set('page', '1');
    }
    goto(`${url.pathname}?${url.searchParams.toString()}`, { replaceState: true });
  }
  
  // Handle search form submission
  function handleSearch(e: SubmitEvent) {
    e.preventDefault();
    updateQuery({ search: searchInput });
  }
  
  // Handle pagination
  function goToPage(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages) return;
    updateQuery({ page: nextPage, search: searchInput || null });
  }
  
  // Format date for display
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('es-AR');
  }
</script>

<div class="px-4 sm:px-6 lg:px-8 py-8">
  <div class="sm:flex sm:items-center sm:justify-between">
    <div class="min-w-0 flex-1">
      <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        Socios
      </h2>
      <p class="mt-1 text-sm text-gray-600">
        Gestiona los socios del sistema
      </p>
    </div>
    <div class="mt-4 flex sm:ml-4 sm:mt-0">
      <a
        href="/socios/nuevo"
        class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Nuevo Socio
      </a>
    </div>
  </div>
  
  <!-- Search Form -->
  <div class="mt-6">
    <form on:submit={handleSearch} class="flex gap-2">
      <div class="flex-1">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o email..."
          bind:value={searchInput}
          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
        />
      </div>
      <button
        type="submit"
        class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Buscar
      </button>
      {#if isSearching}
        <button
          type="button"
          on:click={() => { searchInput = ''; updateQuery({ search: '' }); }}
          class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Limpiar
        </button>
      {/if}
    </form>
  </div>
  
  {#if loadError}
    <div class="mt-8 rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error al cargar los socios</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{loadError}</p>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="mt-8 flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nombre</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Teléfono</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fecha de Registro</th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                {#if members.length === 0}
                  <tr>
                    <td colspan="5" class="px-3 py-6 text-center text-sm text-gray-500">
                      {isSearching ? 'No se encontraron resultados para la búsqueda' : 'No hay socios registrados'}
                    </td>
                  </tr>
                {:else}
                  {#each members as member (member.id)}
                    <tr class="hover:bg-gray-50">
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {member.firstName} {member.lastName}
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {member.email || '-'}
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {member.phone || '-'}
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatDate(member.createdAt)}
                      </td>
                      <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <a href="/socios/{member.id}" class="text-blue-600 hover:text-blue-900">Ver</a>
                      </td>
                    </tr>
                  {/each}
                {/if}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
