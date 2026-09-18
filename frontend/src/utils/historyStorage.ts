import { SavedHistoryItem } from '../types.ts';

const STORAGE_KEY = 'career_copilot_session_history';

export function getSavedHistory(): SavedHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultHistory();
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load history from storage:', err);
    return getDefaultHistory();
  }
}

export function saveHistoryItem(item: Omit<SavedHistoryItem, 'id' | 'timestamp'>): SavedHistoryItem {
  const newItem: SavedHistoryItem = {
    ...item,
    id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  try {
    const existing = getSavedHistory();
    const updated = [newItem, ...existing].slice(0, 30); // keep up to 30 items
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save history item:', err);
  }

  return newItem;
}

export function deleteHistoryItem(id: string): SavedHistoryItem[] {
  try {
    const existing = getSavedHistory();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to delete history item:', err);
    return [];
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear history:', err);
  }
}

export const clearSavedHistory = clearAllHistory;

function getDefaultHistory(): SavedHistoryItem[] {
  return [
    {
      id: 'default_1',
      type: 'resume_scan',
      title: 'Senior Solutions Architect Resume Scan',
      subtitle: 'Jane_Doe_Solutions_Architect.pdf (84% Match)',
      score: 84,
      timestamp: 'Today, 9:30 AM',
      data: { role: 'Senior Solutions Architect' },
    },
    {
      id: 'default_2',
      type: 'interview_session',
      title: 'Google Bar Raiser Mock Interview',
      subtitle: 'Alex Rivera • 4 turns completed (88% Score)',
      score: 88,
      timestamp: 'Yesterday, 4:15 PM',
      data: { company: 'Google', role: 'Staff Software Engineer' },
    },
    {
      id: 'default_3',
      type: 'jd_match',
      title: 'Amazon AWS Principal SA Job Description Match',
      subtitle: '79% Match • Moderate Disqualification Risk',
      score: 79,
      timestamp: '2 days ago',
      data: { company: 'Amazon AWS' },
    },
  ];
}
