import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label?: string;
  active?: boolean;
  size?: 'sm' | 'md';
}

/**
 * Reusable toolbar button component with icon support
 * Used in the top toolbar for viewer tools
 */
export function ToolbarButton({
  icon,
  label,
  active = false,
  size = 'md',
  className = '',
  ...props
}: ToolbarButtonProps) {
  const sizeClasses = size === 'sm' ? 'p-1.5' : 'p-2';
  
  return (
    <button
      className={`
        ${sizeClasses}
        rounded-md
        transition-colors
        flex items-center justify-center gap-1.5
        ${active
          ? 'bg-viewer-accent text-white'
          : 'text-viewer-text-muted hover:text-viewer-text hover:bg-viewer-card'
        }
        ${className}
      `}
      title={label}
      {...props}
    >
      {icon}
      {label && size === 'md' && (
        <span className="text-sm hidden xl:inline">{label}</span>
      )}
    </button>
  );
}
