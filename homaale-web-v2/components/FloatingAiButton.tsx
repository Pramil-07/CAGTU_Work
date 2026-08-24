import React from 'react';
import { useRouter } from 'next/router';
import { useBrand } from '@/hooks/useBrand';

const FloatingAiButton: React.FC = () => {
    const router = useRouter();
    const brand = useBrand();

    const handleClick = () => {
        if (router.pathname === '/ai') {
            window.location.href = '/ai';
        } else {
            router.push('/ai');
        }
    };

    const brandColor = brand === "cagtu" ? "#1aa9ff" : "#f9971f";

    return (
        <button
            onClick={handleClick}
            className="floating-ai-button"
            aria-label="AI Assistant"
        >
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <span>AI</span>

            <style jsx>{`
                .floating-ai-button {
                    position: fixed;
                    bottom: 120px;
                    right: 20px;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background-color: ${brandColor};
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 2px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    transition: all 0.3s ease;
                    z-index: 999;
                    font-weight: 600;
                    font-size: 12px;
                    animation: float 3s ease-in-out infinite;
                }

                .floating-ai-button:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
                }

                .floating-ai-button:active {
                    transform: scale(0.95);
                }

                .floating-ai-button svg {
                    width: 20px;
                    height: 20px;
                }

                @keyframes float {
                    0% { transform: translateY(0) translateX(0); }
                    25% { transform: translateY(-5px) translateX(2px); }
                    50% { transform: translateY(0) translateX(0); }
                    75% { transform: translateY(5px) translateX(-2px); }
                    100% { transform: translateY(0) translateX(0); }
                }

                @media (max-width: 768px) {
                    .floating-ai-button {
                        bottom: 80px;
                        left: 15px;
                        width: 56px;
                        height: 56px;
                    }
                }
            `}</style>
        </button>
    );
};

export default FloatingAiButton;
