import React, { useState, useEffect, useRef } from 'react';

export default function DesktopIcons({ apps, onAppClick }) {
    const [iconPositions, setIconPositions] = useState({});
    const [draggingIcon, setDraggingIcon] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [gridOffset, setGridOffset] = useState({ x: 10, y: 10 });
    const [gridDimensions, setGridDimensions] = useState({ cols: 1, rows: 1 });
    const containerRef = useRef(null);
    const dragStartPosRef = useRef(null);

    // Grid snapping configuration
    const ICON_SIZE = 100; // Icon container width
    const GRID_SPACING = 10; // Spacing between icons
    const GRID_SIZE = ICON_SIZE + GRID_SPACING; // 110px grid cells

    // Calculate centered grid offset based on container size
    useEffect(() => {
        const calculateOffset = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                const containerHeight = containerRef.current.clientHeight;

                // Calculate how many full grid cells fit
                const cellsX = Math.floor(containerWidth / GRID_SIZE);
                const cellsY = Math.floor(containerHeight / GRID_SIZE);

                // Calculate remaining space and center it
                const remainderX = containerWidth - (cellsX * GRID_SIZE);
                const remainderY = containerHeight - (cellsY * GRID_SIZE);

                setGridOffset({
                    x: Math.floor(remainderX / 2),
                    y: Math.floor(remainderY / 2)
                });
                setGridDimensions({
                    cols: Math.max(1, cellsX),
                    rows: Math.max(1, cellsY)
                });
            }
        };

        calculateOffset();
        window.addEventListener('resize', calculateOffset);
        return () => window.removeEventListener('resize', calculateOffset);
    }, []);

    // Snap position to grid
    const snapToGrid = (x, y) => {
        return {
            x: Math.round((x - gridOffset.x) / GRID_SIZE) * GRID_SIZE + gridOffset.x,
            y: Math.round((y - gridOffset.y) / GRID_SIZE) * GRID_SIZE + gridOffset.y,
        };
    };

    const getGridIdFromPos = (x, y) => {
        const col = Math.round((x - gridOffset.x) / GRID_SIZE);
        const row = Math.round((y - gridOffset.y) / GRID_SIZE);

        if (col < 0 || row < 0 || col >= gridDimensions.cols || row >= gridDimensions.rows) {
            return null;
        }

        return (row * gridDimensions.cols) + col + 1;
    };

    const getPosFromGridId = (gridId) => {
        const zeroIndex = gridId - 1;
        const row = Math.floor(zeroIndex / gridDimensions.cols);
        const col = zeroIndex % gridDimensions.cols;

        return {
            x: gridOffset.x + (col * GRID_SIZE),
            y: gridOffset.y + (row * GRID_SIZE)
        };
    };

    // Load saved positions from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('desktop_icon_positions');
        if (saved) {
            try {
                const loaded = JSON.parse(saved);
                // Snap all loaded positions to grid
                const snappedPositions = {};
                Object.keys(loaded).forEach(key => {
                    snappedPositions[key] = snapToGrid(loaded[key].x, loaded[key].y);
                });
                setIconPositions(snappedPositions);
            } catch (e) {
                // Use default positions
                initializeDefaultPositions();
            }
        } else {
            initializeDefaultPositions();
        }
    }, [apps, gridOffset, gridDimensions]);

    const initializeDefaultPositions = () => {
        const positions = {};
        apps.forEach((app, idx) => {
            // Place icons in a grid layout with offset from edge
            const col = idx % gridDimensions.cols;
            const row = Math.floor(idx / gridDimensions.cols);
            positions[app.id] = {
                x: gridOffset.x + (col * GRID_SIZE),
                y: gridOffset.y + (row * GRID_SIZE),
            };
        });
        setIconPositions(positions);
    };

    const savePositions = (newPositions) => {
        localStorage.setItem('desktop_icon_positions', JSON.stringify(newPositions));
    };

    const handleMouseDown = (e, appId) => {
        if (e.button !== 0) return; // Only left click

        const element = e.currentTarget;
        const rect = element.getBoundingClientRect();
        const pos = iconPositions[appId] || { x: 0, y: 0 };

        setDraggingIcon(appId);
        dragStartPosRef.current = pos;
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const handleMouseMove = (e) => {
        if (!draggingIcon) return;

        const container = e.currentTarget;
        const containerRect = container.getBoundingClientRect();

        let newX = e.clientX - containerRect.left - dragOffset.x;
        let newY = e.clientY - containerRect.top - dragOffset.y;

        // Keep within bounds
        newX = Math.max(0, Math.min(newX, containerRect.width - 100));
        newY = Math.max(0, Math.min(newY, containerRect.height - 140));

        setIconPositions(prev => ({
            ...prev,
            [draggingIcon]: { x: newX, y: newY },
        }));
    };

    const handleMouseUp = () => {
        if (draggingIcon) {
            // Snap to grid on release
            const currentPos = iconPositions[draggingIcon];
            if (currentPos) {
                const snappedPos = snapToGrid(currentPos.x, currentPos.y);
                const targetId = getGridIdFromPos(snappedPos.x, snappedPos.y);

                const occupiedIds = new Set(
                    Object.keys(iconPositions)
                        .filter(appId => appId !== draggingIcon)
                        .map(appId => {
                            const pos = iconPositions[appId];
                            return getGridIdFromPos(pos.x, pos.y);
                        })
                        .filter(id => id !== null)
                );

                let finalPos = snappedPos;

                if (targetId && occupiedIds.has(targetId)) {
                    const maxId = gridDimensions.cols * gridDimensions.rows;
                    const targetRow = Math.floor((targetId - 1) / gridDimensions.cols);

                    const orderedCandidates = [
                        targetId - 1,
                        targetId + 1,
                        targetId - 2,
                        targetId + 2,
                        targetId + gridDimensions.cols,
                        targetId + (gridDimensions.cols * 2),
                        targetId - gridDimensions.cols
                    ];

                    let foundCandidate = false;
                    for (let candidateId of orderedCandidates) {
                        if (candidateId < 1 || candidateId > maxId) continue;

                        const candidateRow = Math.floor((candidateId - 1) / gridDimensions.cols);
                        const isHorizontal = Math.abs(candidateId - targetId) <= 2;
                        if (isHorizontal && candidateRow !== targetRow) continue;

                        if (!occupiedIds.has(candidateId)) {
                            finalPos = getPosFromGridId(candidateId);
                            foundCandidate = true;
                            break;
                        }
                    }

                    if (!foundCandidate && dragStartPosRef.current) {
                        finalPos = dragStartPosRef.current;
                    }
                }

                const newPositions = {
                    ...iconPositions,
                    [draggingIcon]: finalPos,
                };
                setIconPositions(newPositions);
                savePositions(newPositions);
            }
            setDraggingIcon(null);
            dragStartPosRef.current = null;
        }
    };

    const handleDoubleClick = (app) => {
        onAppClick(app);
    };

    // Filter apps to show on desktop (exclude certain apps like Settings)
    const desktopApps = apps.filter(app => app.showOnDesktop !== false);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
                position: 'absolute',
                inset: 0,
                userSelect: 'none',
                backgroundImage: draggingIcon
                    ? `
                      linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                      linear-gradient(0deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
                      `
                    : 'none',
                backgroundSize: draggingIcon ? `${GRID_SIZE}px ${GRID_SIZE}px` : 'auto',
                backgroundPosition: draggingIcon ? `${gridOffset.x}px ${gridOffset.y}px` : '0 0',
                transition: 'background-image 0.2s',
            }}
        >
            {desktopApps.map(app => {
                const pos = iconPositions[app.id] || { x: 0, y: 0 };
                return (
                    <div
                        key={app.id}
                        onMouseDown={(e) => handleMouseDown(e, app.id)}
                        onDoubleClick={() => handleDoubleClick(app)}
                        style={{
                            position: 'absolute',
                            left: `${pos.x}px`,
                            top: `${pos.y}px`,
                            width: '100px',
                            cursor: draggingIcon === app.id ? 'grabbing' : 'grab',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px',
                            borderRadius: '8px',
                            backgroundColor: draggingIcon === app.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                            transition: draggingIcon === app.id ? 'none' : 'background-color 0.2s',
                            transform: 'translate(5px, 1.5px)',
                        }}
                    >
                        {/* Icon */}
                        <div
                            style={{
                                pointerEvents: 'none',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '64px',
                                height: '64px',
                            }}
                        >
                            {app.icon}
                        </div>

                        {/* Label */}
                        <span
                            style={{
                                color: '#fff',
                                fontSize: '11px',
                                textAlign: 'center',
                                wordWrap: 'break-word',
                                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                pointerEvents: 'none',
                                maxWidth: '100%',
                                lineHeight: '1.2',
                            }}
                        >
                            {app.name}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
