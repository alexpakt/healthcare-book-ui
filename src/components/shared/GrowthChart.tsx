import React, {useEffect, useState} from 'react';
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {Alert, Center, Loader, SegmentedControl, Stack, Text, Title} from '@mantine/core';
import {IconAlertCircle} from '@tabler/icons-react';
import {childService} from '../../services/childService';
import {childHealthRecordService} from '../../services/childHealthRecordService';
import {parseLocalDate} from '../../utils/dateTime';
import type {GrowthMeasurement} from '../../types/parent';

interface GrowthChartProps {
  measurements: GrowthMeasurement[] | null;
  isLoading: boolean;
  error?: unknown;
  childName?: string;
  childId?: number;
}

type MeasurementType = 'height' | 'weight' | 'head';

interface ChartDataPoint {
  ageInMonths: number;
  measurementDate?: string;
  value?: number;
  percentile?: number;
  [key: string]: any;
}

interface ReferencePoint {
  ageInMonths: number;
  percentile: number;
  value: number;
}

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isMobile;
};

export const GrowthChart: React.FC<GrowthChartProps> = ({
  measurements,
  isLoading,
  error,
  childName,
  childId,
}) => {
  const [type, setType] = useState<MeasurementType>('height');
  const [references, setReferences] = useState<ReferencePoint[]>([]);
  const [loadingReferences, setLoadingReferences] = useState(false);
  const [childAgeInMonths, setChildAgeInMonths] = useState<number | undefined>();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!childId) return;

    const fetchChildAge = async () => {
      try {
        const child = await childService.getById(childId);
        const birthDate = parseLocalDate(child.dateOfBirth);
        if (!birthDate) return;
        const today = new Date();
        const ageInMonths = Math.floor(
          (today.getFullYear() - birthDate.getFullYear()) * 12 +
          (today.getMonth() - birthDate.getMonth())
        );
        setChildAgeInMonths(Math.max(0, ageInMonths));
      } catch (err) {
        console.error('Error fetching child data:', err);
      }
    };

    fetchChildAge();
  }, [childId]);

  useEffect(() => {
    if (!childId) return;

    const fetchReferences = async () => {
      try {
        setLoadingReferences(true);
        const measurementTypeKey = type === 'height' ? 'HEIGHT' : type === 'weight' ? 'WEIGHT' : 'HEAD_CIRCUMFERENCE';
        const data = await childHealthRecordService.getGrowthReferenceCurves(childId, measurementTypeKey);
        setReferences(data);
      } catch (err) {
        console.error('Error fetching reference curves:', err);
      } finally {
        setLoadingReferences(false);
      }
    };

    fetchReferences();
  }, [childId, type]);

  if (isLoading || loadingReferences) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error loading data">
        Failed to load growth measurements
      </Alert>
    );
  }

  const sortedMeasurements = (measurements || []).sort(
    (a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime()
  );

  const getOldestAge = () => {
    if (childAgeInMonths !== undefined) {
      return childAgeInMonths;
    }

    if (references && references.length > 0) {
      return Math.max(...references.map(r => r.ageInMonths));
    }

    return 0;
  };

  const getDisplayMode = () => {
    const oldestAge = getOldestAge();
    if (oldestAge <= 24) return 'baby'; // 0-24 months
    return 'child'; // 0-60 months with 6-month intervals
  };

  const getAgeRange = () => {
    const mode = getDisplayMode();

    if (mode === 'baby') {
      return { min: 0, max: 24 };
    } else {
      return { min: 0, max: 60 };
    }
  };

  const getChartHeight = () => {
    const mode = getDisplayMode();
    if (mode === 'baby') return 400;
    return 500;
  };

  const getChartData = () => {
    const { min, max } = getAgeRange();
    const mode = getDisplayMode();

    const measurementData = sortedMeasurements
      .filter(m => m.ageInMonths >= min && m.ageInMonths <= max)
      .map((m) => {
        if (type === 'height') {
          return m.heightCm
            ? {
                ageInMonths: m.ageInMonths,
                measurementDate: m.measurementDate,
                value: m.heightCm,
                percentile: m.percentileHeight,
              }
            : null;
        } else if (type === 'weight') {
          return m.weightKg
            ? {
                ageInMonths: m.ageInMonths,
                measurementDate: m.measurementDate,
                value: m.weightKg,
                percentile: m.percentileWeight,
              }
            : null;
        } else {
          return m.headCircumferenceCm
            ? {
                ageInMonths: m.ageInMonths,
                measurementDate: m.measurementDate,
                value: m.headCircumferenceCm,
                percentile: m.percentileHeadCircumference,
              }
            : null;
        }
      })
      .filter((d) => d !== null) as ChartDataPoint[];

    const ageSet = new Set<number>();

    // For child mode, only include 6-month intervals for reference data
    const referencesToAdd = mode === 'child'
      ? references.filter(r => r.ageInMonths >= min && r.ageInMonths <= max && r.ageInMonths % 6 === 0)
      : references.filter(r => r.ageInMonths >= min && r.ageInMonths <= max);

    measurementData.forEach(m => ageSet.add(m.ageInMonths));
    referencesToAdd.forEach(r => ageSet.add(r.ageInMonths));

    return Array.from(ageSet).sort((a, b) => a - b).map(age => {
      const refData = references.filter(r => r.ageInMonths === age);
      const measureData = measurementData.find(m => m.ageInMonths === age);

      const point: ChartDataPoint = {
        ageInMonths: age,
        ...(measureData && {
          measurementDate: measureData.measurementDate,
          value: measureData.value,
          percentile: measureData.percentile,
        }),
      };

      refData.forEach(ref => {
        const key = ref.percentile === 3 ? 'p03' : `p${ref.percentile}`;
        (point as any)[key] = ref.value;
      });

      return point;
    });
  };

  const data = getChartData();

  const getTitle = () => {
    if (type === 'height') return 'Ύψος (cm)';
    if (type === 'weight') return 'Βάρος (kg)';
    return 'Περίμετρος κεφαλής (cm)';
  };

  const getYAxisLabel = () => {
    if (type === 'height') return 'cm';
    if (type === 'weight') return 'kg';
    return 'cm';
  };

  const formatAgeDisplay = (months: number): string => {
    const mode = getDisplayMode();
    if (mode === 'child') {
      return `${(months / 12).toFixed(1)}y`;
    }
    return `${months} μήνες`;
  };

  const renderCustomTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      const percentileOrder = ['p03', 'p10', 'p25', 'p50', 'p75', 'p90', 'p97'];
      const percentileLabels: Record<string, string> = {
        p03: '3η εκατοστιαία',
        p10: '10η εκατοστιαία',
        p25: '25η εκατοστιαία',
        p50: '50η εκατοστιαία (διάμεσος)',
        p75: '75η εκατοστιαία',
        p90: '90η εκατοστιαία',
        p97: '97η εκατοστιαία',
        value: 'Μετρούμενη τιμή',
      };

      const sortedPayload = [...payload].sort((a, b) => {
        const aIndex = percentileOrder.indexOf(a.dataKey as string);
        const bIndex = percentileOrder.indexOf(b.dataKey as string);

        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return bIndex - aIndex;
      });

      return (
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', padding: '8px', borderRadius: '4px' }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>Ηλικία: {formatAgeDisplay(label)}</p>
          {sortedPayload.map((entry, index) => (
            <p key={index} style={{ margin: '2px 0', color: entry.color }}>
              {percentileLabels[entry.dataKey as string] || entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value} {getYAxisLabel()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Title order={3}>Καμπύλες ανάπτυξης</Title>
        {childName && <Text c="dimmed">{childName}</Text>}
      </Stack>

      <SegmentedControl
        value={type}
        onChange={(value) => setType(value as MeasurementType)}
        data={[
          { label: 'Ύψος', value: 'height' },
          { label: 'Βάρος', value: 'weight' },
          { label: 'Περίμετρος κεφαλής', value: 'head' },
        ]}
      />

      {(!measurements || measurements.length === 0) && (
        <Alert color="blue" title="Πρότυπα ανάπτυξης κατά τον ΠΟΥ">
          Δεν έχουν καταγραφεί ακόμη μετρήσεις. Το παρακάτω διάγραμμα παρουσιάζει τις καμπύλες αναφοράς ανάπτυξης του Παγκόσμιου Οργανισμού Υγείας.
        </Alert>
      )}

      {references.length === 0 ? (
        <Alert color="gray">Δεν υπάρχουν διαθέσιμα δεδομένα αναφοράς για την ανάπτυξη.</Alert>
      ) : (
        <ResponsiveContainer width="100%" height={getChartHeight()}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="ageInMonths"
              tickFormatter={(months) => {
                const mode = getDisplayMode();
                if (mode === 'child') {
                  return `${(months / 12).toFixed(1)}y`;
                }
                return `${months}`;
              }}
              ticks={getDisplayMode() === 'child' ? [0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60] : undefined}
              label={{
                value: getDisplayMode() === 'child' ? 'Ηλικία (έτη)' : 'Ηλικία (μήνες)',
                position: 'insideBottomRight',
                offset: -5
              }}
            />
            <YAxis label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }} />
            <Tooltip content={renderCustomTooltip} />
            {!isMobile && <Legend itemSorter="dataKey"/>}

            {references.length > 0 && (
              <>
                <Line type="monotone" dataKey="p03" stroke="#ef5350" strokeDasharray="5 5" name="3η εκατοστιαία" isAnimationActive={false} dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="p10" stroke="#ff9800" strokeDasharray="5 5" name="10η εκατοστιαία" isAnimationActive={false} dot={false} />
                <Line type="monotone" dataKey="p25" stroke="#b0bec5" strokeDasharray="5 5" name="25η εκατοστιαία" isAnimationActive={false} dot={false} />
                <Line type="monotone" dataKey="p50" stroke="#4caf50" strokeDasharray="5 5" name="50η εκατοστιαία (διάμεσος)" isAnimationActive={false} dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="p75" stroke="#b0bec5" strokeDasharray="5 5" name="75η εκατοστιαία" isAnimationActive={false} dot={false} />
                <Line type="monotone" dataKey="p90" stroke="#ff9800" strokeDasharray="5 5" name="90η εκατοστιαία" isAnimationActive={false} dot={false} />
                <Line type="monotone" dataKey="p97" stroke="#ef5350" strokeDasharray="5 5" name="97η εκατοστιαία" isAnimationActive={false} dot={false} strokeWidth={2} />
              </>
            )}

            {/* Child's measurements */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#1f77b4"
              dot={{ fill: '#1f77b4', r: 4 }}
              activeDot={{ r: 6 }}
              name={`${getTitle()} (μετρήθηκε)`}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

    </Stack>
  );
};
