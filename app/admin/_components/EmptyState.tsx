import type { ReactNode } from 'react';

/** EmptyState — used when a list (leads, prototypes) is empty. */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="text-center py-16 px-6 rounded-xl"
      style={{ border: '1px dashed var(--adm-border-strong)' }}
    >
      {icon && (
        <div
          className="mx-auto grid place-items-center rounded-full mb-4"
          style={{
            width: 56,
            height: 56,
            background: 'var(--adm-accent-soft)',
            color: 'var(--adm-accent)',
          }}
        >
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold" style={{ color: 'var(--adm-text-primary)' }}>
        {title}
      </p>
      {description && (
        <p className="mt-1 text-sm" style={{ color: 'var(--adm-text-secondary)' }}>
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}