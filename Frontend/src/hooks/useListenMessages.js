import { useEffect } from "react";

import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";
import { useAuthContext } from "../context/AuthContext";

import notificationSound from "../assets/sounds/notification.mp3";

const useListenMessages = () => {
	const { socket } = useSocketContext();
	const { messages, setMessages, selectedChat } = useConversation();
	const { authUser } = useAuthContext();

	useEffect(() => {
		socket?.on("receive_message", (message) => {
			// Only process messages for the currently open chat
			if (!selectedChat || String(message.chatId) !== String(selectedChat._id)) return;

			const senderId = message.senderId?._id || message.senderId;
			const isFromOther = String(senderId) !== String(authUser._id);

			if (isFromOther) {
				message.shouldShake = true;
				const sound = new Audio(notificationSound);
				sound.play();
				// Mark as seen since the chat is currently open
				socket.emit("message_seen", { chatId: selectedChat._id, messageId: message._id });
				// Append receiver's incoming message
				setMessages((prev) => [...prev, message]);
			} else {
				// This is our own message echoed back — replace the optimistic temp entry
				setMessages((prev) => {
					// Use standard reverse findIndex for compatibility
					let tempIdx = -1;
					for (let i = prev.length - 1; i >= 0; i--) {
						const m = prev[i];
						if (m._id?.toString().startsWith("temp_") && m.content === message.content) {
							tempIdx = i;
							break;
						}
					}
					
					if (tempIdx !== -1) {
						// Replace temp with server-confirmed message
						const updated = [...prev];
						updated[tempIdx] = message;
						return updated;
					}
					// No temp found — just append (edge case)
					return [...prev, message];
				});
			}
		});

		socket?.on("chat_read", ({ chatId, userId }) => {
			if (selectedChat && String(chatId) === String(selectedChat._id)) {
				// The other user read the chat. Mark all our messages as seen.
				setMessages((prev) =>
					prev.map((msg) => {
						const senderId = msg.senderId?._id || msg.senderId;
						const isFromMe = String(senderId) === String(authUser._id);
						if (isFromMe && msg.status !== "seen") {
							return { ...msg, status: "seen" };
						}
						return msg;
					})
				);
			}
		});

		socket?.on("message_seen", ({ chatId, messageId, seenBy }) => {
			if (selectedChat && String(chatId) === String(selectedChat._id)) {
				setMessages((prev) =>
					prev.map((msg) =>
						String(msg._id) === String(messageId) ? { ...msg, status: "seen" } : msg
					)
				);
			}
		});

		return () => {
			socket?.off("receive_message");
			socket?.off("chat_read");
			socket?.off("message_seen");
		};
	}, [socket, setMessages, selectedChat, authUser]);
};
export default useListenMessages;
