import { Link } from "react-router-dom";
import GenderCheckbox from "./GenderCheckbox";
import { useState } from "react";
import useSignup from "../../hooks/useSignup";
import { motion } from "framer-motion";

const SignUp = () => {
	const [inputs, setInputs] = useState({
		fullName: "",
		username: "",
		password: "",
		confirmPassword: "",
		gender: "",
		profilePic: "",
	});

	const { loading, signup } = useSignup();

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onloadend = () => {
			setInputs({ ...inputs, profilePic: reader.result });
		};
		reader.readAsDataURL(file);
	};

	const handleCheckboxChange = (gender) => {
		setInputs({ ...inputs, gender });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		await signup(inputs);
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
					Sign Up <span className='text-neonPurple bg-clip-text text-transparent bg-gradient-to-r from-neonPurple to-neonBlue drop-shadow-[0_0_10px_rgba(124,58,237,0.5)]'> ChatApp</span>
				</h1>

				<form onSubmit={handleSubmit} className="flex flex-col gap-3">
					<div className="flex justify-center mb-2">
						<label className="relative cursor-pointer group">
							<div className="w-20 h-20 rounded-full border-2 border-neonPurple flex items-center justify-center overflow-hidden bg-black/20 group-hover:bg-black/40 transition-colors shadow-[0_0_15px_rgba(124,58,237,0.3)]">
								{inputs.profilePic ? (
									<img src={inputs.profilePic} alt="avatar" className="w-full h-full object-cover" />
								) : (
									<span className="text-gray-400 text-xs">Upload</span>
								)}
							</div>
							<input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
						</label>
					</div>

					<div>
						<label className='label p-2'>
							<span className='text-sm font-medium text-gray-300'>Full Name</span>
						</label>
						<input
							type='text'
							placeholder='John Doe'
							className='w-full input h-11 glass-input rounded-xl px-4'
							value={inputs.fullName}
							onChange={(e) => setInputs({ ...inputs, fullName: e.target.value })}
						/>
					</div>

					<div>
						<label className='label p-2'>
							<span className='text-sm font-medium text-gray-300'>Username</span>
						</label>
						<input
							type='text'
							placeholder='johndoe'
							className='w-full input h-11 glass-input rounded-xl px-4'
							value={inputs.username}
							onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
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
							value={inputs.password}
							onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
						/>
					</div>

					<div>
						<label className='label'>
							<span className='text-sm font-medium text-gray-300'>Confirm Password</span>
						</label>
						<input
							type='password'
							placeholder='Confirm Password'
							className='w-full input h-11 glass-input rounded-xl px-4'
							value={inputs.confirmPassword}
							onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}
						/>
					</div>

					<GenderCheckbox onCheckboxChange={handleCheckboxChange} selectedGender={inputs.gender} />

					<Link
						to={"/login"}
						className='text-sm text-gray-400 hover:text-neonBlue transition-colors duration-200 mt-2 inline-block text-right w-full'
					>
						Already have an account? Login here
					</Link>

					<div className="mt-4">
						<button 
							className='btn btn-block h-11 bg-neonPurple hover:bg-neonPurple/80 text-white border-none rounded-xl shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:shadow-[0_0_25px_rgba(124,58,237,0.6)] transition-all duration-300 text-base font-medium' 
							disabled={loading}
						>
							{loading ? <span className='loading loading-spinner text-white'></span> : "Create Account"}
						</button>
					</div>
				</form>
			</div>
		</motion.div>
	);
};
export default SignUp;

// STARTER CODE FOR THE SIGNUP COMPONENT
// import GenderCheckbox from "./GenderCheckbox";

// const SignUp = () => {
// 	return (
// 		<div className='flex flex-col items-center justify-center min-w-96 mx-auto'>
// 			<div className='w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0'>
// 				<h1 className='text-3xl font-semibold text-center text-gray-300'>
// 					Sign Up <span className='text-blue-500'> ChatApp</span>
// 				</h1>

// 				<form>
// 					<div>
// 						<label className='label p-2'>
// 							<span className='text-base label-text'>Full Name</span>
// 						</label>
// 						<input type='text' placeholder='John Doe' className='w-full input input-bordered  h-10' />
// 					</div>

// 					<div>
// 						<label className='label p-2 '>
// 							<span className='text-base label-text'>Username</span>
// 						</label>
// 						<input type='text' placeholder='johndoe' className='w-full input input-bordered h-10' />
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

// 					<div>
// 						<label className='label'>
// 							<span className='text-base label-text'>Confirm Password</span>
// 						</label>
// 						<input
// 							type='password'
// 							placeholder='Confirm Password'
// 							className='w-full input input-bordered h-10'
// 						/>
// 					</div>

// 					<GenderCheckbox />

// 					<a className='text-sm hover:underline hover:text-blue-600 mt-2 inline-block' href='#'>
// 						Already have an account?
// 					</a>

// 					<div>
// 						<button className='btn btn-block btn-sm mt-2 border border-slate-700'>Sign Up</button>
// 					</div>
// 				</form>
// 			</div>
// 		</div>
// 	);
// };
// export default SignUp;
