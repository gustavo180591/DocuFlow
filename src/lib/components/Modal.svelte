<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  export let isOpen = false;
  export let title = '';
  export let onClose = () => {};
  export let onSubmit = () => {};
  export let submitLabel = 'Guardar';
  export let submitVariant: 'primary' | 'danger' = 'primary';
  export let submitDisabled = false;
  export let submitLoading = false;
  export let showFooter = true;
  export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  
  let modalElement: HTMLElement;
  let focusableElements: HTMLElement[] = [];
  let firstFocusableElement: HTMLElement | null = null;
  let lastFocusableElement: HTMLElement | null = null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    
    // Only handle tab key when modal is open
    if (event.key !== 'Tab' || !isOpen) return;
    
    // Handle tab trapping
    if (!focusableElements.length) return;
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  }
  
  function setFocusableElements() {
    if (!modalElement) return;
    
    // Get all focusable elements
    focusableElements = Array.from(
      modalElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el): el is HTMLElement => {
      return el instanceof HTMLElement && 
             !el.hasAttribute('disabled') && 
             !el.getAttribute('aria-hidden');
    });
    
    // Store first and last focusable elements
    firstFocusableElement = focusableElements[0] || null;
    lastFocusableElement = focusableElements[focusableElements.length - 1] || null;
  }
  
  onMount(() => {
    if (!isOpen) return;
    
    // Lock body scroll
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    
    // Set focus to modal
    if (modalElement) {
      setFocusableElements();
      
      // Focus first focusable element or the modal itself
      const focusTarget = firstFocusableElement || modalElement;
      focusTarget.focus();
      
      // Dispatch event when modal is opened
      dispatch('open');
    }
    
    // Cleanup function
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  });
  
  onDestroy(() => {
    // Cleanup when component is destroyed
    document.body.style.overflow = '';
    document.body.style.top = '';
    document.body.style.width = '';
  });
  
  $: if (isOpen && modalElement) {
    // Update focusable elements when modal content changes
    setFocusableElements();
  }
  
  $: modalClass = `fixed inset-0 z-50 overflow-y-auto ${isOpen ? 'block' : 'hidden'}`;
  $: containerClass = `min-h-screen px-4 text-center`;
  $: panelClass = `inline-block w-full ${
    sizeClasses[size] || sizeClasses.md
  } p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg`;
  
  // Button classes based on variant
  $: submitButtonClass = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  }[submitVariant];
</script>

{#if isOpen}
  <!-- Backdrop with click outside to close -->
  <div class={modalClass}>
    <button
      type="button"
      class="fixed inset-0 w-full h-full bg-gray-500 bg-opacity-75 transition-opacity focus:outline-none"
      on:click={onClose}
      on:keydown={(e) => e.key === 'Enter' && onClose()}
      aria-label="Cerrar modal"
      transition:fade={{ duration: 150 }}
    >
      <span class="sr-only">Cerrar modal</span>
    </button>
    
    <!-- Modal container -->
    <div
      bind:this={modalElement}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      tabindex="-1"
      class="fixed inset-0 z-50 overflow-y-auto focus:outline-none"
    >
      <!-- Focus trap container -->
      <div 
        class="w-full h-full flex items-center justify-center p-4"
        on:click|stopPropagation
        on:keydown={handleKeydown}
        role="presentation"
      >
        <!-- Modal panel -->
        <div class={containerClass}>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div 
            class={panelClass}
            in:scale={{ duration: 150, start: 0.95 }}
            out:scale={{ duration: 120, start: 1 }}
            role="document"
          >
            <!-- Header -->
            <div class="flex justify-between items-center pb-3 border-b border-gray-200">
              <h3 class="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                {title}
              </h3>
              <button
                type="button"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
                on:click={onClose}
                aria-label="Cerrar"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <!-- Content -->
            <div class="mt-4">
              <slot></slot>
            </div>
            
            <!-- Footer -->
            {#if showFooter}
              <div class="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  on:click={onClose}
                  disabled={submitLoading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed {submitButtonClass}"
                  on:click={onSubmit}
                  on:keydown={(e) => e.key === 'Enter' && !submitDisabled && !submitLoading && onSubmit()}
                  disabled={submitDisabled || submitLoading}
                  aria-busy={submitLoading}
                  aria-live="polite"
                >
                  {#if submitLoading}
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  {:else}
                    {submitLabel}
                  {/if}
                </button>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
