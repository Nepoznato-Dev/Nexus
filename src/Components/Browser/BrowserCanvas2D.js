import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Trash2, Download, Minus, Plus, Circle, Square, Type, Pencil, Eraser, Move } from 'lucide-react';

const TOOLS = ['pencil', 'line', 'rect', 'circle', 'text', 'eraser', 'fill'];
const COLORS = [
  '#ffffff', '#000000', '#ff4444', '#ff8800', '#ffdd00', '#44ff44',
  '#00ffff', '#4488ff', '#aa44ff', '#ff44aa', '#888888', '#ffaa88',
];

export default function BrowserCanvas2D() {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPos, setTextPos] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const ctxRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctxRef.current = ctx;
    saveSnapshot();
  }, []);

  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.toDataURL();
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(data);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) / zoom,
      y: (clientY - rect.top) / zoom,
    };
  };

  const startDrawing = (e) => {
    const pos = getPos(e);
    if (tool === 'text') {
      setTextPos(pos);
      setShowTextInput(true);
      return;
    }
    if (tool === 'fill') {
      floodFill(Math.round(pos.x), Math.round(pos.y));
      return;
    }
    setIsDrawing(true);
    setLastPos(pos);
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = ctxRef.current;
    const pos = getPos(e);

    ctx.strokeStyle = tool === 'eraser' ? '#1a1a2e' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    setLastPos(pos);
  };

  const endDrawing = (e) => {
    if (!isDrawing) return;
    const ctx = ctxRef.current;
    const pos = getPos(e);

    if (tool === 'line' && lastPos) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'rect' && lastPos) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(lastPos.x, lastPos.y, pos.x - lastPos.x, pos.y - lastPos.y);
    } else if (tool === 'circle' && lastPos) {
      const r = Math.sqrt(Math.pow(pos.x - lastPos.x, 2) + Math.pow(pos.y - lastPos.y, 2));
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.arc(lastPos.x, lastPos.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    setIsDrawing(false);
    saveSnapshot();
  };

  const floodFill = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const targetIdx = (y * canvas.width + x) * 4;
    const targetR = data[targetIdx], targetG = data[targetIdx + 1], targetB = data[targetIdx + 2];

    const fillColor = hexToRgb(color);
    if (!fillColor) return;
    if (targetR === fillColor.r && targetG === fillColor.g && targetB === fillColor.b) return;

    const stack = [[x, y]];
    const visited = new Set();

    while (stack.length) {
      const [cx, cy] = stack.pop();
      if (cx < 0 || cy < 0 || cx >= canvas.width || cy >= canvas.height) continue;
      const idx = (cy * canvas.width + cx) * 4;
      const key = `${cx},${cy}`;
      if (visited.has(key)) continue;
      if (data[idx] !== targetR || data[idx + 1] !== targetG || data[idx + 2] !== targetB) continue;
      visited.add(key);
      data[idx] = fillColor.r;
      data[idx + 1] = fillColor.g;
      data[idx + 2] = fillColor.b;
      data[idx + 3] = 255;
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }

    ctx.putImageData(imgData, 0, 0);
    saveSnapshot();
  };

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const placeText = () => {
    if (!textPos || !textInput) { setShowTextInput(false); return; }
    const ctx = ctxRef.current;
    ctx.fillStyle = color;
    ctx.font = `${lineWidth * 6 + 12}px sans-serif`;
    ctx.fillText(textInput, textPos.x, textPos.y);
    setTextInput('');
    setShowTextInput(false);
    saveSnapshot();
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    const img = new Image();
    img.src = history[newIndex];
    img.onload = () => ctxRef.current.drawImage(img, 0, 0);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    const img = new Image();
    img.src = history[newIndex];
    img.onload = () => ctxRef.current.drawImage(img, 0, 0);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveSnapshot();
  };

  const download = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'canvas-drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const toolIcons = {
    pencil: <Pencil className="w-4 h-4" />,
    line: <Minus className="w-4 h-4" />,
    rect: <Square className="w-4 h-4" />,
    circle: <Circle className="w-4 h-4" />,
    text: <Type className="w-4 h-4" />,
    eraser: <Eraser className="w-4 h-4" />,
    fill: <span className="text-xs font-bold">Fill</span>,
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a12] text-white">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-[#1a1a2e] border-b border-white/10 flex-wrap">
        {/* Tools */}
        <div className="flex gap-1">
          {TOOLS.map(t => (
            <button
              key={t}
              onClick={() => setTool(t)}
              title={t}
              className={`p-2 rounded-lg transition-colors ${tool === t ? 'bg-blue-500 text-white' : 'hover:bg-white/10 text-white/70'}`}
            >
              {toolIcons[t]}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-white/20" />

        {/* Colors */}
        <div className="flex gap-1 flex-wrap max-w-[200px]">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-white scale-110' : ''}`}
              style={{ background: c, border: '1px solid rgba(255,255,255,0.2)' }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer"
            title="Custom color"
          />
        </div>

        <div className="w-px h-6 bg-white/20" />

        {/* Brush size */}
        <div className="flex items-center gap-1">
          <button onClick={() => setLineWidth(Math.max(1, lineWidth - 1))} className="p-1 hover:bg-white/10 rounded">
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-xs w-6 text-center">{lineWidth}</span>
          <button onClick={() => setLineWidth(Math.min(30, lineWidth + 1))} className="p-1 hover:bg-white/10 rounded">
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="w-px h-6 bg-white/20" />

        {/* Undo/Redo/Clear/Download */}
        <button onClick={undo} disabled={historyIndex <= 0} className="px-2 py-1 text-xs rounded hover:bg-white/10 disabled:opacity-40">↩ Undo</button>
        <button onClick={redo} disabled={historyIndex >= history.length - 1} className="px-2 py-1 text-xs rounded hover:bg-white/10 disabled:opacity-40">↪ Redo</button>
        <button onClick={clear} className="px-2 py-1 text-xs rounded hover:bg-red-500/20 text-red-400">
          <Trash2 className="w-3 h-3 inline mr-1" />Clear
        </button>
        <button onClick={download} className="px-2 py-1 text-xs rounded hover:bg-green-500/20 text-green-400">
          <Download className="w-3 h-3 inline mr-1" />Save
        </button>

        <div className="w-px h-6 bg-white/20" />

        {/* Zoom */}
        <div className="flex items-center gap-1 text-xs">
          <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} className="p-1 hover:bg-white/10 rounded">-</button>
          <span className="w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="p-1 hover:bg-white/10 rounded">+</button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-auto relative bg-[#0a0a12]" style={{ cursor: tool === 'eraser' ? 'cell' : tool === 'text' ? 'text' : 'crosshair' }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block', minHeight: '500px' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
          />
        </div>
        {showTextInput && (
          <div
            className="absolute bg-black/80 rounded p-2 flex gap-2 z-10"
            style={{ left: textPos?.x * zoom, top: textPos?.y * zoom }}
          >
            <input
              autoFocus
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && placeText()}
              className="bg-transparent text-white border border-white/30 rounded px-2 py-1 text-sm outline-none"
              placeholder="Type text..."
            />
            <button onClick={placeText} className="px-2 py-1 bg-blue-500 rounded text-xs">Place</button>
            <button onClick={() => setShowTextInput(false)} className="px-2 py-1 bg-white/10 rounded text-xs">✕</button>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="px-3 py-1 text-xs text-white/30 bg-[#0f0f1a] border-t border-white/10">
        Tool: {tool} | Color: {color} | Size: {lineWidth}px | Zoom: {Math.round(zoom * 100)}%
        {' | '}Tip: Draw freely, use shapes, fill, text — Ctrl+Z to undo
      </div>
    </div>
  );
}
