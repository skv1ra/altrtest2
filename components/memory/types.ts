export const memoryCategories = ["Communication Style", "Frequent Phrases", "Important Context", "Relationships", "Typical Decisions"] as const;

export type MemoryCategory = typeof memoryCategories[number];

export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  title: string;
  description: string;
  confidence: number;
  lastUpdated: string;
  source: string;
  isActive: boolean;
}

export type MemoryFilter = "All" | MemoryCategory;
