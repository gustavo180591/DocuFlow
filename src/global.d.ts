/// <reference types="@sveltejs/kit" />

// Declare types for Svelte files
declare module '*.svelte' {
  import type { ComponentType } from 'svelte';
  const component: ComponentType;
}

export {};
  interface PublicEnv {
    PUBLIC_API_URL?: string;
  }
  interface Session {}
  interface Stuff {}
}

// Make TypeScript aware of the svelte:window and svelte:body types
declare namespace svelte.JSX {
  interface HTMLProps<T> {
    [key: string]: any;
  }
}
