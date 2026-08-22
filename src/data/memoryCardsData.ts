export interface MemoryCardType {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export const MEMORY_CARD_TYPES: MemoryCardType[] = [
  { id: 'heart', name: 'Heart', emoji: '💖', color: 'from-pink-500 to-rose-500' },
  { id: 'sparkles', name: 'Sparkles', emoji: '✨', color: 'from-amber-400 to-yellow-500' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', color: 'from-orange-500 to-amber-600' },
  { id: 'gamepad', name: 'Gamepad', emoji: '🎮', color: 'from-purple-500 to-indigo-600' },
  { id: 'coffee', name: 'Coffee', emoji: '☕', color: 'from-amber-700 to-yellow-800' },
  { id: 'beach', name: 'Beach', emoji: '🏖️', color: 'from-cyan-400 to-blue-500' },
  { id: 'music', name: 'Music', emoji: '🎵', color: 'from-violet-500 to-purple-600' },
  { id: 'cake', name: 'Cake', emoji: '🎂', color: 'from-pink-400 to-rose-400' },
  { id: 'cat', name: 'Cat', emoji: '🐱', color: 'from-orange-400 to-amber-500' },
  { id: 'dog', name: 'Dog', emoji: '🐶', color: 'from-yellow-600 to-amber-700' },
  { id: 'camera', name: 'Camera', emoji: '📸', color: 'from-emerald-400 to-teal-500' },
  { id: 'rocket', name: 'Rocket', emoji: '🚀', color: 'from-indigo-500 to-blue-600' },
];
