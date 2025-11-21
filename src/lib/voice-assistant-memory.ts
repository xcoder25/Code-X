'use client';

/**
 * Voice Assistant Memory System
 * Manages conversation history and context for natural, flowing conversations
 */

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  context?: any; // Additional context data
}

export interface ConversationMemory {
  messages: ConversationMessage[];
  userId?: string;
  sessionId: string;
  startedAt: number;
  lastActivity: number;
}

const MAX_MESSAGES = 50; // Keep last 50 messages
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

class VoiceAssistantMemory {
  private memory: Map<string, ConversationMemory> = new Map();
  private currentSessionId: string | null = null;

  /**
   * Start a new conversation session
   */
  startSession(userId?: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.memory.set(sessionId, {
      messages: [],
      userId,
      sessionId,
      startedAt: Date.now(),
      lastActivity: Date.now(),
    });
    
    this.currentSessionId = sessionId;
    return sessionId;
  }

  /**
   * Get current session or create new one
   */
  getCurrentSession(userId?: string): string {
    if (this.currentSessionId) {
      const session = this.memory.get(this.currentSessionId);
      if (session && Date.now() - session.lastActivity < SESSION_TIMEOUT) {
        return this.currentSessionId;
      }
    }
    
    return this.startSession(userId);
  }

  /**
   * Add a message to the conversation
   */
  addMessage(message: Omit<ConversationMessage, 'timestamp'>, sessionId?: string): void {
    const sid = sessionId || this.currentSessionId;
    if (!sid) return;

    const session = this.memory.get(sid);
    if (!session) return;

    session.messages.push({
      ...message,
      timestamp: Date.now(),
    });

    // Keep only last MAX_MESSAGES
    if (session.messages.length > MAX_MESSAGES) {
      session.messages = session.messages.slice(-MAX_MESSAGES);
    }

    session.lastActivity = Date.now();
    this.memory.set(sid, session);

    // Store in localStorage for persistence
    this.persistSession(sid);
  }

  /**
   * Get conversation history
   */
  getHistory(sessionId?: string): ConversationMessage[] {
    const sid = sessionId || this.currentSessionId;
    if (!sid) return [];

    const session = this.memory.get(sid);
    return session?.messages || [];
  }

  /**
   * Get recent context (last N messages)
   */
  getRecentContext(count: number = 10, sessionId?: string): ConversationMessage[] {
    const history = this.getHistory(sessionId);
    return history.slice(-count);
  }

  /**
   * Get conversation summary for AI context
   */
  getContextSummary(sessionId?: string): string {
    const messages = this.getRecentContext(20, sessionId);
    if (messages.length === 0) {
      return 'This is the start of a new conversation.';
    }

    const summary = messages
      .map(m => `${m.role === 'user' ? 'User' : 'Elara'}: ${m.content}`)
      .join('\n');

    return `Previous conversation:\n${summary}`;
  }

  /**
   * Clear current session
   */
  clearSession(sessionId?: string): void {
    const sid = sessionId || this.currentSessionId;
    if (sid) {
      this.memory.delete(sid);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`elara_session_${sid}`);
      }
    }
    if (sid === this.currentSessionId) {
      this.currentSessionId = null;
    }
  }

  /**
   * Get all sessions
   */
  getAllSessions(): ConversationMemory[] {
    return Array.from(this.memory.values());
  }

  /**
   * Persist session to localStorage
   */
  private persistSession(sessionId: string): void {
    if (typeof window === 'undefined') return;

    const session = this.memory.get(sessionId);
    if (session) {
      try {
        localStorage.setItem(`elara_session_${sessionId}`, JSON.stringify(session));
        localStorage.setItem('elara_current_session', sessionId);
      } catch (e) {
        console.error('Failed to persist session:', e);
      }
    }
  }

  /**
   * Restore session from localStorage
   */
  restoreSession(sessionId?: string): void {
    if (typeof window === 'undefined') return;

    try {
      const sid = sessionId || localStorage.getItem('elara_current_session');
      if (!sid) return;

      const stored = localStorage.getItem(`elara_session_${sid}`);
      if (stored) {
        const session: ConversationMemory = JSON.parse(stored);
        
        // Check if session is not expired
        if (Date.now() - session.lastActivity < SESSION_TIMEOUT) {
          this.memory.set(sid, session);
          this.currentSessionId = sid;
        } else {
          // Session expired, clean up
          localStorage.removeItem(`elara_session_${sid}`);
        }
      }
    } catch (e) {
      console.error('Failed to restore session:', e);
    }
  }

  /**
   * Clean up old sessions
   */
  cleanupOldSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.memory.entries()) {
      if (now - session.lastActivity > SESSION_TIMEOUT) {
        this.memory.delete(sessionId);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`elara_session_${sessionId}`);
        }
      }
    }
  }

  /**
   * Export conversation history
   */
  exportHistory(sessionId?: string): string {
    const messages = this.getHistory(sessionId);
    return JSON.stringify(messages, null, 2);
  }

  /**
   * Search conversation history
   */
  searchHistory(searchTerm: string, sessionId?: string): ConversationMessage[] {
    const messages = this.getHistory(sessionId);
    const lowerSearch = searchTerm.toLowerCase();
    
    return messages.filter(m => 
      m.content.toLowerCase().includes(lowerSearch)
    );
  }
}

// Singleton instance
const memoryInstance = new VoiceAssistantMemory();

// Auto-restore session on load
if (typeof window !== 'undefined') {
  memoryInstance.restoreSession();
  
  // Cleanup old sessions periodically
  setInterval(() => {
    memoryInstance.cleanupOldSessions();
  }, 5 * 60 * 1000); // Every 5 minutes
}

export default memoryInstance;

// Helper functions for easy access
export const startConversation = (userId?: string) => 
  memoryInstance.startSession(userId);

export const addUserMessage = (content: string, context?: any) => 
  memoryInstance.addMessage({ role: 'user', content, context });

export const addAssistantMessage = (content: string, context?: any) => 
  memoryInstance.addMessage({ role: 'assistant', content, context });

export const getConversationHistory = () => 
  memoryInstance.getHistory();

export const getConversationContext = () => 
  memoryInstance.getContextSummary();

export const clearConversation = () => 
  memoryInstance.clearSession();

export const searchConversation = (searchTerm: string) => 
  memoryInstance.searchHistory(searchTerm);

