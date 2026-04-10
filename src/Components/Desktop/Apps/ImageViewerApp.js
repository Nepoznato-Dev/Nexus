import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

export default function ImageViewerApp() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);

    const sampleImages = [
        {
            id: 1,
            name: 'Nature Landscape',
            url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Cdefs%3E%3ClinearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%2387CEEB;stop-opacity:1" /%3E%3Cstop offset="100%" style="stop-color:%23E0F6FF;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="300" fill="url(%23sky)"%3E%3C/rect%3E%3Cellipse cx="100" cy="80" rx="40" ry="30" fill="white" opacity="0.8"%3E%3C/ellipse%3E%3Cpolygon points="150,200 200,100 250,200" fill="%238B7355"/%3E%3Cpolygon points="160,210 200,120 240,210" fill="%2328a745"/%3E%3Crect x="50" y="210" width="300" height="90" fill="%2390EE90"/%3E%3C/svg%3E',
            size: '850 KB'
        },
        {
            id: 2,
            name: 'Abstract Colors',
            url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23000000"/%3E%3Ccircle cx="100" cy="100" r="50" fill="%234d96ff"/%3E%3Crect x="150" y="100" width="100" height="100" fill="%23ff6b6b"/%3E%3Cpolygon points="250,50 300,100 250,150 200,100" fill="%2328a745"/%3E%3Cellipse cx="150" cy="220" rx="80" ry="40" fill="%23FFD700"/%3E%3C/svg%3E',
            size: '620 KB'
        },
        {
            id: 3,
            name: 'Geometric Shapes',
            url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3Crect x="20" y="20" width="80" height="80" fill="%234d96ff" rx="10"/%3E%3Ccircle cx="200" cy="60" r="40" fill="%23ff6b6b"/%3E%3Cpolygon points="280,20 340,60 320,130 260,130 240,60" fill="%2328a745"/%3E%3Crect x="40" y="130" width="320" height="150" fill="none" stroke="%23333333" stroke-width="2"/%3E%3C/svg%3E',
            size: '450 KB'
        },
        {
            id: 4,
            name: 'Ocean Waves',
            url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Cdefs%3E%3ClinearGradient id="ocean" x1="0%" y1="0%" x2="0%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%2387CEEB;stop-opacity:1" /%3E%3Cstop offset="50%" style="stop-color:%231E90FF;stop-opacity:1" /%3E%3Cstop offset="100%" style="stop-color:%23000080;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="300" fill="url(%23ocean)"/%3E%3Cpath d="M0,150 Q100,140 200,150 T400,150" stroke="white" stroke-width="2" fill="none" opacity="0.6"/%3E%3Cpath d="M0,180 Q100,170 200,180 T400,180" stroke="white" stroke-width="2" fill="none" opacity="0.4"/%3E%3C/svg%3E',
            size: '720 KB'
        },
        {
            id: 5,
            name: 'Sunset Sky',
            url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Cdefs%3E%3ClinearGradient id="sunset" x1="0%" y1="0%" x2="0%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%23FF6B35;stop-opacity:1" /%3E%3Cstop offset="40%" style="stop-color:%23FFD700;stop-opacity:1" /%3E%3Cstop offset="100%" style="stop-color:%23FF8C00;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="300" fill="url(%23sunset)"/%3E%3Ccircle cx="200" cy="200" r="50" fill="white" opacity="0.8"/%3E%3Cellipse cx="200" cy="300" rx="100" ry="50" fill="%23333333" opacity="0.3"/%3E%3C/svg%3E',
            size: '580 KB'
        }
    ];

    const currentImage = selectedImage ? sampleImages.find(img => img.id === selectedImage) : null;
    const currentIndex = selectedImage ? sampleImages.findIndex(img => img.id === selectedImage) : -1;

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setSelectedImage(sampleImages[currentIndex - 1].id);
            setZoom(100);
            setRotation(0);
        }
    };

    const handleNext = () => {
        if (currentIndex < sampleImages.length - 1) {
            setSelectedImage(sampleImages[currentIndex + 1].id);
            setZoom(100);
            setRotation(0);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100%', backgroundColor: 'transparent', color: '#fff' }}>
            {/* Sidebar - Image List */}
            <div style={{
                width: '120px',
                borderRight: '1px solid rgba(255,255,255,0.1)',
                overflow: 'auto',
                backgroundColor: 'rgba(0,0,0,0.2)',
                padding: '10px'
            }}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px', color: '#aaa' }}>
                    LIBRARY
                </div>
                {sampleImages.map(img => (
                    <div
                        key={img.id}
                        onClick={() => {
                            setSelectedImage(img.id);
                            setZoom(100);
                            setRotation(0);
                        }}
                        style={{
                            padding: '8px',
                            marginBottom: '8px',
                            borderRadius: '6px',
                            backgroundColor: selectedImage === img.id ? 'rgba(77,150,255,0.3)' : 'rgba(0,0,0,0.3)',
                            border: selectedImage === img.id ? '2px solid #4d96ff' : '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'center'
                        }}
                    >
                        <div style={{
                            width: '100%',
                            height: '60px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            marginBottom: '6px',
                            overflow: 'hidden'
                        }}>
                            <img
                                src={img.url}
                                alt={img.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>
                        <div style={{ fontSize: '10px', color: '#aaa', wordBreak: 'break-word', lineHeight: '1.2' }}>
                            {img.name}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Viewer */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {currentImage ? (
                    <>
                        {/* Top Controls */}
                        <div style={{
                            padding: '12px 20px',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0,0,0,0.2)'
                        }}>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '600' }}>{currentImage.name}</div>
                                <div style={{ fontSize: '11px', color: '#aaa' }}>{currentImage.size}</div>
                            </div>
                            <div style={{ fontSize: '12px', color: '#aaa' }}>
                                {currentIndex + 1} / {sampleImages.length}
                            </div>
                        </div>

                        {/* Image Display Area */}
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'auto',
                            backgroundColor: '#000000'
                        }}>
                            <img
                                src={currentImage.url}
                                alt={currentImage.name}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    width: `${zoom}%`,
                                    transform: `rotate(${rotation}deg)`,
                                    transition: 'transform 0.2s'
                                }}
                            />
                        </div>

                        {/* Bottom Controls */}
                        <div style={{
                            padding: '12px 20px',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            flexWrap: 'wrap',
                            gap: '10px'
                        }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={handlePrevious}
                                    disabled={currentIndex === 0}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        backgroundColor: currentIndex === 0 ? '#555555' : '#2a2a2a',
                                        color: '#fff',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '12px'
                                    }}
                                >
                                    <ChevronLeft size={16} /> Prev
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={currentIndex === sampleImages.length - 1}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        backgroundColor: currentIndex === sampleImages.length - 1 ? '#555555' : '#2a2a2a',
                                        color: '#fff',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        cursor: currentIndex === sampleImages.length - 1 ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '12px'
                                    }}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                    onClick={() => setZoom(Math.max(50, zoom - 10))}
                                    style={{
                                        padding: '8px',
                                        borderRadius: '6px',
                                        backgroundColor: '#2a2a2a',
                                        color: '#fff',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <ZoomOut size={16} />
                                </button>
                                <div style={{ fontSize: '12px', color: '#aaa', minWidth: '35px', textAlign: 'center' }}>
                                    {zoom}%
                                </div>
                                <button
                                    onClick={() => setZoom(Math.min(300, zoom + 10))}
                                    style={{
                                        padding: '8px',
                                        borderRadius: '6px',
                                        backgroundColor: '#2a2a2a',
                                        color: '#fff',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <ZoomIn size={16} />
                                </button>
                                <button
                                    onClick={() => setRotation((rotation + 90) % 360)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        backgroundColor: '#2a2a2a',
                                        color: '#fff',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '12px'
                                    }}
                                >
                                    <RotateCcw size={14} /> Rotate
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#666'
                    }}>
                        Select an image from the list
                    </div>
                )}
            </div>
        </div>
    );
}
