import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Key, Ban, AlertTriangle, LogOut, Trash2, Activity, Cpu, Crown, UserX, Check, Home, UserPlus, X, Inbox, MessageSquareText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from 'utils';
import { session, storage } from '../Components/Storage/clientStorage.js';
import { reportStorage } from '../Components/Storage/reportStorage.js';
import GlassCard from '../Components/UI/GlassCard.js';
import NeonButton from '../Components/UI/NeonButton.js';
import AnimatedBackground from '../Components/UI/AnimatedBackground.js';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [accessCodes, setAccessCodes] = useState([]);
  const [banList, setBanList] = useState([]);
  const [notices, setNotices] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [reportInbox, setReportInbox] = useState([]);
  const [reportReview, setReportReview] = useState([]);
  const [stats, setStats] = useState({ fps: 60, ram: 512, activeUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.isAdmin()) {
      navigate(createPageUrl('Landing'));
      return;
    }
    setIsOwner(session.isOwner());
    loadAdminData();
    measurePerformance();
    
    // Poll for active sessions every 3 seconds
    const interval = setInterval(() => {
      loadActiveSessions();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  const loadAdminData = async () => {
    try {
      await storage.init();
      const allUsers = storage.getAllUsers();
      const pending = storage.getPendingUsers();
      setUsers(allUsers);
      setPendingUsers(pending);
      setStats(prev => ({ ...prev, activeUsers: allUsers.length }));
      loadActiveSessions();
      loadReports();
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveSessions = () => {
    try {
      const sessions = JSON.parse(localStorage.getItem('nexus_active_sessions') || '[]');
      // Filter sessions active in last 30 seconds
      const now = Date.now();
      const active = sessions.filter(s => now - s.lastSeen < 30000);
      setActiveSessions(active);
      setStats(prev => ({ ...prev, activeUsers: active.length }));
    } catch (err) {
      console.error('Failed to load active sessions:', err);
    }
  };

  const loadReports = () => {
    try {
      setReportInbox(reportStorage.getInbox());
      setReportReview(reportStorage.getReviewQueue());
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  };

  const approveReport = (reportId) => {
    if (!confirm('Approve this report and move it to inbox?')) return;
    reportStorage.approveReport(reportId);
    loadReports();
  };

  const rejectReport = (reportId) => {
    if (!confirm('Delete this report from review?')) return;
    reportStorage.rejectReport(reportId);
    loadReports();
  };

  const resolveReport = (reportId) => {
    reportStorage.resolveReport(reportId);
    loadReports();
  };

  const exportReports = () => {
    const data = reportStorage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_bug_reports_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const measurePerformance = () => {
    const fps = Math.round(1000 / 16.67);
    const ram = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 512;
    setStats({ fps, ram, activeUsers: users.length || 0 });
  };

  const formatReportDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
  };

  const kickUser = (sessionId, email, targetRole) => {
    // Check permissions
    const currentRole = session.getRole();
    const canKick = currentRole === 'owner' || (currentRole === 'admin' && targetRole !== 'admin' && targetRole !== 'owner');
    
    if (!canKick) {
      alert('You do not have permission to kick this user.');
      return;
    }
    
    if (!confirm(`Kick user ${email}? This will immediately crash their page.`)) return;
    
    try {
      // Add to kick list that clients monitor
      const kickList = JSON.parse(localStorage.getItem('nexus_kick_list') || '[]');
      kickList.push({
        sessionId,
        email,
        timestamp: Date.now()
      });
      localStorage.setItem('nexus_kick_list', JSON.stringify(kickList));
      
      alert(`User ${email} has been kicked. Their page will crash immediately.`);
      
      // Clean up after 10 seconds
      setTimeout(() => {
        const currentList = JSON.parse(localStorage.getItem('nexus_kick_list') || '[]');
        const filtered = currentList.filter(k => k.sessionId !== sessionId);
        localStorage.setItem('nexus_kick_list', JSON.stringify(filtered));
      }, 10000);
      
      loadActiveSessions();
    } catch (err) {
      console.error('Failed to kick user:', err);
    }
  };

  const banUser = async (user) => {
    const currentRole = session.getRole();
    
    // Show duration options for Admins, permanent for Owner
    if (currentRole === 'admin') {
      const duration = prompt(
        'Choose ban duration:\n' +
        '1 - 10 minutes\n' +
        '2 - 30 minutes\n' +
        '3 - 1 hour\n' +
        '4 - 6 hours\n' +
        '5 - 24 hours\n' +
        'Enter number (1-5):'
      );
      
      if (!duration) return; // Cancelled
      
      const durationMap = {
        '1': { minutes: 10, label: '10 minutes' },
        '2': { minutes: 30, label: '30 minutes' },
        '3': { minutes: 60, label: '1 hour' },
        '4': { minutes: 360, label: '6 hours' },
        '5': { minutes: 1440, label: '24 hours' }
      };
      
      const selected = durationMap[duration];
      if (!selected) {
        alert('Invalid selection. Ban cancelled.');
        return;
      }
      
      if (!confirm(`Ban user ${user.code} for ${selected.label}?`)) return;
      
      try {
        storage.banUser(user.code, selected.minutes);
        alert(`User ${user.code} has been banned for ${selected.label}.`);
        loadAdminData();
      } catch (err) {
        console.error('Failed to ban user:', err);
      }
    } else {
      // Owner - permanent ban
      if (!confirm(`Permanently ban user ${user.code}? They will not be able to login.`)) return;
      try {
        storage.banUser(user.code, false);
        alert(`User ${user.code} has been permanently banned.`);
        loadAdminData();
      } catch (err) {
        console.error('Failed to ban user:', err);
      }
    }
  };

  const unbanUser = async (user) => {
    try {
      storage.unbanUser(user.code);
      alert(`User ${user.code} has been unbanned.`);
      loadAdminData();
    } catch (err) {
      console.error('Failed to unban:', err);
    }
  };

  const approveUser = async (user) => {
    try {
      storage.approveUser(user.code);
      alert(`User ${user.username || user.code} has been approved!`);
      loadAdminData();
    } catch (err) {
      console.error('Failed to approve user:', err);
    }
  };

  const rejectUser = async (user) => {
    if (!confirm(`Reject user ${user.username || user.code}? This will delete their account.`)) return;
    try {
      storage.rejectUser(user.code);
      alert(`User ${user.username || user.code} has been rejected and removed.`);
      loadAdminData();
    } catch (err) {
      console.error('Failed to reject user:', err);
    }
  };

  const handleLogout = () => {
    session.clear();
    navigate(createPageUrl('Landing'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-white/50">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground type="gradient" accentColor="#ff0055" />
      
      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <motion.header 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-white/50">Nexus management console</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NeonButton variant="ghost" onClick={() => navigate(createPageUrl('Dashboard'))}>
                <Home className="w-4 h-4 mr-2" />
                Home
              </NeonButton>
              <NeonButton variant="ghost" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </NeonButton>
            </div>
          </div>
        </motion.header>

        {/* Pending Approvals - Admin & Owner */}
        {pendingUsers.length > 0 && (isOwner || session.isAdmin()) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 }}
            className="mb-6"
          >
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center gap-3 mb-4">
                <UserPlus className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-semibold text-white">Pending Approvals</h2>
                <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                  {pendingUsers.length} Waiting
                </span>
              </div>
              <div className="space-y-3">
                {pendingUsers.map((user) => (
                  <div 
                    key={user.code}
                    className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{user.username || 'Unknown User'}</p>
                        <p className="text-xs text-white/50 font-mono">{user.code}</p>
                        <p className="text-xs text-white/40 mt-1">
                          Joined: {new Date().toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <NeonButton 
                          variant="primary" 
                          size="sm" 
                          onClick={() => approveUser(user)}
                          className="bg-green-500/20 hover:bg-green-500/30 text-green-400"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </NeonButton>
                        <NeonButton 
                          variant="danger" 
                          size="sm" 
                          onClick={() => rejectUser(user)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </NeonButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* IRIS Report Inbox - Admin & Owner */}
        {(isOwner || session.isAdmin()) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="mb-6"
          >
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Inbox className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-semibold text-white">IRIS Report Inbox</h2>
                  <span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                    {reportInbox.length} Reports
                  </span>
                </div>
                <NeonButton variant="ghost" size="sm" onClick={exportReports}>
                  <MessageSquareText className="w-4 h-4 mr-2" />
                  Export JSON
                </NeonButton>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="text-sm text-white/70">Approved Reports</h3>
                  {reportInbox.length === 0 && (
                    <p className="text-white/40 text-sm">No reports yet.</p>
                  )}
                  {reportInbox.map((report) => (
                    <div key={report.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-medium">{report.title || 'Untitled Report'}</p>
                          <p className="text-xs text-white/50">{report.description || report.message || 'No description'}</p>
                          <p className="text-xs text-white/40 mt-1">Type: {report.classification?.type || 'unknown'} • {formatReportDate(report.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <NeonButton variant="ghost" size="sm" onClick={() => resolveReport(report.id)}>
                            <Check className="w-4 h-4 mr-1" />
                            Resolve
                          </NeonButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <h3 className="text-sm text-white/70">Needs Review (Possible Junk)</h3>
                    <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                      {reportReview.length}
                    </span>
                  </div>
                  {reportReview.length === 0 && (
                    <p className="text-white/40 text-sm">No items in review.</p>
                  )}
                  {reportReview.map((report) => (
                    <div key={report.id} className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-medium">{report.title || 'Untitled Report'}</p>
                          <p className="text-xs text-white/50">{report.description || report.message || 'No description'}</p>
                          <p className="text-xs text-white/40 mt-1">Confidence: {Math.round((report.classification?.confidence || 0) * 100)}%</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <NeonButton variant="primary" size="sm" onClick={() => approveReport(report.id)}>
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </NeonButton>
                          <NeonButton variant="danger" size="sm" onClick={() => rejectReport(report.id)}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </NeonButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Active Sessions - Admin & Owner */}
        {(isOwner || session.isAdmin()) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6"
          >
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-semibold text-white">Active Sessions</h2>
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                  {activeSessions.length} Online
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activeSessions.map((session) => {
                  const canKickThisUser = isOwner || (session.role !== 'admin' && session.role !== 'owner');
                  return (
                    <div 
                      key={session.sessionId}
                      className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm font-medium">{session.email || 'Anonymous'}</p>
                          {session.role && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              session.role === 'owner' ? 'bg-[#ffc6ff]/20 text-[#ffc6ff]' :
                              session.role === 'admin' ? 'bg-[#bdb2ff]/20 text-[#bdb2ff]' :
                              'bg-[#ffadad]/20 text-[#ffadad]'
                            }`}>
                              {session.role.charAt(0).toUpperCase() + session.role.slice(1)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/40">Session: {session.sessionId.substring(0, 12)}...</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                          Online
                        </span>
                        {canKickThisUser ? (
                          <NeonButton 
                            variant="danger" 
                            size="sm" 
                            onClick={() => kickUser(session.sessionId, session.email, session.role)}
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Kick
                          </NeonButton>
                        ) : (
                          <span className="px-3 py-1 rounded bg-white/5 text-white/40 text-xs">
                            Protected
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {activeSessions.length === 0 && (
                  <p className="text-white/40 text-sm text-center py-4">No active sessions</p>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Access Codes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center gap-3 mb-4">
                <Key className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Access Codes</h2>
              </div>
              <div className="space-y-3">
                {accessCodes.map((code) => (
                  <div 
                    key={code.id}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-mono text-sm">{code.code}</p>
                        <p className="text-xs text-white/50">
                          Used {code.usageCount || 0} times
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        code.isActive 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {code.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                ))}
                {accessCodes.length === 0 && (
                  <p className="text-white/40 text-sm text-center py-4">No access codes</p>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Ban List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center gap-3 mb-4">
                <Ban className="w-5 h-5 text-red-400" />
                <h2 className="text-lg font-semibold text-white">Ban List</h2>
              </div>
              <div className="space-y-3">
                {banList.map((ban) => (
                  <div 
                    key={ban.id}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-mono text-sm">{ban.identifier}</p>
                        <p className="text-xs text-white/50">{ban.reason || 'No reason provided'}</p>
                      </div>
                      <NeonButton variant="ghost" size="sm" onClick={() => unbanCode(ban.id)}>
                        <Trash2 className="w-3 h-3" />
                      </NeonButton>
                    </div>
                  </div>
                ))}
                {banList.length === 0 && (
                  <p className="text-white/40 text-sm text-center py-4">No banned users</p>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* User Management (Owner Only) */}
          {isOwner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <GlassCard className="p-6" hover={false}>
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-5 h-5 text-[#ffc6ff]" />
                  <h2 className="text-lg font-semibold text-white">User Management</h2>
                  <span className="px-2 py-1 rounded-full bg-[#ffc6ff]/20 text-[#ffc6ff] text-xs">Owner Only</span>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {users.map((user) => (
                    <div 
                      key={user.code}
                      className={`p-4 rounded-lg border ${
                        user.banned 
                          ? 'bg-red-500/10 border-red-500/20' 
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <p className="text-white font-mono text-sm">{user.code}</p>
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.role === 'owner' ? 'bg-[#ffc6ff]/20 text-[#ffc6ff]' :
                              user.role === 'admin' ? 'bg-[#bdb2ff]/20 text-[#bdb2ff]' :
                              user.verified ? 'bg-[#caffbf]/20 text-[#caffbf]' :
                              'bg-[#ffadad]/20 text-[#ffadad]'
                            }`}>
                              {user.role === 'owner' ? 'Owner' :
                               user.role === 'admin' ? 'Admin' :
                               user.verified ? 'Verified' : 'Guest'}
                            </span>
                            {user.banned && (
                              <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">
                                {(() => {
                                  const banInfo = storage.getBanInfo(user.code);
                                  if (!banInfo) return 'BANNED';
                                  if (banInfo.isPermanent) return 'BANNED (Permanent)';
                                  const minutesLeft = Math.ceil(banInfo.timeRemaining / 60000);
                                  return `BANNED (${minutesLeft}m left)`;
                                })()}
                              </span>
                            )}
                          </div>
                          {user.discordId && (
                            <p className="text-xs text-white/50 mt-1">Discord: {user.discordId}</p>
                          )}
                          {(() => {
                            const violations = storage.getViolationCount(user.code);
                            if (violations > 0) {
                              return (
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="px-2 py-1 rounded text-xs bg-orange-500/20 text-orange-400">
                                    ⚠️ {violations} Warning{violations !== 1 ? 's' : ''}
                                  </span>
                                  {isOwner && (
                                    <button
                                      onClick={() => {
                                        if (confirm(`Clear all warnings for ${user.code}?`)) {
                                          storage.clearViolations(user.code);
                                          loadAdminData();
                                        }
                                      }}
                                      className="text-xs text-white/50 hover:text-white"
                                    >
                                      Clear
                                    </button>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        <div className="flex items-center gap-2">
                          {!user.banned ? (
                            <>
                              <NeonButton 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => kickUser(user)}
                                className="text-orange-400 hover:text-orange-300"
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                Kick
                              </NeonButton>
                              <NeonButton 
                                variant="danger" 
                                size="sm" 
                                onClick={() => banUser(user)}
                                title={isOwner ? 'Ban permanently' : 'Choose ban duration'}
                              >
                                <Ban className="w-4 h-4 mr-1" />
                                {isOwner ? 'Ban' : 'Ban...'}
                              </NeonButton>
                            </>
                          ) : (
                            <NeonButton 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => unbanUser(user)}
                              className="text-green-400 hover:text-green-300"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Unban
                            </NeonButton>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <p className="text-white/40 text-sm text-center py-4">No users registered</p>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Global Notices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-semibold text-white">Global Notices</h2>
              </div>
              <div className="space-y-3">
                {notices.map((notice) => (
                  <div 
                    key={notice.id}
                    className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white text-sm">{notice.message}</p>
                        <p className="text-xs text-white/40 mt-1">
                          {notice.expiresAt ? `Expires: ${new Date(notice.expiresAt).toLocaleDateString()}` : 'No expiration'}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ml-3 ${
                        notice.isActive 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {notice.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                ))}
                {notices.length === 0 && (
                  <p className="text-white/40 text-sm text-center py-4">No global notices</p>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Performance Diagnostics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-semibold text-white">Site Diagnostics</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <Cpu className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.fps}</p>
                  <p className="text-xs text-white/50">FPS</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <Activity className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.ram}</p>
                  <p className="text-xs text-white/50">RAM (MB)</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <Users className="w-5 h-5 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
                  <p className="text-xs text-white/50">Est. Active</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-3 gap-4">
              <GlassCard className="p-4 text-center" hover={false}>
                <UserPlus className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{pendingUsers.length}</p>
                <p className="text-xs text-white/50">Pending Approval</p>
              </GlassCard>
              <GlassCard className="p-4 text-center" hover={false}>
                <Ban className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{banList.length}</p>
                <p className="text-xs text-white/50">Banned Users</p>
              </GlassCard>
              <GlassCard className="p-4 text-center" hover={false}>
                <Users className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{users.filter(u => u.approved).length}</p>
                <p className="text-xs text-white/50">Approved Users</p>
              </GlassCard>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-white/60 text-sm">
            <strong className="text-white">Privacy Notice:</strong> This dashboard shows only minimal metadata 
            (access codes, ban identifiers, site diagnostics). User settings, favorites, browsing history, and personal data 
            are stored client-side only and cannot be accessed from this panel. Admin code: 0915
          </p>
        </motion.div>
      </div>
    </div>
  );
}