<script lang="ts">
  import { page } from '$app/stores';
  import { fade, scale } from 'svelte/transition';
  import { getErrorMessage, withErrorHandling } from '$lib/utils/errorHandling';
  import { formatDate, type Institution, type BaseInstitutionFormData } from '$lib/utils/validation';
  import Modal from '$lib/components/Modal.svelte';
  import { createInstitutionValidator } from '$lib/utils/validation';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { enhance } from '$app/forms';

  // Page data
  export let data: PageData;
  
  // State
  let showDeleteModal = false;
  let showEditModal = false;
  let isSubmitting = false;
  let formErrors: Record<string, string> = {};
  
  // Form data
  let formData: BaseInstitutionFormData = {
    name: '',
    cuit: '',
    email: '',
    address: ''
  };
  
  // Current institution being edited/deleted
  let currentInstitution: Institution | null = null;
  
  // Pagination
  const pageSize = 10;
  const currentPage = $page.url.searchParams.get('page') 
    ? parseInt($page.url.searchParams.get('page') || '1')
    : 1;
  
  // Computed values
  const totalPages = Math.ceil(data.meta.total / pageSize);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  
  // Initialize form with data if editing
  function editInstitution(institution: typeof currentInstitution) {
    if (!institution) return;
    
    currentInstitution = institution;
    formData = {
      name: institution.name,
      cuit: institution.cuit,
      email: institution.email || '',
      address: institution.address || ''
    };
    showEditModal = true;
  }
  
  // Handle form submission with enhanced form handling
  async function handleSubmit() {
    return withErrorHandling(async () => {
      isSubmitting = true;
      formErrors = {};
      
      const validator = createInstitutionValidator();
      const errors = validator(formData);
      
      if (Object.keys(errors).length > 0) {
        formErrors = errors;
        isSubmitting = false;
        return;
      }
      
      const url = currentInstitution 
        ? `/api/institutions/${currentInstitution.id}`
        : '/api/institutions';
      
      const method = currentInstitution ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Error al guardar la institución');
      }
      
      // Close modal and refresh data
      showEditModal = false;
      window.location.reload();
    }, (error) => {
      formErrors._form = getErrorMessage(error);
      isSubmitting = false;
    });
  }
  
  // Handle delete with error handling
  async function handleDelete() {
    if (!currentInstitution) return;
    
    return withErrorHandling(async () => {
      const response = await fetch(`/api/institutions/${currentInstitution!.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar la institución');
      }
      
      // Close modal and refresh data
      showDeleteModal = false;
      window.location.reload();
    }, (error) => {
      formErrors._form = getErrorMessage(error);
      showDeleteModal = false;
    });
  }
  
  // Pagination helpers
  function goToPage(page: number) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    goto(url.toString());
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Instituciones</h1>
    <button
      on:click={() => {
        currentInstitution = null;
        formData = { name: '', cuit: '', email: '', address: '' };
        showEditModal = true;
      }}
      class="btn-primary"
    >
      Nueva Institución
    </button>
  </div>
  
  {#if data.institutions.length === 0}
    <div class="text-center py-12">
      <p class="text-gray-500">No hay instituciones registradas</p>
    </div>
  {:else}
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CUIT
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha de Registro
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each data.institutions as institution (institution.id)}
            <tr class="hover:bg-gray-50" in:fade={{ duration: 150 }}>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {institution.name}
                </div>
                {#if institution.address}
                  <div class="text-sm text-gray-500">
                    {institution.address}
                  </div>
                {/if}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {institution.cuit}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {institution.email || '-'}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(institution.createdAt)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  on:click={() => editInstitution(institution)}
                  class="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Editar
                </button>
                <button
                  on:click={() => {
                    currentInstitution = institution;
                    showDeleteModal = true;
                  }}
                  class="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
      
      {#if totalPages > 1}
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              on:click={() => goToPage(currentPage - 1)}
              disabled={!hasPreviousPage}
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md {hasPreviousPage ? 'text-gray-700 bg-white hover:bg-gray-50' : 'text-gray-400 bg-gray-100 cursor-not-allowed'}"
            >
              Anterior
            </button>
            <button
              on:click={() => goToPage(currentPage + 1)}
              disabled={!hasNextPage}
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md {hasNextPage ? 'text-gray-700 bg-white hover:bg-gray-50' : 'text-gray-400 bg-gray-100 cursor-not-allowed'}"
            >
              Siguiente
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Mostrando <span class="font-medium">{(currentPage - 1) * pageSize + 1}</span> a
                <span class="font-medium">
                  {Math.min(currentPage * pageSize, data.meta.total)}
                </span> de <span class="font-medium">{data.meta.total}</span> resultados
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  on:click={() => goToPage(currentPage - 1)}
                  disabled={!hasPreviousPage}
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium {hasPreviousPage ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}"
                >
                  <span class="sr-only">Anterior</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                
                {#each Array.from({ length: totalPages }, (_, i) => i + 1) as pageNum}
                  <button
                    on:click={() => goToPage(pageNum)}
                    class={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pageNum === currentPage
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                {/each}
                
                <button
                  on:click={() => goToPage(currentPage + 1)}
                  disabled={!hasNextPage}
                  class={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                    hasNextPage ? 'bg-white text-gray-500 hover:bg-gray-50' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
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
</div>

<!-- Edit/Add Modal -->
<Modal
  isOpen={showEditModal}
  title={currentInstitution ? 'Editar Institución' : 'Nueva Institución'}
  onClose={() => showEditModal = false}
  onSubmit={handleSubmit}
  submitLoading={isSubmitting}
  submitLabel={currentInstitution ? 'Guardar Cambios' : 'Crear Institución'}
>
  <div class="space-y-4">
    {#if formErrors._form}
      <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{formErrors._form}</p>
          </div>
        </div>
      </div>
    {/if}
    
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700">Nombre *</label>
      <input
        type="text"
        id="name"
        bind:value={formData.name}
        class={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
          formErrors.name ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500' : ''
        }`}
        placeholder="Nombre de la institución"
      />
      {#if formErrors.name}
        <p class="mt-2 text-sm text-red-600">{formErrors.name}</p>
      {/if}
    </div>
    
    <div>
      <label for="cuit" class="block text-sm font-medium text-gray-700">CUIT *</label>
      <input
        type="text"
        id="cuit"
        bind:value={formData.cuit}
        class={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
          formErrors.cuit ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500' : ''
        }`}
        placeholder="00-12345678-9"
      />
      {#if formErrors.cuit}
        <p class="mt-2 text-sm text-red-600">{formErrors.cuit}</p>
      {/if}
    </div>
    
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
      <input
        type="email"
        id="email"
        bind:value={formData.email}
        class={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
          formErrors.email ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500' : ''
        }`}
        placeholder="email@institucion.com"
      />
      {#if formErrors.email}
        <p class="mt-2 text-sm text-red-600">{formErrors.email}</p>
      {/if}
    </div>
    
    <div>
      <label for="address" class="block text-sm font-medium text-gray-700">Dirección</label>
      <textarea
        id="address"
        bind:value={formData.address}
        rows="3"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        placeholder="Dirección de la institución"
      />
    </div>
  </div>
</Modal>

<!-- Delete Confirmation Modal -->
<Modal
  isOpen={showDeleteModal}
  title="Eliminar Institución"
  onClose={() => showDeleteModal = false}
  onSubmit={handleDelete}
  submitVariant="danger"
  submitLabel="Eliminar"
  submitLoading={isSubmitting}
>
  <p class="text-gray-700">
    ¿Estás seguro que deseas eliminar la institución <span class="font-semibold">{currentInstitution?.name}</span>?
    Esta acción no se puede deshacer.
  </p>
  
  {#if formErrors._form}
    <div class="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{formErrors._form}</p>
        </div>
      </div>
    </div>
  {/if}
</Modal>
