<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { systemConfig } from '$lib/services/system-config.service';
  import Nav from '$lib/components/Nav.svelte';
  import { toast } from 'svelte-sonner';
  
  let mobileMenuOpen = false;
  
  // Apply theme from SystemConfig
  function applyTheme(config: any) {
    if (!browser || !config) return;
    
    const root = document.documentElement;
    
    // Apply brand colors
    if (config.brand) {
      root.style.setProperty('--brand-primary', config.brand.primaryRgb);
      root.style.setProperty('--brand-secondary', config.brand.secondaryRgb);
      root.style.setProperty('--brand-muted', config.brand.mutedRgb);
    }
    
    // Apply border radius
    if (config.borderRadius) {
      root.style.setProperty('--border-radius', config.borderRadius);
    }
    
    // Update document title
    if (config.appName) {
      document.title = config.appName;
    }
  }
  
  // Load theme preference from localStorage and SystemConfig
  onMount(() => {
    // Load system config
    systemConfig.load()
      .then(config => {
        if (config) {
          applyTheme(config);
        }
      })
      .catch(err => {
        console.error('Failed to load system config:', err);
        toast.error('Error al cargar la configuración del sistema');
      });
    
    // Apply saved theme
    if (browser) {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Watch for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem('theme')) {
          if (e.matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  });
  
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }
</script>

<svelte:head>
  <title>{$systemConfig?.appName || 'DocuFlow'}</title>
  <meta name="description" content="Sistema de gestión de documentos y miembros" />
  <meta name="theme-color" content={$systemConfig?.brand?.primaryColor || '#4f46e5'} />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="/favicon.ico" />
  
  <!-- Preload system font -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link 
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" 
    rel="stylesheet"
  />
  
  <!-- iOS PWA support -->
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content={$systemConfig?.appName || 'DocuFlow'} />
  
  <!-- PWA manifest -->
  <link rel="manifest" href="/manifest.json" />
</svelte:head>

<!-- Main Navigation -->
<Nav bind:mobileMenuOpen />

<main class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <slot />
  </div>
  
  <!-- Toast notifications -->
  <div id="toast" />
  
  <!-- Global loading indicator -->
  <div id="loading-bar" class="fixed top-0 left-0 right-0 h-1 bg-primary opacity-0 transition-opacity duration-200"></div>
</main>

<footer class="bg-white dark:bg-gray-800 shadow-inner mt-12">
  <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col md:flex-row justify-between items-center">
      <div class="text-center md:text-left mb-4 md:mb-0">
        <p class="text-gray-600 dark:text-gray-300 text-sm">
          &copy; {new Date().getFullYear()} {$systemConfig?.appName || 'DocuFlow'}. Todos los derechos reservados.
        </p>
      </div>
      <div class="flex space-x-6">
        <a href="/terminos" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm">
          Términos y condiciones
        </a>
        <a href="/privacidad" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm">
          Política de privacidad
        </a>
        <a href="/contacto" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm">
          Contacto
        </a>
      </div>
    </div>
  </div>
</footer>
