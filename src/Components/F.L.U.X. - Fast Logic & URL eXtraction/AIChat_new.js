import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Clock3,
  Sparkles,
  Plus,
  Search,
} from 'lucide-react';
import { generateNaturalResponse, analyzeUserPersonality } from './aiKnowledgeBase.js';
import { generateSearchEnhancedResponse } from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/IRISSearch.js';
import {
  applyLearnedPersonalization,
  applyPreferenceFromMessage,
  deriveAdaptivePersonality,
  loadLearningProfile,
  recordFeedback,
} from './userLearning.js';
import './AIChat.css';
import { showStorageError } from '../../utils/errorWindowManager.js';
import {
  keepPendingUndo,
  pushPendingUndo,
  subscribePendingUndo,
  undoPendingUndo,
} from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/irisPendingUndo.js';
import {
  getAlloyCapabilitySignal,
  startAlloyPerformanceMonitor,
  stopAlloyPerformanceMonitor,
} from '../../utils/alloyPerformanceMonitor.js';
import {
  executeAlloyFlow,
} from './alloyFlowController.js';

const TERMINAL_CUSTOM_COMMANDS_KEY = 'nexus_terminal_custom_commands';
const SELF_AWARENESS_APPROVALS_KEY = 'nexus_self_awareness_approvals';
const WORKSPACE_LAYOUT_KEY = 'nexus_workspace_layout';
const RESERVED_TERMINAL_COMMANDS = new Set([
  'help', 'clear', 'cls', 'date', 'time', 'systeminfo', 'tasklist', 'whoami', 'ipconfig',
  'applist', 'dir', 'version', 'about', 'echo', 'cmdadd', 'cmddel', 'cmdlist', '/s', '/r'
]);

function normalizeCommandToken(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeSearchText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function parseTerminalCommandIntent(message) {
  const text = String(message || '').trim();

  const addPatterns = [
    /(?:^|\b)(?:hey\s+iris[,\s]*)?(?:make|create|add)\s+(?:a\s+)?(?:terminal\s+)?command\s+(?:called|named)?\s*["']?([A-Za-z0-9_-]+)["']?\s+(?:that\s+|to\s+)?(?:opens?|launch(?:es)?)\s+(.+)$/i,
    /(?:^|\b)(?:hey\s+iris[,\s]*)?(?:make|create|add)\s+["']?([A-Za-z0-9_-]+)["']?\s+(?:command\s+)?(?:that\s+|to\s+)?(?:opens?|launch(?:es)?)\s+(.+)$/i,
  ];

  for (const pattern of addPatterns) {
    const match = text.match(pattern);
    if (match) {
      const commandName = match[1];
      const targetApp = match[2].replace(/[.!?\s]+$/, '').trim();
      return { type: 'add', commandName, targetApp };
    }
  }

  const removePatterns = [
    /(?:^|\b)(?:hey\s+iris[,\s]*)?(?:remove|delete)\s+(?:terminal\s+)?command\s+["']?([A-Za-z0-9_-]+)["']?/i,
  ];

  for (const pattern of removePatterns) {
    const match = text.match(pattern);
    if (match) {
      return { type: 'remove', commandName: match[1] };
    }
  }

  return null;
}

function resolveDesktopAppId(targetApp) {
  const appList = window.nexusDesktop?.listApps?.() || [];
  if (appList.length === 0) {
    return { success: false, reason: 'desktop-api-unavailable' };
  }

  const normalizedTarget = normalizeSearchText(targetApp);
  if (!normalizedTarget) {
    return { success: false, reason: 'invalid-target' };
  }

  const byId = appList.find((app) => normalizeSearchText(app.id) === normalizedTarget);
  if (byId) return { success: true, app: byId };

  const byName = appList.find((app) => normalizeSearchText(app.name) === normalizedTarget);
  if (byName) return { success: true, app: byName };

  const partial = appList.find((app) => {
    const id = normalizeSearchText(app.id);
    const name = normalizeSearchText(app.name);
    return id.includes(normalizedTarget) || normalizedTarget.includes(id) || name.includes(normalizedTarget) || normalizedTarget.includes(name);
  });

  if (partial) return { success: true, app: partial };
  return { success: false, reason: 'app-not-found', appList };
}

function loadCustomTerminalCommands() {
  try {
    const raw = localStorage.getItem(TERMINAL_CUSTOM_COMMANDS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveCustomTerminalCommand(commandName, action) {
  const normalizedName = normalizeCommandToken(commandName);
  const commands = loadCustomTerminalCommands();
  commands[normalizedName] = {
    name: commandName,
    action,
    createdAt: Date.now(),
    createdBy: 'iris-chat',
  };
  localStorage.setItem(TERMINAL_CUSTOM_COMMANDS_KEY, JSON.stringify(commands));
}

function removeCustomTerminalCommand(commandName) {
  const normalizedName = normalizeCommandToken(commandName);
  const commands = loadCustomTerminalCommands();
  if (!commands[normalizedName]) {
    return false;
  }
  delete commands[normalizedName];
  localStorage.setItem(TERMINAL_CUSTOM_COMMANDS_KEY, JSON.stringify(commands));
  return true;
}

function loadSelfAwarenessApprovals() {
  try {
    const raw = localStorage.getItem(SELF_AWARENESS_APPROVALS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => String(item || '').trim()).filter(Boolean);
  } catch (error) {
    return [];
  }
}

function saveSelfAwarenessApprovals(approvals) {
  const normalized = Array.from(new Set((approvals || []).map((item) => String(item || '').trim()).filter(Boolean)));
  localStorage.setItem(SELF_AWARENESS_APPROVALS_KEY, JSON.stringify(normalized));
  return normalized;
}

function parseSelfAwarenessApprovalIntent(message) {
  const text = String(message || '').trim();
  const match = text.match(/^(?:approve\s+)?self-awareness\s*:\s*(.+)$/i) || text.match(/^approve\s+self-awareness\s+(.+)$/i);
  if (!match) return null;

  const features = String(match[1] || '')
    .split(/[;,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/[^a-zA-Z0-9_-]/g, ''));

  if (!features.length) return null;
  return { type: 'approve-self-awareness', features };
}

function loadWorkspaceLayout() {
  try {
    const raw = localStorage.getItem(WORKSPACE_LAYOUT_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== 'object') {
      return {
        showSourcesPanel: true,
        showBuildPanel: true,
      };
    }

    return {
      showSourcesPanel: parsed.showSourcesPanel !== false,
      showBuildPanel: parsed.showBuildPanel !== false,
    };
  } catch (error) {
    return {
      showSourcesPanel: true,
      showBuildPanel: true,
    };
  }
}

function saveWorkspaceLayout(layout) {
  localStorage.setItem(WORKSPACE_LAYOUT_KEY, JSON.stringify({
    showSourcesPanel: Boolean(layout.showSourcesPanel),
    showBuildPanel: Boolean(layout.showBuildPanel),
  }));
}

export default function AIChat() {
  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState('');
  const [omniboxQuery, setOmniboxQuery] = useState('');
  const [personalityDescription, setPersonalityDescription] = useState('Clear, direct, and practical.');
  const [isLoading, setIsLoading] = useState(false);
  const [professionalism, setProfessionalism] = useState(0.5);
  const [mentorship, setMentorship] = useState(0.5);
  const [isPersonalityLocked, setIsPersonalityLocked] = useState(false);
  const [learningProfile, setLearningProfile] = useState(null);
  const [pendingUndo, setPendingUndo] = useState(null);
  const [mode, setMode] = useState('plus');
  const [isSearchWeb, setIsSearchWeb] = useState(false);
  const [isDeepResearch, setIsDeepResearch] = useState(false);
  const [isThinkLonger, setIsThinkLonger] = useState(false);
  const [responseLength, setResponseLength] = useState('auto');
  const [isModePopupOpen, setIsModePopupOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showTransparency, setShowTransparency] = useState(true);
  const [showSourcesPanel, setShowSourcesPanel] = useState(() => loadWorkspaceLayout().showSourcesPanel);
  const [showBuildPanel, setShowBuildPanel] = useState(() => loadWorkspaceLayout().showBuildPanel);
  const [isAlloySidebarCollapsed, setIsAlloySidebarCollapsed] = useState(false);
  const [sourceQuery, setSourceQuery] = useState('');
  const [sourceActivationMap, setSourceActivationMap] = useState({});
  const [selectedBuildVersionId, setSelectedBuildVersionId] = useState(null);
  const [buildPreviewMode, setBuildPreviewMode] = useState('render');
  const [transformerStatus, setTransformerStatus] = useState({ state: 'idle', model: null, message: '' });
  const [statusToasts, setStatusToasts] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [hoveredTimingId, setHoveredTimingId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputFormRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageIdRef = useRef(1);
  const learningProfileRef = useRef(null);
  const readEngagementRef = useRef({});
  const selfAwarenessProfileRef = useRef({});
  const selfAwarenessApprovalsRef = useRef(loadSelfAwarenessApprovals());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    startAlloyPerformanceMonitor();

    return () => {
      stopAlloyPerformanceMonitor();
    };
  }, []);

  useEffect(() => {
    saveWorkspaceLayout({ showSourcesPanel, showBuildPanel });
  }, [showSourcesPanel, showBuildPanel]);

  useEffect(() => {
    setIsAlloySidebarCollapsed(showSourcesPanel);
  }, [showSourcesPanel]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await loadLearningProfile();
        learningProfileRef.current = profile;
        setLearningProfile(profile);
      } catch (error) {
        console.warn('Failed to load learning profile:', error);
        showStorageError('Learning profile could not be loaded from storage', loadProfile);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    return subscribePendingUndo(setPendingUndo);
  }, []);

  useEffect(() => {
    const onTransformerStatus = (event) => {
      const detail = event?.detail || {};
      setTransformerStatus({
        state: detail.state || 'idle',
        model: detail.model || null,
        message: detail.message || '',
      });

      const toastText = (() => {
        if (detail.state === 'loading') return `Downloading brain: ${detail.model || 'local model'}`;
        if (detail.state === 'ready') return `Initialized ${detail.model || 'local model'}`;
        if (detail.state === 'error') return `Model error: ${detail.message || 'unknown issue'}`;
        return null;
      })();

      if (toastText) {
        const toastId = Date.now() + Math.random();
        setStatusToasts((prev) => [...prev.slice(-2), { id: toastId, text: toastText }]);
        setTimeout(() => {
          setStatusToasts((prev) => prev.filter((toast) => toast.id !== toastId));
        }, 3200);
      }
    };

    window.addEventListener('nexus:transformer-status', onTransformerStatus);
    return () => window.removeEventListener('nexus:transformer-status', onTransformerStatus);
  }, []);

  const estimateTokens = (value) => {
    const text = String(value || '').trim();
    if (!text) return 0;
    return Math.max(1, Math.ceil(text.length / 4));
  };

  const filteredUserHistory = messages
    .filter((msg) => msg.role === 'user')
    .filter((msg) => msg.text.toLowerCase().includes(omniboxQuery.toLowerCase()))
    .slice(-6)
    .reverse();

  const recentUserHistory = messages
    .filter((msg) => msg.role === 'user')
    .slice(-8)
    .reverse();

  const sourceEntries = messages.reduce((acc, msg) => {
    if (msg.role === 'user' && Array.isArray(msg.attachments)) {
      msg.attachments.forEach((attachmentName) => {
        if (!attachmentName) return;
        acc.push({
          id: `attachment-${msg.id}-${attachmentName}`,
          name: attachmentName,
          kind: 'attachment',
          messageId: msg.id,
        });
      });
    }

    if (msg.role === 'ai' && msg.transparencyReport) {
      const modules = Array.isArray(msg.transparencyReport.activeModules)
        ? msg.transparencyReport.activeModules
        : [];

      modules.forEach((module) => {
        const sourceAnchor = module?.artifacts?.summaryMap?.sourceAnchor;
        if (!sourceAnchor) return;
        acc.push({
          id: `anchor-${msg.id}-${module.id}-${sourceAnchor}`,
          name: sourceAnchor,
          kind: 'anchor',
          messageId: msg.id,
        });
      });
    }

    return acc;
  }, []);

  const filteredSourceEntries = sourceEntries.filter((entry) => {
    if (!sourceQuery.trim()) return true;
    return entry.name.toLowerCase().includes(sourceQuery.toLowerCase());
  });

  const activeSourceEntries = sourceEntries.filter((entry) => sourceActivationMap[entry.id] !== false);

  const extractCodeSnapshot = (value) => {
    const text = String(value || '');
    const match = text.match(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/);
    if (match && match[1]) {
      return match[1].trim();
    }
    return text.trim();
  };

  const buildVersions = messages
    .filter((msg) => msg.role === 'ai')
    .map((msg, index) => ({
      id: msg.id,
      versionLabel: `v${index + 1}`,
      timestamp: msg.timestamp,
      text: msg.text,
      codeSnapshot: extractCodeSnapshot(msg.text),
      source: msg.transparencyReport?.responseSource || 'runtime',
      contract: msg.transparencyReport?.outputContract || null,
    }));

  const selectedBuildVersion = buildVersions.find((item) => item.id === selectedBuildVersionId) || null;

  useEffect(() => {
    if (buildVersions.length === 0) {
      setSelectedBuildVersionId(null);
      return;
    }

    const stillExists = buildVersions.some((item) => item.id === selectedBuildVersionId);
    if (!stillExists) {
      setSelectedBuildVersionId(buildVersions[buildVersions.length - 1].id);
    }
  }, [buildVersions, selectedBuildVersionId]);

  const refreshLearningProfile = async () => {
    const profile = await loadLearningProfile();
    learningProfileRef.current = profile;
    setLearningProfile(profile);
    return profile;
  };

  const getLatestAiMessageId = () => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'ai') return messages[i].id;
    }
    return null;
  };

  const noteReadingActivity = () => {
    if (document.visibilityState !== 'visible') return;
    const latestAiId = getLatestAiMessageId();
    if (!latestAiId) return;

    const now = Date.now();
    const tracker = readEngagementRef.current[latestAiId] || {
      startedAt: now,
      lastActiveAt: null,
      interactions: 0
    };

    tracker.interactions += 1;
    tracker.lastActiveAt = now;
    readEngagementRef.current[latestAiId] = tracker;
  };

  const getEngagedReadTimeMs = (messageId) => {
    const tracker = readEngagementRef.current[messageId];
    if (!tracker || tracker.interactions === 0 || !tracker.lastActiveAt) return 0;
    return Math.max(0, tracker.lastActiveAt - tracker.startedAt);
  };

  const getModeInstruction = (selectedMode) => {
    if (selectedMode === 'turbo') return 'RAZONET Rzr 1 (Turbo) — fast execution mode for quick syntax checks, basic math, and rapid code fixes with minimal overhead.';
    if (selectedMode === 'lite') return 'RAZONET Rzr 2 (Lite) — conversational mode with compact answers and lightweight validation against recent context.';
    if (selectedMode === 'plus') return 'RAZONET Vexon 1 (Mid) — stable workhorse mode with stronger verification and clearer reasoning structure.';
    if (selectedMode === 'pro') return 'RAZONET Noxyn (Pro/Pro+) — high-depth council mode for complex engineering, heavy debugging, and multi-pass reasoning.';
    if (selectedMode === 'auto') return 'RAZONET AUTO — adaptive router that shifts between Rzr, Vexon, and Noxyn tiers based on task complexity and stability signals.';
    return 'RAZONET adapts response depth to question complexity.';
  };

  const getToolInstruction = () => {
    const toolLines = [];
    if (isSearchWeb) {
      toolLines.push('F.L.U.X gateway active: scrub web noise, extract clean logic from current sources, cite the source domain, and clearly label uncertain claims.');
    }
    if (isDeepResearch) {
      toolLines.push('STM stack active: run deeper research with layered verification passes, source-grounded reasoning, and cross-check important claims 3 to 5 times.');
    }
    if (isThinkLonger) {
      toolLines.push('Think longer active: wake the S-Squad for extra reasoning passes and double-check final conclusions before answering.');
    }
    if (responseLength === 'shorter') {
      toolLines.push('Length control: Shorter response. Keep only essential answer content and remove extra explanation.');
    } else if (responseLength === 'longer') {
      toolLines.push('Length control: Longer response. Include richer explanation, alternatives, and practical details.');
    } else {
      toolLines.push('Length control: Auto. Match response depth to question complexity.');
    }

    return toolLines.join(' ');
  };

  const isGenericTemplateResponse = (value) => {
    const text = String(value || '').toLowerCase();
    return (
      text.includes('i focus on studying techniques') ||
      text.includes("i'm here to chat about studying") ||
      text.includes('here is a concise answer about') ||
      text.includes('based on standard knowledge') ||
      text.includes('if you want, i can add more detail or give a step-by-step version') ||
      text.includes("let's solve this situation directly") ||
      text.includes('if you want, i can return a short answer first') ||
      text.includes('ask me anything specific and i will answer directly') ||
      text.includes('what interests you?') ||
      text.includes('i can help you with:\n\n• **study techniques**') ||
      text.includes('direct explanation for') ||
      text.includes('direct answer:') ||
      text.includes('break the problem into input, process, and output') ||
      text.includes('this approach usually works well') ||
      text.includes('give me one concrete constraint') ||
      text.includes('i want to answer')
    );
  };

  const isSearchFailureResponse = (value) => {
    const text = String(value || '').toLowerCase().trim();
    return (
      text.includes('search temporarily unavailable') ||
      text.includes("couldn't find current info") ||
      text.includes('search failed')
    );
  };

  const getDeviceProfile = () => ({
    deviceClass: (navigator?.hardwareConcurrency || 4) <= 4 ? 'low' : (navigator?.hardwareConcurrency || 4) >= 12 ? 'high' : 'medium',
    vramFreeGB: Number(navigator?.deviceMemory || 0),
    cpuLoad: 0,
  });

  const getSiteState = () => {
    const capabilitySignal = getAlloyCapabilitySignal();
    const performanceState = capabilitySignal?.runtime?.performance || {};

    return {
      fps: Number(performanceState.fps || capabilitySignal?.fps || 0),
      longTaskCount: Number(performanceState.longTaskCount || capabilitySignal?.longTaskCount || 0),
      heapUsedMB: Number(performanceState.heapUsedMB || capabilitySignal?.heapUsedMB || 0),
      rttMs: Number(performanceState.rttMs || capabilitySignal?.rttMs || 0),
      runtime: capabilitySignal.runtime,
      capabilities: capabilitySignal.capabilities,
      schemaVersion: capabilitySignal.schemaVersion,
      source: capabilitySignal.source,
      collectedAt: capabilitySignal.collectedAt,
    };
  };

  const deriveFluxTags = (message, webContext) => {
    const lower = String(message || '').toLowerCase();
    const tags = new Set();

    if (/proof|paradox|contradiction|assumption|hallucinat|logic trap/.test(lower)) {
      tags.add('logic-trap');
    }
    if (/code|stack trace|exception|typescript|javascript|python|compiler|refactor/.test(lower)) {
      tags.add('high-code-density');
    }
    if ((webContext && webContext.length > 1200) || /large|massive|85k|dataset|logs?/.test(lower)) {
      tags.add('high-strain');
    }

    return Array.from(tags);
  };

  const buildGenerationContext = (attachmentNames, selectedMode, extra = {}) => ({
    attachments: attachmentNames,
    activeSources: activeSourceEntries.map((entry) => ({
      id: entry.id,
      name: entry.name,
      kind: entry.kind,
      messageId: entry.messageId,
    })),
    personalityDescription: personalityDescription.trim(),
    mode: selectedMode,
    modeInstruction: getModeInstruction(selectedMode),
    toolInstruction: getToolInstruction(),
    responseLength,
    toolState: {
      searchWeb: isSearchWeb,
      deepResearch: isDeepResearch,
      thinkLonger: isThinkLonger,
    },
    deviceProfile: getDeviceProfile(),
    siteState: getSiteState(),
    selfAwarenessProfile: selfAwarenessProfileRef.current || {},
    selfAwarenessApprovals: selfAwarenessApprovalsRef.current || [],
    fluxTags: [],
    ...extra,
  });

  const updateSelfAwarenessFromTransparency = (transparencyReport) => {
    const profile = transparencyReport?.stageArtifacts?.selfAwareness?.profile;
    if (profile && typeof profile === 'object') {
      selfAwarenessProfileRef.current = profile;
    }
  };

  const enforceLengthMode = (text, lengthMode) => {
    const inputText = String(text || '').trim();
    if (!inputText) return inputText;

    if (lengthMode === 'shorter') {
      const paragraphs = inputText.split(/\n\n+/).filter(Boolean);
      if (paragraphs.length <= 1) {
        return inputText.length > 360 ? `${inputText.slice(0, 357)}...` : inputText;
      }
      const shortened = paragraphs.slice(0, 2).join('\n\n');
      return shortened.length > 520 ? `${shortened.slice(0, 517)}...` : shortened;
    }

    return inputText;
  };

  const buildTiming = (responseMs, tokenCount) => {
    const firstChunkMs = Math.max(120, Math.round(responseMs * 0.25));
    const firstTokenMs = Math.max(firstChunkMs + 120, Math.round(responseMs * 0.45));
    const summaryTokenMs = Math.max(firstTokenMs + 160, Math.round(responseMs * 0.7));
    const tokensPerSecond = Number((tokenCount / (responseMs / 1000)).toFixed(2));

    return {
      firstChunkMs,
      firstTokenMs,
      summaryTokenMs,
      responseMs,
      tokensPerSecond,
    };
  };

  const runGeneration = async ({ displayPrompt, generationContext = {}, includeUserMessage = true }) => {
    if (!displayPrompt.trim() || isLoading) return;

    const startedAt = performance.now();

    if (includeUserMessage) {
      const userMsg = {
        id: messageIdRef.current++,
        role: 'user',
        text: displayPrompt,
        attachments: attachedFiles.map((file) => file.name),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
    }

    setIsLoading(true);

    if (window.nexusPageStatus) {
      window.nexusPageStatus('Thinking');
    }

    setTimeout(async () => {
      try {
        const result = await executeAlloyFlow({
          displayPrompt,
          generationContext,
          mode,
          responseLength,
          toolState: {
            isSearchWeb,
            isDeepResearch,
            isThinkLonger,
          },
          learningProfile: learningProfileRef.current,
          personalityVector: {
            professionalism,
            mentorship,
          },
          helperFns: {
            deriveFluxTags,
            isGenericTemplateResponse,
            isSearchFailureResponse,
            enforceLengthMode,
            estimateTokens,
            buildTiming,
          },
        });

        const aiMessageId = messageIdRef.current++;
        const now = Date.now();
        readEngagementRef.current[aiMessageId] = {
          startedAt: now,
          lastActiveAt: null,
          interactions: 0,
        };

        const aiMsg = {
          id: aiMessageId,
          role: 'ai',
          text: result.text,
          prompt: displayPrompt,
          generationContext: result.generationContext,
          transparencyReport: result.transparencyReport,
          reaction: null,
          metrics: {
            ...result.metrics,
            mode,
          },
          timestamp: now,
        };

        updateSelfAwarenessFromTransparency(result.transparencyReport);
        setMessages((prev) => [...prev, aiMsg]);
      } finally {
        setIsLoading(false);
        if (window.nexusPageStatus) {
          window.nexusPageStatus(null);
        }
      }
    }, 420 + Math.random() * 500);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    const attachmentNames = attachedFiles.map((file) => file.name);
    const generationContext = buildGenerationContext(attachmentNames, mode);

    setInput('');
    setAttachedFiles([]);

    // Natural-language terminal command creation/removal.
    const terminalIntent = parseTerminalCommandIntent(userMessage);
    const selfAwarenessApprovalIntent = parseSelfAwarenessApprovalIntent(userMessage);

    if (selfAwarenessApprovalIntent) {
      const merged = saveSelfAwarenessApprovals([
        ...(selfAwarenessApprovalsRef.current || []),
        ...selfAwarenessApprovalIntent.features,
      ]);
      selfAwarenessApprovalsRef.current = merged;

      const aiMsg = {
        id: messageIdRef.current++,
        role: 'ai',
        text: `Approved self-awareness features: ${selfAwarenessApprovalIntent.features.join(', ')}. I will only add new self-awareness behaviors after explicit approval.`,
        prompt: userMessage,
        rating: 0,
        forgotten: false,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);
      return;
    }

    if (terminalIntent) {
      const now = Date.now();

      if (terminalIntent.type === 'add') {
        const normalizedName = normalizeCommandToken(terminalIntent.commandName);

        if (!normalizedName || !/^[a-z0-9_-]+$/i.test(terminalIntent.commandName)) {
          const aiMsg = {
            id: messageIdRef.current++,
            role: 'ai',
            text: 'I could not create that command because the name is invalid. Use letters, numbers, underscores, or hyphens only.',
            prompt: userMessage,
            rating: 0,
            forgotten: false,
            timestamp: now,
          };
          setMessages(prev => [...prev, aiMsg]);
          return;
        }

        if (RESERVED_TERMINAL_COMMANDS.has(normalizedName)) {
          const aiMsg = {
            id: messageIdRef.current++,
            role: 'ai',
            text: `I can not use '${terminalIntent.commandName}' because it conflicts with a built-in terminal command. Please choose a different name.`,
            prompt: userMessage,
            rating: 0,
            forgotten: false,
            timestamp: now,
          };
          setMessages(prev => [...prev, aiMsg]);
          return;
        }

        const appResolution = resolveDesktopAppId(terminalIntent.targetApp);
        if (!appResolution.success) {
          const aiMsg = {
            id: messageIdRef.current++,
            role: 'ai',
            text: appResolution.reason === 'desktop-api-unavailable'
              ? 'Desktop app registry is not ready yet. Try again in a moment.'
              : `I could not find an app matching '${terminalIntent.targetApp}'. Open Terminal and run 'applist' to see valid app IDs.`,
            prompt: userMessage,
            rating: 0,
            forgotten: false,
            timestamp: now,
          };
          setMessages(prev => [...prev, aiMsg]);
          return;
        }

        saveCustomTerminalCommand(terminalIntent.commandName, `open:${appResolution.app.id}`);

        const aiMsg = {
          id: messageIdRef.current++,
          role: 'ai',
          text: `Done. I created terminal command '${terminalIntent.commandName}' to open ${appResolution.app.name}.\n\nTry it in Terminal:\n${terminalIntent.commandName}`,
          prompt: userMessage,
          rating: 0,
          forgotten: false,
          timestamp: now,
        };
        setMessages(prev => [...prev, aiMsg]);
        return;
      }

      if (terminalIntent.type === 'remove') {
        const removed = removeCustomTerminalCommand(terminalIntent.commandName);
        const aiMsg = {
          id: messageIdRef.current++,
          role: 'ai',
          text: removed
            ? `Done. Removed terminal command '${terminalIntent.commandName}'.`
            : `I could not find terminal command '${terminalIntent.commandName}'.`,
          prompt: userMessage,
          rating: 0,
          forgotten: false,
          timestamp: now,
        };
        setMessages(prev => [...prev, aiMsg]);
        return;
      }
    }

    try {
      const maybeUpdated = await applyPreferenceFromMessage(userMessage);
      if (maybeUpdated) {
        learningProfileRef.current = maybeUpdated;
        setLearningProfile(maybeUpdated);
      }
    } catch (error) {
      console.warn('Failed to apply preference from message:', error);
    }

    if (!isPersonalityLocked) {
      const delta = analyzeUserPersonality(userMessage);
      setProfessionalism(prev => Math.max(0, Math.min(1, prev + delta.professionalismDelta)));
      setMentorship(prev => Math.max(0, Math.min(1, prev + delta.mentorshipDelta)));
    }

    await runGeneration({
      displayPrompt: userMessage,
      generationContext,
      includeUserMessage: true,
    });
  };

  const handleReaction = async (messageId, reactionType) => {
    const target = messages.find(msg => msg.id === messageId && msg.role === 'ai');
    if (!target) return;

    const rating = reactionType === 'like' ? 5 : 1;

    try {
      await recordFeedback({
        messageId,
        prompt: target.prompt || '',
        response: target.text,
        rating,
        readTimeMs: getEngagedReadTimeMs(messageId),
        deletedForLearning: false
      });

      setMessages(prev => prev.map(msg => (
        msg.id === messageId ? { ...msg, reaction: reactionType } : msg
      )));

      await refreshLearningProfile();
    } catch (error) {
      console.error('Failed to save message reaction:', error);
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.warn('Clipboard copy failed:', error);
    }
  };

  const handleRetry = async (message) => {
    if (!message?.prompt || isLoading) return;
    await runGeneration({
      displayPrompt: message.prompt,
      generationContext: message.generationContext || buildGenerationContext([], mode),
      includeUserMessage: false,
    });
  };

  const clearChat = async () => {
    if (!window.confirm('Clear all messages? This won\'t affect your learned preferences.')) {
      return;
    }

    const previousState = {
      messages,
      professionalism,
      mentorship,
      isPersonalityLocked,
      readEngagement: { ...readEngagementRef.current }
    };

    setMessages([]);
    setProfessionalism(0.5);
    setMentorship(0.5);
    setIsPersonalityLocked(false);
    readEngagementRef.current = {};

    await pushPendingUndo({
      summary: 'Chat cleared. Keep this change?',
      undo: async () => {
        setMessages(previousState.messages);
        setProfessionalism(previousState.professionalism);
        setMentorship(previousState.mentorship);
        setIsPersonalityLocked(previousState.isPersonalityLocked);
        readEngagementRef.current = previousState.readEngagement;
      },
      keep: async () => {
        // Intentional no-op: keeping means accepting current state.
      },
      expiresMs: 30000,
    });
  };

  const modeOptions = [
    { id: 'turbo', label: 'Turbo' },
    { id: 'lite', label: 'Lite' },
    { id: 'plus', label: 'Plus' },
    { id: 'pro', label: 'Pro' },
    { id: 'auto', label: 'Auto (Beta)' },
  ];

  const startNewChatPreset = ({ modeId, deepResearch = false, thinkLonger = false, length = 'auto' }) => {
    setMode(modeId);
    setIsDeepResearch(deepResearch);
    setIsThinkLonger(thinkLonger);
    setResponseLength(length);
    setMessages([]);
    setInput('');
    setAttachedFiles([]);
    setIsModePopupOpen(false);
  };

  const toggleSourceActivation = (entryId) => {
    setSourceActivationMap((prev) => ({
      ...prev,
      [entryId]: prev[entryId] === false,
    }));
  };

  const shellColumns = [];
  if (!isAlloySidebarCollapsed) shellColumns.push('minmax(0, 0.62fr)');
  if (showSourcesPanel) shellColumns.push('minmax(0, 0.85fr)');
  shellColumns.push('minmax(0, 1fr)');
  if (showBuildPanel) shellColumns.push('minmax(0, 0.85fr)');

  return (
    <div className="iris-shell" style={{ gridTemplateColumns: shellColumns.join(' ') }}>
      {!isAlloySidebarCollapsed && (
        <aside className="iris-sidebar">
          <div className="sidebar-brand">
            <div className="iris-icon-badge" aria-hidden="true">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <strong>RAZONET</strong>
              <span>Autonomous reasoning core</span>
            </div>
          </div>

          <button type="button" className="sidebar-new-chat-btn" onClick={() => setIsModePopupOpen(true)}>
            <Plus className="w-4 h-4" /> New chat
          </button>

          <div className="sidebar-search-wrap">
            <Search className="w-4 h-4" />
            <input
              type="text"
              className="sidebar-search-input"
              placeholder="Search chats"
              value={omniboxQuery}
              onChange={(event) => setOmniboxQuery(event.target.value)}
            />
          </div>

          {omniboxQuery.trim() && filteredUserHistory.length > 0 && (
            <div className="history-suggestions sidebar-suggestions">
              {filteredUserHistory.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className="history-suggestion-btn"
                  onClick={() => {
                    setInput(entry.text);
                    setOmniboxQuery('');
                  }}
                >
                  {entry.text.slice(0, 120)}
                </button>
              ))}
            </div>
          )}

          <section className="sidebar-section">
            <h3 className="sidebar-section-title">RAZONET Stack</h3>
            <div className="sidebar-feature-list">
              <button type="button" className="sidebar-feature-btn">F.L.U.X Gateway</button>
              <button type="button" className="sidebar-feature-btn">STM S1 Sprinter</button>
              <button type="button" className="sidebar-feature-btn">STM S2 Auditor</button>
              <button type="button" className="sidebar-feature-btn">STM S3 Librarian</button>
              <button type="button" className="sidebar-feature-btn">STM S4 Architect</button>
            </div>
          </section>

          <section className="sidebar-section">
            <h3 className="sidebar-section-title">Recent chats</h3>
            <div className="sidebar-history-list">
              {recentUserHistory.length === 0 && (
                <p className="sidebar-empty-state">No chat history yet.</p>
              )}
              {recentUserHistory.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className="sidebar-history-btn"
                  onClick={() => setInput(entry.text)}
                >
                  {entry.text.slice(0, 80)}
                </button>
              ))}
            </div>
          </section>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="settings-open-btn sidebar-clear-btn"
            title="AI settings"
          >
            <Sparkles className="w-4 h-4" />
            AI Settings
          </button>
        </aside>
      )}

      {showSourcesPanel && (
        <aside className="workspace-side-panel workspace-sources-panel">
          <div className="workspace-drawer-header">
            <h3>Sources</h3>
            <button type="button" onClick={() => setShowSourcesPanel(false)}>Hide</button>
          </div>
          <div className="workspace-drawer-search-wrap">
            <input
              type="text"
              value={sourceQuery}
              onChange={(event) => setSourceQuery(event.target.value)}
              placeholder="Filter files, anchors, docs"
            />
          </div>
          <div className="workspace-drawer-content">
            {filteredSourceEntries.length === 0 && (
              <p className="workspace-empty-state">No sources yet. Add files or ask with transparency enabled.</p>
            )}
            {filteredSourceEntries.map((entry) => {
              const active = sourceActivationMap[entry.id] !== false;
              return (
                <button
                  key={entry.id}
                  type="button"
                  className={`workspace-source-item ${active ? 'active' : ''}`}
                  onClick={() => toggleSourceActivation(entry.id)}
                >
                  <strong>{entry.name}</strong>
                  <span>{entry.kind} · msg {entry.messageId}</span>
                </button>
              );
            })}
          </div>
        </aside>
      )}

      <div className="iris-chat-column">
        <div className="workspace-toolbar">
          <button
            type="button"
            className={`workspace-toolbar-btn ${showSourcesPanel ? 'active' : ''}`}
            onClick={() => setShowSourcesPanel((prev) => !prev)}
          >
            Sources
          </button>
          <button
            type="button"
            className={`workspace-toolbar-btn ${showBuildPanel ? 'active' : ''}`}
            onClick={() => setShowBuildPanel((prev) => !prev)}
          >
            Build
          </button>
          <span className="workspace-toolbar-meta">Active sources: {activeSourceEntries.length}</span>
        </div>

        {statusToasts.length > 0 && (
          <div className="status-toast-stack" aria-live="polite">
            {statusToasts.map((toast) => (
              <div key={toast.id} className="status-toast">
                {toast.text}
              </div>
            ))}
          </div>
        )}

        {transformerStatus.state === 'loading' && (
          <div className="transformer-loading-bar">
            <div className="transformer-loading-fill" />
            <span>Downloading Brain...</span>
          </div>
        )}

        <div
          className="messages-area"
          onScroll={noteReadingActivity}
          onMouseMove={noteReadingActivity}
          onTouchMove={noteReadingActivity}
          onKeyDown={noteReadingActivity}
          tabIndex={0}
        >
          {messages.length === 0 && (
            <div className="iris-greeting-state">
              <h1>How can I help?</h1>
              <p>What are you working on today?</p>
              <div className="greeting-actions">
                <button type="button" onClick={() => setInput('Help me plan this project step by step.')}>Project plan</button>
                <button type="button" onClick={() => setInput('Can you help me debug this issue?')}>Debug issue</button>
                <button type="button" onClick={() => setInput('Write this feature with clean code and tests.')}>Build feature</button>
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'ai' ? (
                  <div className="iris-icon-badge" aria-hidden="true">
                    <Sparkles className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="user-icon-badge" aria-hidden="true">U</div>
                )}
              </div>
              <div className="message-content">
                <p>{msg.text}</p>
                {msg.role === 'ai' && msg.transparencyReport && showTransparency && (
                  <div className="transparency-panel">
                    <div className="transparency-header">Thought pipeline</div>
                    <div className="transparency-chip-row">
                      <span className="transparency-chip">Source: {msg.transparencyReport.responseSource}</span>
                      <span className="transparency-chip">Mode: {msg.transparencyReport.mode}</span>
                      {msg.transparencyReport.routing && (
                        <>
                          <span className="transparency-chip">Tier: {String(msg.transparencyReport.routing.tier || '').toUpperCase()}</span>
                          <span className="transparency-chip">Model: {msg.transparencyReport.routing.modelB}B {String(msg.transparencyReport.routing.quantization || '').toUpperCase()}</span>
                          <span className="transparency-chip">Cores: {msg.transparencyReport.routing.coreCount}</span>
                        </>
                      )}
                      {Array.isArray(msg.transparencyReport.activeTools) && msg.transparencyReport.activeTools.map((tool) => (
                        <span key={tool} className="transparency-chip">Tool: {tool}</span>
                      ))}
                    </div>
                    {Array.isArray(msg.transparencyReport.activeModules) && msg.transparencyReport.activeModules.length > 0 ? (
                      <div className="transparency-module-list">
                        {msg.transparencyReport.activeModules.map((module) => (
                          <div key={module.id} className="transparency-module-item">
                            <strong>{module.id} {module.title}</strong>
                            <span>{module.note}</span>
                            {module.artifacts?.validationTags && (
                              <div className="transparency-artifact-list">
                                {module.artifacts.validationTags.map((tag) => (
                                  <span key={tag} className="transparency-artifact-chip">{tag}</span>
                                ))}
                              </div>
                            )}
                            {module.artifacts?.logicProof && (
                              <div className="transparency-artifact-block">
                                {module.artifacts.logicProof.map((line) => (
                                  <div key={line}>{line}</div>
                                ))}
                              </div>
                            )}
                            {module.artifacts?.summaryMap && (
                              <div className="transparency-artifact-block">
                                <div>Focus: {(module.artifacts.summaryMap.focus || []).join(', ') || 'none'}</div>
                                <div>Source anchor: {module.artifacts.summaryMap.sourceAnchor}</div>
                                <div>Prompt length: {module.artifacts.summaryMap.promptLength}</div>
                              </div>
                            )}
                            {module.artifacts?.scrubbedLog && (
                              <div className="transparency-artifact-block">{module.artifacts.scrubbedLog}</div>
                            )}
                            {module.artifacts?.optimizationLayer && (
                              <div className="transparency-artifact-block">
                                {module.artifacts.optimizationLayer.map((line) => (
                                  <div key={line}>{line}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="transparency-empty">No STM modules were needed for this answer.</div>
                    )}
                    {Array.isArray(msg.transparencyReport.stageOrder) && msg.transparencyReport.stageOrder.length > 0 && (
                      <div className="transparency-artifact-block">
                        <strong>Stage order</strong>
                        <div className="transparency-artifact-list">
                          {msg.transparencyReport.stageOrder.map((stageId) => (
                            <span key={stageId} className="transparency-artifact-chip">{stageId}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {Array.isArray(msg.transparencyReport.thoughtTrace) && msg.transparencyReport.thoughtTrace.length > 0 && (
                      <div className="transparency-artifact-block">
                        <strong>Thought trace</strong>
                        {msg.transparencyReport.thoughtTrace.map((line, index) => (
                          <div key={`${msg.id}-thought-${index}`}>{line}</div>
                        ))}
                      </div>
                    )}
                    <div className="transparency-contract">{msg.transparencyReport.outputContract}</div>
                  </div>
                )}
                {msg.role === 'user' && Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                  <div className="attachment-row">
                    {msg.attachments.map((name) => (
                      <span key={name} className="attachment-chip">
                        <Paperclip className="w-3 h-3" /> {name}
                      </span>
                    ))}
                  </div>
                )}
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>

                {msg.role === 'ai' && (
                  <div className="message-hover-actions">
                    <button type="button" className="message-action-btn" onClick={() => handleRetry(msg)} title="Retry">
                      <RotateCcw className="w-3 h-3" /> Retry
                    </button>
                    <button
                      type="button"
                      className={`message-action-btn ${msg.reaction === 'like' ? 'active' : ''}`}
                      onClick={() => handleReaction(msg.id, 'like')}
                      title="Like"
                    >
                      <ThumbsUp className="w-3 h-3" /> Like
                    </button>
                    <button
                      type="button"
                      className={`message-action-btn ${msg.reaction === 'dislike' ? 'active' : ''}`}
                      onClick={() => handleReaction(msg.id, 'dislike')}
                      title="Dislike"
                    >
                      <ThumbsDown className="w-3 h-3" /> Dislike
                    </button>
                    <button type="button" className="message-action-btn" onClick={() => handleCopy(msg.text)} title="Copy">
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                    {msg.metrics && (
                      <div
                        className="timing-chip"
                        onMouseEnter={() => setHoveredTimingId(msg.id)}
                        onMouseLeave={() => setHoveredTimingId(null)}
                      >
                        <Clock3 className="w-3 h-3" /> Timing
                        {hoveredTimingId === msg.id && (
                          <div className="timing-tooltip">
                            <div>Time to first chunk: {msg.metrics.firstChunkMs}ms</div>
                            <div>Time to first token: {(msg.metrics.firstTokenMs / 1000).toFixed(3)}s</div>
                            <div>Time to first summary token: {(msg.metrics.summaryTokenMs / 1000).toFixed(3)}s</div>
                            <div>Response time: {(msg.metrics.responseMs / 1000).toFixed(3)}s</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message ai">
              <div className="message-avatar">
                <div className="iris-icon-badge" aria-hidden="true">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="message-content">
                <div className="loading-inline">
                  <div className="loading-swirl" aria-label="RAZONET thinking">
                    <div className="swirl-ring"></div>
                    <div className="swirl-inner"></div>
                  </div>
                  <span>RAZONET is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {pendingUndo && (
          <div className="pending-undo-bar" role="status" aria-live="polite">
            <span className="pending-undo-text">{pendingUndo.summary}</span>
            <div className="pending-undo-actions">
              <button
                type="button"
                className="pending-undo-keep"
                onClick={keepPendingUndo}
              >
                Keep
              </button>
              <button
                type="button"
                className="pending-undo-btn"
                onClick={undoPendingUndo}
              >
                Undo
              </button>
            </div>
          </div>
        )}

        <form ref={inputFormRef} onSubmit={handleSendMessage} className="input-area">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={(event) => {
              const files = Array.from(event.target.files || []);
              setAttachedFiles(files);
            }}
          />

          <div className="composer-top-row">
            <button
              type="button"
              className="composer-inline-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Attach files"
            >
              <Paperclip className="w-4 h-4" /> Files
            </button>

            <button
              type="button"
              className={`tool-chip-btn ${isSearchWeb ? 'active' : ''}`}
              onClick={() => setIsSearchWeb((prev) => !prev)}
              title="Search Web"
            >
              Search Web
            </button>

            <button
              type="button"
              className={`tool-chip-btn ${isDeepResearch ? 'active' : ''}`}
              onClick={() => setIsDeepResearch((prev) => !prev)}
              title="Deep Research"
            >
              Deep Research
            </button>

            <button
              type="button"
              className={`tool-chip-btn ${isThinkLonger ? 'active' : ''}`}
              onClick={() => setIsThinkLonger((prev) => !prev)}
              title="Think longer"
            >
              Think longer
            </button>

            <div className="length-tools" role="group" aria-label="Response length tools">
              <button
                type="button"
                className={`length-tool-btn ${responseLength === 'shorter' ? 'active' : ''}`}
                onClick={() => setResponseLength('shorter')}
              >
                Shorter
              </button>
              <button
                type="button"
                className={`length-tool-btn ${responseLength === 'auto' ? 'active' : ''}`}
                onClick={() => setResponseLength('auto')}
              >
                Auto
              </button>
              <button
                type="button"
                className={`length-tool-btn ${responseLength === 'longer' ? 'active' : ''}`}
                onClick={() => setResponseLength('longer')}
              >
                Longer
              </button>
            </div>

            <label className="inline-select-wrap" title="Response mode">
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value)}
                className="inline-select"
              >
                {modeOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className={`tool-chip-btn ${showTransparency ? 'active' : ''}`}
              onClick={() => setShowTransparency((prev) => !prev)}
              title="Toggle thought pipeline transparency"
            >
              Transparency {showTransparency ? 'ON' : 'OFF'}
            </button>
          </div>

          {attachedFiles.length > 0 && (
            <div className="attachment-row composer-attachments">
              {attachedFiles.map((file) => (
                <span key={file.name} className="attachment-chip">
                  <Paperclip className="w-3 h-3" /> {file.name}
                </span>
              ))}
            </div>
          )}

          <div className="composer-input-row">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask RAZONET anything..."
              disabled={isLoading}
              className="chat-input"
            />
            <span className="composer-token-count">{estimateTokens(input)} tok</span>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="send-btn"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {showBuildPanel && (
        <aside className="workspace-side-panel workspace-build-panel">
          <div className="workspace-drawer-header">
            <h3>Build</h3>
            <button type="button" onClick={() => setShowBuildPanel(false)}>Hide</button>
          </div>
          <div className="build-preview-tools" role="group" aria-label="Build preview mode">
            <button
              type="button"
              className={buildPreviewMode === 'render' ? 'active' : ''}
              onClick={() => setBuildPreviewMode('render')}
            >
              Render
            </button>
            <button
              type="button"
              className={buildPreviewMode === 'code' ? 'active' : ''}
              onClick={() => setBuildPreviewMode('code')}
            >
              Code
            </button>
          </div>
          <div className="workspace-drawer-content build-version-list">
            {buildVersions.length === 0 && (
              <p className="workspace-empty-state">No build versions yet. Generate a response first.</p>
            )}
            {buildVersions.map((version) => (
              <button
                key={version.id}
                type="button"
                className={`workspace-build-item ${version.id === selectedBuildVersionId ? 'active' : ''}`}
                onClick={() => setSelectedBuildVersionId(version.id)}
              >
                <strong>{version.versionLabel}</strong>
                <span>{new Date(version.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </button>
            ))}
          </div>
          {selectedBuildVersion && (
            <div className="build-preview-pane">
              <div className="build-preview-meta">
                <span>Source: {selectedBuildVersion.source}</span>
                {selectedBuildVersion.contract && <span>Contract: {selectedBuildVersion.contract}</span>}
              </div>
              <pre>
                {buildPreviewMode === 'code'
                  ? selectedBuildVersion.codeSnapshot
                  : `Preview mode will render richer output in the next phase.\n\n${selectedBuildVersion.text}`}
              </pre>
            </div>
          )}
        </aside>
      )}

      {isModePopupOpen && (
        <div className="iris-modal-backdrop" onClick={() => setIsModePopupOpen(false)}>
          <div className="iris-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Start new chat</h3>
            <p>Pick a RAZONET tier preset first.</p>
            <div className="iris-modal-grid">
              <button type="button" onClick={() => startNewChatPreset({ modeId: 'pro', deepResearch: true, thinkLonger: true, length: 'longer' })}>The Council (Pro 3–5)</button>
              <button type="button" onClick={() => startNewChatPreset({ modeId: 'plus', deepResearch: false, thinkLonger: false, length: 'auto' })}>Stable Workhorse (Plus)</button>
              <button type="button" onClick={() => startNewChatPreset({ modeId: 'pro', deepResearch: true, thinkLonger: true, length: 'longer' })}>Data Computer Mode</button>
              <button type="button" onClick={() => startNewChatPreset({ modeId: 'plus', deepResearch: false, thinkLonger: false, length: 'auto' })}>Coding Mode</button>
            </div>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <div className="iris-modal-backdrop" onClick={() => setIsSettingsOpen(false)}>
          <div className="iris-modal" onClick={(event) => event.stopPropagation()}>
            <h3>AI Settings</h3>
            <p>Customize personality and chat behavior.</p>
            <textarea
              value={personalityDescription}
              onChange={(event) => setPersonalityDescription(event.target.value)}
              className="personality-description-box modal-personality"
              rows={4}
              placeholder="Describe RAZONET tone and behavior."
            />
            <div className="settings-summary-row">
              <span className={`settings-pill ${isSearchWeb ? 'active' : ''}`}>Search Web {isSearchWeb ? 'ON' : 'OFF'}</span>
              <span className={`settings-pill ${isDeepResearch ? 'active' : ''}`}>Deep Research {isDeepResearch ? 'ON' : 'OFF'}</span>
              <span className={`settings-pill ${isThinkLonger ? 'active' : ''}`}>Think longer {isThinkLonger ? 'ON' : 'OFF'}</span>
              <span className="settings-pill">Length: {responseLength}</span>
            </div>
            <div className="settings-modal-actions">
              <button type="button" className="modal-secondary-btn" onClick={clearChat}>Clear chat</button>
              <button type="button" className="modal-primary-btn" onClick={() => setIsSettingsOpen(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
