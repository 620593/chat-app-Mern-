import { motion } from "framer-motion";

const AnimatedBackground = () => {
	return (
		<div className="fixed inset-0 z-[-1] overflow-hidden bg-[#020617]">
			{/* Layer 1: Subtle Gradient Flow */}
			<motion.div
				className="absolute inset-0 opacity-40 mix-blend-screen"
				style={{
					background: "radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.15) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 80%)",
				}}
				animate={{
					scale: [1, 1.2, 1],
					opacity: [0.3, 0.5, 0.3],
				}}
				transition={{
					duration: 25,
					repeat: Infinity,
					ease: "linear",
				}}
			/>

			{/* Layer 2: Floating Glow Orbs */}
			{/* Orb 1 - Purple Top Left */}
			<motion.div
				className="absolute -top-32 -left-32 w-96 h-96 bg-neonPurple/20 rounded-full blur-[100px]"
				animate={{
					x: [0, 100, 0],
					y: [0, 50, 0],
					scale: [1, 1.2, 1],
				}}
				transition={{
					duration: 20,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			{/* Orb 2 - Blue Bottom Right */}
			<motion.div
				className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"
				animate={{
					x: [0, -100, 0],
					y: [0, -50, 0],
					scale: [1, 1.1, 1],
				}}
				transition={{
					duration: 25,
					repeat: Infinity,
					ease: "easeInOut",
					delay: 5,
				}}
			/>

			{/* Orb 3 - Soft Center */}
			<motion.div
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[150px]"
				animate={{
					scale: [1, 1.05, 1],
					opacity: [0.1, 0.2, 0.1],
				}}
				transition={{
					duration: 15,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			{/* Layer 3: Noise Texture Overlay */}
			<div 
				className="absolute inset-0 opacity-[0.03] pointer-events-none"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
					mixBlendMode: 'overlay',
				}}
			/>
		</div>
	);
};

export default AnimatedBackground;
