<script lang="ts">
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';
  
  // Export the component
  export let menuOpen = false;
  let userMenuOpen = false;
  let darkMode = false;
  
  // Toggle dark mode and save preference to localStorage
  function toggleDarkMode() {
    darkMode = !darkMode;
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }
  
  // Check for saved theme preference on component mount
  if (typeof window !== 'undefined') {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      darkMode = true;
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  
  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Socios', path: '/socios' },
    { name: 'Recibos', path: '/recibos' },
    { name: 'Documentos', path: '/documentos' },
    { name: 'Configuración', path: '/configuracion' }
  ];

  // Click outside directive
  function clickOutside(node: HTMLElement, handler: () => void): { destroy: () => void } {
    const handleClick = (event: MouseEvent) => {
      if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
        handler();
      }
    };
    
    document.addEventListener('click', handleClick, true);
    
    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    };
  }

  // Svelte components don't need a default export
  // The component is automatically exported by default
</script>

<nav class="bg-white dark:bg-gray-800 shadow-md">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <!-- Left side: Logo and main nav (desktop) -->
      <div class="flex items-center">
        <!-- Mobile menu button -->
        <div class="flex-shrink-0 flex items-center md:hidden">
          <button 
            type="button" 
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            on:click={() => menuOpen = !menuOpen}
            aria-expanded="false"
          >
            <span class="sr-only">Abrir menú principal</span>
            {#if menuOpen}
              <!-- Close icon -->
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
        
        <!-- Logo -->
        <div class="flex-shrink-0 flex items-center">
          <a href="/" class="text-xl font-bold text-blue-600 dark:text-blue-400">
            DocuFlow
          </a>
        </div>
        
        <!-- Desktop Navigation -->
        <div class="hidden md:ml-10 md:flex md:space-x-8">
          {#each navItems as item}
            <a 
              href={item.path} 
              class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium { $page.url.pathname === item.path 
                ? 'border-blue-500 text-gray-900 dark:text-white' 
                : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white' }"
            >
              {item.name}
            </a>
          {/each}
        </div>
      </div>
      
      <!-- Right side: User menu and dark mode toggle -->
      <div class="hidden md:ml-4 md:flex md:items-center space-x-4">
        <!-- Dark mode toggle -->
        <button 
          on:click={toggleDarkMode}
          class="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {#if darkMode}
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          {:else}
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          {/if}
        </button>
        
        <!-- User menu -->
        <div class="relative ml-3">
          <div>
            <button 
              type="button" 
              class="flex items-center max-w-xs rounded-full bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" 
              id="user-menu" 
              aria-expanded="false" 
              aria-haspopup="true"
              on:click={() => userMenuOpen = !userMenuOpen}
            >
              <span class="sr-only">Abrir menú de usuario</span>
              <div class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                U
              </div>
            </button>
          </div>
          
          <!-- Dropdown menu -->
          {#if userMenuOpen}
            <div 
              transition:fade={{ duration: 150 }}
              class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 py-1 z-50"
              role="menu" 
              aria-orientation="vertical" 
              aria-labelledby="user-menu"
              use:clickOutside={() => userMenuOpen = false}
            >
              <a 
                href="/perfil" 
                class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
              >
                Tu perfil
              </a>
              <a 
                href="/configuracion" 
                class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
              >
                Configuración
              </a>
              <div class="border-t border-gray-100 dark:border-gray-700 my-1"></div>
              <a 
                href="/cerrar-sesion" 
                class="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
              >
                Cerrar sesión
              </a>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
  
  <!-- Mobile menu -->
  {#if menuOpen}
    <div 
      transition:fade={{ duration: 150 }}
      class="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="pt-2 pb-3 space-y-1">
        {#each navItems as item}
          <a 
            href={item.path} 
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium { $page.url.pathname === item.path 
              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300' 
              : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 dark:hover:text-white' }"
          >
            {item.name}
          </a>
        {/each}
        
        <!-- Mobile dark mode toggle -->
        <button 
          on:click={toggleDarkMode}
          class="w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 dark:hover:text-white flex items-center"
        >
          <span class="mr-2">
            {#if darkMode}
              <svg class="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Modo claro
            {:else}
              <svg class="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              Modo oscuro
            {/if}
          </span>
        </button>
        
        <!-- Mobile user menu -->
        <div class="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center px-4">
            <div class="flex-shrink-0">
              <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                U
              </div>
            </div>
            <div class="ml-3">
              <div class="text-base font-medium text-gray-800 dark:text-white">Usuario</div>
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">usuario@ejemplo.com</div>
            </div>
          </div>
          <div class="mt-3 space-y-1">
            <a 
              href="/perfil" 
              class="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Tu perfil
            </a>
            <a 
              href="/configuracion" 
              class="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Configuración
            </a>
            <a 
              href="/cerrar-sesion" 
              class="block px-4 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cerrar sesión
            </a>
          </div>
        </div>
      </div>
    </div>
  {/if}
</nav>

