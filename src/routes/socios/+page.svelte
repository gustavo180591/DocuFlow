<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { flip } from 'svelte/animate';

  // Types
  type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  
  interface Institution {
    id: string;
    name: string;
  }
  
  interface Member {
    id: string;
    dni: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    birthDate?: string;
    nationality: string;
    status: MemberStatus;
    joinedAt: string;
    institutionId: string;
    institution?: Institution;
  }
  
  interface MemberFormData {
    dni: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    birthDate: string;
    nationality: string;
    status: MemberStatus;
    joinedAt: string;
    institutionId: string;
  }
  
  let members: Member[] = [];
  let institutions: Institution[] = [];
  let loading = true;
  let error: string | null = null;
  let showModal = false;
  
  // Form data with all required fields from MemberFormData
  let formData: MemberFormData = {
    dni: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    birthDate: new Date().toISOString().split('T')[0],
    nationality: 'Argentina',
    status: 'PENDING_VERIFICATION',
    joinedAt: new Date().toISOString(),
    institutionId: institutions[0]?.id || ''
  };
  
  let formErrors: Partial<Record<keyof MemberFormData, string>> = {};
  let isSubmitting = false;
  let searchTerm = '';
  let currentPage = 1;
  const itemsPerPage = 10;
  let totalItems = 0;
  let selectedInstitution = '';
  let selectedStatus: MemberStatus | '' = '';

  const getStatusBadgeClass = (status: MemberStatus = 'INACTIVE'): string => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING_VERIFICATION': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: MemberStatus = 'INACTIVE'): string => {
    switch (status) {
      case 'ACTIVE': return 'Activo';
      case 'SUSPENDED': return 'Suspendido';
      case 'PENDING_VERIFICATION': return 'Pendiente';
      default: return 'Inactivo';
    }
  };

  const fetchMembers = async () => {
    try {
      loading = true;
      error = null;
      const params = new URLSearchParams({
        search: searchTerm,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(selectedInstitution && { institutionId: selectedInstitution }),
        ...(selectedStatus && { status: selectedStatus })
      });
      
      const response = await fetch(`/api/members?${params}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar los socios');
      }
      
      const data = await response.json() as { data: Member[], meta: { total: number } };
      members = data.data;
      totalItems = data.meta.total;
    } catch (err: unknown) {
      console.error('Error:', err);
      error = err instanceof Error ? err.message : 'Error desconocido';
    } finally {
      loading = false;
    }
  };

  const fetchInstitutions = async (): Promise<void> => {
    try {
      const response = await fetch('/api/institutions');
      if (response.ok) {
        const data = await response.json() as { data: Institution[] };
        institutions = data.data;
      }
    } catch (err) {
      console.error('Error fetching institutions:', err);
    }
  };

  const handleSearch = (e?: Event): void => {
    e?.preventDefault();
    currentPage = 1;
    fetchMembers().catch(err => {
      console.error('Error in handleSearch:', err);
      error = err instanceof Error ? err.message : 'Error desconocido';
    });
  };

  const handlePageChange = (page: number): void => {
    currentPage = page;
    fetchMembers().catch(err => {
      console.error('Error in handlePageChange:', err);
      error = err instanceof Error ? err.message : 'Error al cambiar de página';
    });
  };

  // Modal and Form Functions
  const closeModal = (): void => {
    showModal = false;
    // Reset form data when closing modal
    formData = {
      dni: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      birthDate: new Date().toISOString().split('T')[0],
      nationality: 'Argentina',
      status: 'PENDING_VERIFICATION' as MemberStatus,
      joinedAt: new Date().toISOString(),
      institutionId: institutions[0]?.id || ''
    };
    formErrors = {};
  };

  const openModal = (member?: Member): void => {
    if (member) {
      // Create a new form data object with all required fields
      const newFormData: MemberFormData = {
        dni: member.dni,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email || '',
        phone: member.phone || '',
        address: member.address || '',
        birthDate: member.birthDate || new Date().toISOString().split('T')[0],
        nationality: member.nationality || 'Argentina',
        status: member.status,
        joinedAt: member.joinedAt || new Date().toISOString(),
        institutionId: member.institution?.id || institutions[0]?.id || ''
      };
      formData = newFormData;
    } else {
      formData = {
        dni: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        birthDate: new Date().toISOString().split('T')[0],
        nationality: 'Argentina',
        status: 'PENDING_VERIFICATION' as MemberStatus,
        joinedAt: new Date().toISOString(),
        institutionId: institutions[0]?.id || ''
      };
    }
    formErrors = {};
    showModal = true;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.dni.trim()) {
      errors.dni = 'El DNI es requerido';
    } else if (!/^\d{7,8}$/.test(formData.dni)) {
      errors.dni = 'DNI inválido (7 u 8 dígitos)';
    }
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'El nombre es requerido';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'El apellido es requerido';
    }
    
    if (!formData.institutionId) {
      errors.institutionId = 'La institución es requerida';
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
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          birthDate: formData.birthDate || null,
          joinedAt: formData.joinedAt || new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el socio');
      }
      
      await fetchMembers();
      closeModal();
    } catch (err: unknown) {
      console.error('Error:', err);
      error = err instanceof Error ? err.message : 'Error desconocido';
    } finally {
      isSubmitting = false;
    }
  };

  // Status utility functions

  onMount(() => {
    fetchInstitutions().then(() => {
      fetchMembers();
    });
  });
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-gray-800">Socios</h1>
    <button 
      on:click={() => openModal()}
      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
      disabled={institutions.length === 0}
    >
      Nuevo Socio
    </button>
  </div>

  <!-- Search and Filters -->
  <form on:submit|preventDefault={handleSearch} class="mb-6 space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="md:col-span-2">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            bind:value={searchTerm}
            placeholder="Buscar por nombre, apellido o DNI..."
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      
      <div>
        <select
          bind:value={selectedInstitution}
          class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">Todas las instituciones</option>
          {#each institutions as institution}
            <option value={institution.id}>
              {institution.name}
            </option>
          {/each}
        </select>
      </div>
      
      <div>
        <select
          bind:value={selectedStatus}
          class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activo</option>
          <option value="INACTIVE">Inactivo</option>
          <option value="PENDING_VERIFICATION">Pendiente</option>
          <option value="SUSPENDED">Suspendido</option>
        </select>
      </div>
    </div>
    
    <div class="flex justify-end">
      <button
        type="submit"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Buscar
      </button>
    </div>
  </form>

  <!-- Error Message -->
  {#if error}
    <div class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {error}
    </div>
  {/if}

  {#if institutions.length === 0}
    <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-yellow-700">
            No hay instituciones disponibles. Por favor, <a href="/instituciones" class="font-medium text-yellow-700 underline hover:text-yellow-600">cree una institución</a> antes de agregar socios.
          </p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Loading State -->
  {#if loading && members.length === 0}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  {:else}
    <!-- Members Table -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DNI
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Institución
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha de Alta
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each members as member}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span class="text-blue-600 font-medium">
                        {member.firstName[0]}{member.lastName[0]}
                      </span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </div>
                      <div class="text-sm text-gray-500">
                        {member.email || 'Sin email'}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{member.dni}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{member.institution?.name || 'Sin institución'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(member.status)}`}>
                    {getStatusLabel(member.status)}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(member.joinedAt).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href={`/socios/${member.id}`} class="text-blue-600 hover:text-blue-900">Ver detalles</a>
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                  No se encontraron socios
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
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button 
              on:click={() => currentPage * itemsPerPage < totalItems && handlePageChange(currentPage + 1)}
              disabled={currentPage * itemsPerPage >= totalItems}
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

  <!-- Create Member Modal -->
  {#if showModal}
    <div 
      class="fixed inset-0 overflow-y-auto" 
      role="dialog" 
      aria-modal="true"
      in:fade={{ duration: 150 }}
      out:fade={{ duration: 150 }}
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div 
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          role="button"
          tabindex="0"
          on:click={closeModal}
          on:keydown={(e) => e.key === 'Enter' && closeModal()}
          in:fade
          out:fade
          aria-label="Cerrar modal"
        ></div>

        <!-- Modal panel -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div 
          class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
          in:scale
          out:scale
        >
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Nuevo Socio
                </h3>
                
                <div class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label for="dni" class="block text-sm font-medium text-gray-700">DNI *</label>
                      <input
                        type="text"
                        id="dni"
                        bind:value={formData.dni}
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="12345678"
                      />
                      {#if formErrors.dni}
                        <p class="mt-1 text-sm text-red-600">{formErrors.dni}</p>
                      {/if}
                    </div>
                    
                    <div>
                      <label for="institutionId" class="block text-sm font-medium text-gray-700">Institución *</label>
                      <select
                        id="institutionId"
                        bind:value={formData.institutionId}
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Seleccione una institución</option>
                        {#each institutions as institution}
                          <option value={institution.id}>{institution.name}</option>
                        {/each}
                      </select>
                      {#if formErrors.institutionId}
                        <p class="mt-1 text-sm text-red-600">{formErrors.institutionId}</p>
                      {/if}
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label for="firstName" class="block text-sm font-medium text-gray-700">Nombre *</label>
                      <input
                        type="text"
                        id="firstName"
                        bind:value={formData.firstName}
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      {#if formErrors.firstName}
                        <p class="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                      {/if}
                    </div>
                    
                    <div>
                      <label for="lastName" class="block text-sm font-medium text-gray-700">Apellido *</label>
                      <input
                        type="text"
                        id="lastName"
                        bind:value={formData.lastName}
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      {#if formErrors.lastName}
                        <p class="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                      {/if}
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    
                    <div>
                      <label for="phone" class="block text-sm font-medium text-gray-700">Teléfono</label>
                      <input
                        type="tel"
                        id="phone"
                        bind:value={formData.phone}
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
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
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label for="birthDate" class="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                      <input
                        type="date"
                        id="birthDate"
                        bind:value={formData.birthDate}
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label for="nationality" class="block text-sm font-medium text-gray-700">Nacionalidad</label>
                      <input
                        type="text"
                        id="nationality"
                        bind:value={formData.nationality}
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label for="joinedAt" class="block text-sm font-medium text-gray-700">Fecha de Alta</label>
                      <input
                        type="date"
                        id="joinedAt"
                        bind:value={formData.joinedAt}
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label for="status" class="block text-sm font-medium text-gray-700">Estado</label>
                      <select
                        id="status"
                        bind:value={formData.status}
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="PENDING_VERIFICATION">Pendiente de Verificación</option>
                        <option value="ACTIVE">Activo</option>
                        <option value="INACTIVE">Inactivo</option>
                        <option value="SUSPENDED">Suspendido</option>
                      </select>
                    </div>
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
