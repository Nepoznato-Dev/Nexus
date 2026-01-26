import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

export default function DecoyScreen({ onDismiss, reason = 'idle' }) {
  const [decoyType, setDecoyType] = useState('classroom');

  // Only randomize once on mount
  useEffect(() => {
    const types = ['classroom', 'ixl'];
    setDecoyType(types[Math.floor(Math.random() * types.length)]);
  }, []);

  // Memoize key handler
  const handleKeyDown = useCallback((e) => {
    if (e.key === '`' || e.key === '~') {
      e.preventDefault();
      if (onDismiss) onDismiss();
    }
  }, [onDismiss]);

  // Only listen for boss key if in bosskey mode
  useEffect(() => {
    if (reason !== 'bosskey') return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [reason, handleKeyDown]);

  return (
    <div className="fixed inset-0 bg-white z-[9999] overflow-auto">
      {/* Dismiss hint - only show for boss key, not idle */}
      {reason === 'bosskey' && (
        <div className="absolute top-4 right-4 text-gray-400 text-xs opacity-50 hover:opacity-100 transition-opacity">
          Press ` again to dismiss
        </div>
      )}

      {decoyType === 'classroom' ? (
        <div className="min-h-screen bg-white">
          {/* Google Classroom Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
                <path d="M37 12H11C9.34 12 8 13.34 8 15V33C8 34.66 9.34 36 11 36H37C38.66 36 40 34.66 40 33V15C40 13.34 38.66 12 37 12Z" fill="#FFC107"/>
                <path d="M40 15V18L24 28L8 18V15L24 25L40 15Z" fill="#FFECB3"/>
              </svg>
              <h1 className="text-xl font-normal text-gray-700">Classroom</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </button>
            </div>
          </header>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="bg-blue-600 rounded-lg p-8 mb-6 text-white">
              <h2 className="text-2xl font-normal mb-2">English Language Arts</h2>
              <p className="text-blue-100">Mr. Johnson</p>
            </div>

            {/* Stream */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    MJ
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">Mr. Johnson</span>
                      <span className="text-gray-500 text-sm">posted a new assignment: Essay Draft</span>
                    </div>
                    <p className="text-gray-600 mb-4">Please submit your rough draft by Friday. Remember to include a thesis statement and at least 3 body paragraphs.</p>
                    <div className="flex gap-4 text-sm">
                      <button className="text-blue-600 hover:underline">View assignment</button>
                      <span className="text-gray-400">Due Friday, 11:59 PM</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                    MJ
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">Mr. Johnson</span>
                      <span className="text-gray-500 text-sm">added new material: Chapter 5 Reading</span>
                    </div>
                    <p className="text-gray-600">Read Chapter 5 and complete the comprehension questions.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    MJ
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">Mr. Johnson</span>
                      <span className="text-gray-500 text-sm">posted: Reminder about vocab quiz</span>
                    </div>
                    <p className="text-gray-600">Don't forget about tomorrow's vocabulary quiz on Chapter 4!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
          {/* IXL Header */}
          <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                IXL
              </div>
              <span className="text-gray-600">| Learning</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">SmartScore: 82</span>
            </div>
          </header>

          {/* Main Content */}
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="bg-white rounded-xl shadow-md p-8 mb-6">
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">8th grade Math</h1>
              <p className="text-gray-600">Complete today's recommended skills</p>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1">Solve linear equations</h3>
                    <p className="text-sm text-gray-500">Algebra • 15 questions</p>
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    76
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '76%' }}></div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1">Pythagorean theorem</h3>
                    <p className="text-sm text-gray-500">Geometry • 12 questions</p>
                  </div>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    92
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1">Multiply fractions</h3>
                    <p className="text-sm text-gray-500">Number sense • 18 questions</p>
                  </div>
                  <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                    64
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '64%' }}></div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1">Graph linear equations</h3>
                    <p className="text-sm text-gray-500">Algebra • 10 questions</p>
                  </div>
                  <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                    88
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Keep up the great work!</h3>
              <p className="text-blue-50">You've completed 4 skills this week. Try to finish 3 more to reach your goal.</p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden dismiss button for mouse users */}
      {reason === 'bosskey' && (
        <button
          onClick={onDismiss}
          className="fixed bottom-4 right-4 p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-lg opacity-70 hover:opacity-100 transition-opacity"
          title="Dismiss (or press ` key)"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
