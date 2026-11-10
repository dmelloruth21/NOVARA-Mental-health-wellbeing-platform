/**
 * frontend/src/services/wellnessSyncManager.js
 * ─────────────────────────────────────────────
 * Cross-device synchronization manager for Elora.
 *
 * Responsibilities:
 *  - Namespaces browser localStorage per authenticated Firebase UID
 *  - Performs one-time legacy migration of old un-namespaced localStorage keys
 *  - Implements optimistic UI: updates local storage & state immediately
 *  - Flushes debounced mutations to POST /api/wellness/sync
 *  - Handles offline queuing and online auto-flush
 *  - Pulls updates from GET /api/wellness/sync using composite cursor pagination
 *  - Notifies React components through a lightweight subscription pattern
 */

// Simple string hash for deterministic quote and gratitude IDs
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// Generate unique client IDs for new planner tasks
export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
}

class WellnessSyncManager {
  constructor() {
    this.currentUid = null;
    this.authToken = null;
    this.subscribers = new Set();
    this.debounceTimer = null;
    this.isFlushing = false;

    // Attach cross-device & offline event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log(' Network restored. Flushing pending wellness sync...');
        this.flushPendingMutations();
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.authToken && this.currentUid) {
          this.pullSync();
        }
      });
    }
  }

  // ── Session & User Context ──────────────────────────────────────────────────

  setUser(currentUser, token) {
    const nextUid = currentUser ? currentUser.uid : null;
    const uidChanged = nextUid !== this.currentUid;

    this.currentUid = nextUid;
    this.authToken = token;

    if (uidChanged) {
      // Notify components to reload data for the newly active user
      this.notifySubscribers();

      if (this.currentUid && this.authToken) {
        this.runBootstrap();
      }
    } else if (this.authToken && this.currentUid) {
      // Token refreshed: flush any pending mutations
      this.flushPendingMutations();
    }
  }

  async runBootstrap() {
    // 1. Run legacy migration if un-namespaced items exist
    await this.checkAndMigrateLegacy();

    // 2. Perform initial pull sync to get latest changes from cloud
    await this.pullSync();
  }

  // ── Storage Keys (UID Namespaced) ──────────────────────────────────────────

  _getKey(name) {
    if (this.currentUid) {
      return `elora_${name}_${this.currentUid}`;
    }
    return `elora_${name}_guest`;
  }

  _getMeta() {
    try {
      const val = localStorage.getItem(this._getKey('sync_meta'));
      return val ? JSON.parse(val) : { rev: 0, last_synced_at: null, cursor_id: null };
    } catch {
      return { rev: 0, last_synced_at: null, cursor_id: null };
    }
  }

  _saveMeta(meta) {
    try {
      localStorage.setItem(this._getKey('sync_meta'), JSON.stringify(meta));
    } catch (e) {
      console.warn('Failed to save sync meta:', e);
    }
  }

  // ── Subscription System ─────────────────────────────────────────────────────

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error('Subscriber callback error:', e);
      }
    });
  }

  // ── Local CRUD Accessors ────────────────────────────────────────────────────

  // 1. Daily Planner Tasks
  getPlannerTasks() {
    try {
      const saved = localStorage.getItem(this._getKey('planner_tasks'));
      if (saved) return JSON.parse(saved);

      // Default seed tasks if empty
      return [
        { id: 'seed-1', text: 'Complete DBMS assignment', completed: false, created_at: Date.now() },
        { id: 'seed-2', text: 'Drink 2 litres of water', completed: true, created_at: Date.now() },
        { id: 'seed-3', text: 'Take a 15 minute walk', completed: true, created_at: Date.now() },
        { id: 'seed-4', text: 'Revise DAA concepts', completed: true, created_at: Date.now() },
      ];
    } catch {
      return [];
    }
  }

  savePlannerTasks(tasks, emitMutation = false, mutationDetails = null) {
    localStorage.setItem(this._getKey('planner_tasks'), JSON.stringify(tasks));
    if (emitMutation && mutationDetails) {
      this.queueMutation(mutationDetails);
    }
    this.notifySubscribers();
  }

  addPlannerTask(text) {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const id = generateUUID();
    const now = Date.now();
    const newTask = {
      id: id,
      text: trimmed,
      completed: false,
      created_at: now,
      updated_at: now,
    };
    const current = this.getPlannerTasks();
    const updated = [...current, newTask];

    this.savePlannerTasks(updated, true, {
      kind: 'planner',
      item_id: String(id),
      action: 'upsert',
      data: { text: trimmed, completed: false },
      field_meta: {
        text: { ts: now, op_id: generateUUID() },
        completed: { ts: now, op_id: generateUUID() },
      },
      client_timestamp: now,
    });
    return newTask;
  }

  togglePlannerTask(id) {
    const now = Date.now();
    const current = this.getPlannerTasks();
    let target = null;
    const updated = current.map((t) => {
      if (String(t.id) === String(id)) {
        target = { ...t, completed: !t.completed, updated_at: now };
        return target;
      }
      return t;
    });

    if (target) {
      this.savePlannerTasks(updated, true, {
        kind: 'planner',
        item_id: String(id),
        action: 'upsert',
        data: { text: target.text, completed: target.completed },
        field_meta: {
          completed: { ts: now, op_id: generateUUID() },
        },
        client_timestamp: now,
      });
    }
  }

  deletePlannerTask(id) {
    const now = Date.now();
    const current = this.getPlannerTasks();
    const updated = current.filter((t) => String(t.id) !== String(id));

    this.savePlannerTasks(updated, true, {
      kind: 'planner',
      item_id: String(id),
      action: 'delete',
      client_timestamp: now,
    });
  }

  // 2. Saved Affirmation Quotes
  getSavedQuotes() {
    try {
      const saved = localStorage.getItem(this._getKey('saved_quotes'));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveQuote(quote) {
    const current = this.getSavedQuotes();
    if (current.some((q) => q.text === quote.text)) return;
    const quoteId = hashString(quote.text);
    const now = Date.now();
    const item = { ...quote, id: quoteId, saved_at: now };
    const updated = [...current, item];
    localStorage.setItem(this._getKey('saved_quotes'), JSON.stringify(updated));

    this.queueMutation({
      kind: 'quote',
      item_id: quoteId,
      action: 'upsert',
      data: { text: quote.text, category: quote.category || 'General' },
      field_meta: {
        text: { ts: now, op_id: generateUUID() },
        category: { ts: now, op_id: generateUUID() },
      },
      client_timestamp: now,
    });
    this.notifySubscribers();
  }

  removeQuote(text) {
    const current = this.getSavedQuotes();
    const quote = current.find((q) => q.text === text);
    const quoteId = quote?.id || hashString(text);
    const now = Date.now();
    const updated = current.filter((q) => q.text !== text);
    localStorage.setItem(this._getKey('saved_quotes'), JSON.stringify(updated));

    this.queueMutation({
      kind: 'quote',
      item_id: quoteId,
      action: 'delete',
      client_timestamp: now,
    });
    this.notifySubscribers();
  }

  // 3. Gratitude Jar
  getGratitudes() {
    try {
      const saved = localStorage.getItem(this._getKey('gratitudes'));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  addGratitude(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = Date.now();
    const gratitudeId = hashString(trimmed + '_' + now);
    const current = this.getGratitudes();
    // Prepend new memory
    const updated = [trimmed, ...current];
    localStorage.setItem(this._getKey('gratitudes'), JSON.stringify(updated));

    this.queueMutation({
      kind: 'gratitude',
      item_id: gratitudeId,
      action: 'upsert',
      data: { text: trimmed },
      field_meta: { text: { ts: now, op_id: generateUUID() } },
      client_timestamp: now,
    });
    this.notifySubscribers();
  }

  // 4. Favorited Music Tracks
  getFavoritedTracks() {
    try {
      const saved = localStorage.getItem(this._getKey('favorited_tracks'));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  toggleFavoriteTrack(trackId) {
    const cleanId = String(trackId).trim();
    const current = this.getFavoritedTracks();
    const isFav = current.includes(cleanId);
    const now = Date.now();
    let updated;

    if (isFav) {
      updated = current.filter((tid) => tid !== cleanId);
      this.queueMutation({
        kind: 'track',
        item_id: cleanId,
        action: 'delete',
        client_timestamp: now,
      });
    } else {
      updated = [...current, cleanId];
      this.queueMutation({
        kind: 'track',
        item_id: cleanId,
        action: 'upsert',
        data: { track_id: cleanId, favorited: true },
        field_meta: { favorited: { ts: now, op_id: generateUUID() } },
        client_timestamp: now,
      });
    }

    localStorage.setItem(this._getKey('favorited_tracks'), JSON.stringify(updated));
    this.notifySubscribers();
  }

  // ── Background Sync Queue ───────────────────────────────────────────────────

  _getPendingQueue() {
    try {
      const saved = localStorage.getItem(this._getKey('pending_mutations'));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  _savePendingQueue(queue) {
    try {
      localStorage.setItem(this._getKey('pending_mutations'), JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to save pending queue:', e);
    }
  }

  queueMutation(mutation) {
    if (!this.currentUid) return; // Guest mode operates purely in local storage
    const queue = this._getPendingQueue();
    queue.push(mutation);
    this._savePendingQueue(queue);

    // Debounce network flush (500ms buffer)
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.flushPendingMutations();
    }, 500);
  }

  async flushPendingMutations() {
    if (!this.currentUid || !this.authToken || this.isFlushing) return;
    const queue = this._getPendingQueue();
    if (queue.length === 0) return;

    this.isFlushing = true;
    const clientMutationId = generateUUID();

    try {
      const res = await fetch('/api/wellness/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          client_mutation_id: clientMutationId,
          mutations: queue,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const meta = this._getMeta();
        meta.rev = data.rev || meta.rev;
        meta.last_synced_at = new Date().toISOString();
        this._saveMeta(meta);

        // Clear flushed items from pending queue
        this._savePendingQueue([]);
      } else {
        console.warn('Wellness sync response was not ok:', res.status);
      }
    } catch (err) {
      console.warn('Wellness push sync deferred (offline or error):', err.message);
    } finally {
      this.isFlushing = false;
    }
  }

  // ── Pull Synchronization ────────────────────────────────────────────────────

  async pullSync() {
    if (!this.currentUid || !this.authToken) return;

    try {
      const meta = this._getMeta();
      const sinceRev = meta.rev || 0;
      let cursorId = meta.cursor_id || '';

      const queryParams = new URLSearchParams({
        since_rev: String(sinceRev),
        limit: '500',
      });
      if (cursorId) {
        queryParams.set('cursor_id', cursorId);
      }

      const res = await fetch(`/api/wellness/sync?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });

      if (!res.ok) return;

      const result = await res.json();
      const items = result.items || [];

      if (items.length > 0) {
        this._applyServerItems(items);
      }

      // Update local metadata
      meta.rev = result.rev || sinceRev;
      meta.last_synced_at = new Date().toISOString();
      meta.cursor_id = result.next_cursor ? result.next_cursor.id : null;
      this._saveMeta(meta);

      this.notifySubscribers();
    } catch (err) {
      console.warn('Wellness pull sync deferred:', err.message);
    }
  }

  _applyServerItems(serverItems) {
    let plannerUpdated = false;
    let quotesUpdated = false;
    let gratitudesUpdated = false;
    let tracksUpdated = false;

    const planner = this.getPlannerTasks();
    const quotes = this.getSavedQuotes();
    const gratitudes = this.getGratitudes();
    const tracks = this.getFavoritedTracks();

    serverItems.forEach((item) => {
      if (item.kind === 'planner') {
        const idx = planner.findIndex((t) => String(t.id) === String(item.id));
        if (item.deleted) {
          if (idx >= 0) {
            planner.splice(idx, 1);
            plannerUpdated = true;
          }
        } else {
          const taskData = {
            id: item.id,
            text: item.data?.text || '',
            completed: Boolean(item.data?.completed),
            updated_at: item.updated_at || Date.now(),
          };
          if (idx >= 0) {
            planner[idx] = taskData;
          } else {
            planner.push(taskData);
          }
          plannerUpdated = true;
        }
      } else if (item.kind === 'quote') {
        const qText = item.data?.text || '';
        const idx = quotes.findIndex((q) => q.text === qText || q.id === item.id);
        if (item.deleted) {
          if (idx >= 0) {
            quotes.splice(idx, 1);
            quotesUpdated = true;
          }
        } else {
          if (idx >= 0) {
            quotes[idx] = { id: item.id, text: qText, category: item.data?.category || 'General' };
          } else {
            quotes.push({ id: item.id, text: qText, category: item.data?.category || 'General' });
          }
          quotesUpdated = true;
        }
      } else if (item.kind === 'gratitude') {
        const gText = item.data?.text || '';
        const idx = gratitudes.findIndex((g) => g === gText);
        if (item.deleted) {
          if (idx >= 0) {
            gratitudes.splice(idx, 1);
            gratitudesUpdated = true;
          }
        } else {
          if (idx === -1 && gText) {
            gratitudes.unshift(gText);
            gratitudesUpdated = true;
          }
        }
      } else if (item.kind === 'track') {
        const tId = String(item.id);
        const idx = tracks.indexOf(tId);
        if (item.deleted) {
          if (idx >= 0) {
            tracks.splice(idx, 1);
            tracksUpdated = true;
          }
        } else {
          if (idx === -1) {
            tracks.push(tId);
            tracksUpdated = true;
          }
        }
      }
    });

    if (plannerUpdated) localStorage.setItem(this._getKey('planner_tasks'), JSON.stringify(planner));
    if (quotesUpdated) localStorage.setItem(this._getKey('saved_quotes'), JSON.stringify(quotes));
    if (gratitudesUpdated) localStorage.setItem(this._getKey('gratitudes'), JSON.stringify(gratitudes));
    if (tracksUpdated) localStorage.setItem(this._getKey('favorited_tracks'), JSON.stringify(tracks));
  }

  // ── One-Time Legacy Migration ───────────────────────────────────────────────

  async checkAndMigrateLegacy() {
    if (!this.currentUid || !this.authToken) return;

    const migrationKey = `elora_legacy_migrated_${this.currentUid}`;
    if (localStorage.getItem(migrationKey)) return;

    // Check if un-namespaced legacy keys exist
    const oldPlanner = localStorage.getItem('elora_planner_tasks');
    const oldQuotes = localStorage.getItem('elora_saved_quotes');
    const oldGratitudes = localStorage.getItem('elora_gratitudes');
    const oldTracks = localStorage.getItem('elora_favorited_tracks');

    if (!oldPlanner && !oldQuotes && !oldGratitudes && !oldTracks) {
      localStorage.setItem(migrationKey, 'true');
      return;
    }

    try {
      const payload = {
        planner_tasks: oldPlanner ? JSON.parse(oldPlanner) : [],
        saved_quotes: oldQuotes ? JSON.parse(oldQuotes) : [],
        gratitudes: oldGratitudes ? JSON.parse(oldGratitudes) : [],
        favorited_tracks: oldTracks ? JSON.parse(oldTracks) : [],
      };

      const res = await fetch('/api/wellness/legacy-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        console.log('✅ Legacy localStorage wellness items migrated successfully to cloud.');
        localStorage.setItem(migrationKey, 'true');

        // Migrate local items into namespaced keys if empty
        if (!localStorage.getItem(this._getKey('planner_tasks')) && oldPlanner) {
          localStorage.setItem(this._getKey('planner_tasks'), oldPlanner);
        }
        if (!localStorage.getItem(this._getKey('saved_quotes')) && oldQuotes) {
          localStorage.setItem(this._getKey('saved_quotes'), oldQuotes);
        }
        if (!localStorage.getItem(this._getKey('gratitudes')) && oldGratitudes) {
          localStorage.setItem(this._getKey('gratitudes'), oldGratitudes);
        }
        if (!localStorage.getItem(this._getKey('favorited_tracks')) && oldTracks) {
          localStorage.setItem(this._getKey('favorited_tracks'), oldTracks);
        }

        // Clean un-namespaced keys to avoid cross-user contamination
        localStorage.removeItem('elora_planner_tasks');
        localStorage.removeItem('elora_saved_quotes');
        localStorage.removeItem('elora_gratitudes');
        localStorage.removeItem('elora_favorited_tracks');
      }
    } catch (e) {
      console.warn('Legacy import deferred:', e.message);
    }
  }
}

export const wellnessSyncManager = new WellnessSyncManager();

