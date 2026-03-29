import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";

/**
 * Premium Glassmorphism Video Call Modal
 * Handles state rendering for incoming, outgoing, and ongoing calls.
 */
const VideoCallModal = ({ webRTC }) => {
	const {
		localStream,
		remoteStream,
		callStatus,
		callData,
		isMuted,
		isVideoOff,
		answerCall,
		endCall,
		toggleMute,
		toggleVideo,
	} = webRTC;

	const localVideoRef = useRef(null);
	const remoteVideoRef = useRef(null);

	// Attach media streams to video elements
	useEffect(() => {
		if (localVideoRef.current && localStream) {
			localVideoRef.current.srcObject = localStream;
		}
	}, [localStream, callStatus]);

	useEffect(() => {
		if (remoteVideoRef.current && remoteStream) {
			remoteVideoRef.current.srcObject = remoteStream;
		}
	}, [remoteStream, callStatus]);

	if (callStatus === "idle") return null;

	const callerName = callData?.user?.fullName || "Unknown";
	const callerPic = callData?.user?.profilePic || "";

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
			>
				{/* Incoming Call View */}
				{callStatus === "incoming" && (
					<motion.div 
						initial={{ scale: 0.8, y: 50 }}
						animate={{ scale: 1, y: 0 }}
						className="flex flex-col items-center p-8 bg-darkPanel/90 border border-glassBorder rounded-3xl shadow-[0_0_50px_rgba(124,58,237,0.2)]"
					>
						<div className="relative mb-6">
							<div className="absolute inset-0 rounded-full animate-ping bg-neonPurple/50"></div>
							<img src={callerPic} alt="caller" className="relative w-24 h-24 rounded-full border-2 border-neonPurple object-cover z-10" />
						</div>
						<h2 className="text-2xl font-bold text-white mb-2">{callerName}</h2>
						<p className="text-gray-400 mb-8 animate-pulse">Incoming video call...</p>

						<div className="flex gap-8">
							<button onClick={endCall} className="w-14 h-14 flex items-center justify-center bg-red-500/20 text-red-500 rounded-full border border-red-500/50 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]">
								<PhoneOff className="w-6 h-6" />
							</button>
							<button onClick={answerCall} className="w-14 h-14 flex items-center justify-center bg-green-500/20 text-green-500 rounded-full border border-green-500/50 hover:bg-green-500 hover:text-white transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] animate-bounce">
								<Phone className="w-6 h-6" />
							</button>
						</div>
					</motion.div>
				)}

				{/* Outgoing & Ongoing Call View */}
				{(callStatus === "outgoing" || callStatus === "ongoing") && (
					<div className="relative w-full h-full max-w-6xl max-h-[90vh] md:rounded-3xl overflow-hidden bg-gray-900 border border-glassBorder shadow-[0_0_40px_rgba(0,0,0,0.5)]">
						
						{/* Remote Video (Main Background) */}
						<div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
							{callStatus === "outgoing" ? (
								<div className="text-center">
									<img src={callerPic} alt="calling" className="w-32 h-32 rounded-full border-4 border-glassBorder mx-auto mb-4 object-cover" />
									<h2 className="text-3xl font-bold text-white">{callerName}</h2>
									<p className="text-neonPurple mt-2 animate-pulse">Calling...</p>
								</div>
							) : (
								<video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
							)}
						</div>

						{/* Local Video (Picture in Picture) */}
						<div className="absolute top-6 right-6 w-32 h-48 md:w-48 md:h-72 bg-gray-900 rounded-2xl overflow-hidden border-2 border-neonPurple/50 shadow-2xl z-20">
							<video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
						</div>

						{/* Glass Overlay Controls */}
						<div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-6 px-8 py-4 bg-darkBg/60 backdrop-blur-lg border border-glassBorder rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-20">
							<button 
								onClick={toggleMute} 
								className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-white/10 text-white hover:bg-white/20'}`}
							>
								{isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
							</button>

							<button 
								onClick={endCall} 
								className="w-14 h-14 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:scale-105"
							>
								<PhoneOff className="w-6 h-6" />
							</button>

							<button 
								onClick={toggleVideo} 
								className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${isVideoOff ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-white/10 text-white hover:bg-white/20'}`}
							>
								{isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
							</button>
						</div>
					</div>
				)}
			</motion.div>
		</AnimatePresence>
	);
};

export default VideoCallModal;
