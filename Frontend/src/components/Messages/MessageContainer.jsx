import { useEffect } from "react";
import useConversation from "../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { useAuthContext } from "../../context/AuthContext";
import ChatHeader from "./ChatHeader";

const MessageContainer = () => {
	const { selectedConversation, setSelectedConversation } = useConversation();

	useEffect(() => {
		// cleanup function (unmounts)
		return () => setSelectedConversation(null);
	}, [setSelectedConversation]);

	return (
		<div className='flex flex-col relative overflow-hidden bg-black/10 w-full h-full'>
			{/* Vignette Overlay */}
			<div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/40 z-0" />
			
			<div className="relative z-10 flex flex-col h-full w-full">
				{!selectedConversation ? (
					<NoChatSelected />
				) : (
					<>
					<ChatHeader selectedConversation={selectedConversation} />
					<Messages />
					<MessageInput />
				</>
			)}
			</div>
		</div>
	);
};
export default MessageContainer;

const NoChatSelected = () => {
	const { authUser } = useAuthContext();
	return (
		<div className='flex items-center justify-center w-full h-full'>
			<div className='px-4 text-center sm:text-lg md:text-xl text-gray-300 font-medium flex flex-col items-center gap-4 bg-darkBg/30 p-8 rounded-2xl border border-glassBorder backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.2)]'>
				<p className='text-2xl font-semibold text-white'>Welcome 👋 <span className='text-neonPurple'>{authUser.fullName}</span></p>
				<p className='text-sm opacity-80'>Select a chat to start messaging</p>
				<TiMessages className='text-6xl md:text-8xl text-neonPurple/80 animate-bounce mt-4 drop-shadow-[0_0_15px_rgba(124,58,237,0.5)]' />
			</div>
		</div>
	);
};

// STARTER CODE SNIPPET
// import MessageInput from "./MessageInput";
// import Messages from "./Messages";

// const MessageContainer = () => {
// 	return (
// 		<div className='md:min-w-[450px] flex flex-col'>
// 			<>
// 				{/* Header */}
// 				<div className='bg-slate-500 px-4 py-2 mb-2'>
// 					<span className='label-text'>To:</span> <span className='text-gray-900 font-bold'>John doe</span>
// 				</div>

// 				<Messages />
// 				<MessageInput />
// 			</>
// 		</div>
// 	);
// };
// export default MessageContainer;
