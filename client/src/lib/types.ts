export interface UserAwareness {
  id: string;
  name: string;
  color: string;
  avatar: string;
  cursor?: {
    anchor: number;
    head: number;
  } | null;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'offline';

export interface DocumentStats {
  crdtByteSize: number;
  updateCount: number;
  activePeers: number;
  lastSyncedAt: string | null;
  pendingLocalUpdates: number;
}

export interface NetworkSimulationConfig {
  simulatedLatencyMs: number;
  packetLossRate: number; // 0 to 1
  isSimulatedOffline: boolean;
}
