export function NeonSign() {
  return (
    <div 
      className="fixed top-6 left-6 pointer-events-none"
      style={{
        position: 'fixed',
        zIndex: 1,
        top: '1.5rem',
        left: '1.5rem'
      }}
    >
      <span 
        className="font-inter text-2xl md:text-xl sm:text-lg font-bold tracking-wider text-[#FF1744]"
        style={{
          textShadow: `
            0 0 5px #FF1744,
            0 0 10px #FF1744,
            0 0 15px #FF1744,
            0 0 20px #FF1744,
            0 0 35px #FF1744,
            0 0 40px #FF1744
          `,
          animation: 'neon-flicker 3s ease-in-out infinite',
          background: 'transparent',
          border: 'none',
          boxShadow: 'none'
        }}
      >
        TheKeyn
      </span>
    </div>
  );
}