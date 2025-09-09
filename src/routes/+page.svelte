<script>
  import { page } from '$app/stores';
  
  $: currentPath = $page.url.pathname;
  
  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Socios', path: '/socios' },
    { name: 'Recibos', path: '/recibos' },
  ];
</script>

<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="bg-white shadow-sm rounded-lg overflow-hidden">
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Bienvenido a DocuFlow</h1>
      
      <div class="mb-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Sistema de Gestión Documental</h2>
        <p class="text-gray-600">
          Gestiona socios, recibos y documentos de manera eficiente con nuestra plataforma.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {#each navItems.filter(item => item.path !== currentPath) as item}
          <a 
            href={item.path}
            class="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition-colors duration-200"
          >
            <h3 class="text-lg font-medium text-gray-900">{item.name}</h3>
            <p class="mt-2 text-sm text-gray-600">
              {item.name === 'Socios' 
                ? 'Gestión de socios y sus datos' 
                : item.name === 'Recibos' 
                  ? 'Subir y gestionar recibos' 
                  : 'Página principal'}
            </p>
          </a>
        {/each}
      </div>
    </div>
  </div>
</main>
