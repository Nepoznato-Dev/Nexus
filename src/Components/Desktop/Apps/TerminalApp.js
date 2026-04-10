import React, { useState, useRef, useEffect } from 'react';
import { openInAboutBlank, isDevelopmentUrl } from '../../../utils.js';

export default function TerminalApp() {
    const CUSTOM_COMMANDS_KEY = 'nexus_terminal_custom_commands';

    const normalizeCommandName = (name) => String(name || '').trim().toLowerCase();

    const loadCustomCommands = () => {
        try {
            const raw = localStorage.getItem(CUSTOM_COMMANDS_KEY);
            const parsed = raw ? JSON.parse(raw) : {};
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (error) {
            return {};
        }
    };

    const [lines, setLines] = useState([
        '╔═══════════════════════════════════════════════════╗',
        '║     Welcome to Nexus Terminal v1.0                ║',
        '║     Type "help" for available commands            ║',
        '╚═══════════════════════════════════════════════════╝',
        '',
    ]);
    const [input, setInput] = useState('');
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [customCommands, setCustomCommands] = useState(() => loadCustomCommands());
    const [devServerEnabled, setDevServerEnabled] = useState(false);
    const terminalRef = useRef(null);
    const inputRef = useRef(null);
    const draftInputRef = useRef('');
    const isDevEnvironment = isDevelopmentUrl(window.location.href);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [lines]);

    useEffect(() => {
        localStorage.setItem(CUSTOM_COMMANDS_KEY, JSON.stringify(customCommands));
    }, [customCommands]);

    const getSystemInfo = () => {
        const now = new Date();
        const ram = performance.memory ? `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB` : 'N/A';
        return [
            '------- SYSTEM INFORMATION -------',
            `OS: Nexus Desktop Environment`,
            `Platform: ${navigator.platform}`,
            `Browser: ${navigator.userAgent.split(' ').pop()}`,
            `Time: ${now.toLocaleString()}`,
            `Memory Usage: ${ram}`,
            `Screen: ${window.innerWidth}x${window.innerHeight}`,
            '------------------------------------',
        ];
    };

    const getTaskList = () => {
        // Simulated task list (in real system would show actual processes)
        return [
            '------- RUNNING PROCESSES -------',
            'System Processes:',
            '  - Desktop Manager (PID: 1)',
            '  - Window Manager (PID: 2)',
            '  - Task Scheduler (PID: 3)',
            '  - Performance Monitor (PID: 4)',
            '  - Terminal (PID: ' + Math.floor(Math.random() * 9000 + 1000) + ')',
            '',
            'Open Applications:',
            '  - (Check Task Manager for running apps)',
            '------------------------------------',
        ];
    };

    const commands = {
        help: () => [
            '═══════════════════════════════════',
            'AVAILABLE COMMANDS:',
            '═══════════════════════════════════',
            'System Commands:',
            '  /s                - Shutdown system',
            '  /r                - Restart system',
            '  systeminfo        - Show system information',
            '  tasklist          - List running processes',
            '  dir               - List directory contents',
            '  cls or clear      - Clear terminal',
            '',
            'Utilities:',
            '  echo <text>       - Echo text',
            '  date              - Show current date & time',
            '  whoami            - Show current user',
            '  time              - Show current time',
            '  ipconfig          - Show network info',
            '  applist           - List launchable desktop app IDs',
            ...(isDevEnvironment && devServerEnabled
                ? [
                    '  NexusOpenIn: <target> - Open target in about:blank wrapper',
                    '                       Targets: about:blank | canva | classroom | <https://url>',
                    '  Dev_Server.no     - Disable dev server commands',
                ]
                : []),
            '',
            'Custom Commands:',
            '  cmdadd <name> <action>  - Add custom command',
            '  cmddel <name>           - Delete custom command',
            '  cmdlist                 - List custom commands',
            '  Action examples:',
            '    open:taskmanager',
            '    open:settings',
            '    echo:Hello from custom command',
            '    run:systeminfo',
            '    url:https://example.com',
            '',
            'Desktop:',
            '  about             - About Nexus Terminal',
            '  version           - Show version info',
            '  help              - Show this help message',
            ...(isDevEnvironment && !devServerEnabled
                ? ['  Dev_Server.yes    - Enable hidden dev server commands']
                : []),
            '═══════════════════════════════════',
        ],
        clear: () => {
            setLines([]);
            return null;
        },
        cls: () => {
            setLines([]);
            return null;
        },
        date: () => [new Date().toLocaleString()],
        time: () => [new Date().toLocaleTimeString()],
        systeminfo: () => getSystemInfo(),
        tasklist: () => getTaskList(),
        whoami: () => ['User: ' + (localStorage.getItem('nexus_username') || 'Guest')],
        ipconfig: () => [
            '------- NETWORK CONFIGURATION -------',
            'Note: Simulated network info',
            'IPv4: 192.168.1.' + Math.floor(Math.random() * 255),
            'Gateway: 192.168.1.1',
            'DNS: 8.8.8.8 (Google DNS)',
            'MAC Address: ' + Array(6).fill(0).map(() => Math.floor(Math.random() * 255).toString(16)).join(':').toUpperCase(),
            '-------------------------------------',
        ],
        applist: () => {
            const appList = window.nexusDesktop?.listApps?.() || [];
            if (appList.length === 0) {
                return ['Desktop app list unavailable (desktop API not ready).'];
            }

            return [
                '------- LAUNCHABLE APPS -------',
                ...appList.map(app => `  ${app.id.padEnd(16, ' ')} - ${app.name}`),
                '--------------------------------',
            ];
        },
        dir: () => [
            '------- DIRECTORY LISTING -------',
            '[Desktop]',
            '[Documents]',
            '[Downloads]',
            '[Games]',
            '[Mods]',
            '[Settings]',
            '  Terminal.exe',
            '  README.txt',
            '----------------------------------',
        ],
        version: () => [
            'Nexus Desktop Environment v2.0',
            'Build: 2026.02.26',
            'Copyright © 2026 Nexus Project',
        ],
        about: () => [
            '╔════════════════════════════════════════════╗',
            '║  Nexus Terminal v2.0                       ║',
            '║  Advanced system shell interface           ║',
            '║                                            ║',
            '║  A modern terminal emulator for the        ║',
            '║  Nexus Desktop Environment                 ║',
            '║                                            ║',
            '║  Built with React & JavaScript            ║',
            '║  Licensed under MIT                        ║',
            '╚════════════════════════════════════════════╝',
        ],
    };

    const executeCustomAction = (action) => {
        if (!action || typeof action !== 'string') {
            return ['Invalid custom command action.'];
        }

        if (action.startsWith('open:')) {
            const appId = action.slice(5).trim();
            const result = window.nexusDesktop?.launchAppById?.(appId);
            if (!result?.success) {
                return [result?.error || `Failed to open app '${appId}'.`];
            }
            return [`Opened ${result.appName} (${result.appId}).`];
        }

        if (action.startsWith('echo:')) {
            return [action.slice(5)];
        }

        if (action.startsWith('url:')) {
            const url = action.slice(4).trim();
            if (!/^https?:\/\//i.test(url)) {
                return ['Only http/https URLs are allowed.'];
            }
            window.open(url, '_blank');
            return [`Opened URL: ${url}`];
        }

        if (action.startsWith('run:')) {
            const nested = action.slice(4).trim();
            if (!nested) return ['Nested command is empty.'];
            handleCommand(nested);
            return null;
        }

        return [`Unknown custom action: ${action}`];
    };

    const handleShutdown = () => {
        if (confirm('Shutdown system? This will close all windows.')) {
            localStorage.setItem('desktop_mode', 'false');
            window.location.reload();
        }
    };

    const handleRestart = () => {
        if (confirm('Restart system? This will reload the environment.')) {
            window.location.reload();
        }
    };

    const handleCommand = (cmd) => {
        const trimmed = cmd.trim();
        const parsedCommand = trimmed.replace(/^['"]+|['"]+$/g, '').trim();
        const pushUnknownCommand = (rawCommand) => {
            setLines(prev => [...prev, `> ${rawCommand}`, `'${rawCommand}' is not recognized as an internal or external command.`, '']);
            setCommandHistory(prev => [...prev, rawCommand]);
            setHistoryIndex(-1);
            draftInputRef.current = '';
        };
        const normalizedRaw = parsedCommand.toLowerCase();

        if (normalizedRaw === 'dev_server.yes') {
            setLines(prev => [...prev, `> ${trimmed}`]);
            setCommandHistory(prev => [...prev, trimmed]);
            setHistoryIndex(-1);
            draftInputRef.current = '';

            setDevServerEnabled(true);
            if (isDevEnvironment) {
                setLines(prev => [...prev, 'Dev server commands enabled for this session.', '']);
            } else {
                setLines(prev => [...prev, 'Manual command mode enabled for this session.', '']);
            }
            return;
        }

        if (normalizedRaw === 'dev_server.no') {
            setLines(prev => [...prev, `> ${trimmed}`]);
            setCommandHistory(prev => [...prev, trimmed]);
            setHistoryIndex(-1);
            draftInputRef.current = '';

            setDevServerEnabled(false);
            setLines(prev => [...prev, 'Dev server commands disabled.', '']);
            return;
        }

        const openInMatch = parsedCommand.match(/^nexusopenin\s*:\s*(.+)$/i);
        if (openInMatch) {
            if (!devServerEnabled) {
                pushUnknownCommand(trimmed);
                return;
            }

            const target = String(openInMatch[1] || '').trim();

            if (!target) {
                setLines(prev => [...prev, `> ${trimmed}`, 'Usage: NexusOpenIn: <target>', 'Targets: about:blank | canva | classroom | https://example.com', '']);
                return;
            }

            let urlToOpen = '';
            let title = 'about:blank';
            const lowered = target.toLowerCase();

            if (lowered === 'about:blank' || lowered === 'blank') {
                urlToOpen = window.location.href;
                title = 'about:blank';
            } else if (lowered === 'canva') {
                urlToOpen = 'https://www.canva.com';
                title = 'Canva';
            } else if (lowered === 'classroom' || lowered === 'googleclassroom') {
                urlToOpen = 'https://classroom.google.com';
                title = 'Google Classroom';
            } else if (/^https?:\/\//i.test(target)) {
                try {
                    const parsed = new URL(target);
                    urlToOpen = parsed.toString();
                    title = parsed.hostname.replace(/^www\./, '') || 'about:blank';
                } catch (error) {
                    setLines(prev => [...prev, `> ${trimmed}`, 'Invalid URL target.', '']);
                    return;
                }
            } else {
                setLines(prev => [...prev, `> ${trimmed}`, 'Unknown target.', 'Try: about:blank, canva, classroom, or full https:// URL.', '']);
                return;
            }

            const opened = openInAboutBlank(urlToOpen, title);
            setLines(prev => [...prev, `> ${trimmed}`, opened ? `Opened in about:blank -> ${urlToOpen}` : 'Popup blocked. Allow popups and try again.', '']);
            setCommandHistory(prev => [...prev, trimmed]);
            setHistoryIndex(-1);
            draftInputRef.current = '';
            return;
        }

        const [command, ...args] = trimmed.split(' ');
        const normalizedCommand = normalizeCommandName(command);
        const rawArgs = trimmed.slice(command.length).trim();
        if (!trimmed) return;

        setLines(prev => [...prev, `> ${trimmed}`]);
        setCommandHistory(prev => [...prev, trimmed]);
        setHistoryIndex(-1);
        draftInputRef.current = '';

        // Special commands with side effects
        if (command === '/s') {
            handleShutdown();
            return;
        }

        if (command === '/r') {
            handleRestart();
            return;
        }

        if (normalizedCommand === 'echo') {
            setLines(prev => [...prev, args.join(' '), '']);
            return;
        }

        if (normalizedCommand === 'cmdadd') {
            const nameArg = args[0] || '';
            const actionArg = rawArgs.slice(nameArg.length).trim();
            const normalizedName = normalizeCommandName(nameArg);

            if (!normalizedName || !/^[a-z0-9_-]+$/i.test(nameArg)) {
                setLines(prev => [...prev, 'Usage: cmdadd <name> <action>', 'Name must use letters, numbers, _ or -.', '']);
                return;
            }

            if (!actionArg) {
                setLines(prev => [...prev, 'Usage: cmdadd <name> <action>', 'Example: cmdadd Open_Task_Manager open:taskmanager', '']);
                return;
            }

            if (commands[normalizedName]) {
                setLines(prev => [...prev, `Cannot override built-in command '${nameArg}'.`, '']);
                return;
            }

            setCustomCommands(prev => ({
                ...prev,
                [normalizedName]: {
                    name: nameArg,
                    action: actionArg,
                    createdAt: Date.now(),
                },
            }));

            setLines(prev => [...prev, `Custom command '${nameArg}' added -> ${actionArg}`, '']);
            return;
        }

        if (normalizedCommand === 'cmddel') {
            const nameArg = args[0] || '';
            const normalizedName = normalizeCommandName(nameArg);

            if (!normalizedName) {
                setLines(prev => [...prev, 'Usage: cmddel <name>', '']);
                return;
            }

            if (!customCommands[normalizedName]) {
                setLines(prev => [...prev, `Custom command '${nameArg}' not found.`, '']);
                return;
            }

            setCustomCommands(prev => {
                const next = { ...prev };
                delete next[normalizedName];
                return next;
            });

            setLines(prev => [...prev, `Custom command '${nameArg}' removed.`, '']);
            return;
        }

        if (normalizedCommand === 'cmdlist') {
            const entries = Object.values(customCommands);
            if (entries.length === 0) {
                setLines(prev => [...prev, 'No custom commands defined.', '']);
                return;
            }

            setLines(prev => [
                ...prev,
                '------- CUSTOM COMMANDS -------',
                ...entries.map(entry => `  ${entry.name} -> ${entry.action}`),
                '--------------------------------',
                '',
            ]);
            return;
        }

        if (normalizedCommand === 'dir') {
            const arg = args[0];
            if (arg) {
                setLines(prev => [...prev, `Directory of ${arg}:`, ...getSystemInfo().slice(1), '']);
            } else {
                const result = commands[normalizedCommand]();
                if (result) setLines(prev => [...prev, ...result, '']);
            }
            return;
        }

        if (commands[normalizedCommand]) {
            const result = commands[normalizedCommand]();
            if (result) {
                setLines(prev => [...prev, ...result, '']);
            }
        } else if (customCommands[normalizedCommand]) {
            const result = executeCustomAction(customCommands[normalizedCommand].action);
            if (result) {
                setLines(prev => [...prev, ...result, '']);
            }
        } else {
            setLines(prev => [...prev, `'${command}' is not recognized as an internal or external command.`, '']);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleCommand(input);
        setInput('');
    };

    const handleHistoryKey = (e) => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        if (commandHistory.length === 0) return;

        e.preventDefault();

        if (e.key === 'ArrowUp') {
            if (historyIndex === -1) {
                draftInputRef.current = input;
                const lastIndex = commandHistory.length - 1;
                setHistoryIndex(lastIndex);
                setInput(commandHistory[lastIndex]);
            } else if (historyIndex > 0) {
                const nextIndex = historyIndex - 1;
                setHistoryIndex(nextIndex);
                setInput(commandHistory[nextIndex]);
            }
        }

        if (e.key === 'ArrowDown') {
            if (historyIndex === -1) return;
            const nextIndex = historyIndex + 1;
            if (nextIndex >= commandHistory.length) {
                setHistoryIndex(-1);
                setInput(draftInputRef.current);
            } else {
                setHistoryIndex(nextIndex);
                setInput(commandHistory[nextIndex]);
            }
        }
    };

    return (
        <div
            onClick={() => inputRef.current?.focus()}
            style={{
                height: '100%',
                backgroundColor: 'transparent',
                color: '#00ff00',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                fontSize: '14px',
                padding: '16px',
                overflow: 'auto',
                cursor: 'text',
            }}
            ref={terminalRef}
        >
            {lines.map((line, idx) => (
                <div key={idx} style={{ lineHeight: '1.5' }}>
                    {line}
                </div>
            ))}
            <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px' }}>{'>'}</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => {
                        if (historyIndex !== -1) setHistoryIndex(-1);
                        setInput(e.target.value);
                    }}
                    onKeyDown={handleHistoryKey}
                    autoFocus
                    style={{
                        flex: 1,
                        backgroundColor: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#00ff00',
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                    }}
                />
            </form>
        </div>
    );
}
