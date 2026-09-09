import { useMemo, useState } from 'react';
import Construction from 'lucide-react-native/icons/construction';
import Info from 'lucide-react-native/icons/info';
import ListIcon from 'lucide-react-native/icons/list';
import MapIcon from 'lucide-react-native/icons/map';
import SearchX from 'lucide-react-native/icons/search-x';
import TrafficCone from 'lucide-react-native/icons/traffic-cone';
import Zap from 'lucide-react-native/icons/zap';
import { AccessibilityInfo, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, type BadgeVariant } from '@/components/badge';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { FilterChip } from '@/components/filter-chip';
import { LoadingSpinner } from '@/components/loading-spinner';
import { MapBackground } from '@/components/map-background';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useCivicPoints } from '@/hooks/use-civic-points';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { useTheme } from '@/hooks/use-theme';
import { mockIncidents } from '@/mocks/incidents';
import type { Incident, IncidentType } from '@/types';
import type { IconComponent } from '@/types/icon';
import { formatDateTime } from '@/utils/format-date';
import { getBoundingBox, projectToPercent } from '@/utils/project-coordinates';

const ALL_TYPES = 'all';

const TYPE_INFO: Record<
  IncidentType,
  { label: string; icon: IconComponent; variant: BadgeVariant }
> = {
  roadwork: { label: 'Obra', icon: Construction, variant: 'warning' },
  traffic_closure: { label: 'Corte de tráfico', icon: TrafficCone, variant: 'danger' },
  utility_fault: { label: 'Avería', icon: Zap, variant: 'warning' },
  other: { label: 'Otro', icon: Info, variant: 'neutral' },
};

const REPORT_TYPE_OPTIONS: IncidentType[] = [
  'roadwork',
  'traffic_closure',
  'utility_fault',
  'other',
];

// Civic points awarded for reporting an incident (see Gamificación, HAS-18).
const INCIDENT_REPORT_POINTS = 10;

const BOUNDING_BOX = getBoundingBox(mockIncidents.map((incident) => incident.coordinates));

function IncidentDetails({ incident }: { incident: Incident }) {
  const typeInfo = TYPE_INFO[incident.type];

  return (
    <Card style={styles.detailCard}>
      <View style={styles.detailHeader}>
        <ThemedText type="default" style={styles.detailAddress}>
          {incident.address}
        </ThemedText>
        <Badge
          label={incident.status === 'active' ? 'Activa' : 'Resuelta'}
          variant={incident.status === 'active' ? 'warning' : 'success'}
        />
      </View>
      <Badge label={typeInfo.label} icon={typeInfo.icon} variant={typeInfo.variant} />
      <ThemedText type="default">{incident.description}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {formatDateTime(incident.date)}
      </ThemedText>
    </Card>
  );
}

function ReportIncidentForm({ onDone }: { onDone: () => void }) {
  const { addPoints } = useCivicPoints();
  const [type, setType] = useState<IncidentType | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Card style={styles.formCard}>
        <ThemedText type="default">Incidencia enviada, gracias por avisar.</ThemedText>
        <Badge label={`+${INCIDENT_REPORT_POINTS} puntos`} variant="success" />
        <Button title="Cerrar" variant="secondary" onPress={onDone} style={styles.formButton} />
      </Card>
    );
  }

  return (
    <Card style={styles.formCard}>
      <ThemedText type="smallBold">Reportar incidencia</ThemedText>
      <View style={styles.chipRow}>
        {REPORT_TYPE_OPTIONS.map((option) => (
          <FilterChip
            key={option}
            label={TYPE_INFO[option].label}
            icon={TYPE_INFO[option].icon}
            variant={
              TYPE_INFO[option].variant === 'neutral' ? 'primary' : TYPE_INFO[option].variant
            }
            selected={type === option}
            onPress={() => setType(option)}
          />
        ))}
      </View>
      <TextField
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        placeholder="¿Qué está pasando?"
        multiline
        numberOfLines={3}
        style={styles.multilineInput}
      />
      <TextField
        label="Ubicación aproximada"
        value={location}
        onChangeText={setLocation}
        placeholder="Ej: Calle Real, esquina con Calle Molino"
      />
      {error ? (
        <ThemedText type="small" themeColor="danger" accessibilityLiveRegion="polite">
          {error}
        </ThemedText>
      ) : null}
      <View style={styles.formActions}>
        <Button title="Cancelar" variant="ghost" onPress={onDone} />
        <Button
          title="Enviar"
          onPress={() => {
            if (!type) {
              setError('Elige un tipo de incidencia.');
              return;
            }
            if (!description.trim() || !location.trim()) {
              setError('Rellena la descripción y la ubicación.');
              return;
            }
            setError(null);
            addPoints('Reportaste una incidencia', INCIDENT_REPORT_POINTS);
            // Announces the points gain to screen readers on both platforms
            // (the "+N puntos" Badge below is otherwise silent to them).
            AccessibilityInfo.announceForAccessibility(
              `Incidencia enviada. Ganaste ${INCIDENT_REPORT_POINTS} puntos.`,
            );
            setSubmitted(true);
          }}
        />
      </View>
    </Card>
  );
}

export default function IncidentsScreen() {
  const theme = useTheme();
  const isLoading = useSimulatedLoading();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [typeFilter, setTypeFilter] = useState<IncidentType | typeof ALL_TYPES>(ALL_TYPES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const filteredIncidents = useMemo(
    () =>
      mockIncidents.filter((incident) => typeFilter === ALL_TYPES || incident.type === typeFilter),
    [typeFilter],
  );

  const selectedIncident = filteredIncidents.find((incident) => incident.id === selectedId) ?? null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner label="Cargando incidencias…" />
          </View>
        ) : (
          <FlatList
            data={viewMode === 'list' ? filteredIncidents : []}
            keyExtractor={(incident) => incident.id}
            contentContainerStyle={styles.content}
            ListHeaderComponent={
              <View style={styles.headerSection}>
                <View style={styles.chipRow}>
                  <FilterChip
                    label="Mapa"
                    icon={MapIcon}
                    selected={viewMode === 'map'}
                    onPress={() => setViewMode('map')}
                    accessibilityLabel="Ver como mapa"
                  />
                  <FilterChip
                    label="Lista"
                    icon={ListIcon}
                    selected={viewMode === 'list'}
                    onPress={() => setViewMode('list')}
                    accessibilityLabel="Ver como lista"
                  />
                </View>

                <View style={styles.chipRow}>
                  <FilterChip
                    label="Todas"
                    selected={typeFilter === ALL_TYPES}
                    onPress={() => setTypeFilter(ALL_TYPES)}
                  />
                  {REPORT_TYPE_OPTIONS.map((option) => (
                    <FilterChip
                      key={option}
                      label={TYPE_INFO[option].label}
                      icon={TYPE_INFO[option].icon}
                      variant={
                        TYPE_INFO[option].variant === 'neutral'
                          ? 'primary'
                          : TYPE_INFO[option].variant
                      }
                      selected={typeFilter === option}
                      onPress={() => setTypeFilter(option)}
                    />
                  ))}
                </View>

                {isReportOpen ? (
                  <ReportIncidentForm onDone={() => setIsReportOpen(false)} />
                ) : (
                  <Button title="Reportar incidencia" onPress={() => setIsReportOpen(true)} />
                )}

                {viewMode === 'map' ? (
                  <>
                    <MapBackground accessibilityLabel="Mapa de incidencias de Aguilar de la Frontera">
                      {filteredIncidents.map((incident) => {
                        const { leftPercent, topPercent } = projectToPercent(
                          incident.coordinates,
                          BOUNDING_BOX,
                        );
                        const typeInfo = TYPE_INFO[incident.type];
                        const TypeIcon = typeInfo.icon;
                        const isSelected = selectedId === incident.id;
                        return (
                          <Pressable
                            key={incident.id}
                            onPress={() =>
                              setSelectedId((current) =>
                                current === incident.id ? null : incident.id,
                              )
                            }
                            accessibilityRole="button"
                            accessibilityLabel={`Incidencia: ${typeInfo.label} en ${incident.address}${isSelected ? ', seleccionada' : ''}`}
                            accessibilityState={{ selected: isSelected }}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            style={[
                              styles.marker,
                              {
                                left: `${leftPercent}%`,
                                top: `${topPercent}%`,
                                backgroundColor:
                                  theme[
                                    typeInfo.variant === 'neutral'
                                      ? 'textSecondary'
                                      : typeInfo.variant
                                  ],
                                borderColor: theme.background,
                                borderWidth: isSelected ? 3 : 2,
                              },
                            ]}
                          >
                            <TypeIcon size={14} color={theme.background} strokeWidth={2.5} />
                          </Pressable>
                        );
                      })}
                    </MapBackground>
                    {selectedIncident ? <IncidentDetails incident={selectedIncident} /> : null}
                  </>
                ) : null}
              </View>
            }
            ListEmptyComponent={
              viewMode === 'list' ? (
                <EmptyState
                  icon={SearchX}
                  title="Sin incidencias para este filtro"
                  description="Prueba a quitar el filtro de tipo."
                />
              ) : null
            }
            renderItem={({ item }) => <IncidentDetails incident={item} />}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  headerSection: {
    gap: Spacing.three,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  formCard: {
    gap: Spacing.two,
  },
  formButton: {
    alignSelf: 'flex-start',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  marker: {
    position: 'absolute',
    width: Spacing.five,
    height: Spacing.five,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    // Centers the marker on its (left, top) point — half of Spacing.five.
    transform: [{ translateX: -Spacing.three }, { translateY: -Spacing.three }],
  },
  detailCard: {
    gap: Spacing.one,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  detailAddress: {
    flex: 1,
  },
  separator: {
    height: Spacing.three,
  },
});
