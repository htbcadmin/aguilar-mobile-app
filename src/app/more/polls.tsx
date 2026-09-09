import { useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MinTouchTarget, Radius, Spacing } from '@/constants/theme';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { useTheme } from '@/hooks/use-theme';
import { mockPolls } from '@/mocks/polls';
import type { Poll } from '@/types';
import { formatDate } from '@/utils/format-date';

function OptionSelectRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.optionRow,
        { backgroundColor: theme.backgroundElement },
        selected && { borderColor: theme.primary },
        pressed && styles.pressed,
      ]}
    >
      <ThemedText type="default" style={styles.optionRowText}>
        {label}
      </ThemedText>
      {selected ? (
        <SymbolView
          name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
          tintColor={theme.primary}
          size={20}
        />
      ) : null}
    </Pressable>
  );
}

function OptionResultBar({
  label,
  votes,
  totalVotes,
  isYourVote,
}: {
  label: string;
  votes: number;
  totalVotes: number;
  isYourVote: boolean;
}) {
  const theme = useTheme();
  const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

  return (
    <View style={styles.resultRow}>
      <View style={styles.resultLabelRow}>
        <ThemedText type="small" style={styles.resultLabelText}>
          {label}
          {isYourVote ? ' · tu voto' : ''}
        </ThemedText>
        <ThemedText type="smallBold">{percentage}%</ThemedText>
      </View>
      <View style={[styles.resultTrack, { backgroundColor: theme.backgroundElement }]}>
        <View
          style={[
            styles.resultFill,
            {
              width: `${percentage}%`,
              backgroundColor: isYourVote ? theme.primary : theme.textSecondary,
            },
          ]}
        />
      </View>
    </View>
  );
}

function PollCard({
  poll,
  expanded,
  selectedOptionId,
  votedOptionId,
  onToggle,
  onSelectOption,
  onVote,
}: {
  poll: Poll;
  expanded: boolean;
  selectedOptionId: string | null;
  votedOptionId: string | null;
  onToggle: () => void;
  onSelectOption: (optionId: string) => void;
  onVote: () => void;
}) {
  const showResults = !poll.active || votedOptionId !== null;
  const votesById = poll.options.reduce<Record<string, number>>((acc, option) => {
    acc[option.id] = option.votes + (votedOptionId === option.id ? 1 : 0);
    return acc;
  }, {});
  const totalVotes = Object.values(votesById).reduce((sum, count) => sum + count, 0);

  return (
    <Card style={styles.card}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`Ver ${poll.active ? 'y votar en ' : 'resultados de '}la encuesta: ${poll.question}`}
        accessibilityState={{ expanded }}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <View style={styles.cardHeader}>
          <ThemedText type="default" style={styles.question}>
            {poll.question}
          </ThemedText>
          <Badge
            label={poll.active ? 'Activa' : 'Cerrada'}
            variant={poll.active ? 'primary' : 'neutral'}
          />
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {poll.active
            ? `Cierra el ${formatDate(poll.closingDate)}`
            : `Cerrada el ${formatDate(poll.closingDate)}`}
        </ThemedText>
      </Pressable>

      {expanded ? (
        <View style={styles.details}>
          {showResults ? (
            <>
              {poll.options.map((option) => (
                <OptionResultBar
                  key={option.id}
                  label={option.text}
                  votes={votesById[option.id]}
                  totalVotes={totalVotes}
                  isYourVote={votedOptionId === option.id}
                />
              ))}
              <ThemedText type="small" themeColor="textSecondary">
                {totalVotes} votos en total
              </ThemedText>
            </>
          ) : (
            <>
              <View
                style={styles.optionGroup}
                accessibilityRole="radiogroup"
                accessibilityLabel={poll.question}
              >
                {poll.options.map((option) => (
                  <OptionSelectRow
                    key={option.id}
                    label={option.text}
                    selected={selectedOptionId === option.id}
                    onPress={() => onSelectOption(option.id)}
                  />
                ))}
              </View>
              <Button
                title="Votar"
                onPress={onVote}
                disabled={selectedOptionId === null}
                style={styles.voteButton}
              />
            </>
          )}
        </View>
      ) : null}
    </Card>
  );
}

export default function PollsScreen() {
  const isLoading = useSimulatedLoading();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectionByPoll, setSelectionByPoll] = useState<Record<string, string>>({});
  const [votedByPoll, setVotedByPoll] = useState<Record<string, string>>({});

  const sortedPolls = [...mockPolls].sort((a, b) => Number(b.active) - Number(a.active));

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner label="Cargando encuestas…" />
          </View>
        ) : (
          <FlatList
            data={sortedPolls}
            keyExtractor={(poll) => poll.id}
            contentContainerStyle={styles.content}
            renderItem={({ item }) => (
              <PollCard
                poll={item}
                expanded={expandedId === item.id}
                selectedOptionId={selectionByPoll[item.id] ?? null}
                votedOptionId={votedByPoll[item.id] ?? null}
                onToggle={() => setExpandedId((current) => (current === item.id ? null : item.id))}
                onSelectOption={(optionId) =>
                  setSelectionByPoll((current) => ({ ...current, [item.id]: optionId }))
                }
                onVote={() => {
                  const optionId = selectionByPoll[item.id];
                  if (optionId) {
                    setVotedByPoll((current) => ({ ...current, [item.id]: optionId }));
                  }
                }}
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
  card: {
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  question: {
    flex: 1,
  },
  details: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  optionGroup: {
    gap: Spacing.two,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: MinTouchTarget,
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionRowText: {
    flex: 1,
  },
  voteButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
  },
  resultRow: {
    gap: Spacing.half,
  },
  resultLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  resultLabelText: {
    flex: 1,
  },
  resultTrack: {
    height: 8,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  resultFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  pressed: {
    opacity: 0.7,
  },
});
