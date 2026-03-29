import { useState, useCallback } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";
import { useSocketContext } from "../context/SocketContext";
import { useAuthContext } from "../context/AuthContext";

const RETRY_DELAY_MS = 3000;

const useSendMessage = () => {
	const [loading, setLoading] = useState(false);
	const { selectedChat, messages, setMessages } = useConversation();
	const { socket } = useSocketContext();
	const { authUser } = useAuthContext();

	const sendMessage = useCallback(async (content) => {
		if (!socket?.connected) {
			toast.error("Not connected — please wait and try again");
			return;
		}
		if (!selectedChat) {
			toast.error("No chat selected");
			return;
		}
		if (!content?.trim()) return;

		// ── Optimistic update — sender sees message instantly ────────────────
		const tempId = `temp_${Date.now()}`;
		const optimistic = {
			_id: tempId,
			chatId: selectedChat._id,
			senderId: {
				_id: authUser._id,
				profilePic: authUser.profilePic,
				fullName: authUser.fullName,
				username: authUser.username,
			},
			content: content.trim(),
			status: "sent",
			createdAt: new Date().toISOString(),
		};

		setMessages((prev) => [...prev, optimistic]);
		setLoading(true);

		// ── Emit with ACK ─────────────────────────────────────────────────────
		const emitWithAck = () =>
			new Promise((resolve) => {
				socket.timeout(5000).emit(
					"send_message",
					{ chatId: selectedChat._id, content: content.trim() },
					(err, response) => {
						if (err) resolve({ error: err.message || "Timeout" });
						else resolve(response);
					}
				);
			});

		try {
			let result = await emitWithAck();

			// Single retry on timeout/error
			if (result?.error) {
				console.warn("send_message failed, retrying once:", result.error);
				await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
				result = await emitWithAck();
			}

			if (result?.error) {
				// Remove optimistic message on definitive failure
				setMessages((prev) => prev.filter((m) => m._id !== tempId));
				toast.error(`Failed to send: ${result.error}`);
			}
			// On success → useListenMessages will receive 'receive_message'
			// and replace the temp_ entry with the server-confirmed message
		} catch (err) {
			setMessages((prev) => prev.filter((m) => m._id !== tempId));
			toast.error(err.message);
		} finally {
			setLoading(false);
		}
	}, [socket, selectedChat, authUser, messages, setMessages]);

	return { sendMessage, loading };
};
export default useSendMessage;
