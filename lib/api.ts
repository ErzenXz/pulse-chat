import { toast } from "sonner";

const BASE_URL = "https://apis.erzen.tk";

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "An error occurred");
  }
  return response.json();
};

// Generic fetch function with authentication
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      ...options,
    });

    // If unauthorized, redirect to auth page
    if (response.status === 401) {
      const token = await refreshToken();
      if (token) {
        return fetchWithAuth(endpoint, options);
      }
    }

    return handleResponse(response);
  } catch (error) {
    console.error("API request failed:", error);
    toast.error("Request failed. Please try again.");
    throw error;
  }
};

// API functions for conversations
export const getConversations = () => {
  return fetchWithAuth("/messaging/conversations");
};

export const getMessages = (conversationId: string, page = 1, limit = 20) => {
  return fetchWithAuth(
    `/messaging/messages/${conversationId}?page=${page}&limit=${limit}`
  );
};

export const sendMessage = (username: string, content: string) => {
  return fetchWithAuth(`/messaging/send/${username}`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
};

export const deleteMessage = (messageId: string) => {
  return fetchWithAuth(`/messaging/delete/${messageId}`, {
    method: "DELETE",
  });
};

// API functions for users
export const searchUsers = (query: string) => {
  return fetchWithAuth(
    `/messaging/searchUsers?query=${encodeURIComponent(query)}`
  );
};

// API functions for file uploads
export const uploadFile = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${BASE_URL}/storage/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let uploadedUrl = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const messages = chunk
        .split("\n\n")
        .filter((msg) => msg.trim() !== "")
        .map((msg) => msg.replace("data: ", ""));

      for (const msg of messages) {
        try {
          const data = JSON.parse(msg);

          if (data.error) {
            throw new Error(data.error);
          }

          if (data.progress && onProgress) {
            onProgress(data.progress);
          }

          if (data.url) {
            uploadedUrl = data.url;
          }
        } catch (e) {
          console.log("Progress update:", msg);
        }
      }
    }

    if (!uploadedUrl) {
      throw new Error("No URL received from server");
    }

    return { url: uploadedUrl };
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};

// API function for creating photo entry
export const createPhotoEntry = (url: string, albumId: string) => {
  return fetchWithAuth("/photos", {
    method: "POST",
    body: JSON.stringify({ url, albumId }),
  });
};

// API function for user authentication
export const getUserInfo = async () => {
  try {
    const response = await fetch(`${BASE_URL}/v1/auth/info`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to get user info");
    }

    const data = await response.json();
    localStorage.setItem("userData", data);
    return true;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
};

export const refreshToken = async () => {
  try {
    const response = await fetch(`${BASE_URL}/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    localStorage.setItem("accessToken", data.accessToken);
    return true;
  } catch (error) {
    console.error("Token refresh failed:", error);
    const currentUrl = encodeURIComponent(window.location.href);
    window.location.href = `https://auth.erzen.tk?return_to=${currentUrl}`;
    return false;
  }
};
