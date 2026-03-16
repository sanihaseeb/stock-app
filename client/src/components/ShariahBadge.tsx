import type { ComplianceStatus } from '../utils/shariahData';
import { STATUS_LABELS, STATUS_COLORS } from '../utils/shariahData';

interface ShariahBadgeProps {
  status: ComplianceStatus;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

// Simple crescent moon SVG
function CrescentIcon({ size = 12, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        fill={color}
      />
    </svg>
  );
}

export default function ShariahBadge({ status, size = 'sm', showLabel = false }: ShariahBadgeProps) {
  const c = STATUS_COLORS[status];
  const iconSize = size === 'md' ? 13 : 10;
  const fontSize = size === 'md' ? 11 : 9;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 20,
      padding: size === 'md' ? '3px 9px' : '2px 6px',
    }}>
      <CrescentIcon size={iconSize} color={c.color} />
      {showLabel && (
        <span style={{
          fontSize,
          fontWeight: 600,
          color: c.color,
          letterSpacing: '0.03em',
          whiteSpace: 'nowrap',
        }}>
          {STATUS_LABELS[status]}
        </span>
      )}
    </div>
  );
}
