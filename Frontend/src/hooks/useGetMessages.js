import { useEffect, useState, useRef } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";
import { useSocketContext } from "../context/SocketContext";

const useGetMessages = () => {
	const [loading, setLoading] = useState(false);
	const { messages, setMessages, selectedConversation, setSelectedChat } = useConversation();
	const { socket } = useSocketContext();
	// Use a ref so we always have the latest socket without adding it to deps
	const socketRef = useRef(socket);
	useEffect(() => { socketRef.current = socket; }, [socket]);

	useEffect(() => {
		const getMessages = async () => {
			setLoading(true);
			try {
				// 1. Get or create a 1-1 chat first to get the unified chatId
				const chatRes = await fetch("/api/chats", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ userId: selectedConversation._id }),
				});
				const chatData = await chatRes.json();
				if (chatData.error) throw new Error(chatData.error);
				
				setSelectedChat(chatData);

				// 2. Mark chat as read immediately
				if (socketRef.current && chatData._id) {
					socketRef.current.emit("mark_read", { chatId: chatData._id });
				}

				// 3. Fetch past messages for this chat
				const res = await fetch(`/api/messages/${chatData._id}`);
				const data = await res.json();
				if (data.error) throw new Error(data.error);
				
				setMessages(data);
			} catch (error) {
				toast.error(error.message);
			} finally {
				setLoading(false);
			}
		};

		if (selectedConversation?._id) getMessages();
		
		// Clear selected chat when conversation is deselected
		return () => setSelectedChat(null);
	}, [selectedConversation?._id, setMessages, setSelectedChat]); // socket intentionally omitted — using ref

	return { messages, loading };
};
export default useGetMessages;
