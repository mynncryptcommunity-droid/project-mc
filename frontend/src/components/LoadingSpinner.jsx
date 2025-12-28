import React from 'react';

/**
 * LoadingSpinner Component
 * 
 * Menampilkan loading indicator dengan pesan untuk user
 * Digunakan saat:
 * - Checking registration status (2-3 detik)
 * - Validating referral ID
 * - Waiting for transaction confirmation
 * 
 * Props:
 * - message: String - Pesan loading yang ditampilkan
 * - type: String - 'default' | 'overlay' (full screen)
 * - size: String - 'small' | 'medium' | 'large'
 */
export default function LoadingSpinner({ 
  message = 'Loading...', 
  type = 'default',
  size = 'medium'
}) {
  // Ukuran spinner
  const sizeClass = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  }[size] || 'w-12 h-12';

  // Inline spinner dengan animation
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Spinner Animation */}
      <div className={`${sizeClass} relative`}>
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-gray-300 rounded-full"></div>
        
        {/* Animated ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-yellow-500 border-r-yellow-500 rounded-full animate-spin"></div>
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-2 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
      </div>

      {/* Loading message */}
      {message && (
        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            {message}
          </p>
          {/* Animated dots */}
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            <span className="inline-block animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
          </p>
        </div>
      )}
    </div>
  );

  // Jika type overlay, tampilkan full screen
  if (type === 'overlay') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          {spinnerContent}
        </div>
      </div>
    );
  }

  // Jika type default, tampilkan inline
  return spinnerContent;
}

/**
 * USAGE EXAMPLES:
 * 
 * 1. Inline Loading (di dalam form/button):
 *    {isLoading && <LoadingSpinner message="Memeriksa status..." size="small" />}
 * 
 * 2. Full Screen Overlay:
 *    {isLoading && <LoadingSpinner message="Memproses..." type="overlay" size="large" />}
 * 
 * 3. Custom size:
 *    <LoadingSpinner message="Tunggu sebentar..." size="large" />
 * 
 * 4. Tanpa message:
 *    <LoadingSpinner size="medium" />
 */
