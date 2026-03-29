import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";

import { motion } from "framer-motion";

const Conversation = ({ conversation, lastIdx, emoji }) => {
	const { selectedConversation, setSelectedConversation } = useConversation();

	const isSelected = selectedConversation?._id === conversation._id;
	const { onlineUsers } = useSocketContext();
	const isOnline = onlineUsers.includes(conversation._id);

	const item = {
		hidden: { opacity: 0, y: 10 },
		show: { opacity: 1, y: 0 }
	};

	return (
		<motion.div variants={item}>
			<motion.div
				className={`flex gap-3 items-center rounded-xl p-3 py-2 cursor-pointer transition-all duration-300 border
				${isSelected ? "bg-neonPurple/20 border-neonPurple/40 shadow-[0_0_20px_rgba(124,58,237,0.2)]" : "border-transparent hover:bg-glassBorder/30 hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.03)]"}
			`}
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				onClick={() => setSelectedConversation(conversation)}
			>
				<div className={`avatar ${isOnline ? "online" : ""}`}>
					<div className='w-12 h-12 rounded-full border-2 border-transparent transition-all duration-300 hover:border-neonPurple'>
						<img src={conversation.profilePic} alt='user avatar' className="object-cover" />
					</div>
				</div>

				<div className='flex flex-col flex-1 overflow-hidden'>
					<div className='flex gap-2 justify-between items-center'>
						<p className={`font-semibold text-sm truncate ${isSelected ? "text-white" : "text-gray-300"}`}>{conversation.fullName}</p>
						{conversation.unreadCount > 0 ? (
							<span className='w-5 h-5 shrink-0 flex justify-center items-center rounded-full bg-neonPurple text-white text-[10px] font-bold shadow-[0_0_8px_rgba(124,58,237,0.8)]'>
								{conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
							</span>
						) : (
							<span className='text-xs opacity-70'>{emoji}</span>
						)}
					</div>
					{conversation.lastMessage && (
						<p className={`text-xs truncate mt-1 ${conversation.unreadCount > 0 ? "text-white font-medium" : (isSelected ? "text-gray-200" : "text-gray-400")}`}>
							{conversation.lastMessage.senderId === conversation._id ? "" : "You: "}
							{conversation.lastMessage.content || conversation.lastMessage.message}
						</p>
					)}
				</div>
			</motion.div>

			{!lastIdx && <div className='divider my-1 py-0 h-1 px-4 before:bg-glassBorder after:bg-glassBorder opacity-50' />}
		</motion.div>
	);
};
export default Conversation;

// STARTER CODE SNIPPET
// const Conversation = () => {
// 	return (
// 		<>
// 			<div className='flex gap-2 items-center hover:bg-sky-500 rounded p-2 py-1 cursor-pointer'>
// 				<div className='avatar online'>
// 					<div className='w-12 rounded-full'>
// 						<img
// 							src='https://cdn0.iconfinder.com/data/icons/communication-line-10/24/account_profile_user_contact_person_avatar_placeholder-512.png'
// 							alt='user avatar'
// 						/>
// 					</div>
// 				</div>

// 				<div className='flex flex-col flex-1'>
// 					<div className='flex gap-3 justify-between'>
// 						<p className='font-bold text-gray-200'>John Doe</p>
// 						<span className='text-xl'>🎃</span>
// 					</div>
// 				</div>
// 			</div>

// 			<div className='divider my-0 py-0 h-1' />
// 		</>
// 	);
// };
// export default Conversation;
