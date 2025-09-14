<script lang="ts">
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
  
  // Add dark mode class to html element if needed
  if (typeof document !== 'undefined') {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
</script>

<Navbar />

<main class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <slot />
  </div>
</main>
