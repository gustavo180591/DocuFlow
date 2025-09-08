<script lang="ts">
  import { page } from '$app/stores';
  import { systemConfig } from '$lib/services/system-config.service';
  
  export let mobileMenuOpen = false;
  
  const navigation = [
    { name: 'Inicio', href: '/', current: false },
    { name: 'Instituciones', href: '/instituciones', current: false },
    { name: 'Socios', href: '/socios', current: false },
    { name: 'Documentos', href: '/documentos', current: false },
    { name: 'Reportes', href: '/reportes', current: false }
  ];
  
  // Update current page based on URL
  $: navigation.forEach(item => {
    item.current = $page.url.pathname === item.href;
  });
  
  // Toggle mobile menu
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }
</script>

<nav class="bg-primary">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Logo and main navigation -->
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <a href="/" class="text-white font-bold text-xl flex items-center">
            {#if $systemConfig?.logoUrl}
              <img src="{$systemConfig.logoUrl}" alt="Logo" class="h-8 w-auto mr-2" />
            {/if}
            {$systemConfig?.appName || 'DocuFlow'}
          </a>
        </div>
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-4">
            {#each navigation as item}
              <a 
                href={item.href}
                class="px-3 py-2 rounded-md text-sm font-medium {item.current 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'text-white hover:bg-white hover:bg-opacity-10'}"
                aria-current={item.current ? 'page' : undefined}
              >
                {item.name}
              </a>
            {/each}
          </div>
        </div>
      </div>
      
      <!-- Mobile menu button -->
      <div class="-mr-2 flex md:hidden">
        <button
          type="button"
          on:click={toggleMobileMenu}
          class="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white"
          aria-controls="mobile-menu"
          aria-expanded="false"
        >
          <span class="sr-only">Abrir menú principal</span>
          {#if mobileMenuOpen}
            <!-- X icon -->
            <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          {:else}
            <!-- Menu icon -->
            <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          {/if}
        </button>
      </div>
      
      <!-- Desktop user menu -->
      <div class="hidden md:block">
        <div class="ml-4 flex items-center md:ml-6">
          <!-- User profile dropdown -->
          <div class="ml-3 relative">
            <div>
              <button
                type="button"
                class="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white"
                id="user-menu"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <span class="sr-only">Abrir menú de usuario</span>
                <div class="h-8 w-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white">
                  <span class="font-medium">U</span>
                </div>
              </button>
            </div>
            <!-- Dropdown menu -->
            <div class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none hidden" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
              <a href="/perfil" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Tu perfil</a>
              <a href="/configuracion" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Configuración</a>
              <a href="/auth/signout" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Cerrar sesión</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Mobile menu -->
  {#if mobileMenuOpen}
    <div class="md:hidden" id="mobile-menu">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        {#each navigation as item}
          <a 
            href={item.href}
            class="block px-3 py-2 rounded-md text-base font-medium {item.current 
              ? 'bg-white text-primary' 
              : 'text-white hover:bg-white hover:bg-opacity-10'}"
            aria-current={item.current ? 'page' : undefined}
          >
            {item.name}
          </a>
        {/each}
      </div>
      <div class="pt-4 pb-3 border-t border-white border-opacity-20">
        <div class="flex items-center px-5">
          <div class="flex-shrink-0">
            <div class="h-10 w-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white">
              <span class="font-medium">U</span>
            </div>
          </div>
          <div class="ml-3">
            <div class="text-base font-medium text-white">Usuario</div>
            <div class="text-sm font-medium text-white text-opacity-75">usuario@ejemplo.com</div>
          </div>
        </div>
        <div class="mt-3 px-2 space-y-1">
          <a href="/perfil" class="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white hover:bg-opacity-10">Tu perfil</a>
          <a href="/configuracion" class="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white hover:bg-opacity-10">Configuración</a>
          <a href="/auth/signout" class="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white hover:bg-opacity-10">Cerrar sesión</a>
        </div>
      </div>
    </div>
  {/if}
</nav>
