import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { SystemConfig } from '@prisma/client';

// Default configuration that matches the database schema
export const defaultConfig: Omit<SystemConfig, 'id' | 'createdAt' | 'updatedAt'> = {
  appName: 'DocuFlow',
  logoUrl: null,
  primaryColor: '#4f46e5',
  secondaryColor: '#7c3aed',
  primaryTextColor: '#111827',
  secondaryTextColor: '#4b5563',
  borderRadius: '0.75rem',
  defaultLocale: 'es'
};

// Create a writable store for the system configuration
function createSystemConfig() {
  const { subscribe, set, update } = writable<SystemConfig>({
    id: 'default',
    ...defaultConfig,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Load config from API
  async function load() {
    try {
      const response = await fetch('/api/system-config');
      if (!response.ok) throw new Error('Failed to load system config');
      
      const { data } = await response.json();
      set(data);
      applyTheme(data);
      return data;
    } catch (error) {
      console.error('Error loading system config:', error);
      // Apply default theme if loading fails
      applyTheme(defaultConfig);
      throw error;
    }
  }

  // Update config
  async function updateConfig(updates: Partial<SystemConfig>) {
    try {
      const response = await fetch('/api/system-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update system config');
      }

      const { data } = await response.json();
      set(data);
      applyTheme(data);
      return data;
    } catch (error) {
      console.error('Error updating system config:', error);
      throw error;
    }
  }

  // Apply theme to the document
  function applyTheme(config: Partial<SystemConfig>) {
    if (!browser) return;
    
    const root = document.documentElement;
    
    // Apply theme variables
    if (config.primaryColor) root.style.setProperty('--primary', config.primaryColor);
    if (config.secondaryColor) root.style.setProperty('--secondary', config.secondaryColor);
    if (config.primaryTextColor) root.style.setProperty('--text-primary', config.primaryTextColor);
    if (config.secondaryTextColor) root.style.setProperty('--text-secondary', config.secondaryTextColor);
    if (config.borderRadius) root.style.setProperty('--radius', config.borderRadius);
    
    // Set document title
    if (config.appName) {
      document.title = config.appName;
    }
  }

  return {
    subscribe,
    load,
    update: updateConfig,
    applyTheme
  };
}

export const systemConfig = createSystemConfig();

// Load config automatically when the module is imported
if (browser) {
  systemConfig.load().catch(console.error);
}
