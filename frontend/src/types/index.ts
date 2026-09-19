export interface Device {
  id: string; name: string; lat: number; lng: number;
  status: 'online' | 'offline' | 'alert'; lastSeen: string;
  battery: number; temperature: number;
  groupId?: string;
  thresholds?: DeviceThresholds;
}

export interface DeviceThresholds {
  lowBattery: number;
  highTemperature: number;
  offlineTimeout: number;
}

export interface DeviceGroup {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface DeviceRegistrationForm {
  name: string;
  lat: number;
  lng: number;
  battery: number;
  temperature: number;
  groupId?: string;
  thresholds: DeviceThresholds;
}

export interface Geofence {
  id: string; name: string;
  center: { lat: number; lng: number };
  radius: number; type: 'circle' | 'polygon';
  paths?: Array<{ lat: number; lng: number }>;
  alertOnEnter: boolean; alertOnExit: boolean; color: string;
}

export type AlertType = 'enter' | 'exit' | 'low_battery' | 'offline';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  deviceId: string;
  fenceId?: string;
  type: AlertType;
  severity: AlertSeverity;
  timestamp: string;
  message: string;
  acknowledged: boolean;
}

export interface MqttMessage {
  topic: string; payload: string; timestamp: string;
}

export interface TrackPoint {
  lat: number;
  lng: number;
  timestamp: string;
  speed?: number;
  battery?: number;
  temperature?: number;
  isAbnormal?: boolean;
  abnormalType?: 'fence_breach' | 'low_battery' | 'offline' | 'speed';
  abnormalMessage?: string;
}

export interface StayPoint {
  lat: number;
  lng: number;
  startTime: string;
  endTime: string;
  duration: number;
  name?: string;
}

export interface TrackSegment {
  points: TrackPoint[];
  isNormal: boolean;
  abnormalType?: string;
  startTime: string;
  endTime: string;
}

export interface TrackData {
  deviceId: string;
  deviceName: string;
  startTime: string;
  endTime: string;
  points: TrackPoint[];
  segments: TrackSegment[];
  stayPoints: StayPoint[];
  breachEvents: TrackPoint[];
  totalDistance: number;
  totalDuration: number;
}

export interface HealthDataPoint {
  timestamp: string;
  battery: number;
  temperature: number;
  isOnline: boolean;
}

export interface DeviceHealth {
  deviceId: string;
  deviceName: string;
  healthScore: number;
  batteryLevel: number;
  temperatureLevel: number;
  onlineHours: number;
  offlineHours: number;
  alertCount: number;
  healthTrend: 'improving' | 'stable' | 'declining';
  lastAbnormalTime?: string;
  lastAbnormalType?: AlertType;
  priorityRank: number;
  recommendations: string[];
  historyData: HealthDataPoint[];
}

export interface HealthSummary {
  avgHealthScore: number;
  totalAlertCount: number;
  avgOnlineRate: number;
  avgBatteryLevel: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
}

/** 巡检计划生命周期状态：进行中 / 已暂停 */
export type InspectionPlanStatus = 'active' | 'paused';

/** 巡检阶段：常规巡检 / 重点巡检（阶段切换后提醒范围与综合评分同步更新） */
export type InspectionStage = 'routine' | 'focused';

/** 计划内单台设备在某一时刻的健康快照，暂停后用于保留历史健康评分和在线率 */
export interface InspectionDeviceSnapshot {
  deviceId: string;
  healthScore: number;
  onlineRate: number;
}

export interface InspectionPlan {
  id: string;
  name: string;
  description?: string;
  deviceIds: string[];
  status: InspectionPlanStatus;
  stage: InspectionStage;
  createdAt: string;
  /** 暂停时间，仅 status === 'paused' 时存在 */
  pausedAt?: string;
  /** 暂停瞬间的历史健康快照，恢复后清空 */
  frozenSnapshots?: InspectionDeviceSnapshot[];
}

export interface PlanStats {
  deviceCount: number;
  avgHealthScore: number;
  avgOnlineRate: number;
  /** 达到本计划巡检阶段提醒阈值、需要提醒的设备（暂停中的计划不参与提醒） */
  reminderCount: number;
  /** 当前统计是否来自暂停时保留的历史快照 */
  fromSnapshot: boolean;
}

export interface InspectionReminder {
  planId: string;
  planName: string;
  health: DeviceHealth;
}
