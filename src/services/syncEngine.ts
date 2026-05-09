import { supabase } from '../lib/supabase';

// Simple offline storage using localStorage (for demo, IndexedDB would be better for large data)
const OFFLINE_QUEUE_KEY = 'library_sync_queue';

export const syncEngine = {
  // Add an action to the sync queue
  enqueue: (actionType: 'INSERT' | 'UPDATE' | 'DELETE', tableName: string, payload: any) => {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    const newAction = {
      id: Math.random().toString(36).substr(2, 9),
      actionType,
      tableName,
      payload,
      timestamp: new Date().toISOString(),
    };
    queue.push(newAction);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    
    // Attempt to sync immediately if online
    if (navigator.onLine) {
      syncEngine.processQueue();
    }
  },

  // Process the queue when back online
  processQueue: async () => {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    if (queue.length === 0) return;

    console.log(`Processing sync queue: ${queue.length} items`);
    const remainingQueue = [];

    for (const action of queue) {
      try {
        let error;
        if (action.actionType === 'INSERT') {
          ({ error } = await supabase.from(action.tableName).insert(action.payload));
        } else if (action.actionType === 'UPDATE') {
          ({ error } = await supabase.from(action.tableName).update(action.payload).match({ id: action.payload.id }));
        } else if (action.actionType === 'DELETE') {
          ({ error } = await supabase.from(action.tableName).delete().match({ id: action.payload.id }));
        }

        if (error) throw error;
      } catch (err) {
        console.error('Sync failed for action:', action, err);
        remainingQueue.push(action); // Keep in queue to retry later
      }
    }

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
  }
};

// Listen for online event
window.addEventListener('online', () => {
  console.log('System online. Triggering sync...');
  syncEngine.processQueue();
});
