/**
 * TodoWidget.js - Task and assignment tracker for students
 * Persists tasks to localStorage
 */

import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Calendar, BookOpen, AlertCircle } from 'lucide-react';

export default function TodoWidget() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');

  // Load tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nexus_todo_tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load tasks:', err);
      }
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('nexus_todo_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const task = {
      id: Date.now(),
      text: newTask,
      completed: false,
      priority: newTaskPriority,
      createdAt: new Date().toISOString()
    };

    setTasks([task, ...tasks]);
    setNewTask('');
    setNewTaskPriority('medium');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-400/50 bg-red-500/10';
      case 'medium': return 'border-yellow-400/50 bg-yellow-500/10';
      case 'low': return 'border-green-400/50 bg-green-500/10';
      default: return 'border-white/20 bg-white/5';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'medium': return <Calendar className="w-4 h-4 text-yellow-400" />;
      case 'low': return <BookOpen className="w-4 h-4 text-green-400" />;
      default: return null;
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="todo-widget h-full flex flex-col p-4">
      {/* Header with progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white/80">Tasks & Assignments</h3>
          {totalCount > 0 && (
            <span className="text-xs text-white/60">
              {completedCount}/{totalCount} done
            </span>
          )}
        </div>
        {totalCount > 0 && (
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-purple-400 h-full transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Add task form */}
      <form onSubmit={addTask} className="mb-4">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-blue-400/50"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setNewTaskPriority('high')}
            className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
              newTaskPriority === 'high'
                ? 'bg-red-500/30 text-red-300 border border-red-400/50'
                : 'bg-white/5 text-white/60 border border-white/20'
            }`}
          >
            High Priority
          </button>
          <button
            type="button"
            onClick={() => setNewTaskPriority('medium')}
            className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
              newTaskPriority === 'medium'
                ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/50'
                : 'bg-white/5 text-white/60 border border-white/20'
            }`}
          >
            Medium
          </button>
          <button
            type="button"
            onClick={() => setNewTaskPriority('low')}
            className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
              newTaskPriority === 'low'
                ? 'bg-green-500/30 text-green-300 border border-green-400/50'
                : 'bg-white/5 text-white/60 border border-white/20'
            }`}
          >
            Low
          </button>
        </div>
      </form>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-white/40">
            <BookOpen className="w-12 h-12 mb-2" />
            <p className="text-sm">No tasks yet. Add one above!</p>
          </div>
        )}

        {tasks.map(task => (
          <div
            key={task.id}
            className={`border rounded-lg p-3 transition-all ${getPriorityColor(task.priority)} ${
              task.completed ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start gap-2">
              <button
                onClick={() => toggleTask(task.id)}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-colors flex items-center justify-center ${
                  task.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-white/40 hover:border-white/60'
                }`}
              >
                {task.completed && <Check className="w-3 h-3 text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm text-white break-words ${
                    task.completed ? 'line-through text-white/60' : ''
                  }`}
                >
                  {task.text}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {getPriorityIcon(task.priority)}
                  <span className="text-xs text-white/40">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
