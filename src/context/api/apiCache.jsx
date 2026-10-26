// Create a simple cache system with event emitter
export const apiCache = {
  data: new Map(),
  events: new Map(), // Event system for real-time updates

  set(key, value, ttl = 10 * 60 * 1000) {
    this.data.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });

    // Trigger cache update events
    this.triggerEvent('cacheUpdate', { key, value });
  },

  get(key) {
    const item = this.data.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.data.delete(key);
      return null;
    }

    return item.value;
  },

  delete(key) {
    this.data.delete(key);
    this.triggerEvent('cacheDelete', { key });
  },

  clear() {
    this.data.clear();
    this.triggerEvent('cacheClear', {});
  },

  // Event system methods
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
  },

  off(event, callback) {
    if (this.events.has(event)) {
      this.events.get(event).delete(callback);
    }
  },

  triggerEvent(event, data) {
    if (this.events.has(event)) {
      this.events.forEach ? null : null;
      this.events.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in cache event handler for ${event}:`, error);
        }
      });
    }
  }
};

// Create a global event system for cross-component communication
export const globalEvents = {
  events: new Map(),

  emit(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in global event handler for ${event}:`, error);
        }
      });
    }
  },

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
  },

  off(event, callback) {
    if (this.events.has(event)) {
      this.events.get(event).delete(callback);
    }
  }
};
