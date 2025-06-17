"use client";

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useTheme } from '../contexts/ThemeContext';

export default function AdminPanel() {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const seedDatabase = useMutation(api.seedData.seedDatabase);
  const clearDatabase = useMutation(api.seedData.clearDatabase);
  const getDatabaseStats = useMutation(api.seedData.getDatabaseStats);

  const handleSeedDatabase = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const result = await seedDatabase({});
      setMessage(`✅ ${result.message}`);
      console.log('🌱 Seeding result:', result);
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
      console.error('❌ Seeding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    
    try {
      const result = await clearDatabase({});
      setMessage(`🗑️ ${result.message}`);
      console.log('🗑️ Clear result:', result);
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
      console.error('❌ Clear error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetStats = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const stats = await getDatabaseStats({});
      setMessage(`📊 Database Stats: ${stats.folders} folders, ${stats.projects} projects, ${stats.flows} flows, ${stats.nodes} nodes, ${stats.edges} edges`);
      console.log('📊 Database stats:', stats);
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
      console.error('❌ Stats error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-12 h-12 rounded-full text-white font-bold text-lg shadow-lg hover:brightness-110 transition-all z-50"
        style={{ backgroundColor: theme.colors.accent.danger }}
        title="Admin Panel"
      >
        ⚙️
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 rounded-lg shadow-xl border z-50 w-96"
         style={{ 
           backgroundColor: theme.colors.background.elevated,
           borderColor: theme.colors.border.primary 
         }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold" style={{ color: theme.colors.text.primary }}>
          🔧 Admin Panel
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-xl hover:brightness-110"
          style={{ color: theme.colors.text.secondary }}
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleSeedDatabase}
          disabled={isLoading}
          className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110 disabled:opacity-50"
          style={{
            backgroundColor: theme.colors.accent.success,
            color: theme.colors.text.inverse
          }}
        >
          {isLoading ? '⏳ Loading...' : '🌱 Seed Database'}
        </button>

        <button
          onClick={handleGetStats}
          disabled={isLoading}
          className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110 disabled:opacity-50"
          style={{
            backgroundColor: theme.colors.accent.primary,
            color: theme.colors.text.inverse
          }}
        >
          {isLoading ? '⏳ Loading...' : '📊 Get Stats'}
        </button>

        <button
          onClick={handleClearDatabase}
          disabled={isLoading}
          className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110 disabled:opacity-50"
          style={{
            backgroundColor: theme.colors.accent.danger,
            color: theme.colors.text.inverse
          }}
        >
          {isLoading ? '⏳ Loading...' : '🗑️ Clear Database'}
        </button>
      </div>

      {message && (
        <div className="mt-4 p-3 rounded-lg text-sm border"
             style={{ 
               backgroundColor: theme.colors.background.secondary,
               borderColor: theme.colors.border.secondary,
               color: theme.colors.text.primary
             }}>
          {message}
        </div>
      )}

      <div className="mt-4 text-xs" style={{ color: theme.colors.text.secondary }}>
        💡 Use this panel to seed the database with sample data or check current stats.
      </div>
    </div>
  );
} 