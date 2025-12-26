/**
 * Resolution Card Templates and Composer
 */

export interface CardTemplate {
  id: string;
  name: string;
  gradientStart: string;
  gradientEnd: string;
  textColor: string;
  accentColor: string;
}

export const CARD_TEMPLATES: CardTemplate[] = [
  {
    id: 'purple-gold',
    name: 'Royal',
    gradientStart: '#1a1a2e',
    gradientEnd: '#16213e',
    textColor: '#ffffff',
    accentColor: '#ffd700',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    gradientStart: '#f97316',
    gradientEnd: '#ec4899',
    textColor: '#ffffff',
    accentColor: '#fef3c7',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    gradientStart: '#06b6d4',
    gradientEnd: '#3b82f6',
    textColor: '#ffffff',
    accentColor: '#bfdbfe',
  },
  {
    id: 'forest',
    name: 'Forest',
    gradientStart: '#22c55e',
    gradientEnd: '#14b8a6',
    textColor: '#ffffff',
    accentColor: '#d9f99d',
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    gradientStart: '#9333ea',
    gradientEnd: '#ec4899',
    textColor: '#ffffff',
    accentColor: '#fcd34d',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    gradientStart: '#0f172a',
    gradientEnd: '#1e293b',
    textColor: '#e2e8f0',
    accentColor: '#818cf8',
  },
];

/**
 * Generate a resolution card image
 */
export async function generateResolutionCard(
  text: string,
  templateId: string
): Promise<string> {
  const template = CARD_TEMPLATES.find((t) => t.id === templateId) || CARD_TEMPLATES[0];

  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, template.gradientStart);
  gradient.addColorStop(1, template.gradientEnd);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorative elements - stars/sparkles
  drawSparkles(ctx, canvas.width, canvas.height, template.accentColor);

  // Year badge at top
  ctx.font = 'bold 72px system-ui';
  ctx.textAlign = 'center';
  ctx.fillStyle = template.accentColor;
  ctx.shadowColor = template.accentColor;
  ctx.shadowBlur = 30;
  ctx.fillText('2026', canvas.width / 2, 100);
  ctx.shadowBlur = 0;

  // "My Resolution" header
  ctx.font = 'bold 28px system-ui';
  ctx.fillStyle = template.textColor;
  ctx.globalAlpha = 0.7;
  ctx.fillText('My New Year Resolution', canvas.width / 2, 160);
  ctx.globalAlpha = 1;

  // Decorative line
  ctx.strokeStyle = template.accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 190);
  ctx.lineTo(canvas.width - 100, 190);
  ctx.stroke();

  // Resolution text (wrapped)
  ctx.font = '32px system-ui';
  ctx.fillStyle = template.textColor;
  wrapText(ctx, `"${text}"`, canvas.width / 2, 280, canvas.width - 80, 44);

  // Decorative line at bottom
  ctx.strokeStyle = template.accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 680);
  ctx.lineTo(canvas.width - 100, 680);
  ctx.stroke();

  // Footer
  ctx.font = '18px system-ui';
  ctx.fillStyle = template.textColor;
  ctx.globalAlpha = 0.5;
  ctx.fillText('Made with NYE Countdown App', canvas.width / 2, 750);
  ctx.globalAlpha = 1;

  // Border with rounded corners
  ctx.strokeStyle = template.accentColor;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.3;
  roundRectStroke(ctx, 20, 20, canvas.width - 40, canvas.height - 40, 24);
  ctx.globalAlpha = 1;

  return canvas.toDataURL('image/png');
}

/**
 * Draw decorative sparkles
 */
function drawSparkles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.3;

  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 3 + 1;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Larger sparkles
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    drawStar(ctx, x, y, 5, 8, 4);
  }

  ctx.globalAlpha = 1;
}

/**
 * Draw a star shape
 */
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
): void {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(
      cx + Math.cos(rot) * outerRadius,
      cy + Math.sin(rot) * outerRadius
    );
    rot += step;
    ctx.lineTo(
      cx + Math.cos(rot) * innerRadius,
      cy + Math.sin(rot) * innerRadius
    );
    rot += step;
  }

  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

/**
 * Wrap text to fit within a width
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): void {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line.trim(), x, currentY);
}

/**
 * Draw rounded rectangle stroke
 */
function roundRectStroke(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.stroke();
}
