import { ExpoRoot } from 'expo-router';
import React from 'react';

// ─────────────────────────────────────────────
// Main App Component
// ─────────────────────────────────────────────
// Note: Your project currently uses Expo Router for navigation 
// ("main": "expo-router/entry" in package.json).
//
// If you ever need to wrap your entire app with global providers 
// (like Redux Provider, Theme Provider, etc.) before the router loads,
// you can change your package.json "main" to "App.js" and add them here.

export default function App() {
  // Pass the required context to the Expo Router
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}
