<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { fade, slide } from 'svelte/transition';
  
  export let data;
  
  let institution = $state(data.institution);
  let loading = $state(false);
  let error = $state(null);
  let activeTab = $state('overview');
  let showEditModal = $state(false);
  let showDeleteModal = $state(false);
  
  let formData = $state({
    name: institution?.name || '',
    cuit: institution?.cuit || '',
    address: institution?.address || '',
    phone: institution?.phone || '',
    email: institution?.email || '',
    website: institution?.website || '',
    isActive: institution?.isActive ?? true
  });
  
  let formErrors = $state({});
  let isSubmitting = $state(false);
  let isDeleting = $state(false);
  
  const fetchInstitution = async () => {
    try {
      loading = true;
      error = null;
      const response = await fetch(`/api/institutions/${$page.params.id}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar la institución');
      }
      
      const data = await response.json();
      institution = data;
      
      // Update form data
      formData = {
        name: data.name,
        cuit: data.cuit,
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        isActive: data.isActive
      };
    } catch (err) {
      console.error('Error:', err);
      error = err.message;
    } finally {
      loading = false;
    }
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
      const response = await fetch(`/api/institutions/${$page.params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la institución');
      }
      
      const updatedInstitution = await response.json();
      institution = updatedInstitution;
      showEditModal = false;
    } catch (err) {
      console.error('Error:', err);
      error = err.message;
    } finally {
      isSubmitting = false;
    }
  };
  
  const handleDelete = async () => {
    try {
      isDeleting = true;
      const response = await fetch(`/api/institutions/${$page.params.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar la institución');
      }
      
      // Redirect to institutions list
      window.location.href = '/instituciones';
    } catch (err) {
      console.error('Error:', err);
      error = err.message;
      showDeleteModal = false;
    } finally {
      isDeleting = false;
    }
  };
  
  onMount(() => {
    fetchInstitution();
  });
</script>

<div class="bg-white shadow overflow-hidden sm:rounded-lg">
  <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
    <div>
      <h3 class="text-lg leading-6 font-medium text-gray-900">
        {#if loading}
          Cargando...
        {:else}
          {institution?.name || 'Institución no encontrada'}
        {/if}
      </h3>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">
        Detalles de la institución
      </p>
    </div>
    <div class="flex space-x-3">
      <button
        on:click={() => showEditModal = true}
        class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        Editar
      </button>
      <button
        on:click={() => showDeleteModal = true}
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        Eliminar
      </button>
    </div>
  </div>
  
  {#if loading}
    <div class="px-4 py-5 sm:p-6 flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  {:else if error}
    <div class="px-4 py-5 sm:p-6">
      <div class="bg-red-50 border-l-4 border-red-400 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    </div>
  {:else if institution}
    <div class="border-t border-gray-200">
      <dl>
        <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Nombre</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{institution.name}</dd>
        </div>
        <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">CUIT</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{institution.cuit}</dd>
        </div>
        <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Dirección</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{institution.address || '-'}</dd>
        </div>
        <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Teléfono</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{institution.phone || '-'}</dd>
        </div>
        <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Email</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{institution.email || '-'}</dd>
        </div>
        <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Sitio Web</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            {#if institution.website}
              <a href={institution.website.startsWith('http') ? institution.website : `https://${institution.website}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 class="text-blue-600 hover:text-blue-800">
                {institution.website}
              </a>
            {:else}
              -
            {/if}
          </dd>
        </div>
        <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Estado</dt>
          <dd class="mt-1 text-sm sm:mt-0 sm:col-span-2">
            <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${institution.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {institution.isActive ? 'Activa' : 'Inactiva'}
            </span>
          </dd>
        </div>
        <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Fecha de creación</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            {new Date(institution.createdAt).toLocaleString()}
          </dd>
        </div>
        <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Última actualización</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            {new Date(institution.updatedAt).toLocaleString()}
          </dd>
        </div>
      </dl>
    </div>
  {/if}
</div>

<!-- Edit Modal -->
{#if showEditModal}
  <div 
    class="fixed inset-0 overflow-y-auto z-50"
    role="dialog" 
    aria-modal="true"
    transition:fade={{ duration: 150 }}
  >
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div 
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
        on:click={() => showEditModal = false}
        transition:opacity
      ></div>

      <!-- Modal panel -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      
      <div 
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
        transition:scale
        in:scale-100
        out:scale-95
      >
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Editar Institución
              </h3>
              
              <div class="space-y-4">
                <div>
                  <label for="edit-name" class="block text-sm font-medium text-gray-700">Nombre *</label>
                  <input
                    type="text"
                    id="edit-name"
                    bind:value={formData.name}
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {#if formErrors.name}
                    <p class="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  {/if}
                </div>
                
                <div>
                  <label for="edit-cuit" class="block text-sm font-medium text-gray-700">CUIT *</label>
                  <input
                    type="text"
                    id="edit-cuit"
                    bind:value={formData.cuit}
                    placeholder="30-12345678-9"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {#if formErrors.cuit}
                    <p class="mt-1 text-sm text-red-600">{formErrors.cuit}</p>
                  {/if}
                </div>
                
                <div>
                  <label for="edit-address" class="block text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    type="text"
                    id="edit-address"
                    bind:value={formData.address}
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="edit-phone" class="block text-sm font-medium text-gray-700">Teléfono</label>
                    <input
                      type="text"
                      id="edit-phone"
                      bind:value={formData.phone}
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label for="edit-email" class="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      id="edit-email"
                      bind:value={formData.email}
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    {#if formErrors.email}
                      <p class="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    {/if}
                  </div>
                </div>
                
                <div>
                  <label for="edit-website" class="block text-sm font-medium text-gray-700">Sitio Web</label>
                  <div class="mt-1 flex rounded-md shadow-sm">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      https://
                    </span>
                    <input
                      type="text"
                      id="edit-website"
                      bind:value={formData.website}
                      class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="www.ejemplo.com"
                    />
                  </div>
                </div>
                
                <div class="flex items-center">
                  <input
                    id="edit-isActive"
                    type="checkbox"
                    bind:checked={formData.isActive}
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="edit-isActive" class="ml-2 block text-sm text-gray-700">
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
            on:click={() => showEditModal = false}
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
  <div 
    class="fixed z-10 inset-0 overflow-y-auto"
    role="dialog" 
    aria-modal="true"
    transition:fade={{ duration: 150 }}
  >
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div 
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
        on:click={() => showDeleteModal = false}
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
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Eliminar institución
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  ¿Estás seguro de que deseas eliminar la institución "{institution?.name}"? Esta acción no se puede deshacer.
                </p>
                {#if error}
                  <p class="mt-2 text-sm text-red-600">{error}</p>
                {/if}
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            on:click={handleDelete}
            disabled={isDeleting}
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if isDeleting}
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Eliminando...
            {:else}
              Eliminar
            {/if}
          </button>
          <button
            type="button"
            on:click={() => showDeleteModal = false}
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
