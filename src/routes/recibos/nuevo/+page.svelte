<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { API_ENDPOINTS } from '$lib/config';
  
  // Types
  interface FileUpload {
    name: string;
    size: number;
    type: string;
    file: File; // The actual File object for upload
  }

  interface UploadStatus {
    name: string;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    progress: number;
    error: string | null;
    documentId?: string;
    redirectPath?: string;
  }

  // Form state
  let files: FileUpload[] = [];
  let uploads: UploadStatus[] = [];
  let isUploading = false;
  let error = '';
  let success = '';
  
  // Handle file selection
  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const selectedFiles = Array.from(target.files || []).map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file // Keep the original file object for upload
    }));
    
    if (selectedFiles.length > 0) {
      files = [...files, ...selectedFiles];
      // Reset input value to allow selecting the same file again if needed
      target.value = '';
    }
  }
  
  // Remove a file from the selection
  function removeFile(index: number) {
    files = files.filter((_, i) => i !== index);
  }
  
  // Handle form submission
  async function handleSubmit({ form, formData, cancel }: { 
    form: HTMLFormElement; 
    formData: FormData;
    cancel: () => void;
  }) {
    if (files.length === 0) {
      error = 'Por favor, seleccione al menos un archivo';
      cancel();
      return;
    }
    
    isUploading = true;
    error = '';
    success = '';
    uploads = files.map(file => ({
      name: file.name,
      status: 'pending',
      progress: 0,
      error: null
    }));
    
    try {
      // Upload files sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file.file);
        
        // Update upload status
        uploads[i].status = 'uploading';
        uploads = [...uploads]; // Trigger reactivity
        
        try {
          const response = await fetch(API_ENDPOINTS.UPLOAD, {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al subir el archivo');
          }
          
          const result = await response.json();
          uploads[i].status = 'completed';
          uploads[i].documentId = result.fileName;
          uploads[i].redirectPath = result.redirectPath; // Store the redirect path
          uploads = [...uploads]; // Trigger reactivity
          
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Error al procesar el archivo';
          console.error(`Error uploading file ${file.name}:`, errorMessage);
          uploads[i].status = 'error';
          uploads[i].error = errorMessage;
          uploads = [...uploads]; // Trigger reactivity
        }
      }
      
      // Check if all uploads were successful
      const allSuccessful = uploads.every(upload => upload.status === 'completed');
      
      if (allSuccessful) {
        success = 'Todos los archivos se procesaron correctamente';
        
        // If we have a redirect path from the last successful upload, use it
        const lastUpload = uploads.find(u => u.status === 'completed' && u.redirectPath);
        const redirectPath = lastUpload?.redirectPath || '/recibos';
        
        // Redirect after a short delay
        setTimeout(() => {
          goto(redirectPath);
        }, 1500);
      } else {
        error = 'Algunos archivos no se pudieron subir. Por favor, revise los detalles.';
      }
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar los archivos';
      console.error('Error during upload process:', errorMessage);
      error = errorMessage;
    } finally {
      isUploading = false;
    }
  }
</script>

<div class="px-4 sm:px-6 lg:px-8 py-8">
  <div class="md:flex md:items-center md:justify-between">
    <div class="min-w-0 flex-1">
      <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        Nuevo Recibo
      </h2>
    </div>
    <div class="mt-4 flex md:ml-4 md:mt-0">
      <button
        type="button"
        class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        on:click={() => goto('/recibos')}
      >
        <svg class="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
        </svg>
        Volver a la lista
      </button>
    </div>
  </div>
  
  <div class="mt-8">
    <div class="md:grid md:grid-cols-3 md:gap-6">
      <div class="md:col-span-1">
        <div class="px-4 sm:px-0">
          <h3 class="text-base font-semibold leading-6 text-gray-900">Subir recibo</h3>
          <p class="mt-1 text-sm text-gray-600">
            Suba un archivo de recibo en formato PDF o imagen. El sistema intentará extraer automáticamente la información.
          </p>
        </div>
      </div>
      <div class="mt-5 md:col-span-2 md:mt-0">
        <form method="POST" use:enhance={handleSubmit} class="space-y-6">
          <div class="shadow sm:overflow-hidden sm:rounded-md">
            <div class="space-y-6 bg-white px-4 py-5 sm:p-6">
              {#if error}
                <div class="rounded-md bg-red-50 p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-red-800">Error</h3>
                      <div class="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              {/if}
              
              {#if success}
                <div class="rounded-md bg-green-50 p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-green-800">Éxito</h3>
                      <div class="mt-2 text-sm text-green-700">
                        <p>{success}</p>
                      </div>
                    </div>
                  </div>
                </div>
              {/if}
              
              <div class="col-span-6">
                <label for="file-upload" class="block text-sm font-medium leading-6 text-gray-900">Archivo del recibo</label>
                <div class="mt-1 rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                  <div class="space-y-4 text-center">
                    <div class="flex text-sm text-gray-600 justify-center">
                      <label
                        for="file-upload"
                        class="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                      >
                        <span>Seleccionar archivos</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          class="sr-only"
                          on:change={handleFileSelect}
                          accept="application/pdf,image/jpeg,image/png"
                          multiple
                        />
                      </label>
                      <p class="pl-1">o arrástrelos aquí</p>
                    </div>
                    <p class="text-xs text-gray-500">Seleccione uno o más archivos PDF, JPG o PNG (hasta 10MB cada uno)</p>
                    
                    <!-- Selected files list -->
                    {#if files.length > 0}
                      <div class="mt-4 border-t border-gray-200 pt-4">
                        <h4 class="text-sm font-medium text-gray-700 mb-2">Archivos seleccionados: {files.length}</h4>
                        <ul class="space-y-2 max-h-40 overflow-y-auto">
                          {#each files as file, i}
                            <li class="flex items-center justify-between text-sm">
                              <span class="truncate max-w-xs text-gray-900 font-medium" title={file.name}>
                                {file.name}
                              </span>
                              <button
                                type="button"
                                on:click={() => removeFile(i)}
                                class="text-red-500 hover:text-red-700"
                                disabled={isUploading}
                              >
                                <span class="sr-only">Eliminar</span>
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </li>
                          {/each}
                        </ul>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
              
              <!-- Upload progress -->
              {#if uploads.length > 0}
                <div class="space-y-3 px-4 py-3 bg-gray-50">
                  <h4 class="text-sm font-medium text-gray-700">Progreso de carga:</h4>
                  <div class="space-y-2">
                    {#each uploads as upload, i}
                      <div class="text-sm">
                        <div class="flex justify-between mb-1">
                          <span class="truncate max-w-xs" title={upload.name}>
                            {upload.name}
                          </span>
                          <span class="text-xs text-gray-500">
                            {upload.status === 'pending' && 'Pendiente'}
                            {upload.status === 'uploading' && 'Subiendo...'}
                            {upload.status === 'completed' && 'Completado'}
                            {upload.status === 'error' && 'Error'}
                          </span>
                        </div>
                        {#if upload.status === 'uploading'}
                          <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-indigo-600 h-2 rounded-full" style={`width: ${upload.progress}%`}></div>
                          </div>
                        {:else if upload.status === 'error'}
                          <p class="text-xs text-red-500 mt-1">{upload.error}</p>
                        {/if}
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
              
              <div class="bg-gray-50 px-4 py-3 text-right sm:px-6">
                <button
                  type="submit"
                  disabled={isUploading || files.length === 0}
                  class="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {#if isUploading}
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  {:else}
                    {files.length > 1 ? `Subir ${files.length} archivos` : 'Subir archivo'}
                  {/if}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
  
  <div class="mt-10">
    <div class="md:grid md:grid-cols-3 md:gap-6">
      <div class="md:col-span-1">
        <div class="px-4 sm:px-0">
          <h3 class="text-base font-semibold leading-6 text-gray-900">Instrucciones</h3>
        </div>
      </div>
      <div class="mt-5 md:col-span-2 md:mt-0">
        <div class="overflow-hidden bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium leading-6 text-gray-900">Formato de los recibos</h3>
            <div class="mt-2 max-w-xl text-sm text-gray-500">
              <p>Para obtener los mejores resultados, asegúrese de que los recibos cumplan con los siguientes requisitos:</p>
            </div>
            <div class="mt-5">
              <ul role="list" class="list-disc space-y-2 pl-5 text-sm text-gray-500">
                <li>El documento debe estar en formato PDF o imagen (PNG, JPG, JPEG)</li>
                <li>El texto debe ser legible y no estar borroso</li>
                <li>El documento no debe estar rotado</li>
                <li>El tamaño máximo del archivo es de 10MB</li>
              </ul>
            </div>
            <div class="mt-5">
              <h4 class="text-sm font-medium text-gray-900">Ejemplos de formatos soportados:</h4>
              <ul role="list" class="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-500">
                <li>Comprobantes bancarios</li>
                <li>Listados de aportes</li>
                <li>Recibos de pago</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
