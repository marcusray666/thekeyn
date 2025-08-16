import React from 'react';

interface NoBorderElementProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const NoBorderElement: React.FC<NoBorderElementProps> = ({ children, className, onClick }) => {
  // Use a plain div with the most aggressive anti-border styling possible
  const handleClick = () => {
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={`${className} no-border-absolutely-none`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        border: '0px none transparent',
        outline: '0px none transparent',
        boxShadow: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        appearance: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        background: 'transparent',
        borderWidth: '0',
        borderStyle: 'none',
        borderColor: 'transparent'
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

export default NoBorderElement;