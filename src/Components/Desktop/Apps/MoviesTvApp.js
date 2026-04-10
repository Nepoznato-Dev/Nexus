import React from 'react';

const library = [
    { id: 'mv-1', title: 'Spotlight', genre: 'Drama', year: '2021' },
    { id: 'mv-2', title: 'Skyline', genre: 'Sci-Fi', year: '2023' },
    { id: 'mv-3', title: 'Night Shift', genre: 'Thriller', year: '2020' },
    { id: 'mv-4', title: 'Aurora', genre: 'Animation', year: '2022' }
];

export default function MoviesTvApp() {
    return (
        <div style={{
            height: '100%',
            backgroundColor: '#0f172a',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            gap: '16px'
        }}>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>Movies & TV</div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '16px'
            }}>
                {library.map(item => (
                    <div
                        key={item.id}
                        style={{
                            backgroundColor: '#0b1220',
                            border: '1px solid #1f2a44',
                            borderRadius: '10px',
                            padding: '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                        }}
                    >
                        <div style={{
                            height: '120px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #334155, #1e293b)',
                            marginBottom: '6px'
                        }} />
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{item.genre} • {item.year}</div>
                        <button
                            style={{
                                marginTop: '6px',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#334155',
                                color: '#fff',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            Play
                        </button>
                    </div>
                ))}
            </div>

            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Add your own media library in a future update.
            </div>
        </div>
    );
}
