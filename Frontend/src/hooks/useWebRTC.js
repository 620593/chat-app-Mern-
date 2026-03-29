import { useState, useEffect, useRef, useCallback } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const useWebRTC = () => {
	const { socket } = useSocketContext();
	const { authUser } = useAuthContext();
	
	const [localStream, setLocalStream] = useState(null);
	const [remoteStream, setRemoteStream] = useState(null);
	const [callStatus, setCallStatus] = useState("idle"); // 'idle', 'incoming', 'outgoing', 'ongoing'
	const [callData, setCallData] = useState(null); // { user: {}, signal: null }
	
	const [isMuted, setIsMuted] = useState(false);
	const [isVideoOff, setIsVideoOff] = useState(false);

	const peerConnection = useRef(null);

	const iceServers = {
		iceServers: [
			{ urls: "stun:stun.l.google.com:19302" },
			{ urls: "stun:stun1.l.google.com:19302" },
		],
	};

	const setupMediaStream = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
			setLocalStream(stream);
			return stream;
		} catch (err) {
			console.error("Failed to get local stream", err);
			toast.error("Could not access camera/microphone");
			return null;
		}
	};

	const createPeerConnection = useCallback(() => {
		const pc = new RTCPeerConnection(iceServers);

		pc.onicecandidate = (event) => {
			if (event.candidate && callData?.user?._id) {
				socket.emit("ice_candidate", {
					to: callData.user._id,
					candidate: event.candidate,
				});
			}
		};

		pc.ontrack = (event) => {
			setRemoteStream(event.streams[0]);
		};

		peerConnection.current = pc;
		return pc;
	}, [callData, socket]);

	// Listen for socket events
	useEffect(() => {
		if (!socket) return;

		const handleIncomingCall = async ({ from, signal, callerName, callerPic, callId }) => {
			setCallStatus("incoming");
			setCallData({ user: { _id: from, fullName: callerName, profilePic: callerPic }, signal, callId });
		};

		const handleCallAccepted = async (signalData) => {
			setCallStatus("ongoing");
			if (peerConnection.current) {
				await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signalData));
			}
		};

		const handleIceCandidate = async ({ candidate }) => {
			if (peerConnection.current && candidate) {
				try {
					await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
				} catch (e) {
					console.error("Error adding ice candidate", e);
				}
			}
		};

		const handleCallEnded = () => {
			cleanupCall();
			toast("Call ended", { icon: "📞" });
		};
		
		const handleCallRejected = () => {
			cleanupCall();
			toast.error("Call declined");
		};

		socket.on("incoming_call", handleIncomingCall);
		socket.on("call_accepted", handleCallAccepted);
		socket.on("call_rejected", handleCallRejected);
		socket.on("ice_candidate", handleIceCandidate);
		socket.on("end_call", handleCallEnded);

		return () => {
			socket.off("incoming_call", handleIncomingCall);
			socket.off("call_accepted", handleCallAccepted);
			socket.off("call_rejected", handleCallRejected);
			socket.off("ice_candidate", handleIceCandidate);
			socket.off("end_call", handleCallEnded);
		};
	}, [socket]);

	const initiateCall = async (targetUser) => {
		const stream = await setupMediaStream();
		if (!stream) return;

		setCallStatus("outgoing");
		setCallData({ user: targetUser, signal: null });

		const pc = createPeerConnection();
		stream.getTracks().forEach((track) => pc.addTrack(track, stream));

		const offer = await pc.createOffer();
		await pc.setLocalDescription(offer);

		socket.emit("call_user", {
			userToCall: targetUser._id,
			signalData: offer,
			callerName: authUser.fullName,
			callerPic: authUser.profilePic
		});
	};

	const answerCall = async () => {
		const stream = await setupMediaStream();
		if (!stream) {
			endCall();
			return;
		}

		setCallStatus("ongoing");

		const pc = createPeerConnection();
		stream.getTracks().forEach((track) => pc.addTrack(track, stream));

		await pc.setRemoteDescription(new RTCSessionDescription(callData.signal));
		const answer = await pc.createAnswer();
		await pc.setLocalDescription(answer);

		socket.emit("call_accepted", { signal: answer, to: callData.user._id, callId: callData.callId });
	};

	const cleanupCall = () => {
		setCallStatus("idle");
		setCallData(null);
		
		if (localStream) {
			localStream.getTracks().forEach(track => track.stop());
			setLocalStream(null);
		}
		
		setRemoteStream(null);
		
		if (peerConnection.current) {
			peerConnection.current.close();
			peerConnection.current = null;
		}
		
		setIsMuted(false);
		setIsVideoOff(false);
	};

	const endCall = () => {
		if (callData?.user?._id && socket) {
			socket.emit("end_call", { to: callData.user._id, callId: callData.callId });
		}
		cleanupCall();
	};

	const toggleMute = () => {
		if (localStream) {
			const audioTrack = localStream.getAudioTracks()[0];
			if (audioTrack) {
				audioTrack.enabled = !audioTrack.enabled;
				setIsMuted(!audioTrack.enabled);
			}
		}
	};

	const toggleVideo = () => {
		if (localStream) {
			const videoTrack = localStream.getVideoTracks()[0];
			if (videoTrack) {
				videoTrack.enabled = !videoTrack.enabled;
				setIsVideoOff(!videoTrack.enabled);
			}
		}
	};

	return {
		localStream,
		remoteStream,
		callStatus,
		callData,
		isMuted,
		isVideoOff,
		initiateCall,
		answerCall,
		endCall,
		toggleMute,
		toggleVideo
	};
};

export default useWebRTC;
