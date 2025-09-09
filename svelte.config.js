import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess({
    typescript: {
      tsconfigFile: './tsconfig.json',
      compilerOptions: {
        module: 'es2020'
      }
    }
  }),

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    alias: {
      $lib: './src/lib',
      $components: './src/components'
    }
  },
  
  // Enable TypeScript strict mode
  typescript: {
    config: (config) => ({
      ...config,
      compilerOptions: {
        ...config.compilerOptions,
        allowJs: true,
        checkJs: false,
        esModuleInterop: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        skipLibCheck: true,
        sourceMap: true,
        strict: true,
        moduleResolution: 'bundler',
        module: 'es2020',
        target: 'es2020',
        lib: ['es2020', 'dom'],
        types: ['@sveltejs/kit', 'svelte'],
        verbatimModuleSyntax: false
      },
    }),
  }
};

export default config;
