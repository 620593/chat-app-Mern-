import { ArrowLeft, Phone, Video, MoreVertical, Search } from "lucide-react";
import { useSocketContext } from "../../context/SocketContext";
import useTyping from "../../hooks/useTyping";
import { useWebRTCContext } from "../../context/WebRTCContext";
import useConversation from "../../zustand/useConversation";

const ChatHeader = ({ selectedConversation }) => {
    const { onlineUsers, connectionStatus } = useSocketContext();
    const { typingUsers } = useTyping();
    const webRTC = useWebRTCContext();
    const { setSelectedConversation } = useConversation();

    const isOnline = onlineUsers.includes(selectedConversation._id);
    const isTyping = typingUsers[selectedConversation._id];

    // Placeholder check based on the prompt's avatar rule
    const hasImage = selectedConversation.profilePic && selectedConversation.profilePic.includes("http");
    const initals = selectedConversation.fullName.split(" ").map(n => n[0]).join("").toUpperCase();

    const showBanner = connectionStatus === "reconnecting" || connectionStatus === "disconnected";

    return (
        <div className="sticky top-0 z-20">
        {showBanner && (
            <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-amber-500/20 border-b border-amber-500/30 text-amber-300 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {connectionStatus === "reconnecting" ? "Reconnecting…" : "Connection lost — check your network"}
            </div>
        )}
        <div className="bg-darkBg/60 backdrop-blur-xl px-4 py-3 border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)] flex items-center justify-between">
            {/* Left Side: Avatar & Status */}
            <div className="flex items-center gap-2 md:gap-3">
                <button 
                    onClick={() => setSelectedConversation(null)} 
                    className="md:hidden p-1 mr-1 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className={`avatar ${isOnline ? "online" : ""}`}>
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-neonPurple/20 overflow-hidden text-lg font-semibold text-white">
                        {hasImage ? (
                            <img src={selectedConversation.profilePic} alt="avatar" className="object-cover w-full h-full" />
                        ) : (
                            <span>{initals}</span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-white font-semibold tracking-wide leading-tight">
                        {selectedConversation.fullName}
                    </span>
                    <div className="text-xs mt-0.5">
                        {isTyping ? (
                            <span className="text-neonPurple italic animate-pulse font-medium flex items-center gap-1">
                                typing
                                <span className="flex gap-[2px]">
                                    <span className="w-1 h-1 bg-neonPurple rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1 h-1 bg-neonPurple rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1 h-1 bg-neonPurple rounded-full animate-bounce"></span>
                                </span>
                            </span>
                        ) : (
                            <span className={isOnline ? "text-green-400" : "text-gray-500"}>
                                {isOnline ? "Online" : "Offline"}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex gap-2 items-center">
                <button 
                    onClick={() => webRTC.initiateCall(selectedConversation, "audio")} 
                    className="p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                    <Phone className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => webRTC.initiateCall(selectedConversation, "video")} 
                    className="p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all relative group"
                >
                    <div className="absolute inset-0 rounded-full border border-neonPurple group-hover:animate-ping opacity-0 group-hover:opacity-50"></div>
                    <Video className="w-5 h-5 relative z-10" />
                </button>
                <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
                    <Search className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>
        </div>
        </div>
    );
};

export default ChatHeader;
