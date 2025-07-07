import React from 'react';

const TerminalIcon: React.FC<{ width?: number; height?: number; className?: string }> = ({
    width = 24,
    height = 24,
    className = '',
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect x="2" y="4" width="20" height="16" rx="2" ry="2" fill="#1E1E1E" stroke="#ccc" strokeWidth="1.5" />
            <text x="4" y="14" fontFamily="monospace" fontSize="10" fill="#00FF00">
                &gt;_
            </text>
        </svg>
    );
};

export default TerminalIcon;
