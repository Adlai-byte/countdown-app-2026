import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { type FaceDetection } from '@/hooks/useFaceDetection';
import { type ARFilter, getFilterById } from '@/data/arFilters';

interface ARFiltersProps {
  faces: FaceDetection[];
  selectedFilterId: string;
  videoWidth: number;
  videoHeight: number;
  isMirrored?: boolean;
}

export function ARFiltersOverlay({
  faces,
  selectedFilterId,
  videoWidth,
  videoHeight,
  isMirrored = true,
}: ARFiltersProps) {
  const filter = getFilterById(selectedFilterId);

  if (!filter || filter.id === 'none' || faces.length === 0) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        width: videoWidth,
        height: videoHeight,
      }}
    >
      {faces.map((face, index) => (
        <FaceFilter
          key={index}
          face={face}
          filter={filter}
          isMirrored={isMirrored}
        />
      ))}
    </div>
  );
}

interface FaceFilterProps {
  face: FaceDetection;
  filter: ARFilter;
  isMirrored: boolean;
}

function FaceFilter({ face, filter, isMirrored }: FaceFilterProps) {
  const style = useMemo(() => {
    if (!face.landmarks) return null;

    let anchorPoint: { x: number; y: number };

    switch (filter.anchor) {
      case 'forehead':
        anchorPoint = face.landmarks.forehead;
        break;
      case 'eyes':
        anchorPoint = {
          x: (face.landmarks.leftEye.x + face.landmarks.rightEye.x) / 2,
          y: (face.landmarks.leftEye.y + face.landmarks.rightEye.y) / 2,
        };
        break;
      case 'nose':
        anchorPoint = face.landmarks.nose;
        break;
      case 'mouth':
        anchorPoint = face.landmarks.mouth;
        break;
      default:
        anchorPoint = {
          x: face.x + face.width / 2,
          y: face.y + face.height / 2,
        };
    }

    const filterWidth = face.width * filter.scale;
    const filterHeight = filterWidth; // Square for emojis
    const offsetY = face.height * filter.offsetY;

    // Mirror the X position if video is mirrored
    let x = anchorPoint.x - filterWidth / 2;
    const y = anchorPoint.y + offsetY - filterHeight / 2;

    return {
      left: `${x}px`,
      top: `${y}px`,
      width: `${filterWidth}px`,
      height: `${filterHeight}px`,
      transform: isMirrored ? 'scaleX(-1)' : undefined,
    };
  }, [face, filter, isMirrored]);

  if (!style) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute flex items-center justify-center"
      style={style}
    >
      {filter.emoji ? (
        <span
          className="select-none"
          style={{ fontSize: `${parseFloat(style.width) * 0.8}px` }}
        >
          {filter.emoji}
        </span>
      ) : (
        <FilterGraphic filter={filter} size={parseFloat(style.width)} />
      )}
    </motion.div>
  );
}

interface FilterGraphicProps {
  filter: ARFilter;
  size: number;
}

function FilterGraphic({ filter, size }: FilterGraphicProps) {
  const color = filter.color || '#ffd700';

  switch (filter.type) {
    case 'hat':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="drop-shadow-lg"
        >
          {/* Party hat triangle */}
          <polygon
            points="50,5 85,95 15,95"
            fill={color}
            stroke="#fff"
            strokeWidth="2"
          />
          {/* Pom pom */}
          <circle cx="50" cy="8" r="8" fill="#ff6b6b" />
          {/* Stripes */}
          <line x1="35" y1="40" x2="30" y2="70" stroke="#fff" strokeWidth="3" opacity="0.5" />
          <line x1="50" y1="30" x2="50" y2="75" stroke="#fff" strokeWidth="3" opacity="0.5" />
          <line x1="65" y1="40" x2="70" y2="70" stroke="#fff" strokeWidth="3" opacity="0.5" />
        </svg>
      );

    case 'glasses':
      return (
        <svg
          width={size}
          height={size * 0.5}
          viewBox="0 0 200 60"
          className="drop-shadow-lg"
        >
          {/* Left lens - "2" */}
          <rect x="10" y="10" width="45" height="40" rx="5" fill={color} stroke="#fff" strokeWidth="2" />
          <text x="32" y="40" fontSize="24" fontWeight="bold" fill="#000" textAnchor="middle">2</text>

          {/* Bridge */}
          <rect x="55" y="25" width="30" height="5" fill={color} />
          <rect x="115" y="25" width="30" height="5" fill={color} />

          {/* Right lens - "0" */}
          <circle cx="100" cy="30" r="22" fill={color} stroke="#fff" strokeWidth="2" />
          <text x="100" y="38" fontSize="24" fontWeight="bold" fill="#000" textAnchor="middle">0</text>

          {/* Third lens - "2" */}
          <rect x="145" y="10" width="45" height="40" rx="5" fill={color} stroke="#fff" strokeWidth="2" />
          <text x="168" y="40" fontSize="24" fontWeight="bold" fill="#000" textAnchor="middle">2</text>

          {/* Arms hint */}
          <rect x="0" y="25" width="15" height="5" fill={color} opacity="0.7" />
          <rect x="185" y="25" width="15" height="5" fill={color} opacity="0.7" />
        </svg>
      );

    case 'crown':
      return (
        <svg
          width={size}
          height={size * 0.7}
          viewBox="0 0 100 70"
          className="drop-shadow-lg"
        >
          {/* Crown base */}
          <path
            d="M10,60 L10,30 L30,45 L50,15 L70,45 L90,30 L90,60 Z"
            fill={color}
            stroke="#fff"
            strokeWidth="2"
          />
          {/* Jewels */}
          <circle cx="50" cy="35" r="6" fill="#ec4899" stroke="#fff" strokeWidth="1" />
          <circle cx="30" cy="45" r="4" fill="#3b82f6" stroke="#fff" strokeWidth="1" />
          <circle cx="70" cy="45" r="4" fill="#3b82f6" stroke="#fff" strokeWidth="1" />
          {/* Base band */}
          <rect x="10" y="55" width="80" height="8" fill={color} stroke="#fff" strokeWidth="1" />
        </svg>
      );

    case 'headband':
      return (
        <svg
          width={size}
          height={size * 0.4}
          viewBox="0 0 100 40"
          className="drop-shadow-lg"
        >
          {/* Headband */}
          <ellipse cx="50" cy="30" rx="45" ry="12" fill={color} stroke="#fff" strokeWidth="2" />
          {/* Stars */}
          <text x="25" y="20" fontSize="16">&#9734;</text>
          <text x="45" y="15" fontSize="20">&#9733;</text>
          <text x="70" y="20" fontSize="16">&#9734;</text>
        </svg>
      );

    default:
      return null;
  }
}
