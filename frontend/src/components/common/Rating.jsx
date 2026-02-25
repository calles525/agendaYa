import { FiStar } from 'react-icons/fi';

const Rating = ({ value, onChange, readonly = false, size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          className={`${!readonly && 'cursor-pointer hover:scale-110 transition-transform'}`}
          disabled={readonly}
        >
          <FiStar
            className={`${sizes[size]} ${
              star <= value
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default Rating;