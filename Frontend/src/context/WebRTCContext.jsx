import { createContext, useContext } from "react";
import useWebRTC from "../hooks/useWebRTC";

export const WebRTCContext = createContext();

export const useWebRTCContext = () => useContext(WebRTCContext);

export const WebRTCContextProvider = ({ children }) => {
	const webRTC = useWebRTC();
	return (
		<WebRTCContext.Provider value={webRTC}>
			{children}
		</WebRTCContext.Provider>
	);
};
