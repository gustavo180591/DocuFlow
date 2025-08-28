<script lang="ts">
  import { page } from '$app/stores';
  
  // Dashboard stats (this would come from your API in a real app)
  let stats = {
    totalDocuments: 0,
    pendingReview: 0,
    processedToday: 0,
    totalMembers: 0
  };
  
  interface Document {
    id: number;
    name: string;
    type: string;
    status: string;
    date: string;
  }

  interface Activity {
    id: number;
    action: string;
    details: string;
    timestamp: string;
  }

  let recentDocuments: Document[] = [];
  let recentActivity: Activity[] = [];
  
  // This would be an API call in a real app
  async function loadDashboardData() {
    // TODO: Replace with actual API calls
    stats = {
      totalDocuments: 124,
      pendingReview: 8,
      processedToday: 12,
      totalMembers: 87
    };
    
    recentDocuments = [
      { id: 1, name: 'Recibo de sueldo.pdf', type: 'Recibo', status: 'Procesado', date: '2025-08-27' },
      { id: 2, name: 'DNI_escaneado.pdf', type: 'DNI', status: 'Pendiente', date: '2025-08-27' },
      { id: 3, name: 'Contrato_firmado.pdf', type: 'Contrato', status: 'Procesado', date: '2025-08-26' }
    ];
    
    recentActivity = [
      { id: 1, action: 'Documento procesado', details: 'Recibo de sueldo.pdf', timestamp: 'Hace 5 minutos' },
      { id: 2, action: 'Nuevo documento subido', details: 'DNI_escaneado.pdf', timestamp: 'Hace 15 minutos' },
      { id: 3, action: 'Socio actualizado', details: 'Juan Pérez', timestamp: 'Ayer' }
    ];
  }
  
  // Load data when component mounts
  loadDashboardData();
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900">Panel de Control</h1>
    </div>
  </header>
  
  <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Total Documents -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Documentos Totales</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{stats.totalDocuments}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pending Review -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-yellow-500 rounded-md p-3">
              <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Pendientes de Revisión</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{stats.pendingReview}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Processed Today -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-500 rounded-md p-3">
              <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Procesados Hoy</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{stats.processedToday}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Total Members -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total de Socios</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{stats.totalMembers}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Recent Documents -->
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Documentos Recientes</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">Últimos documentos subidos al sistema</p>
        </div>
        <div class="bg-white overflow-hidden">
          <ul class="divide-y divide-gray-200">
            {#each recentDocuments as doc}
              <li class="px-6 py-4">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-md">
                    <span class="text-blue-600">
                      {#if doc.type === 'Recibo'}
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      {:else if doc.type === 'DNI'}
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                      {:else}
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      {/if}
                    </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{doc.name}</div>
                    <div class="text-sm text-gray-500">{doc.type} • {doc.date}</div>
                  </div>
                  <div class="ml-auto">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {doc.status}
                    </span>
                  </div>
                </div>
              </li>
            {/each}
          </ul>
          <div class="bg-gray-50 px-6 py-4 text-right">
            <a href="/documents" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Ver todos los documentos<span aria-hidden="true"> &rarr;</span>
            </a>
          </div>
        </div>
      </div>
      
      <!-- Recent Activity -->
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Actividad Reciente</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">Últimas acciones en el sistema</p>
        </div>
        <div class="bg-white overflow-hidden">
          <ul class="divide-y divide-gray-200">
            {#each recentActivity as activity}
              <li class="px-6 py-4">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p class="text-sm text-gray-500">{activity.details}</p>
                  </div>
                  <div class="ml-auto text-sm text-gray-500">
                    {activity.timestamp}
                  </div>
                </div>
              </li>
            {/each}
          </ul>
          <div class="bg-gray-50 px-6 py-4 text-right">
            <a href="/activity" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Ver todo el historial<span aria-hidden="true"> &rarr;</span>
            </a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="mt-8">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Acciones rápidas</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <a href="/documents/upload" class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <p class="text-sm font-medium text-gray-900 truncate">Subir Documento</p>
                <p class="text-sm text-gray-500">Cargar un nuevo archivo</p>
              </div>
            </div>
          </div>
        </a>
        
        <a href="/members/new" class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <p class="text-sm font-medium text-gray-900 truncate">Nuevo Socio</p>
                <p class="text-sm text-gray-500">Agregar un nuevo miembro</p>
              </div>
            </div>
          </div>
        </a>
        
        <a href="/reports" class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <p class="text-sm font-medium text-gray-900 truncate">Generar Reporte</p>
                <p class="text-sm text-gray-500">Crear un nuevo informe</p>
              </div>
            </div>
          </div>
        </a>
        
        <a href="/settings" class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-gray-500 rounded-md p-3">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <p class="text-sm font-medium text-gray-900 truncate">Configuración</p>
                <p class="text-sm text-gray-500">Ajustes del sistema</p>
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
  </main>
</div>
