import { create } from "zustand";

interface TabState {
  openTabIds: string[];
  activeTabId: string | null;
  openTab: (id: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
}

export const useTabStore = create<TabState>((set, get) => ({
  openTabIds: [],
  activeTabId: null,

  openTab: (id: string) => {
    const { openTabIds } = get();
    if (!openTabIds.includes(id)) {
      set({
        openTabIds: [...openTabIds, id],
        activeTabId: id,
      });
    } else {
      set({ activeTabId: id });
    }
  },

  closeTab: (id: string) => {
    const { openTabIds, activeTabId } = get();
    const newOpenTabIds = openTabIds.filter((tabId) => tabId !== id);

    let newActiveTabId = activeTabId;
    if (activeTabId === id) {
      const closedIndex = openTabIds.indexOf(id);
      if (newOpenTabIds.length > 0) {
        // 优先切换到前一个标签，如果没有则切换到后一个
        newActiveTabId =
          newOpenTabIds[Math.min(closedIndex, newOpenTabIds.length - 1)] ||
          newOpenTabIds[closedIndex - 1] ||
          null;
      } else {
        newActiveTabId = null;
      }
    }

    set({
      openTabIds: newOpenTabIds,
      activeTabId: newActiveTabId,
    });
  },

  setActiveTab: (id: string) => {
    set({ activeTabId: id });
  },
}));
