// IndexedDB utility for caching messages and conversations

const DB_NAME = "pulseChat";
const DB_VERSION = 1;
const MESSAGES_STORE = "messages";
const CONVERSATIONS_STORE = "conversations";

interface DBMessage {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  username: string;
}

interface DBConversation {
  id: string;
  username: string;
  fullName: string;
  profilePicture: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

// Initialize the database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create messages store with an index on conversationId
      if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
        const messagesStore = db.createObjectStore(MESSAGES_STORE, {
          keyPath: "id",
        });
        messagesStore.createIndex("conversationId", "conversationId", {
          unique: false,
        });
      }

      // Create conversations store
      if (!db.objectStoreNames.contains(CONVERSATIONS_STORE)) {
        db.createObjectStore(CONVERSATIONS_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      console.error("IndexedDB error:", request.error);
      reject(request.error);
    };
  });
};

// Store messages in IndexedDB
export const storeMessages = async (
  conversationId: string,
  messages: DBMessage[]
): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(MESSAGES_STORE, "readwrite");
    const store = transaction.objectStore(MESSAGES_STORE);

    // Add conversationId to each message for indexing
    const messagesWithConversationId = messages.map((message) => ({
      ...message,
      conversationId,
    }));

    // Store each message
    for (const message of messagesWithConversationId) {
      store.put(message);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => reject(transaction.error);
    });
  } catch (error) {
    console.error("Error storing messages:", error);
    throw error;
  }
};

// Get messages from IndexedDB by conversation ID
export const getMessagesFromDB = async (
  conversationId: string
): Promise<DBMessage[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(MESSAGES_STORE, "readonly");
    const store = transaction.objectStore(MESSAGES_STORE);
    const index = store.index("conversationId");
    const request = index.getAll(conversationId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const messages = request.result as DBMessage[];
        // Sort messages by timestamp
        messages.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        resolve(messages);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    return [];
  }
};

// Store conversations in IndexedDB
export const storeConversations = async (
  conversations: DBConversation[]
): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(CONVERSATIONS_STORE, "readwrite");
    const store = transaction.objectStore(CONVERSATIONS_STORE);

    // Clear existing conversations
    store.clear();

    // Store each conversation
    for (const conversation of conversations) {
      store.put(conversation);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error("Error storing conversations:", error);
    throw error;
  }
};

// Get all conversations from IndexedDB
export const getConversationsFromDB = async (): Promise<DBConversation[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(CONVERSATIONS_STORE, "readonly");
    const store = transaction.objectStore(CONVERSATIONS_STORE);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const conversations = request.result as DBConversation[];
        // Sort conversations by timestamp (newest first)
        conversations.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        resolve(conversations);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error getting conversations:", error);
    return [];
  }
};

// Add a single message to the store
export const addMessageToDB = async (
  conversationId: string,
  message: DBMessage
): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(MESSAGES_STORE, "readwrite");
    const store = transaction.objectStore(MESSAGES_STORE);

    // Add conversationId to the message
    const messageWithConversationId = {
      ...message,
      conversationId,
    };

    store.put(messageWithConversationId);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error("Error adding message:", error);
    throw error;
  }
};

// Delete a message from the store
export const deleteMessageFromDB = async (messageId: string): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(MESSAGES_STORE, "readwrite");
    const store = transaction.objectStore(MESSAGES_STORE);

    store.delete(messageId);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

// Clear all data from the database (useful for logout)
export const clearDatabase = async (): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(
      [MESSAGES_STORE, CONVERSATIONS_STORE],
      "readwrite"
    );

    transaction.objectStore(MESSAGES_STORE).clear();
    transaction.objectStore(CONVERSATIONS_STORE).clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
};
