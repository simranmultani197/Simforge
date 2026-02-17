import type { ComponentConfig } from './components';

export type CloudProvider = 'aws' | 'gcp' | 'azure';

export interface ComponentPreset<K extends ComponentConfig['kind'] = ComponentConfig['kind']> {
  id: string;
  name: string;
  kind: K;
  provider: CloudProvider | null;
  description: string;
  config: Partial<Extract<ComponentConfig, { kind: K }>>;
  tags: string[];
}
