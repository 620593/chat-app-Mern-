import { useState, useRef, useEffect } from "react";
import { BsSend } from "react-icons/bs";
import { motion } from "framer-motion";
import { Smile } from "lucide-react";
import useSendMessage from "../../hooks/useSendMessage";
import EmojiPicker from "emoji-picker-react";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";
import { useAuthContext } from "../../context/AuthContext";

const MessageInput = () => {
	const [message, setMessage] = useState("");
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const pickerRef = useRef(null);
	const typingTimeoutRef = useRef(null);
	const { loading, sendMessage } = useSendMessage();
	const { socket } = useSocketContext();
	const { selectedChat } = useConversation();
	const { authUser } = useAuthContext();

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (pickerRef.current && !pickerRef.current.contains(event.target)) {
				setShowEmojiPicker(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const onEmojiClick = (emojiObject) => {
		setMessage((prev) => prev + emojiObject.emoji);
	};

	const handleTyping = (e) => {
		setMessage(e.target.value);
		if (!socket || !selectedChat) return;

		socket.emit("typing", { senderId: authUser._id, chatId: selectedChat._id });

		if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

		typingTimeoutRef.current = setTimeout(() => {
			socket.emit("stop_typing", { senderId: authUser._id, chatId: selectedChat._id });
		}, 2000);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!message.trim()) return;
		await sendMessage(message);
		setMessage("");
		setShowEmojiPicker(false);
		if (socket && selectedChat) {
			socket.emit("stop_typing", { senderId: authUser._id, chatId: selectedChat._id });
			if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
		}
	};

	return (
		<form className='px-4 my-3 mt-auto relative' onSubmit={handleSubmit}>
			{showEmojiPicker && (
				<div className="absolute bottom-16 left-4 z-50 shadow-2xl rounded-xl overflow-hidden border border-glassBorder" ref={pickerRef}>
					<EmojiPicker 
						onEmojiClick={onEmojiClick} 
						theme="dark" 
						lazyLoadEmojis={true}
						style={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)' }}
					/>
				</div>
			)}
			<div className='w-full relative group'>
				<button
					type="button"
					onClick={() => setShowEmojiPicker(!showEmojiPicker)}
					className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-neonPurple transition-colors duration-200"
				>
					<Smile className="w-5 h-5" />
				</button>
				<input
					type='text'
					className='w-full p-3 pl-11 pr-12 rounded-full glass-input text-sm group-focus-within:bg-black/40 group-focus-within:shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-all'
					placeholder='Type a message...'
					value={message}
					onChange={handleTyping}
				/>
				<button 
					type='submit' 
					className='absolute inset-y-0 end-0 flex items-center pe-4 text-gray-400 transition-all z-10'
					disabled={!message.trim() && !loading}
				>
					<motion.div 
						whileHover={{ scale: 1.15, filter: "drop-shadow(0 0 8px rgba(124,58,237,0.8))" }} 
						whileTap={{ scale: 0.9 }}
						className="hover:text-neonPurple"
					>
						{loading ? <div className='loading loading-spinner w-4 h-4'></div> : <BsSend className="w-5 h-5" />}
					</motion.div>
				</button>
			</div>
		</form>
	);
};
export default MessageInput;

// STARTER CODE SNIPPET
// import { BsSend } from "react-icons/bs";

// const MessageInput = () => {
// 	return (
// 		<form className='px-4 my-3'>
// 			<div className='w-full'>
// 				<input
// 					type='text'
// 					className='border text-sm rounded-lg block w-full p-2.5  bg-gray-700 border-gray-600 text-white'
// 					placeholder='Send a message'
// 				/>
// 				<button type='submit' className='absolute inset-y-0 end-0 flex items-center pe-3'>
// 					<BsSend />
// 				</button>
// 			</div>
// 		</form>
// 	);
// };
// export default MessageInput;
