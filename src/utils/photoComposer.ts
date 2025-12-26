/**
 * Composes multiple photos into a vertical strip (4 photos stacked)
 */
export async function composePhotoStrip(shots: string[]): Promise<string> {
  if (shots.length !== 4) {
    throw new Error('Photo strip requires exactly 4 shots');
  }

  const images = await Promise.all(shots.map(loadImage));

  // Use consistent dimensions for the strip
  const photoWidth = 300;
  const photoHeight = 225;
  const padding = 12;
  const borderRadius = 8;

  const canvas = document.createElement('canvas');
  canvas.width = photoWidth + padding * 2;
  canvas.height = (photoHeight * 4) + (padding * 5);

  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw each photo
  for (let index = 0; index < images.length; index++) {
    const img = images[index];
    const y = padding + (photoHeight + padding) * index;

    // Draw rounded rectangle background
    drawRoundedRect(ctx, padding, y, photoWidth, photoHeight, borderRadius, '#ffffff15');

    // Clip and draw image
    ctx.save();
    createRoundedClip(ctx, padding, y, photoWidth, photoHeight, borderRadius);

    // Center-crop the image to fit
    const scale = Math.max(photoWidth / img.width, photoHeight / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const offsetX = (photoWidth - scaledWidth) / 2;
    const offsetY = (photoHeight - scaledHeight) / 2;

    ctx.drawImage(img, padding + offsetX, y + offsetY, scaledWidth, scaledHeight);
    ctx.restore();

    // Add subtle border
    ctx.strokeStyle = '#ffffff30';
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, padding, y, photoWidth, photoHeight, borderRadius);
  }

  // Add decorative elements
  ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffd700';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 4;
  ctx.fillText('NYE 2026', canvas.width / 2, canvas.height - 12);

  return canvas.toDataURL('image/png');
}

/**
 * Composes multiple photos into a 2x2 collage
 */
export async function composeCollage(shots: string[]): Promise<string> {
  if (shots.length !== 4) {
    throw new Error('Collage requires exactly 4 shots');
  }

  const images = await Promise.all(shots.map(loadImage));

  const photoSize = 300;
  const padding = 12;
  const borderRadius = 12;

  const canvas = document.createElement('canvas');
  canvas.width = (photoSize * 2) + (padding * 3);
  canvas.height = (photoSize * 2) + (padding * 3) + 40; // Extra space for text

  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(0.5, '#16213e');
  gradient.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid positions
  const positions = [
    { x: padding, y: padding },
    { x: padding * 2 + photoSize, y: padding },
    { x: padding, y: padding * 2 + photoSize },
    { x: padding * 2 + photoSize, y: padding * 2 + photoSize },
  ];

  // Draw each photo
  for (let index = 0; index < images.length; index++) {
    const img = images[index];
    const { x, y } = positions[index];

    // Draw rounded rectangle background
    drawRoundedRect(ctx, x, y, photoSize, photoSize, borderRadius, '#ffffff10');

    // Clip and draw image
    ctx.save();
    createRoundedClip(ctx, x, y, photoSize, photoSize, borderRadius);

    // Center-crop the image
    const scale = Math.max(photoSize / img.width, photoSize / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const offsetX = (photoSize - scaledWidth) / 2;
    const offsetY = (photoSize - scaledHeight) / 2;

    ctx.drawImage(img, x + offsetX, y + offsetY, scaledWidth, scaledHeight);
    ctx.restore();

    // Add border
    ctx.strokeStyle = '#ffffff25';
    ctx.lineWidth = 3;
    strokeRoundedRect(ctx, x, y, photoSize, photoSize, borderRadius);
  }

  // Add decorative text at the bottom
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffd700';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 8;
  ctx.fillText('Happy New Year 2026!', canvas.width / 2, canvas.height - 12);

  return canvas.toDataURL('image/png');
}

/**
 * Helper function to draw a rounded rectangle
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillColor: string
) {
  ctx.fillStyle = fillColor;
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
  ctx.fill();
}

/**
 * Helper function to stroke a rounded rectangle
 */
function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
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

/**
 * Helper function to create a rounded rectangle clip
 */
function createRoundedClip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
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
  ctx.clip();
}

/**
 * Helper to load an image from a data URL
 */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}
