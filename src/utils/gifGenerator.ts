/**
 * Creates a filmstrip layout from multiple frames
 * Since creating real animated GIFs requires heavy libraries,
 * we create a visually appealing filmstrip/contact sheet instead
 */

interface GifOptions {
  delay?: number;
  quality?: number;
}

/**
 * Creates a filmstrip image from multiple frames
 * Shows all frames in a cinematic film strip style
 */
export async function createAnimatedGif(
  frames: string[],
  _options: GifOptions = {}
): Promise<string> {
  if (frames.length < 2) {
    throw new Error('Filmstrip requires at least 2 frames');
  }

  const images = await Promise.all(frames.map(loadImage));

  // Film strip dimensions
  const frameWidth = 200;
  const frameHeight = 150;
  const sprocketSize = 20;
  const padding = 8;
  const framesPerRow = 4;

  const rows = Math.ceil(images.length / framesPerRow);
  const totalWidth = (frameWidth * framesPerRow) + (padding * (framesPerRow + 1));
  const totalHeight = (frameHeight + sprocketSize * 2 + padding) * rows + padding + 50;

  const canvas = document.createElement('canvas');
  canvas.width = totalWidth;
  canvas.height = totalHeight;

  const ctx = canvas.getContext('2d')!;

  // Background - dark film look
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw each frame with film strip decoration
  for (let index = 0; index < images.length; index++) {
    const row = Math.floor(index / framesPerRow);
    const col = index % framesPerRow;

    const x = padding + (frameWidth + padding) * col;
    const y = padding + (frameHeight + sprocketSize * 2 + padding) * row;

    // Draw film strip background (black strip with sprocket holes)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x - 4, y, frameWidth + 8, frameHeight + sprocketSize * 2);

    // Draw sprocket holes (top)
    for (let i = 0; i < 4; i++) {
      const holeX = x + (frameWidth / 4) * i + frameWidth / 8 - 6;
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.arc(holeX, y + sprocketSize / 2, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw sprocket holes (bottom)
    for (let i = 0; i < 4; i++) {
      const holeX = x + (frameWidth / 4) * i + frameWidth / 8 - 6;
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.arc(holeX, y + frameHeight + sprocketSize * 1.5, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw frame background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y + sprocketSize, frameWidth, frameHeight);

    // Draw the image
    const img = images[index];
    const scale = Math.max(frameWidth / img.width, frameHeight / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const offsetX = (frameWidth - scaledWidth) / 2;
    const offsetY = (frameHeight - scaledHeight) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y + sprocketSize, frameWidth, frameHeight);
    ctx.clip();
    ctx.drawImage(img, x + offsetX, y + sprocketSize + offsetY, scaledWidth, scaledHeight);
    ctx.restore();

    // Frame number
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'center';
    ctx.fillText(`${index + 1}`, x + frameWidth / 2, y + sprocketSize + frameHeight - 8);
  }

  // Add title at the bottom
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffd700';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 4;
  ctx.fillText('NYE 2026 Moments', canvas.width / 2, canvas.height - 18);

  return canvas.toDataURL('image/png');
}

/**
 * Creates a simple looping animation preview using requestAnimationFrame
 * Returns a function to stop the animation
 */
export function createAnimationPreview(
  frames: string[],
  canvas: HTMLCanvasElement,
  fps: number = 8
): () => void {
  let frameIndex = 0;
  let lastFrameTime = 0;
  let animationId: number;
  const frameInterval = 1000 / fps;

  const ctx = canvas.getContext('2d')!;
  const images: HTMLImageElement[] = [];
  let imagesLoaded = 0;

  // Load all images
  frames.forEach((frame, index) => {
    const img = new Image();
    img.onload = () => {
      images[index] = img;
      imagesLoaded++;
      if (imagesLoaded === 1) {
        startAnimation();
      }
    };
    img.src = frame;
  });

  function startAnimation() {
    function animate(timestamp: number) {
      if (timestamp - lastFrameTime >= frameInterval) {
        lastFrameTime = timestamp;

        const img = images[frameIndex];
        if (img) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const scale = Math.min(
            canvas.width / img.width,
            canvas.height / img.height
          );
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (canvas.width - scaledWidth) / 2;
          const y = (canvas.height - scaledHeight) / 2;

          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        }

        frameIndex = (frameIndex + 1) % frames.length;
      }

      animationId = requestAnimationFrame(animate);
    }

    animationId = requestAnimationFrame(animate);
  }

  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}
