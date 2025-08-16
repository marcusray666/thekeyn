import React from 'react';

interface BorderlessButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

const BorderlessButton: React.FC<BorderlessButtonProps> = ({ onClick, children, className = '' }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const style: React.CSSProperties = {
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
  };

  return (
    <span
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`cursor-pointer ${className}`}
      role="button"
      tabIndex={0}
      style={style}
    >
      {children}
    </span>
  );
};

export default BorderlessButton;