import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import {renderToString} from 'react-dom/server';

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

test('home renders with malformed local settings and Firebase unconfigured', async () => {
  const storage = new MemoryStorage();
  storage.setItem('pairplay_dark_mode', '{not valid JSON');
  Object.defineProperty(globalThis, 'localStorage', {value: storage, configurable: true});

  const {default: App} = await import('./App.tsx');
  const html = renderToString(<App />);

  assert.match(html, /Two players\./);
  assert.match(html, /Play on One Device/);
  assert.match(html, /Online — Two Devices/);
  assert.ok(html.length > 1_000, 'expected the home screen, not an empty React root');
});
