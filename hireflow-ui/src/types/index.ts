export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  plan: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  applicationCount?: number;
}

export interface Application {
  id: number;
  userId: number;
  company: string;
  role: string;
  status: ApplicationStatus;
  salary?: string;
  location?: string;
  source?: string;
  url?: string;
  notes?: string;
  priority: Priority;
  appliedDate: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
  timeline?: TimelineEntry[];
  contacts?: Contact[];
}

export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'ghosted';

export type Priority = 'low' | 'medium' | 'high';

export interface TimelineEntry {
  id: number;
  applicationId: number;
  action: string;
  details?: string;
  createdAt: string;
}

export interface Contact {
  id: number;
  applicationId: number;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface Payment {
  id: number;
  userId: number;
  amount: number;
  currency: string;
  status: string;
  plan: string;
  createdAt: string;
  description?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UserProfile {
  user: User;
  stats: ApplicationStats;
}

export interface ApplicationStats {
  total: number;
  applied: number;
  interviews: number;
  offers: number;
  rejected: number;
  ghosted: number;
  saved: number;
  responseRate: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalApplications: number;
  revenue: number;
  usersByPlan: Record<string, number>;
  applicationsByStatus: Record<string, number>;
  recentSignups: User[];
  topUsers: Array<{ user: User; applicationCount: number }>;
  monthlyRevenue: Array<{ month: string; amount: number }>;
}

export interface PlanConfig {
  name: string;
  price: number;
  maxApplications: number;
  features: string[];
  recommended?: boolean;
}

export interface MatchScoreResponse {
  score: number;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
