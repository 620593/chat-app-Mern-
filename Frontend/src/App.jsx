import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./Pages/home/Home";
import Login from "./Pages/Login/Login";
import SignUp from "./Pages/signup/Signup";
import { Toaster } from "react-hot-toast";
import { useAuthContext } from "./context/AuthContext";
import { useWebRTCContext } from "./context/WebRTCContext";
import VideoCallModal from "./components/calls/VideoCallModal";
import AnimatedBackground from "./components/layout/AnimatedBackground";
import CursorParticles from "./components/layout/CursorParticles";

function App() {
	const { authUser } = useAuthContext();
	const webRTC = useWebRTCContext();
	
	return (
		<div className='p-4 h-screen flex items-center justify-center relative overflow-hidden'>
			<AnimatedBackground />
			<CursorParticles />
			<Routes>
				<Route path='/' element={authUser ? <Home /> : <Navigate to={"/login"} />} />
				<Route path='/login' element={authUser ? <Navigate to='/' /> : <Login />} />
				<Route path='/signup' element={authUser ? <Navigate to='/' /> : <SignUp />} />
			</Routes>
			<Toaster />
			{authUser && <VideoCallModal webRTC={webRTC} />}
		</div>
	);
}

export default App;
