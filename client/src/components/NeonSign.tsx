export function NeonSign() {
  return (
    <div className="fixed top-6 left-6 z-50 pointer-events-none">
      <div className="relative font-inter text-2xl md:text-xl sm:text-lg font-bold tracking-wider">
        <span 
          className="inline-block text-[#FF1744] animate-pulse"
          style={{
            textShadow: `
              0 0 5px #FF1744,
              0 0 10px #FF1744,
              0 0 15px #FF1744,
              0 0 20px #FF1744,
              0 0 35px #FF1744,
              0 0 40px #FF1744
            `,
            animation: 'neon-flicker 3s ease-in-out infinite'
          }}
        >
          TheKeyn
        </span>
      </div>
    </div>
  );
}