import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatState {
  chats: {
    messages: Message[];
    title: string;
    id: string;
    type: "analysis" | "portfolio";
  }[];
  addChat: (
    title: string,
    messages: Message[],
    id: string,
    type: "analysis" | "portfolio"
  ) => void;
  removeChat: (id: string) => void;
  updateMessages: (id: string, messages: Message[]) => void;
  updateTitle: (id: string, title: string) => void;
}

export const useChat = create(
  persist<ChatState>(
    (set) => ({
      chats: [],
      addChat: (
        title: string,
        messages: Message[],
        id: string,
        type: "analysis" | "portfolio"
      ) =>
        set((state) => ({
          chats: [...state.chats, { title, messages, id, type }],
        })),
      removeChat: (id: string) =>
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== id),
        })),
      updateMessages: (id: string, messages: Message[]) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === id ? { ...chat, messages } : chat
          ),
        })),
      updateTitle: (id: string, title: string) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === id ? { ...chat, title } : chat
          ),
        })),
    }),
    { name: "chat-storage" }
  )
);
