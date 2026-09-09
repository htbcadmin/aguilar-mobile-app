import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/badge';
import { Card } from '@/components/card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { mockBusLines } from '@/mocks/bus-lines';
import type { BusLine } from '@/types';
import { getNextDeparture } from '@/utils/get-next-departure';

function ScheduleRow({ label, times }: { label: string; times: string[] }) {
  return (
    <View style={styles.scheduleRow}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.scheduleLabel}>
        {label}
      </ThemedText>
      <View style={styles.scheduleTimes}>
        {times.map((time) => (
          <Badge key={time} label={time} />
        ))}
      </View>
    </View>
  );
}

function BusLineCard({
  line,
  expanded,
  onToggle,
}: {
  line: BusLine;
  expanded: boolean;
  onToggle: () => void;
}) {
  const nextDeparture = getNextDeparture(line);
  const nextDepartureLabel = nextDeparture
    ? `Próxima salida ${nextDeparture}`
    : 'Sin más salidas hoy';

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={`Ver horarios de la línea a ${line.destination}. ${nextDepartureLabel}`}
      accessibilityState={{ expanded }}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.route}>
            <ThemedText type="default">{line.origin}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              → {line.destination}
            </ThemedText>
          </View>
          <Badge label={nextDepartureLabel} variant={nextDeparture ? 'primary' : 'neutral'} />
        </View>

        {expanded ? (
          <View style={styles.details}>
            {line.intermediateStops.length > 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                Paradas intermedias: {line.intermediateStops.join(', ')}
              </ThemedText>
            ) : null}
            <ScheduleRow label="Días laborables" times={line.weekdaySchedule} />
            <ScheduleRow label="Fines de semana" times={line.weekendSchedule} />
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}

export default function BusScreen() {
  const isLoading = useSimulatedLoading();
  const [expandedLineId, setExpandedLineId] = useState<string | null>(null);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner label="Cargando líneas…" />
          </View>
        ) : (
          <FlatList
            data={mockBusLines}
            keyExtractor={(line) => line.id}
            contentContainerStyle={styles.content}
            ListHeaderComponent={
              <ThemedText type="default" themeColor="textSecondary" style={styles.screenSubtitle}>
                Líneas interurbanas desde Aguilar de la Frontera
              </ThemedText>
            }
            renderItem={({ item }) => (
              <BusLineCard
                line={item}
                expanded={expandedLineId === item.id}
                onToggle={() =>
                  setExpandedLineId((current) => (current === item.id ? null : item.id))
                }
              />
            )}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: Spacing.three,
    padding: Spacing.four,
  },
  screenSubtitle: {
    marginBottom: Spacing.two,
  },
  card: {
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  route: {
    gap: Spacing.half,
  },
  details: {
    gap: Spacing.three,
  },
  scheduleRow: {
    gap: Spacing.one,
  },
  scheduleLabel: {
    textTransform: 'uppercase',
  },
  scheduleTimes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
});
