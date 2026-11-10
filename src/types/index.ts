export type Page =
  | 'dashboard'
  | 'meetings'
  | 'live'
  | 'assistant'
  | 'knowledge'
  | 'tasks'
  | 'analytics'
  | 'settings';

export interface NavigationItem {
  id: Page;
  label: string;
}