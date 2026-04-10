import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, GripVertical, Minimize2, Maximize2, RotateCw } from 'lucide-react';

export default function WidgetContainer({
  id,
  title,
  children,
  onClose,
  onMinimize,
  defaultPosition = { x: 20, y: 100 },
  isMinimized = false,
  reloadOnOpen = true
}) {
  const [position, setPosition] = useState(defaultPosition);
  const [isOpen, setIsOpen] = useState(!isMinimized);
  const [isReloading, setIsReloading] = useState(false);
  const widgetRef = useRef(null);
  const contentKey = useRef(0);

  // Mark widget as protected from RAZONET culling when open
  useEffect(() => {
    if (widgetRef.current) {
      if (isOpen) {
        widgetRef.current.dataset.protected = 'true';
        widgetRef.current.dataset.widgetOpen = 'true';
        widgetRef.current.dataset.widgetId = id;

        // Notify RAZONET that this widget is active
        if (window.irisPerformanceManager) {
          console.log(`[RAZONET] Widget "${title}" opened - marked as protected from culling`);
        }
      } else {
        delete widgetRef.current.dataset.protected;
        delete widgetRef.current.dataset.widgetOpen;

        if (window.irisPerformanceManager) {
          console.log(`[RAZONET] Widget "${title}" minimized - can be culled if needed`);
        }
      }
    }
  }, [isOpen, id, title]);

  // Reload widget content when opened
  const handleOpen = () => {
    if (!isOpen && reloadOnOpen) {
      setIsReloading(true);
      contentKey.current += 1;

      setTimeout(() => {
        setIsReloading(false);
        setIsOpen(true);
      }, 300);
    } else {
      setIsOpen(true);
    }
  };

  const handleMinimize = () => {
    setIsOpen(false);
    if (onMinimize) {
      onMinimize(id);
    }
  };

  const handleReload = () => {
    setIsReloading(true);
    contentKey.current += 1;

    setTimeout(() => {
      setIsReloading(false);
    }, 300);
  };

  return (
    <motion.div
      ref={widgetRef}
      drag={isOpen}
      dragMomentum={false}
      dragConstraints={{
        left: 0,
        right: typeof window !== 'undefined' ? window.innerWidth - 320 : 1000,
        top: 0,
        bottom: typeof window !== 'undefined' ? window.innerHeight - 200 : 600
      }}
      initial={defaultPosition}
      animate={{
        scale: isOpen ? 1 : 0.8,
        opacity: isOpen ? 1 : 0.7,
        height: isOpen ? 'auto' : '50px'
      }}
      className="fixed z-40 w-80"
      style={{
        x: position.x,
        y: position.y,
        pointerEvents: isOpen ? 'auto' : 'none'
      }}
    >
      <div className="backdrop-blur-xl bg-black/50 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header - Always visible */}
        <div
          className="flex items-center justify-between p-3 border-b border-white/10 cursor-move"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-white/50" />
            <h3 className="text-white font-medium text-sm">{title}</h3>
          </div>
          <div className="flex items-center gap-1">
            {isOpen && (
              <button
                onClick={handleReload}
                className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                title="Reload widget"
              >
                <RotateCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={isOpen ? handleMinimize : handleOpen}
              className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              title={isOpen ? 'Minimize' : 'Maximize'}
            >
              {isOpen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              title="Close widget"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content - Only when open */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isReloading ? 0.5 : 1 }}
            className="p-4"
          >
            {isReloading ? (
              <div className="flex items-center justify-center py-8">
                <RotateCw className="w-6 h-6 text-white/50 animate-spin" />
              </div>
            ) : (
              <div key={contentKey.current}>
                {children}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}