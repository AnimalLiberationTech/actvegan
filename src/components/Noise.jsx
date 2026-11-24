import { useEffect, useRef } from "react";
import "./Noise.css";

function Noise({
  patternSize = 250,
  patternScaleX = 1,
  patternScaleY = 1,
  patternRefreshInterval = 2,
  patternAlpha = 15,
}) {
  const grainRef = useRef(null);

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return undefined;

    let frame = 0;
    let animationId;
    const canvasSize = 1024;

    const resize = () => {
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    };

    const drawGrain = () => {
      const imageData = context.createImageData(canvasSize, canvasSize);
      const data = imageData.data;
      const alpha = Math.max(0, Math.min(255, patternAlpha));

      for (let index = 0; index < data.length; index += 4) {
        const value = Math.random() * 255;
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = alpha;
      }

      context.putImageData(imageData, 0, 0);
    };

    const loop = () => {
      if (frame % Math.max(1, patternRefreshInterval) === 0) {
        drawGrain();
      }
      frame += 1;
      animationId = window.requestAnimationFrame(loop);
    };

    resize();
    loop();

    return () => {
      window.cancelAnimationFrame(animationId);
    };
  }, [
    patternAlpha,
    patternRefreshInterval,
    patternScaleX,
    patternScaleY,
    patternSize,
  ]);

  return (
    <canvas
      className="noise-overlay"
      ref={grainRef}
      style={{
        imageRendering: "pixelated",
        backgroundSize: `${patternSize}px ${patternSize}px`,
        transform: `scale(${patternScaleX}, ${patternScaleY})`,
      }}
      aria-hidden="true"
    />
  );
}

export default Noise;
