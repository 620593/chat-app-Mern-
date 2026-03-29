import { useEffect, useState } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";

const useTyping = () => {
    const [typingUsers, setTypingUsers] = useState({});
    const { socket } = useSocketContext();
    const { selectedChat } = useConversation();

    useEffect(() => {
        if (!socket) return;

        const handleTyping = ({ chatId, senderId }) => {
            if (selectedChat?._id === chatId) {
                setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
            }
        };

        const handleStopTyping = ({ chatId, senderId }) => {
            if (selectedChat?._id === chatId) {
                setTypingUsers((prev) => ({ ...prev, [senderId]: false }));
            }
        };

        socket.on("typing", handleTyping);
        socket.on("stop_typing", handleStopTyping);

        return () => {
            socket.off("typing", handleTyping);
            socket.off("stop_typing", handleStopTyping);
        };
    }, [socket, selectedChat]);

    return { typingUsers };
};

export default useTyping;
