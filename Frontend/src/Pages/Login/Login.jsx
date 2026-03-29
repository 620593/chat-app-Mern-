import { useState } from "react";
import { Link } from "react-router-dom";
import useLogin from "../../hooks/useLogin";
import { motion } from "framer-motion";

const Login = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const { loading, login } = useLogin();

	const handleSubmit = async (e) => {
		e.preventDefault();
		await login(username, password);
	};

	return (
		<motion.div 
			initial={{ opacity: 0, scale: 0.9, y: 20 }}
			animate={{ opacity: 1, scale: 1, y: 0 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
			className='flex flex-col items-center justify-center min-w-96 mx-auto'
		>
			<div className='w-full p-8 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] glass-panel'>
				<h1 className='text-3xl font-semibold text-center text-white tracking-wide mb-6'>
					Login to
					<span className='text-neonPurple bg-clip-text text-transparent bg-gradient-to-r from-neonPurple to-neonBlue drop-shadow-[0_0_10px_rgba(124,58,237,0.5)]'> ChatApp</span>
				</h1>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<div>
						<label className='label p-2'>
							<span className='text-sm font-medium text-gray-300'>Username</span>
						</label>
						<input
							type='text'
							placeholder='Enter username'
							className='w-full input h-11 glass-input rounded-xl px-4'
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
					</div>

					<div>
						<label className='label'>
							<span className='text-sm font-medium text-gray-300'>Password</span>
						</label>
						<input
							type='password'
							placeholder='Enter Password'
							className='w-full input h-11 glass-input rounded-xl px-4'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
					
					<Link to='/signup' className='text-sm text-gray-400 hover:text-neonBlue transition-colors duration-200 mt-2 inline-block text-right w-full'>
						{"Don't"} have an account? Create one
					</Link>

					<div className="mt-4">
						<button 
							className='btn btn-block h-11 bg-neonPurple hover:bg-neonPurple/80 text-white border-none rounded-xl shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:shadow-[0_0_25px_rgba(124,58,237,0.6)] transition-all duration-300 text-base font-medium' 
							disabled={loading}
						>
							{loading ? <span className='loading loading-spinner text-white'></span> : "Login to Account"}
						</button>
					</div>
				</form>
			</div>
		</motion.div>
	);
};
export default Login;

// STARTER CODE FOR THIS FILE
// const Login = () => {
// 	return (
// 		<div className='flex flex-col items-center justify-center min-w-96 mx-auto'>
// 			<div className='w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0'>
// 				<h1 className='text-3xl font-semibold text-center text-gray-300'>
// 					Login
// 					<span className='text-blue-500'> ChatApp</span>
// 				</h1>

// 				<form>
// 					<div>
// 						<label className='label p-2'>
// 							<span className='text-base label-text'>Username</span>
// 						</label>
// 						<input type='text' placeholder='Enter username' className='w-full input input-bordered h-10' />
// 					</div>

// 					<div>
// 						<label className='label'>
// 							<span className='text-base label-text'>Password</span>
// 						</label>
// 						<input
// 							type='password'
// 							placeholder='Enter Password'
// 							className='w-full input input-bordered h-10'
// 						/>
// 					</div>
// 					<a href='#' className='text-sm  hover:underline hover:text-blue-600 mt-2 inline-block'>
// 						{"Don't"} have an account?
// 					</a>

// 					<div>
// 						<button className='btn btn-block btn-sm mt-2'>Login</button>
// 					</div>
// 				</form>
// 			</div>
// 		</div>
// 	);
// };
// export default Login;
