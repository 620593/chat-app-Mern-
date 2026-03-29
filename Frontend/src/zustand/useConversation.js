import { create } from "zustand";

const useConversation = create((set) => ({
	selectedConversation: null,
	setSelectedConversation: (selectedConversation) => set({ selectedConversation }),
	selectedChat: null,
	setSelectedChat: (selectedChat) => set({ selectedChat }),
	messages: [],
	setMessages: (messages) =>
		set((state) => ({
			messages: typeof messages === "function" ? messages(state.messages) : messages,
		})),
}));

export default useConversation;
