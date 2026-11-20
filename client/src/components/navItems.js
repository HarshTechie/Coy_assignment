import { Heart, House, Sparkles } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/home', label: 'Home', icon: House },
  { to: '/discover', label: 'Discover', icon: Sparkles },
  { to: '/matches', label: 'Matches', icon: Heart, badgeKey: 'matches' },
];
