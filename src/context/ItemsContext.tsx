import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import api from '../services/api';
import storage from '../utils/storage';

export interface Item {
  id: string;
  productName: string;
  quantity: number;
  expiryDate: string; // YYYY-MM-DD string
  purchaseDate?: string; // YYYY-MM-DD string
  category: "food" | "non-food";
  userId: string;
  createdAt?: string;
  status?: 'active' | 'consumed' | 'expired';
  consumedAt?: string;
  wastedAt?: string;
  savedViaRecipe?: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
}

export interface WasteAnalytics {
  added: number;
  consumed: number;
  expired: number;
}

interface ItemContextType {
  items: Item[];
  shoppingList: ShoppingItem[];
  historyList: Item[];
  analytics: WasteAnalytics;
  addItem: (item: Omit<Item, 'id' | 'userId'>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  markItemConsumed: (id: string, usedInRecipe?: boolean) => Promise<void>;
  markItemExpired: (id: string) => Promise<void>;
  clearAllItems: () => Promise<void>;
  fetchItems: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  addShoppingItem: (name: string) => Promise<void>;
  toggleShoppingItem: (id: string) => Promise<void>;
  deleteShoppingItem: (id: string) => Promise<void>;
  clearShoppingList: () => Promise<void>;
  loading: boolean;
}

export const ItemContext = createContext<ItemContextType>({
  items: [],
  shoppingList: [],
  historyList: [],
  analytics: { added: 0, consumed: 0, expired: 0 },
  addItem: async () => {},
  deleteItem: async () => {},
  markItemConsumed: async () => {},
  markItemExpired: async () => {},
  clearAllItems: async () => {},
  fetchItems: async () => {},
  fetchHistory: async () => {},
  addShoppingItem: async () => {},
  toggleShoppingItem: async () => {},
  deleteShoppingItem: async () => {},
  clearShoppingList: async () => {},
  loading: true,
});

export const ItemProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState<Item[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [historyList, setHistoryList] = useState<Item[]>([]);
  const [analytics, setAnalytics] = useState<WasteAnalytics>({ added: 0, consumed: 0, expired: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to persist local items state
  const saveLocalItems = async (userId: string, currentItems: Item[]) => {
    try {
      await storage.setItem(`local_items_${userId}`, JSON.stringify(currentItems));
    } catch (e) {
      console.error('Error persisting local items:', e);
    }
  };

  // Helper to persist local history state
  const saveLocalHistory = async (userId: string, currentHistory: Item[]) => {
    try {
      await storage.setItem(`local_history_${userId}`, JSON.stringify(currentHistory));
    } catch (e) {
      console.error('Error persisting local history:', e);
    }
  };

  const fetchItems = async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    
    // First, load cached local storage items immediately
    try {
      const cached = await storage.getItem(`local_items_${user.uid}`);
      if (cached) {
        setItems(JSON.parse(cached));
      }
    } catch (err) {
      console.error('Error loading cached local items:', err);
    }

    // Try background sync with remote backend if available
    try {
      const response = await api.get('/api/items');
      const fetchedItems = response.data.map((item: any) => ({
        ...item,
        userId: user.uid,
      }));
      setItems(fetchedItems);
      await saveLocalItems(user.uid, fetchedItems);
    } catch (error) {
      console.warn('Backend API unavailable, utilizing local mobile storage for items');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!user) {
      setHistoryList([]);
      return;
    }

    try {
      const cached = await storage.getItem(`local_history_${user.uid}`);
      if (cached) {
        setHistoryList(JSON.parse(cached));
      }
    } catch (err) {
      console.error('Error loading cached local history:', err);
    }

    try {
      const response = await api.get('/api/items/history');
      const fetchedHistory = response.data.map((item: any) => ({
        ...item,
        userId: user.uid,
      }));
      setHistoryList(fetchedHistory);
      await saveLocalHistory(user.uid, fetchedHistory);
    } catch (error) {
      console.warn('Backend API unavailable, utilizing local mobile storage for history');
    }
  };

  // Synchronize items on user login changes
  useEffect(() => {
    if (user) {
      fetchItems();
      fetchHistory();
    } else {
      setItems([]);
      setHistoryList([]);
      setLoading(false);
    }
  }, [user]);

  // Load shopping list & analytics on user change
  useEffect(() => {
    if (!user) {
      setShoppingList([]);
      setAnalytics({ added: 0, consumed: 0, expired: 0 });
      return;
    }

    const loadLocalData = async () => {
      try {
        const storedList = await storage.getItem(`shopping_list_${user.uid}`);
        if (storedList) setShoppingList(JSON.parse(storedList));

        const storedAnalytics = await storage.getItem(`analytics_${user.uid}`);
        if (storedAnalytics) {
          setAnalytics(JSON.parse(storedAnalytics));
        } else {
          // Initialize analytics default values
          const initial = { added: items.length, consumed: 0, expired: 0 };
          setAnalytics(initial);
          await storage.setItem(`analytics_${user.uid}`, JSON.stringify(initial));
        }
      } catch (err) {
        console.error('Error loading local context data:', err);
      }
    };
    loadLocalData();
  }, [user]);

  const addItem = async (item: Omit<Item, 'id' | 'userId'>) => {
    if (!user) return;
    const tempId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newItem: Item = {
      ...item,
      id: tempId,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    // 1. Instantly update React state & local storage
    let updatedItems: Item[] = [];
    setItems((prevItems) => {
      updatedItems = [...prevItems, newItem];
      updatedItems.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
      saveLocalItems(user.uid, updatedItems);
      return updatedItems;
    });

    // 2. Increment analytics added count
    setAnalytics(prev => {
      const next = { ...prev, added: prev.added + 1 };
      storage.setItem(`analytics_${user.uid}`, JSON.stringify(next));
      return next;
    });

    // 3. Attempt background API post if online
    try {
      const response = await api.post('/api/items', item);
      if (response?.data?.id) {
        // Swap temp ID with backend ID
        setItems(prev => {
          const synced = prev.map(i => i.id === tempId ? { ...i, id: response.data.id } : i);
          saveLocalItems(user.uid, synced);
          return synced;
        });
      }
    } catch (error) {
      console.warn("Item saved to local mobile database (backend offline)");
    }
  };

  const deleteItem = async (id: string) => {
    if (!user) return;

    setItems((prevItems) => {
      const updated = prevItems.filter(item => item.id !== id);
      saveLocalItems(user.uid, updated);
      return updated;
    });

    try {
      await api.delete(`/api/items/${id}`);
    } catch (error) {
      console.warn("Item deleted from local mobile database (backend offline)");
    }
  };

  const markItemConsumed = async (id: string, usedInRecipe: boolean = false) => {
    if (!user) return;

    let consumedItem: Item | undefined;
    setItems((prevItems) => {
      consumedItem = prevItems.find(item => item.id === id);
      const updated = prevItems.filter(item => item.id !== id);
      saveLocalItems(user.uid, updated);
      return updated;
    });

    if (consumedItem) {
      const historyItem: Item = {
        ...consumedItem,
        status: 'consumed',
        consumedAt: new Date().toISOString(),
        savedViaRecipe: usedInRecipe,
      };
      setHistoryList(prev => {
        const updatedHistory = [historyItem, ...prev];
        saveLocalHistory(user.uid, updatedHistory);
        return updatedHistory;
      });
    }

    setAnalytics(prev => {
      const next = { ...prev, consumed: prev.consumed + 1 };
      storage.setItem(`analytics_${user.uid}`, JSON.stringify(next));
      return next;
    });

    try {
      await api.put(`/api/items/${id}/consume`, { usedInRecipe });
    } catch (error) {
      console.warn("Item marked consumed in local mobile database (backend offline)");
    }
  };

  const markItemExpired = async (id: string) => {
    if (!user) return;

    let expiredItem: Item | undefined;
    setItems((prevItems) => {
      expiredItem = prevItems.find(item => item.id === id);
      const updated = prevItems.filter(item => item.id !== id);
      saveLocalItems(user.uid, updated);
      return updated;
    });

    if (expiredItem) {
      const historyItem: Item = {
        ...expiredItem,
        status: 'expired',
        wastedAt: new Date().toISOString(),
      };
      setHistoryList(prev => {
        const updatedHistory = [historyItem, ...prev];
        saveLocalHistory(user.uid, updatedHistory);
        return updatedHistory;
      });
    }

    setAnalytics(prev => {
      const next = { ...prev, expired: prev.expired + 1 };
      storage.setItem(`analytics_${user.uid}`, JSON.stringify(next));
      return next;
    });

    try {
      await api.put(`/api/items/${id}/expire`);
    } catch (error) {
      console.warn("Item marked expired in local mobile database (backend offline)");
    }
  };

  const clearAllItems = async () => {
    if (!user || items.length === 0) return;
    setItems([]);
    setHistoryList([]);
    await storage.removeItem(`local_items_${user.uid}`);
    await storage.removeItem(`local_history_${user.uid}`);

    try {
      await api.delete('/api/items');
    } catch (error) {
      console.warn("Cleared local mobile database (backend offline)");
    }
  };

  // Shopping List helpers
  const addShoppingItem = async (name: string) => {
    if (!name.trim()) return;
    const newItem = { id: Math.random().toString(), name: name.trim(), checked: false };
    setShoppingList(prev => {
      const next = [...prev, newItem];
      if (user) storage.setItem(`shopping_list_${user.uid}`, JSON.stringify(next));
      return next;
    });
  };

  const toggleShoppingItem = async (id: string) => {
    setShoppingList(prev => {
      const next = prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item);
      if (user) storage.setItem(`shopping_list_${user.uid}`, JSON.stringify(next));
      return next;
    });
  };

  const deleteShoppingItem = async (id: string) => {
    setShoppingList(prev => {
      const next = prev.filter(item => item.id !== id);
      if (user) storage.setItem(`shopping_list_${user.uid}`, JSON.stringify(next));
      return next;
    });
  };

  const clearShoppingList = async () => {
    setShoppingList([]);
    if (user) await storage.removeItem(`shopping_list_${user.uid}`);
  };

  return (
    <ItemContext.Provider value={{ 
      items, 
      shoppingList,
      historyList,
      analytics,
      addItem, 
      deleteItem, 
      markItemConsumed,
      markItemExpired,
      clearAllItems, 
      fetchItems, 
      fetchHistory,
      addShoppingItem,
      toggleShoppingItem,
      deleteShoppingItem,
      clearShoppingList,
      loading 
    }}>
      {children}
    </ItemContext.Provider>
  );
};
