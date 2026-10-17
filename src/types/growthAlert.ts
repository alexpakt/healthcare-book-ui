export interface GrowthAlert {
  alertKey: string;
  ruleType: 'PERCENTILE_CROSSING' | 'VELOCITY' | 'MISSING_MEASUREMENT';
  measurementType: 'HEIGHT' | 'WEIGHT' | 'HEAD_CIRCUMFERENCE';
  fromMeasurementId: number;
  toMeasurementId: number;
  fromDate: string;
  toDate: string;
  fromValue: number;
  toValue: number;
  bandShift: number;
  direction: 'UP' | 'DOWN';
  crossedLines: number[];
  reason: string;
  acknowledged: boolean;
  acknowledgedBy?: string | null;
  acknowledgedAt?: string | null;
  acknowledgementNote?: string | null;
}
