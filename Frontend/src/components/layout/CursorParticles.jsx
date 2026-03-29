import { useEffect, useRef } from "react";

const CursorParticles = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationFrameId;
        
        // Full screen canvas
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        let particlesArray = [];
        const mouse = { x: null, y: null };

        // Mouse move tracking
        const handleMouseMove = (event) => {
            mouse.x = event.x;
            mouse.y = event.y;
            // Spawn new particle on movement
            if (Math.random() > 0.3) {
                particlesArray.push(new Particle());
            }
        };

        window.addEventListener("mousemove", handleMouseMove);

        class Particle {
            constructor() {
                this.x = mouse.x;
                this.y = mouse.y;
                this.size = Math.random() * 3 + 1; // Size 1 to 4
                this.speedX = Math.random() * 2 - 1; // -1 to 1
                this.speedY = Math.random() * 2 - 1.5; // Drift upwards
                this.color = `hsla(${260 + Math.random() * 60}, 100%, 70%, `; // Purple to Blue hues
                this.opacity = 0.8;
                this.shrink = 0.95;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.opacity -= 0.02; // Fade out
                this.size *= this.shrink; // Scale down
            }

            draw() {
                ctx.fillStyle = this.color + this.opacity + ")";
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Add soft glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color + "1)";
            }
        }

        const handleParticles = () => {
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();

                if (particlesArray[i].opacity <= 0.01 || particlesArray[i].size <= 0.1) {
                    particlesArray.splice(i, 1);
                    i--; // Decrement to avoid skipping the next element
                }
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            handleParticles();
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50 mix-blend-screen opacity-70" />;
};

export default CursorParticles;
