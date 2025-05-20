import ShinyText from '@/components/shiny-text';

interface ShinyButtonProps {
    text: string;
    disabled?: boolean;
    speed?: number;
    className?: string;
    onClick?: () => void;
}

const ShinyButton: React.FC<ShinyButtonProps> = ({ 
    text, 
    disabled = false, 
    speed = 5, 
    className = '', 
    onClick 
}) => {
    return (
        <button
            className={`px-6 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            disabled={disabled}
            onClick={onClick}
        >
            <ShinyText 
                text={text} 
                disabled={disabled} 
                speed={speed}
                className="text-lg font-semibold"
            />
        </button>
    );
};

export default ShinyButton;
