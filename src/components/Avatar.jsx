import { User } from 'lucide-react';

export default function Avatar({ src, alt, size = 'md', className = '' }) {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16'
  };

  const sizeClass = sizes[size] || sizes.md;
  const iconSize = iconSizes[size] || iconSizes.md;

  if (src) {
    return (
      <img
        src={src}
        alt={alt || 'Avatar'}
        className={`${sizeClass} rounded-full object-cover border-2 border-gray-200 ${className}`}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white ${className}`}>
      <User className={iconSize} />
    </div>
  );
}
