import MessageContainer from "../../components/messages/MessageContainer";
import Sidebar from "../../components/sidebar/Sidebar";
import { motion } from "framer-motion";
import useConversation from "../../zustand/useConversation";

const Home = () => {
  const { selectedConversation } = useConversation();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className='flex h-[90vh] md:h-[85vh] w-full max-w-6xl rounded-2xl overflow-hidden glass-panel shadow-[0_20px_60px_rgba(0,0,0,0.6)]'
    >
      <div className={`h-full w-full md:w-[35%] md:block ${selectedConversation ? 'hidden' : 'block'}`}>
        <Sidebar />
      </div>
      <div className={`h-full w-full md:w-[65%] md:flex ${selectedConversation ? 'flex' : 'hidden'}`}>
        <MessageContainer />
      </div>
    </motion.div>
  );
};
export default Home;

