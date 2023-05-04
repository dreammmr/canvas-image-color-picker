import React, { useRef, useState, useEffect } from 'react';
import { rgbToHex } from '../../utils';
import * as Styled from './ColorPicker.styled';
import ColorizeRoundedIcon from '@mui/icons-material/ColorizeRounded';
import Snackbar from '@mui/material/Snackbar';

export const ColorPicker: React.FC<{}> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState<string>('transparent');
  const [colorPickerActive, setColorPickerActive] = useState<boolean>(false);
  const [colorCopied, setColorCopied] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const img = new Image();

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const aspectRatio = img.width / img.height;
      let newWidth = canvas.width;
      let newHeight = newWidth / aspectRatio;

      if (newHeight > canvas.height) {
        newHeight = canvas.height;
        newWidth = newHeight * aspectRatio;
      }

      ctx.drawImage(img, (canvas.width - newWidth) / 2, (canvas.height - newHeight) / 2, newWidth, newHeight);
    };

    img.src = URL.createObjectURL(file);
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!colorPickerActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const imageData = ctx.getImageData(x, y, 1, 1).data;
    const color = `rgba(${imageData[0]}, ${imageData[1]}, ${imageData[2]}, ${imageData[3] / 255})`;

    setSelectedColor(color);

    setColorPickerActive(false);

    // Copy the selected hex code into the keyboard
    navigator.clipboard.writeText(rgbToHex(imageData[0], imageData[1], imageData[2]));

    // Show the snackbar about the copying
    setColorCopied(true);
  };

  const activateColorPicker = () => {
    setColorPickerActive(!colorPickerActive);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (colorPickerActive) {
      canvas.style.cursor = 'none';
    } else {
      canvas.style.cursor = 'default';
    }
  }, [colorPickerActive]);

  const drawGrid = (previewCtx: CanvasRenderingContext2D, previewSize: number, gridSize: number) => {
    const halfSize = previewSize / 2;
    previewCtx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    previewCtx.lineWidth = 0.5;

    // Draw horizontal lines
    for (let i = halfSize; i < previewSize; i += gridSize) {
      previewCtx.beginPath();
      previewCtx.moveTo(0, i);
      previewCtx.lineTo(previewSize, i);
      previewCtx.stroke();

      previewCtx.beginPath();
      previewCtx.moveTo(0, halfSize - (i - halfSize));
      previewCtx.lineTo(previewSize, halfSize - (i - halfSize));
      previewCtx.stroke();
    }

    // Draw vertical lines
    for (let i = halfSize; i < previewSize; i += gridSize) {
      previewCtx.beginPath();
      previewCtx.moveTo(i, 0);
      previewCtx.lineTo(i, previewSize);
      previewCtx.stroke();

      previewCtx.beginPath();
      previewCtx.moveTo(halfSize - (i - halfSize), 0);
      previewCtx.lineTo(halfSize - (i - halfSize), previewSize);
      previewCtx.stroke();
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!colorPickerActive) return;

    const canvas = canvasRef.current;
    const preview = previewRef.current;
    if (!canvas || !preview) return;
    const ctx = canvas.getContext('2d');
    const previewCtx = preview.getContext('2d');

    if (!ctx || !previewCtx) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const zoom = 5;
    const previewSize = 100;
    const gridSize = 10;

    preview.width = previewSize;
    preview.height = previewSize;

    preview.style.left = `${event.clientX - previewSize / 2}px`;
    preview.style.top = `${event.clientY - previewSize / 2}px`;

    previewCtx.clearRect(0, 0, preview.width, preview.height);
    previewCtx.drawImage(
      canvas,
      x - previewSize / (2 * zoom),
      y - previewSize / (2 * zoom),
      previewSize / zoom,
      previewSize / zoom,
      0,
      0,
      preview.width,
      preview.height,
    );

    // Update the selected color from the cursor
    const imageData = ctx.getImageData(x, y, 1, 1).data;
    const color = `rgba(${imageData[0]}, ${imageData[1]}, ${imageData[2]}, ${imageData[3] / 255})`;
    setSelectedColor(color);

    // Draw the grid on the preview canvas
    drawGrid(previewCtx, previewSize, gridSize);

    // Highlight the selected pixel in the preview grid
    const previewHalfSize = previewSize / 2;
    const highlightSize = gridSize + 2;
    previewCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    previewCtx.lineWidth = 2;
    previewCtx.strokeRect(previewHalfSize - highlightSize / 2, previewHalfSize - highlightSize / 2, highlightSize, highlightSize);

    // Add hex code of the selected pixel color into preview canvas
    previewCtx.font = "10px Arial";
    previewCtx.fillStyle = '#8B8989';
    previewCtx.roundRect(previewHalfSize - 25, previewHalfSize + 15, 50, 15, 2);
    previewCtx.fill();
    previewCtx.fillStyle = 'white';
    previewCtx.fillText(rgbToHex(imageData[0], imageData[1], imageData[2]), previewHalfSize - 20, previewHalfSize + 26);
  };

  return (
    <Styled.ColorPickerContainer>
      <Styled.ColorPickerHeader>
        <input
          type="file"
          onChange={handleFileInput}
        />
        <button
          onClick={activateColorPicker}
          disabled={colorPickerActive}
        >
          <ColorizeRoundedIcon />
        </button>
        <p>Choose the image, then click the dropper icon.</p>
      </Styled.ColorPickerHeader>
      <Styled.ColorPickerCanvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        style={{ display: 'block' }}
      />
      <Styled.ColorPickerPreviewCanvas
        ref={previewRef}
        style={{
          display: colorPickerActive ? 'block' : 'none',
          borderColor: selectedColor,
        }}
      />
      <Snackbar
        open={colorCopied}
        autoHideDuration={3000}
        onClose={() => setColorCopied(false)}
        message="Color copied into your keyboard."
      />
    </Styled.ColorPickerContainer>
  );
};
