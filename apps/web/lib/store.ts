import { create } from 'zustand';

interface AppState {
  /** Whether the sidebar is collapsed */
  sidebarCollapsed: boolean;
  /** Currently active agent ID */
  activeAgentId: string | null;
  /** Theme preference */
  theme: 'light' | 'dark' | 'system';

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveAgent: (id: string | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  activeAgentId: null,
  theme: 'system',

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setActiveAgent: (id) => set({ activeAgentId: id }),
  setTheme: (theme) => set({ theme }),
}));
