const GenderCheckbox = ({ onCheckboxChange, selectedGender }) => {
	return (
		<div className='flex gap-4 mt-2'>
			<div className='form-control'>
				<label className={`label gap-2 cursor-pointer transition-colors duration-200 rounded-lg px-3 py-1 ${selectedGender === "male" ? "bg-neonPurple/20 border border-neonPurple/50 shadow-[0_0_10px_rgba(124,58,237,0.3)]" : "hover:bg-glassBorder"}`}>
					<span className={`label-text ${selectedGender === "male" ? "text-white" : "text-gray-400"}`}>Male</span>
					<input
						type='checkbox'
						className='checkbox checkbox-primary border-gray-600 checked:border-neonPurple [--chkbg:theme(colors.neonPurple)] [--chkfg:white] transition-all'
						checked={selectedGender === "male"}
						onChange={() => onCheckboxChange("male")}
					/>
				</label>
			</div>
			<div className='form-control'>
				<label className={`label gap-2 cursor-pointer transition-colors duration-200 rounded-lg px-3 py-1 ${selectedGender === "female" ? "bg-neonPurple/20 border border-neonPurple/50 shadow-[0_0_10px_rgba(124,58,237,0.3)]" : "hover:bg-glassBorder"}`}>
					<span className={`label-text ${selectedGender === "female" ? "text-white" : "text-gray-400"}`}>Female</span>
					<input
						type='checkbox'
						className='checkbox checkbox-primary border-gray-600 checked:border-neonPurple [--chkbg:theme(colors.neonPurple)] [--chkfg:white] transition-all'
						checked={selectedGender === "female"}
						onChange={() => onCheckboxChange("female")}
					/>
				</label>
			</div>
		</div>
	);
};
export default GenderCheckbox;

// STARTER CODE FOR THIS FILE
// const GenderCheckbox = () => {
// 	return (
// 		<div className='flex'>
// 			<div className='form-control'>
// 				<label className={`label gap-2 cursor-pointer`}>
// 					<span className='label-text'>Male</span>
// 					<input type='checkbox' className='checkbox border-slate-900' />
// 				</label>
// 			</div>
// 			<div className='form-control'>
// 				<label className={`label gap-2 cursor-pointer`}>
// 					<span className='label-text'>Female</span>
// 					<input type='checkbox' className='checkbox border-slate-900' />
// 				</label>
// 			</div>
// 		</div>
// 	);
// };
// export default GenderCheckbox;
