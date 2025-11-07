
import React, { useRef, useEffect } from 'react';

interface WaveformProps {
  analyserNode: AnalyserNode;
}

export const Waveform: React.FC<WaveformProps> = ({ analyserNode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    analyserNode.fftSize = 256;
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    let animationFrameId: number;

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      
      analyserNode.getByteTimeDomainData(dataArray);

      const { width, height } = canvas;
      canvasCtx.fillStyle = 'rgb(0, 0, 0)';
      canvasCtx.fillRect(0, 0, width, height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(255, 255, 255)';
      canvasCtx.beginPath();

      const sliceWidth = width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * height / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      canvasCtx.lineTo(width, height / 2);
      canvasCtx.stroke();
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyserNode]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};
