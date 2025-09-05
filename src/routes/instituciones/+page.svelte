<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  
  let institutions = [];
  let loading = true;
  let error = null;
  let showModal = false;
  let formData = {
    name: '',
    cuit: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    isActive: true
  };
  let formErrors = {};
  let isSubmitting = false;
  let searchTerm = '';
  let currentPage = 1;
  const itemsPerPage = 10;
  let totalItems = 0;

  const fetchInstitutions = async () => {
    try {
      loading = true;
      error = null;
      const params = new URLSearchParams({
        search: searchTerm,
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });
      
      const response = await fetch(`/api/institutions?${params}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar las instituciones');
      }
      
      const data = await response.json();
      institutions = data.data;
      totalItems = data.meta.total;
    } catch (err) {
      console.error('Error:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    currentPage = 1;
    fetchInstitutions();
  };

  const handlePageChange = (page) => {
    currentPage = page;
    fetchInstitutions();
  };

  const openModal = () => {
    formData = {
      name: '',
      cuit: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      isActive: true
    };
    formErrors = {};
    showModal = true;
  };

  const closeModal = () => {
    showModal = false;
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }
    
    if (!formData.cuit.trim()) {
      errors.cuit = 'El CUIT es requerido';
    } else if (!/^\d{2}-\d{8}-\d$/.test(formData.cuit)) {
      errors.cuit = 'Formato de CUIT inválido (ej: 30-12345678-9)';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    
    formErrors = errors;
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      isSubmitting = true;
      const response = await fetch('/api/institutions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar la institución');
      }
      
      await fetchInstitutions();
      closeModal();
    } catch (err) {
      console.error('Error:', err);
      error = err.message;
    } finally {
      isSubmitting = false;
    }
  };

  onMount(() => {
    fetchInstitutions();
  });
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-gray-800">Instituciones</h1>
    <button 
      on:click={openModal}
      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
    >
      Nueva Institución
    </button>
  </div>

  <!-- Search Form -->
  <form on:submit|preventDefault={handleSearch} class="mb-6">
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
      </div>
      <input
        type="text"
        bind:value={searchTerm}
        on:input={() => handleSearch()}
        placeholder="Buscar por nombre o CUIT..."
        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
  </form>

  <!-- Error Message -->
  {#if error}
    <div class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {error}
    </div>
  {/if}

  <!-- Loading State -->
  {#if loading && institutions.length === 0}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  {:else}
    <!-- Institutions Table -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CUIT
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each institutions as institution}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{institution.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{institution.cuit}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{institution.email || '-'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {institution.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href={`/instituciones/${institution.id}`} class="text-blue-600 hover:text-blue-900">Ver detalles</a>
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                  No se encontraron instituciones
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      {#if totalItems > itemsPerPage}
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button 
              on:click={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Anterior
            </button>
            <button 
              on:click={() => currentPage * itemsPerPage < totalItems && handlePageChange(currentPage + 1)}
              disabled={currentPage * itemsPerPage >= totalItems}
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Mostrando <span class="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a 
                <span class="font-medium">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span> de <span class="font-medium">{totalItems}</span> resultados
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  on:click={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Anterior</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                {#each Array(Math.ceil(totalItems / itemsPerPage)) as _, i}
                  {#if i + 1 === currentPage}
                    <button
                      on:click={() => handlePageChange(i + 1)}
                      aria-current="page"
                      class="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                    >
                      {i + 1}
                    </button>
                  {:else}
                    <button
                      on:click={() => handlePageChange(i + 1)}
                      class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                    >
                      {i + 1}
                    </button>
                  {/if}
                {/each}
                <button
                  on:click={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage * itemsPerPage >= totalItems}
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Siguiente</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Create Institution Modal -->
  {#if showModal}
    <div 
      class="fixed inset-0 overflow-y-auto" 
      role="dialog" 
      aria-modal="true"
      transition:fade={{ duration: 150 }}
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div 
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          on:click={closeModal}
          transition:opacity
        ></div>

        <!-- Modal panel -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div 
          class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          transition:scale
          in:scale-100
          out:scale-95
        >
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Nueva Institución
                </h3>
                
                <div class="space-y-4">
                  <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">Nombre *</label>
                    <input
                      type="text"
                      id="name"
                      bind:value={formData.name}
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    {#if formErrors.name}
                      <p class="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    {/if}
                  </div>
                  
                  <div>
                    <label for="cuit" class="block text-sm font-medium text-gray-700">CUIT *</label>
                    <input
                      type="text"
                      id="cuit"
                      bind:value={formData.cuit}
                      placeholder="30-12345678-9"
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    {#if formErrors.cuit}
                      <p class="mt-1 text-sm text-red-600">{formErrors.cuit}</p>
                    {/if}
                  </div>
                  
                  <div>
                    <label for="address" class="block text-sm font-medium text-gray-700">Dirección</label>
                    <input
                      type="text"
                      id="address"
                      bind:value={formData.address}
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label for="phone" class="block text-sm font-medium text-gray-700">Teléfono</label>
                      <input
                        type="text"
                        id="phone"
                        bind:value={formData.phone}
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        id="email"
                        bind:value={formData.email}
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      {#if formErrors.email}
                        <p class="mt-1 text-sm text-red-600">{formErrors.email}</p>
                      {/if}
                    </div>
                  </div>
                  
                  <div>
                    <label for="website" class="block text-sm font-medium text-gray-700">Sitio Web</label>
                    <div class="mt-1 flex rounded-md shadow-sm">
                      <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        https://
                      </span>
                      <input
                        type="text"
                        id="website"
                        bind:value={formData.website}
                        class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="www.ejemplo.com"
                      />
                    </div>
                  </div>
                  
                  <div class="flex items-center">
                    <input
                      id="isActive"
                      type="checkbox"
                      bind:checked={formData.isActive}
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label for="isActive" class="ml-2 block text-sm text-gray-700">
                      Institución activa
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              on:click={handleSubmit}
              disabled={isSubmitting}
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if isSubmitting}
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              {:else}
                Guardar
              {/if}
            </button>
            <button
              type="button"
              on:click={closeModal}
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
