/**
 * Generates shareable countdown widget images
 */

interface CountdownData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface WidgetOptions {
  theme?: 'dark' | 'light' | 'gradient';
  showSeconds?: boolean;
  title?: string;
}

/**
 * Generate a countdown widget image as a data URL
 */
export async function generateCountdownWidget(
  countdown: CountdownData,
  options: WidgetOptions = {}
): Promise<string> {
  const {
    theme = 'gradient',
    showSeconds = true,
    title = 'New Year Countdown'
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 500;
  const ctx = canvas.getContext('2d')!;

  // Background
  if (theme === 'gradient') {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f0f23');
    ctx.fillStyle = gradient;
  } else if (theme === 'dark') {
    ctx.fillStyle = '#1a1a2e';
  } else {
    ctx.fillStyle = '#ffffff';
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorative elements - stars
  ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 3 + 1;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Title
  ctx.font = 'bold 36px system-ui';
  ctx.textAlign = 'center';
  const titleGradient = ctx.createLinearGradient(200, 60, 600, 60);
  titleGradient.addColorStop(0, '#ffd700');
  titleGradient.addColorStop(0.5, '#ec4899');
  titleGradient.addColorStop(1, '#9333ea');
  ctx.fillStyle = titleGradient;
  ctx.fillText(title, canvas.width / 2, 70);

  // Year badge
  ctx.font = 'bold 48px system-ui';
  ctx.fillStyle = '#ffd700';
  ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
  ctx.shadowBlur = 20;
  ctx.fillText('2026', canvas.width / 2, 130);
  ctx.shadowBlur = 0;

  // Countdown boxes
  const boxWidth = showSeconds ? 150 : 180;
  const boxHeight = 120;
  const boxGap = 20;
  const units = showSeconds
    ? [
        { value: countdown.days, label: 'DAYS' },
        { value: countdown.hours, label: 'HOURS' },
        { value: countdown.minutes, label: 'MINS' },
        { value: countdown.seconds, label: 'SECS' },
      ]
    : [
        { value: countdown.days, label: 'DAYS' },
        { value: countdown.hours, label: 'HOURS' },
        { value: countdown.minutes, label: 'MINUTES' },
      ];

  const totalWidth = units.length * boxWidth + (units.length - 1) * boxGap;
  const startX = (canvas.width - totalWidth) / 2;
  const boxY = 180;

  units.forEach((unit, index) => {
    const x = startX + index * (boxWidth + boxGap);

    // Box background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    roundRect(ctx, x, boxY, boxWidth, boxHeight, 16);
    ctx.fill();

    // Box border
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.lineWidth = 2;
    roundRect(ctx, x, boxY, boxWidth, boxHeight, 16);
    ctx.stroke();

    // Value
    ctx.font = 'bold 56px system-ui';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(
      unit.value.toString().padStart(2, '0'),
      x + boxWidth / 2,
      boxY + 65
    );

    // Label
    ctx.font = 'bold 14px system-ui';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText(unit.label, x + boxWidth / 2, boxY + 100);
  });

  // Decorative line
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, 340);
  ctx.lineTo(canvas.width - 100, 340);
  ctx.stroke();

  // Bottom message
  ctx.font = '20px system-ui';
  ctx.fillStyle = '#9ca3af';
  ctx.textAlign = 'center';
  ctx.fillText('Celebrate the New Year together!', canvas.width / 2, 390);

  // Branding
  ctx.font = 'bold 16px system-ui';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillText('NYE Countdown App', canvas.width / 2, 460);

  return canvas.toDataURL('image/png');
}

/**
 * Share the widget using Web Share API with fallbacks
 */
export async function shareWidget(dataUrl: string): Promise<{ success: boolean; method: string }> {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], 'nye-countdown-2026.png', { type: 'image/png' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: 'New Year Countdown 2026',
        text: 'Check out my countdown to 2026!',
        files: [file],
      });
      return { success: true, method: 'share' };
    }

    // Fallback: try clipboard
    if (navigator.clipboard && 'write' in navigator.clipboard) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      return { success: true, method: 'clipboard' };
    }

    // Fallback: download
    downloadWidget(dataUrl);
    return { success: true, method: 'download' };
  } catch {
    // Final fallback: download
    downloadWidget(dataUrl);
    return { success: true, method: 'download' };
  }
}

/**
 * Download the widget as an image file
 */
export function downloadWidget(dataUrl: string, filename?: string): void {
  const link = document.createElement('a');
  link.download = filename || `nye-countdown-${Date.now()}.png`;
  link.href = dataUrl;
  link.click();
}

/**
 * Helper function to draw rounded rectangles
 */
function roundRect(
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
}
