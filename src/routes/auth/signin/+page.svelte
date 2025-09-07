<script lang="ts">
  import { signIn } from '@auth/sveltekit/client';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  
  let email = '';
  let password = '';
  let error = '';
  
  async function handleSubmit(event: Event) {
    event.preventDefault();
    
    try {
      await signIn('credentials', {
        email,
        password,
        callbackUrl: `${base}/`
      });
    } catch (e) {
      error = 'Error al iniciar sesión. Verifica tus credenciales.';
      console.error('Error en el inicio de sesión:', e);
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Iniciar sesión en DocuFlow
      </h2>
    </div>
    
    {#if $page.url.searchParams.get('error') === 'CredentialsSignin'}
      <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">
              Error en las credenciales. Por favor, inténtalo de nuevo.
            </p>
          </div>
        </div>
      </div>
    {/if}
    
    {#if error}
      <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <p class="text-sm text-red-700">{error}</p>
      </div>
    {/if}
    
    <form class="mt-8 space-y-6" on:submit={handleSubmit}>
      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="email-address" class="sr-only">Correo electrónico</label>
          <input
            id="email-address"
            name="email"
            type="email"
            autocomplete="email"
            required
            bind:value={email}
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Correo electrónico"
          />
        </div>
        <div>
          <label for="password" class="sr-only">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            bind:value={password}
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Contraseña"
          />
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label for="remember-me" class="ml-2 block text-sm text-gray-900">
            Recordarme
          </label>
        </div>

        <div class="text-sm">
          <a href="/auth/forgot-password" class="font-medium text-indigo-600 hover:text-indigo-500">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>

      <div>
        <button
          type="submit"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Iniciar sesión
        </button>
      </div>
      
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">O continúa con</span>
        </div>
      </div>
      
      <div class="mt-6 grid grid-cols-1 gap-3">
        <div>
          <button
            type="button"
            on:click={() => signIn('github', { callbackUrl: `${base}/` })}
            class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span class="sr-only">Iniciar sesión con GitHub</span>
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.699 1.028 1.595 1.028 2.688 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.197 20 14.444 20 10.017 20 4.484 15.522 0 10 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </form>
    
    <div class="text-center text-sm">
      <p class="text-gray-600">
        ¿No tienes una cuenta?{' '}
        <a href="/auth/signup" class="font-medium text-indigo-600 hover:text-indigo-500">
          Regístrate
        </a>
      </p>
    </div>
  </div>
</div>
