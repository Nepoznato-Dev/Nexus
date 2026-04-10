import React, { useEffect, useRef, useState } from 'react';

const CONTENT_KEY = 'nexus_notepad_content';
const NAME_KEY = 'nexus_notepad_filename';

export default function NotepadApp() {
    const [content, setContent] = useState('');
    const [fileName, setFileName] = useState('untitled.txt');
    const fileInputRef = useRef(null);

    useEffect(() => {
        const savedContent = localStorage.getItem(CONTENT_KEY);
        const savedName = localStorage.getItem(NAME_KEY);
        if (savedContent !== null) {
            setContent(savedContent);
        }
        if (savedName) {
            setFileName(savedName);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(CONTENT_KEY, content);
        localStorage.setItem(NAME_KEY, fileName);
    }, [content, fileName]);

    const handleNew = () => {
        setContent('');
        setFileName('untitled.txt');
    };

    const handleOpen = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setContent(String(reader.result || ''));
            setFileName(file.name || 'untitled.txt');
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleSave = () => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'untitled.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: 'transparent',
        }}>
            {/* Menu Bar */}
            <div style={{
                padding: '8px 12px',
                backgroundColor: '#252525',
                borderBottom: '1px solid #333',
                display: 'flex',
                gap: '16px',
                fontSize: '13px',
                color: '#aaa',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <span style={{ cursor: 'default' }}>File</span>
                    <span style={{ cursor: 'default' }}>Edit</span>
                    <span style={{ cursor: 'default' }}>View</span>
                    <span style={{ cursor: 'default' }}>Help</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        type="button"
                        onClick={handleNew}
                        style={{
                            padding: '4px 8px',
                            backgroundColor: '#1f1f1f',
                            border: '1px solid #333',
                            color: '#ddd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                        }}
                    >
                        New
                    </button>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            padding: '4px 8px',
                            backgroundColor: '#1f1f1f',
                            border: '1px solid #333',
                            color: '#ddd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                        }}
                    >
                        Open
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        style={{
                            padding: '4px 8px',
                            backgroundColor: '#2d3b5a',
                            border: '1px solid #2f4d8a',
                            color: '#fff',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                        }}
                    >
                        Save
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,text/plain"
                        onChange={handleOpen}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>

            {/* Editor */}
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start typing..."
                style={{
                    flex: 1,
                    padding: '16px',
                    backgroundColor: 'transparent',
                    color: '#fff',
                    border: 'none',
                    outline: 'none',
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    resize: 'none',
                }}
            />

            {/* Status Bar */}
            <div style={{
                padding: '4px 12px',
                backgroundColor: '#252525',
                borderTop: '1px solid #333',
                fontSize: '12px',
                color: '#666',
                display: 'flex',
                justifyContent: 'space-between',
            }}>
                <span>{fileName}</span>
                <span>Lines: {content.split('\n').length} | Characters: {content.length}</span>
            </div>
        </div>
    );
}
