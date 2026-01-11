interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function UserAvatar({ name, avatarUrl, isOnline = false, size = 'md' }: UserAvatarProps) {
  
  // Dynamic sizing classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
  };

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-4 h-4 border-2', // Thicker border for large
  };

  return (
    <div className="relative inline-block">
      {/* 1. The Image or Initials */}
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={name} 
          className={`${sizeClasses[size]} rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm`} 
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700 shadow-sm`}>
          {name?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}

      {/* 2. The Green Dot (Only shows if isOnline is true) */}
      {isOnline && (
        <span 
          className={`absolute bottom-0 right-0 ${dotSizes[size]} bg-green-500 border-white dark:border-gray-800 rounded-full shadow-sm ring-1 ring-white dark:ring-gray-900`}
        ></span>
      )}
    </div>
  );
}