import { createContext, useState, useEffect, useRef, useCallback, useContext } from "react";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

/**
 * Connection status values: "disconnected" | "connecting" | "connected" | "reconnecting"
 */
export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState([]);
	const [connectionStatus, setConnectionStatus] = useState("disconnected");

	const { authUser } = useAuthContext();
	const socketRef = useRef(null);

	// ── Cleanup helper ────────────────────────────────────────────────────────
	const destroySocket = useCallback(() => {
		if (socketRef.current) {
			socketRef.current.disconnect();
			socketRef.current = null;
			setSocket(null);
			setOnlineUsers([]);
			setConnectionStatus("disconnected");
		}
	}, []);

	useEffect(() => {
		// No user — destroy any existing socket
		if (!authUser?._id) {
			destroySocket();
			return;
		}

		// Guard: socket already live for this user — skip re-creation
		if (socketRef.current?.connected) return;

		const socketUrl =
			import.meta.env.VITE_BACKEND_URL ||
			import.meta.env.VITE_URL ||
			"http://localhost:5000";

		setConnectionStatus("connecting");

		const newSocket = io(socketUrl, {
			withCredentials: true, // sends the httpOnly JWT cookie to the server
			// ACK timeout: if the server doesn't respond within 5000ms, callback gets an error
			ackTimeout: 5000,
			// Reconnect with exponential backoff
			reconnection: true,
			reconnectionAttempts: 10,
			reconnectionDelay: 1000,        // start at 1s
			reconnectionDelayMax: 30000,    // cap at 30s
			randomizationFactor: 0.5,       // jitter to prevent thundering herd
		});

		socketRef.current = newSocket;
		setSocket(newSocket);

		// ── Lifecycle events ────────────────────────────────────────────────
		newSocket.on("connect", () => {
			console.log(`🟢 Socket connected: ${newSocket.id} (user=${authUser._id})`);
			setConnectionStatus("connected");
		});

		newSocket.on("disconnect", (reason) => {
			console.log(`🔴 Socket disconnected: reason="${reason}"`);
			setConnectionStatus("disconnected");
		});

		newSocket.on("connect_error", (err) => {
			console.warn(`⚠️ Socket connect error: ${err.message}`);
			setConnectionStatus("disconnected");
		});

		newSocket.io.on("reconnect_attempt", (attempt) => {
			console.log(`🔄 Reconnect attempt #${attempt}`);
			setConnectionStatus("reconnecting");
		});

		newSocket.io.on("reconnect", (attempt) => {
			console.log(`✅ Reconnected after ${attempt} attempt(s): ${newSocket.id}`);
			setConnectionStatus("connected");
		});

		newSocket.io.on("reconnect_failed", () => {
			console.error("❌ All reconnect attempts exhausted");
			setConnectionStatus("disconnected");
		});

		// ── Data events ────────────────────────────────────────────────────
		newSocket.on("getOnlineUsers", (users) => {
			setOnlineUsers(users);
		});

		// ── Cleanup on logout / userId change ──────────────────────────────
		return () => {
			console.log("🧹 Cleaning up socket for user:", authUser._id);
			newSocket.disconnect();
			socketRef.current = null;
			setSocket(null);
			setConnectionStatus("disconnected");
		};
	}, [authUser?._id, destroySocket]); // depends only on the stable ID string

	return (
		<SocketContext.Provider value={{ socket, onlineUsers, connectionStatus }}>
			{children}
		</SocketContext.Provider>
	);
};
