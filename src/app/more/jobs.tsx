import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { FilterChip } from '@/components/filter-chip';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { mockJobOffers } from '@/mocks/job-offers';
import type { JobOffer, JobOfferType } from '@/types';
import { formatDate } from '@/utils/format-date';

const TYPE_LABEL: Record<JobOfferType, string> = {
  private: 'Negocio privado',
  council: 'Ayuntamiento',
};

const ALL_TYPES = 'all';
type TypeFilter = JobOfferType | typeof ALL_TYPES;

const ALL_SECTORS = 'all';

function JobOfferCard({
  offer,
  expanded,
  applied,
  onToggle,
  onApply,
}: {
  offer: JobOffer;
  expanded: boolean;
  applied: boolean;
  onToggle: () => void;
  onApply: () => void;
}) {
  return (
    <Card style={styles.card}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`Ver detalle de la oferta ${offer.position}, ${offer.company}`}
        accessibilityState={{ expanded }}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitles}>
            <ThemedText type="default">{offer.position}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {offer.company}
            </ThemedText>
          </View>
          <Badge
            label={TYPE_LABEL[offer.type]}
            variant={offer.type === 'council' ? 'primary' : 'neutral'}
          />
        </View>

        <View style={styles.cardMeta}>
          <ThemedText type="small" themeColor="textSecondary">
            {offer.scheduleType}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Publicada el {formatDate(offer.publishedDate)}
          </ThemedText>
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.details}>
          <ThemedText type="default">{offer.description}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Requisitos: {offer.requirements}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Cómo inscribirse: {offer.howToApply}
          </ThemedText>
          {applied ? (
            <Badge label="Inscripción enviada" variant="success" style={styles.appliedBadge} />
          ) : (
            <Button title="Inscribirme" onPress={onApply} style={styles.applyButton} />
          )}
        </View>
      ) : null}
    </Card>
  );
}

export default function JobsScreen() {
  const isLoading = useSimulatedLoading();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<ReadonlySet<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(ALL_TYPES);
  const [sectorFilter, setSectorFilter] = useState<string>(ALL_SECTORS);

  const sectors = useMemo(
    () => Array.from(new Set(mockJobOffers.map((offer) => offer.sector))).sort(),
    [],
  );

  const filteredOffers = useMemo(
    () =>
      mockJobOffers.filter(
        (offer) =>
          (typeFilter === ALL_TYPES || offer.type === typeFilter) &&
          (sectorFilter === ALL_SECTORS || offer.sector === sectorFilter),
      ),
    [typeFilter, sectorFilter],
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner label="Cargando ofertas…" />
          </View>
        ) : (
          <FlatList
            data={filteredOffers}
            keyExtractor={(offer) => offer.id}
            contentContainerStyle={styles.content}
            ListHeaderComponent={
              <View style={styles.filters}>
                <View style={styles.filterRow}>
                  <FilterChip
                    label="Todas"
                    selected={typeFilter === ALL_TYPES}
                    onPress={() => setTypeFilter(ALL_TYPES)}
                  />
                  <FilterChip
                    label={TYPE_LABEL.private}
                    selected={typeFilter === 'private'}
                    onPress={() => setTypeFilter('private')}
                  />
                  <FilterChip
                    label={TYPE_LABEL.council}
                    selected={typeFilter === 'council'}
                    onPress={() => setTypeFilter('council')}
                  />
                </View>
                <View style={styles.filterRow}>
                  <FilterChip
                    label="Todos los sectores"
                    selected={sectorFilter === ALL_SECTORS}
                    onPress={() => setSectorFilter(ALL_SECTORS)}
                  />
                  {sectors.map((sector) => (
                    <FilterChip
                      key={sector}
                      label={sector}
                      selected={sectorFilter === sector}
                      onPress={() => setSectorFilter(sector)}
                    />
                  ))}
                </View>
              </View>
            }
            ListEmptyComponent={
              <EmptyState
                emoji="💼"
                title="Sin ofertas para este filtro"
                description="Prueba a quitar algún filtro para ver más ofertas."
              />
            }
            renderItem={({ item }) => (
              <JobOfferCard
                offer={item}
                expanded={expandedId === item.id}
                applied={appliedIds.has(item.id)}
                onToggle={() => setExpandedId((current) => (current === item.id ? null : item.id))}
                onApply={() => setAppliedIds((current) => new Set(current).add(item.id))}
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
  filters: {
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  card: {
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  cardTitles: {
    flex: 1,
    gap: Spacing.half,
  },
  cardMeta: {
    gap: Spacing.half,
  },
  details: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  applyButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
  },
  appliedBadge: {
    marginTop: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
});
