import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  setItem(key: string): void;
  getItem(key: string): string | null;
  createActivity(key: string): Promise<void>;
  updateActivity(key: string): Promise<void>;
  deleteActivity(key: string): Promise<void>;
  autoUpdateActivity(key: string): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'NativeLocalStorage',
);
