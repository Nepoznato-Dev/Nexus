import React, { useEffect, useMemo, useState } from 'react';

export default function ClockApp() {
    const [now, setNow] = useState(new Date());
    const [timeZone, setTimeZone] = useState('local');

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const zones = useMemo(() => ([
        { id: 'local', label: 'Local Time' },
        { id: 'UTC', label: 'UTC' },
        { id: 'America/New_York', label: 'New York' },
        { id: 'Europe/London', label: 'London' },
        { id: 'Europe/Berlin', label: 'Berlin' },
        { id: 'Asia/Tokyo', label: 'Tokyo' },
        { id: 'Australia/Sydney', label: 'Sydney' }
    ]), []);

    const effectiveZone = timeZone === 'local'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : timeZone;

    const timeString = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: effectiveZone
    }).format(now);

    const dateString = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: effectiveZone
    }).format(now);

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
            <div style={{ fontSize: '18px', fontWeight: 600 }}>Clock</div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                gap: '8px'
            }}>
                <div style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '1px' }}>
                    {timeString}
                </div>
                <div style={{ fontSize: '14px', color: '#cbd5f5' }}>
                    {dateString}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {effectiveZone}
                </div>
            </div>

            <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                    Timezone
                </label>
                <select
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    style={{
                        width: '100%',
                        backgroundColor: '#0b1220',
                        border: '1px solid #1f2a44',
                        borderRadius: '6px',
                        color: '#fff',
                        padding: '10px 12px',
                        fontSize: '13px'
                    }}
                >
                    {zones.map(zone => (
                        <option key={zone.id} value={zone.id}>
                            {zone.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
