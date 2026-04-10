import React, { useEffect, useState } from 'react';

export default function MediaPlayerApp() {
    const [mediaUrl, setMediaUrl] = useState('');
    const [mediaName, setMediaName] = useState('');
    const [mediaType, setMediaType] = useState('');

    useEffect(() => {
        return () => {
            if (mediaUrl) {
                URL.revokeObjectURL(mediaUrl);
            }
        };
    }, [mediaUrl]);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (mediaUrl) {
            URL.revokeObjectURL(mediaUrl);
        }
        const url = URL.createObjectURL(file);
        setMediaUrl(url);
        setMediaName(file.name);
        setMediaType(file.type.startsWith('video') ? 'video' : 'audio');
    };

    return (
        <div style={{
            height: '100%',
            backgroundColor: '#0f172a',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            gap: '16px'
        }}>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>Media Player</div>

            <input
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileSelect}
                style={{
                    padding: '10px',
                    backgroundColor: '#0b1220',
                    border: '1px solid #1f2a44',
                    borderRadius: '6px',
                    color: '#fff'
                }}
            />

            <div style={{
                flex: 1,
                border: '1px solid #1f2a44',
                borderRadius: '10px',
                padding: '12px',
                backgroundColor: '#0b1220',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                {mediaUrl ? (
                    <>
                        <div style={{ fontSize: '13px', color: '#cbd5f5' }}>{mediaName}</div>
                        {mediaType === 'video' ? (
                            <video src={mediaUrl} controls style={{ width: '100%', borderRadius: '8px' }} />
                        ) : (
                            <audio src={mediaUrl} controls style={{ width: '100%' }} />
                        )}
                    </>
                ) : (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                        fontSize: '13px'
                    }}>
                        Select an audio or video file to play.
                    </div>
                )}
            </div>
        </div>
    );
}
