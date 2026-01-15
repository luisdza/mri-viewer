import type { ReactNode } from 'react';

interface SidebarSectionProps {
  title: string;
  badge?: number | string;
  children: ReactNode;
  className?: string;
}

/**
 * Reusable sidebar section component with title and optional badge
 * Used for Study Information, Report, and Series sections
 */
export function SidebarSection({
  title,
  badge,
  children,
  className = '',
}: SidebarSectionProps) {
  return (
    <div className={`bg-viewer-card rounded-lg border border-viewer-border ${className}`}>
      {/* Section header */}
      <div className="px-4 py-2.5 border-b border-viewer-border flex items-center gap-2">
        <h3 className="text-viewer-accent font-medium text-sm">{title}</h3>
        {badge !== undefined && (
          <span className="text-viewer-text-muted text-xs">({badge})</span>
        )}
      </div>
      
      {/* Section content */}
      <div className="p-3">
        {children}
      </div>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  className?: string;
}

/**
 * Simple key-value row for displaying study/report information
 */
export function InfoRow({ label, value, className = '' }: InfoRowProps) {
  return (
    <div className={`flex text-sm py-1.5 ${className}`}>
      <span className="text-viewer-text-muted w-28 flex-shrink-0">{label}</span>
      <span className="text-viewer-text">{value}</span>
    </div>
  );
}
