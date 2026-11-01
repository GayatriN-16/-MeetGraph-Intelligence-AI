
export type Page =
  | 'dashboard'
  | 'meetings'
  | 'assistant'
  | 'tasks'
  | 'knowledge';

export interface NavigationItem {
  id: Page;
  label: string;
}
