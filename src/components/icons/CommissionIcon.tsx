import React from 'react';

const CommissionIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 16v-1m0-4H9.528a1 1 0 00-.97.744l-.228.684a1 1 0 01-.97.744H4.5m15 0h-2.272a1 1 0 00-.97.744l-.228.684a1 1 0 01-.97.744H12m0 0a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
);

export default CommissionIcon;