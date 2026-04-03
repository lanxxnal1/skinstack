// SVG product silhouettes per category

interface Props {
  category: string;
  size?: number;
}

export default function CategoryImage({ category, size = 48 }: Props) {
  const fill = 'var(--text-muted)';
  const s = size;

  switch (category) {
    case 'Serum':
    case 'Face Oil':
      // Dropper bottle
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* bottle body */}
          <rect x="16" y="22" width="16" height="20" rx="4" fill={fill} opacity="0.7"/>
          {/* shoulder */}
          <path d="M16 26 Q16 22 20 20 L28 20 Q32 22 32 26" fill={fill} opacity="0.5"/>
          {/* neck */}
          <rect x="20" y="12" width="8" height="10" rx="2" fill={fill} opacity="0.6"/>
          {/* dropper tip */}
          <rect x="22" y="6" width="4" height="8" rx="2" fill={fill} opacity="0.8"/>
          {/* dropper bulb */}
          <ellipse cx="24" cy="6" rx="4" ry="3" fill={fill} opacity="0.5"/>
          {/* drop */}
          <path d="M24 36 Q22 39 24 41 Q26 39 24 36Z" fill="white" opacity="0.3"/>
        </svg>
      );

    case 'Moisturizer':
    case 'Eye Cream':
      // Cream jar
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* lid */}
          <rect x="10" y="16" width="28" height="8" rx="4" fill={fill} opacity="0.5"/>
          {/* jar body */}
          <rect x="12" y="24" width="24" height="16" rx="3" fill={fill} opacity="0.7"/>
          {/* jar rim */}
          <rect x="10" y="22" width="28" height="4" rx="2" fill={fill} opacity="0.6"/>
          {/* highlight */}
          <rect x="15" y="27" width="6" height="2" rx="1" fill="white" opacity="0.25"/>
        </svg>
      );

    case 'Cleanser':
      // Pump bottle
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* bottle body */}
          <rect x="14" y="20" width="20" height="22" rx="4" fill={fill} opacity="0.7"/>
          {/* neck */}
          <rect x="19" y="12" width="10" height="10" rx="2" fill={fill} opacity="0.6"/>
          {/* pump head */}
          <rect x="17" y="8" width="14" height="6" rx="3" fill={fill} opacity="0.5"/>
          {/* pump spout */}
          <rect x="29" y="6" width="5" height="3" rx="1.5" fill={fill} opacity="0.6"/>
          <rect x="32" y="9" width="3" height="5" rx="1.5" fill={fill} opacity="0.6"/>
          {/* highlight */}
          <rect x="17" y="23" width="5" height="2" rx="1" fill="white" opacity="0.25"/>
        </svg>
      );

    case 'Sunscreen':
      // Squeeze tube
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* tube body */}
          <rect x="14" y="16" width="20" height="24" rx="5" fill={fill} opacity="0.7"/>
          {/* crimped bottom */}
          <rect x="12" y="36" width="24" height="6" rx="2" fill={fill} opacity="0.4"/>
          {/* cap */}
          <rect x="18" y="8" width="12" height="10" rx="3" fill={fill} opacity="0.6"/>
          {/* tip */}
          <rect x="21" y="4" width="6" height="6" rx="3" fill={fill} opacity="0.8"/>
          {/* highlight */}
          <rect x="17" y="19" width="5" height="2" rx="1" fill="white" opacity="0.25"/>
        </svg>
      );

    case 'Toner':
      // Spray bottle
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* bottle body */}
          <rect x="16" y="20" width="18" height="22" rx="4" fill={fill} opacity="0.7"/>
          {/* shoulder cut */}
          <path d="M16 24 L16 20 Q16 18 18 17 L26 17 L26 20Z" fill={fill} opacity="0.5"/>
          {/* neck */}
          <rect x="18" y="10" width="8" height="10" rx="2" fill={fill} opacity="0.6"/>
          {/* spray head */}
          <rect x="16" y="8" width="16" height="6" rx="3" fill={fill} opacity="0.5"/>
          {/* nozzle */}
          <rect x="30" y="7" width="6" height="3" rx="1.5" fill={fill} opacity="0.7"/>
          {/* spray dots */}
          <circle cx="38" cy="7" r="1" fill={fill} opacity="0.4"/>
          <circle cx="40" cy="10" r="1" fill={fill} opacity="0.3"/>
          <circle cx="40" cy="4" r="1" fill={fill} opacity="0.3"/>
          {/* highlight */}
          <rect x="19" y="23" width="5" height="2" rx="1" fill="white" opacity="0.25"/>
        </svg>
      );

    case 'Mask':
      // Flat pouch / packet
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* packet body */}
          <rect x="8" y="14" width="32" height="24" rx="4" fill={fill} opacity="0.7"/>
          {/* inner panel */}
          <rect x="12" y="18" width="24" height="16" rx="2" fill={fill} opacity="0.3"/>
          {/* tear notch */}
          <path d="M36 14 L40 14 L40 18 Z" fill="white" opacity="0.15"/>
          {/* horizontal lines (label) */}
          <rect x="16" y="23" width="16" height="2" rx="1" fill="white" opacity="0.2"/>
          <rect x="18" y="27" width="12" height="1.5" rx="0.75" fill="white" opacity="0.15"/>
        </svg>
      );

    case 'Exfoliant':
      // Wide-mouth jar (scrub)
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* jar body - wider */}
          <rect x="8" y="22" width="32" height="18" rx="3" fill={fill} opacity="0.7"/>
          {/* lid - wide flat */}
          <rect x="8" y="14" width="32" height="10" rx="4" fill={fill} opacity="0.5"/>
          {/* texture dots */}
          <circle cx="18" cy="31" r="2" fill="white" opacity="0.15"/>
          <circle cx="24" cy="28" r="1.5" fill="white" opacity="0.12"/>
          <circle cx="30" cy="31" r="2" fill="white" opacity="0.15"/>
          <circle cx="22" cy="34" r="1.5" fill="white" opacity="0.12"/>
          <circle cx="28" cy="34" r="1" fill="white" opacity="0.1"/>
        </svg>
      );

    default:
      // Generic bottle
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="16" y="20" width="16" height="22" rx="4" fill={fill} opacity="0.7"/>
          <path d="M16 26 Q15 20 19 18 L29 18 Q33 20 32 26" fill={fill} opacity="0.5"/>
          <rect x="19" y="10" width="10" height="10" rx="2" fill={fill} opacity="0.6"/>
          <rect x="21" y="6" width="6" height="6" rx="3" fill={fill} opacity="0.8"/>
          <rect x="19" y="24" width="5" height="2" rx="1" fill="white" opacity="0.25"/>
        </svg>
      );
  }
}
