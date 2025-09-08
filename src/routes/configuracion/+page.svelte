<script lang="ts">
  import { systemConfig } from '$lib/services/system-config.service';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { toast } from 'svelte-sonner';
  
  // Define the form data type
  interface ConfigFormData {
    appName: string;
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    primaryTextColor: string;
    secondaryTextColor: string;
    borderRadius: string;
    defaultLocale: 'es' | 'en' | 'pt';
  }
  
  let formData: ConfigFormData = {
    appName: '',
    logoUrl: '',
    primaryColor: '#4f46e5',
    secondaryColor: '#7c3aed',
    primaryTextColor: '#111827',
    secondaryTextColor: '#4b5563',
    borderRadius: '0.75rem',
    defaultLocale: 'es'
  };
  
  let isLoading = true;
  let isSaving = false;
  
  // Load current config
  onMount(async () => {
    try {
      const config = await systemConfig.load();
      if (config) {
        formData = {
          appName: config.appName,
          logoUrl: config.logoUrl || '',
          primaryColor: config.primaryColor,
          secondaryColor: config.secondaryColor,
          primaryTextColor: config.primaryTextColor,
          secondaryTextColor: config.secondaryTextColor,
          borderRadius: config.borderRadius,
          defaultLocale: config.defaultLocale
        };
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast.error('Error al cargar la configuración');
    } finally {
      isLoading = false;
    }
  });
  
  async function handleSubmit() {
    try {
      isSaving = true;
      await systemConfig.update(formData);
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      isSaving = false;
    }
  }
  
  function handleColorChange(event: Event, field: keyof ConfigFormData) {
    const target = event.target as HTMLInputElement;
    if (target) {
      formData = { ...formData, [field]: target.value };
    }
  }
</script>

<div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Configuración del Sistema</h1>
    
    {#if isLoading}
      <div class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    {:else}
      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <!-- General Settings -->
        <div class="space-y-4">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white">Ajustes Generales</h2>
          
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="appName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre de la Aplicación
              </label>
              <input
                id="appName"
                type="text"
                bind:value={formData.appName}
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label for="logoUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL del Logo
              </label>
              <input
                id="logoUrl"
                type="url"
                bind:value={formData.logoUrl}
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="https://ejemplo.com/logo.png"
              />
              {#if formData.logoUrl}
                <div class="mt-2">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Vista previa:</p>
                  <img src={formData.logoUrl} alt="Logo preview" class="h-12 mt-1" />
                </div>
              {/if}
            </div>
          </div>
          
          <div>
            <label for="defaultLocale" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Idioma Predeterminado
            </label>
            <select
              id="defaultLocale"
              bind:value={formData.defaultLocale}
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>
        </div>
        
        <!-- Theme Colors -->
        <div class="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white">Colores del Tema</h2>
          
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="primaryColor" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color Primario
              </label>
              <div class="flex items-center space-x-2">
                <input
                  type="color"
                  id="primaryColor"
                  bind:value={formData.primaryColor}
                  on:input={(e) => handleColorChange(e, 'primaryColor')}
                  class="h-10 w-16 rounded border border-gray-300"
                />
                <input
                  type="text"
                  bind:value={formData.primaryColor}
                  on:input={(e) => handleColorChange(e, 'primaryColor')}
                  class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label for="secondaryColor" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color Secundario
              </label>
              <div class="flex items-center space-x-2">
                <input
                  type="color"
                  id="secondaryColor"
                  bind:value={formData.secondaryColor}
                  on:input={(e) => handleColorChange(e, 'secondaryColor')}
                  class="h-10 w-16 rounded border border-gray-300"
                />
                <input
                  type="text"
                  bind:value={formData.secondaryColor}
                  on:input={(e) => handleColorChange(e, 'secondaryColor')}
                  class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label for="primaryTextColor" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color de Texto Primario
              </label>
              <div class="flex items-center space-x-2">
                <input
                  type="color"
                  id="primaryTextColor"
                  bind:value={formData.primaryTextColor}
                  on:input={(e) => handleColorChange(e, 'primaryTextColor')}
                  class="h-10 w-16 rounded border border-gray-300"
                />
                <input
                  type="text"
                  bind:value={formData.primaryTextColor}
                  on:input={(e) => handleColorChange(e, 'primaryTextColor')}
                  class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label for="secondaryTextColor" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color de Texto Secundario
              </label>
              <div class="flex items-center space-x-2">
                <input
                  type="color"
                  id="secondaryTextColor"
                  bind:value={formData.secondaryTextColor}
                  on:input={(e) => handleColorChange(e, 'secondaryTextColor')}
                  class="h-10 w-16 rounded border border-gray-300"
                />
                <input
                  type="text"
                  bind:value={formData.secondaryTextColor}
                  on:input={(e) => handleColorChange(e, 'secondaryTextColor')}
                  class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          <div class="pt-2">
            <label for="borderRadius" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Radio de Bordes
            </label>
            <div class="flex items-center space-x-4">
              <input
                type="range"
                id="borderRadius"
                bind:value={formData.borderRadius.replace('rem', '')}
                min="0"
                max="2"
                step="0.1"
                on:input={(e) => {
                  const target = e.currentTarget as HTMLInputElement;
                  formData = {
                    ...formData,
                    borderRadius: `${target.value}rem`
                  };
                }}
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <span class="text-sm text-gray-600 dark:text-gray-300 w-16">
                {formData.borderRadius}
              </span>
            </div>
          </div>
        </div>
        
        <div class="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if isSaving}
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            {:else}
              Guardar Cambios
            {/if}
          </button>
        </div>
      </form>
    {/if}
  </div>
</div>
