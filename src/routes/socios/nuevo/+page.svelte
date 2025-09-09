<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  // Form state interface
  interface MemberFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    membershipType: string;
    membershipStartDate: string;
    membershipEndDate: string;
    status: string;
    notes: string;
  }

  // Form state with default values
  let formData: MemberFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'México',
    membershipType: 'standard',
    membershipStartDate: new Date().toISOString().split('T')[0],
    membershipEndDate: '',
    status: 'active',
    notes: ''
  };

  // Form state
  let isSubmitting = false;
  let formError = '';
  let formSuccess = false;
  const errors: Record<string, string> = {};

  // Calculate default end date (1 year from now)
  function calculateDefaultEndDate(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  }

  // Set default end date on mount
  onMount(() => {
    formData.membershipEndDate = calculateDefaultEndDate();
  });

  // Handle form submission
  async function handleSubmit(event: Event) {
    event.preventDefault();
    isSubmitting = true;
    formError = '';
    
    // Basic validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'El nombre es requerido';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'El apellido es requerido';
    }
    if (!formData.email.trim()) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Por favor ingrese un correo electrónico válido';
    }

    if (Object.keys(errors).length > 0) {
      isSubmitting = false;
      return;
    }

    try {
      const response = await fetch('/api/socios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el socio');
      }

      formSuccess = true;
      // Redirect after successful submission
      setTimeout(() => {
        goto('/socios');
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
      formError = error instanceof Error ? error.message : 'Ocurrió un error inesperado';
    } finally {
      isSubmitting = false;
    }
  }

  // Handle input changes
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    formData = {
      ...formData,
      [target.name]: target.value
    };
  }

  // Handle cancel
  function handleCancel() {
    if (confirm('¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán.')) {
      goto('/socios');
    }
  }
</script>

<div class="px-4 sm:px-6 lg:px-8 py-8">
  <div class="md:flex md:items-center md:justify-between">
    <div class="min-w-0 flex-1">
      <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        Nuevo Socio
      </h2>
    </div>
    <div class="mt-4 flex md:ml-4 md:mt-0">
      <button
        type="button"
        on:click={handleCancel}
        class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      >
        Volver
      </button>
    </div>
  </div>
  
  <div class="mt-8">
    <div class="md:grid md:grid-cols-3 md:gap-6">
      <div class="md:col-span-1">
        <div class="px-4 sm:px-0">
          <h3 class="text-lg font-medium leading-6 text-gray-900">Información del Socio</h3>
          <p class="mt-1 text-sm text-gray-600">
            Ingrese los datos del nuevo socio. Los campos marcados con * son obligatorios.
          </p>
        </div>
      </div>
      
      <div class="mt-5 md:col-span-2 md:mt-0">
        {#if formError}
          <div class="mb-6 rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Error</h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{formError}</p>
                </div>
              </div>
            </div>
          </div>
        {/if}
        
        {#if formSuccess}
          <div class="mb-6 rounded-md bg-green-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">Éxito</h3>
                <div class="mt-2 text-sm text-green-700">
                  <p>Socio creado exitosamente. Redirigiendo...</p>
                </div>
              </div>
            </div>
          </div>
        {/if}
        
        <form on:submit={handleSubmit} class="space-y-6">
          <div class="overflow-hidden shadow sm:rounded-md">
            <div class="bg-white px-4 py-5 sm:p-6">
              <div class="grid grid-cols-6 gap-6">
                <div class="col-span-6 sm:col-span-3">
                  <label for="firstName" class="block text-sm font-medium text-gray-700">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    bind:value={formData.firstName}
                    on:input={handleInput}
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  {#if errors.firstName}
                    <p class="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  {/if}
                </div>

                <div class="col-span-6 sm:col-span-3">
                  <label for="lastName" class="block text-sm font-medium text-gray-700">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    bind:value={formData.lastName}
                    on:input={handleInput}
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  {#if errors.lastName}
                    <p class="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  {/if}
                </div>

                <div class="col-span-6 sm:col-span-4">
                  <label for="email" class="block text-sm font-medium text-gray-700">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    bind:value={formData.email}
                    on:input={handleInput}
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  {#if errors.email}
                    <p class="mt-1 text-sm text-red-600">{errors.email}</p>
                  {/if}
                </div>

                <div class="col-span-6 sm:col-span-3">
                  <label for="phone" class="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    bind:value={formData.phone}
                    on:input={handleInput}
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div class="col-span-6">
                  <label for="address" class="block text-sm font-medium text-gray-700">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    bind:value={formData.address}
                    on:input={handleInput}
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div class="col-span-6 sm:col-span-2">
                  <label for="city" class="block text-sm font-medium text-gray-700">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    bind:value={formData.city}
                    on:input={handleInput}
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div class="col-span-6 sm:col-span-2">
                  <label for="state" class="block text-sm font-medium text-gray-700">
                    Estado
                  </label>
                  <input
                    type="text"
                    name="state"
                    id="state"
                    bind:value={formData.state}
                    on:input={handleInput}
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div class="col-span-6 sm:col-span-2">
                  <label for="postalCode" class="block text-sm font-medium text-gray-700">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    id="postalCode"
                    bind:value={formData.postalCode}
                    on:input={handleInput}
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div class="col-span-6 sm:col-span-3">
                  <label for="membershipType" class="block text-sm font-medium text-gray-700">
                    Tipo de Membresía
                  </label>
                  <select
                    id="membershipType"
                    name="membershipType"
                    bind:value={formData.membershipType}
                    on:change={handleInput}
                    class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="standard">Estándar</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>

                <div class="col-span-6 sm:col-span-3">
                  <label for="status" class="block text-sm font-medium text-gray-700">
                    Estado
                  </label>
                  <select
                    id="status"
                    name="status"
                    bind:value={formData.status}
                    on:change={handleInput}
                    class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                </div>

                <div class="col-span-6 sm:col-span-3">
                  <label for="membershipStartDate" class="block text-sm font-medium text-gray-700">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    name="membershipStartDate"
                    id="membershipStartDate"
                    bind:value={formData.membershipStartDate}
                    on:input={handleInput}
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div class="col-span-6 sm:col-span-3">
                  <label for="membershipEndDate" class="block text-sm font-medium text-gray-700">
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    name="membershipEndDate"
                    id="membershipEndDate"
                    bind:value={formData.membershipEndDate}
                    on:input={handleInput}
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div class="col-span-6">
                  <label for="notes" class="block text-sm font-medium text-gray-700">
                    Notas
                  </label>
                  <div class="mt-1">
                    <textarea
                      id="notes"
                      name="notes"
                      rows="3"
                      bind:value={formData.notes}
                      on:input={handleInput}
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 text-right sm:px-6">
              <button
                type="button"
                on:click={handleCancel}
                class="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
