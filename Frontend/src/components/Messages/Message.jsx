import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";
import { Check, CheckCheck } from "lucide-react";

import { motion } from "framer-motion";

const Message = ({ message }) => {
	const { authUser } = useAuthContext();
	const { selectedConversation } = useConversation();
	// senderId may be a populated object or a raw string (legacy data)
	const senderObjectId = String(message.senderId?._id || message.senderId || "");
	const fromMe = senderObjectId === String(authUser._id);
	const formattedTime = extractTime(message.createdAt);
	const chatClassName = fromMe ? "chat-end" : "chat-start";
	const profilePic = fromMe
		? authUser.profilePic
		: (message.senderId?.profilePic || selectedConversation?.profilePic);
	
	const bubbleBgColor = fromMe 
		? "bg-gradient-to-br from-neonPurple to-neonBlue border-none shadow-[0_5px_15px_rgba(124,58,237,0.3)] text-white" 
		: "bg-darkPanel/80 backdrop-blur-md border border-glassBorder text-gray-200";

	const shakeClass = message.shouldShake ? "animate-shake" : "";

	const variants = {
		hidden: { opacity: 0, y: 10, scale: 0.95 },
		visible: { opacity: 1, y: 0, scale: 1 }
	};

	return (
		<motion.div 
			variants={variants}
			initial="hidden"
			animate="visible"
			whileHover={{ scale: 1.01, y: -2 }}
			transition={{ duration: 0.4, ease: "easeOut" }}
			className={`chat ${chatClassName} relative z-10`}
		>
			<div className='chat-image avatar'>
				<div className='w-10 rounded-full border border-glassBorder shadow-sm'>
					<img alt='User Avatar' src={profilePic} className="object-cover" />
				</div>
			</div>
			<div className={`chat-bubble ${bubbleBgColor} ${shakeClass} pb-2 text-sm leading-relaxed tracking-wide`}>
				{message.content}
			</div>
			<div className='chat-footer opacity-50 text-[10px] flex gap-1 items-center mt-1 text-gray-400'>
				{formattedTime}
				{fromMe && (
					<span className="ml-[2px] mb-[1px]">
						{message.status === "seen" ? (
							<CheckCheck className="w-[14px] h-[14px] text-blue-400" />
						) : message.status === "delivered" ? (
							<CheckCheck className="w-[14px] h-[14px] text-gray-400" />
						) : (
							<Check className="w-[14px] h-[14px] text-gray-400" />
						)}
					</span>
				)}
			</div>
		</motion.div>
	);
};
export default Message;
