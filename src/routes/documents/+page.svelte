<script lang="ts">
  interface Document {
    id: string;
    type: 'ID' | 'RECEIPT' | 'CONTRACT' | 'STATEMENT' | 'OTHER';
    originalName: string;
    storagePath: string;
    mimeType: string;
    size: number;
    content: string | null;
    metadata: any;
    memberId: string | null;
    member: {
      id: string;
      firstName: string;
      lastName: string;
      dni: string;
    } | null;
    extractions: { id: string; fieldName: string; fieldValue: string | null; confidence: number | null }[];
    jobs: { id: string; type: string; status: string }[];
    createdAt: string;
    updatedAt: string;
    processedAt: string | null;
  }

  const { data } = $props<{ data: { documents: Document[] } }>();
  
  let selectedStatus = 'all';
  let searchQuery = '';
  let selectedDocuments: string[] = [];
  
  // Use the data from the server
  let documents = data?.documents || [];
  let isLoading = $derived(!documents || documents.length === 0);

  // Filter documents
  let filteredDocuments = $derived(documents.filter(doc => {
    const matchesSearch = doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (doc.member && `${doc.member.firstName} ${doc.member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || doc.jobs.some(job => job.status === selectedStatus);
    return matchesSearch && matchesStatus;
  }));

  // Toggle document selection
  function toggleDocumentSelection(id: string) {
    selectedDocuments = selectedDocuments.includes(id)
      ? selectedDocuments.filter(docId => docId !== id)
      : [...selectedDocuments, id];
  }

  // Toggle select all
  function toggleSelectAll() {
    selectedDocuments = selectedDocuments.length === filteredDocuments.length 
      ? [] 
      : filteredDocuments.map(doc => doc.id);
  }

  // Get document type display text
  function getTypeText(type: string): string {
    switch (type) {
      case 'ID': return 'DNI';
      case 'RECEIPT': return 'Recibo';
      case 'CONTRACT': return 'Contrato';
      case 'STATEMENT': return 'Declaración';
      case 'OTHER': return 'Otro';
      default: return type;
    }
  }

  // Get document type icon class
  function getTypeIconClass(type: string): string {
    switch (type) {
      case 'RECEIPT': return 'text-blue-600';
      case 'ID': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  }

  // Get document type background class
  function getTypeBgClass(type: string): string {
    switch (type) {
      case 'RECEIPT': return 'bg-blue-100';
      case 'ID': return 'bg-purple-100';
      default: return 'bg-gray-100';
    }
  }

  // Get job status display text
  function getJobStatusText(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'Completado';
      case 'PROCESSING': return 'Procesando';
      case 'PENDING': return 'Pendiente';
      case 'FAILED': return 'Falló';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  }

  // Get job status badge class
  function getJobStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'badge-success';
      case 'PROCESSING': return 'badge-info';
      case 'PENDING': return 'badge-warning';
      case 'FAILED': return 'badge-error';
      case 'CANCELLED': return 'badge-gray';
      default: return 'badge-gray';
    }
  }

  // Format file size
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Format date
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  // Get primary job status for document
  function getPrimaryJobStatus(document: Document): string {
    const completedJobs = document.jobs.filter(job => job.status === 'COMPLETED');
    const failedJobs = document.jobs.filter(job => job.status === 'FAILED');
    const processingJobs = document.jobs.filter(job => job.status === 'PROCESSING');
    
    if (failedJobs.length > 0) return 'FAILED';
    if (processingJobs.length > 0) return 'PROCESSING';
    if (completedJobs.length > 0) return 'COMPLETED';
    return 'PENDING';
  }
</script>

<div class="px-4 lg:px-8">
  <!-- Header -->
  <div class="flex items-center">
    <div class="flex-auto">
      <h1 class="text-2xl font-semibold text-gray-900">Documentos</h1>
      <p class="mt-2 text-sm text-gray-700">
        Gestiona todos los documentos de los socios.
      </p>
    </div>
    <div class="mt-4 ml-16 flex-none">
      <a href="/documents/upload" class="btn-primary">
        <svg class="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
        Subir documento
      </a>
    </div>
  </div>
  
  <!-- Filters -->
  <div class="mt-6 flex flex-row gap-4">
    <div class="relative flex-1">
      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
        </svg>
      </div>
      <input 
        type="text" 
        bind:value={searchQuery}
        class="input pl-10" 
        placeholder="Buscar documentos o socios..."
      />
    </div>
    
    <div class="flex items-center gap-2">
      <label for="status-filter" class="text-sm font-medium text-gray-700">Estado:</label>
      <select 
        id="status-filter" 
        bind:value={selectedStatus}
        class="select"
      >
        <option value="all">Todos</option>
        <option value="COMPLETED">Completados</option>
        <option value="PROCESSING">Procesando</option>
        <option value="PENDING">Pendientes</option>
        <option value="FAILED">Falló</option>
        <option value="CANCELLED">Cancelados</option>
      </select>
    </div>
  </div>
  
  <!-- Document list -->
  <div class="mt-8">
    {#if isLoading}
      <div class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    {:else if filteredDocuments.length === 0}
      <div class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No se encontraron documentos</h3>
        <p class="mt-1 text-sm text-gray-500">Intenta ajustar los filtros de búsqueda.</p>
      </div>
    {:else}
      <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table class="min-w-full divide-y divide-gray-300">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="relative w-16 px-8">
                <input 
                  type="checkbox" 
                  class="absolute left-6 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  checked={selectedDocuments.length > 0 && selectedDocuments.length === filteredDocuments.length}
                  on:change={toggleSelectAll}
                />
              </th>
              <th scope="col" class="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900">Documento</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Socio</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tipo</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tamaño</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fecha</th>
              <th scope="col" class="relative py-3.5 pl-3 pr-6">
                <span class="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            {#each filteredDocuments as document (document.id)}
              <tr class={selectedDocuments.includes(document.id) ? 'bg-gray-50' : ''}>
                <td class="relative w-16 px-8">
                  <input 
                    type="checkbox" 
                    class="absolute left-6 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    checked={selectedDocuments.includes(document.id)}
                    on:change={() => toggleDocumentSelection(document.id)}
                  />
                </td>
                <td class="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                      <div class="h-10 w-10 rounded-md {getTypeBgClass(document.type)} flex items-center justify-center">
                        <svg class="h-6 w-6 {getTypeIconClass(document.type)}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="font-medium text-gray-900">{document.originalName}</div>
                      <div class="text-gray-500">{formatDate(document.createdAt)} • {document.mimeType}</div>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {#if document.member}
                    <a href="/members/{document.member.id}" class="text-indigo-600 hover:text-indigo-900">
                      {document.member.firstName} {document.member.lastName}
                    </a>
                    <div class="text-gray-400 text-xs">{document.member.dni}</div>
                  {:else}
                    <span class="text-gray-400 italic">Sin socio asignado</span>
                  {/if}
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{getTypeText(document.type)}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                  <span class={getJobStatusClass(getPrimaryJobStatus(document))}>
                    {getJobStatusText(getPrimaryJobStatus(document))}
                  </span>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatFileSize(document.size)}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div>
                    <div class="text-gray-900">{formatDate(document.createdAt)}</div>
                    {#if document.processedAt}
                      <div class="text-gray-500">Procesado: {formatDate(document.processedAt)}</div>
                    {/if}
                  </div>
                </td>
                <td class="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <a href="/documents/{document.id}" class="text-indigo-600 hover:text-indigo-900">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </a>
                    <a href="/documents/{document.id}/download" class="text-indigo-600 hover:text-indigo-900">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
        <div class="flex flex-1 justify-between">
          <a href="#" class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Anterior</a>
          <a href="#" class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Siguiente</a>
        </div>
        <div class="flex flex-1 items-center justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Mostrando <span class="font-medium">1</span> a <span class="font-medium">{filteredDocuments.length}</span> de <span class="font-medium">{documents.length}</span> resultados
            </p>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  @reference "tailwindcss";
  
  .btn-primary {
    @apply inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-auto;
  }
  
  .input {
    @apply block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm leading-6;
  }
  
  .select {
    @apply block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 text-sm leading-6;
  }
  
  .badge-success {
    @apply inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800;
  }
  
  .badge-info {
    @apply inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800;
  }
  
  .badge-warning {
    @apply inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800;
  }
  
  .badge-error {
    @apply inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800;
  }

  .badge-gray {
    @apply inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800;
  }
</style>
