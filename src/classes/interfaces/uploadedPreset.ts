import CalcManager from '../calcManager';
import Ship from '../fleet/ship';

export interface UploadedPreset {
  id: string;
  map: number;
  name: string;
  ships: Ship[];
  manager: CalcManager;
  user: string;
  memo: string;
  level: number;
  createdAt: string;
}
