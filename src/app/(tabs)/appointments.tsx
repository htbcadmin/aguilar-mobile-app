import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { FilterChip } from '@/components/filter-chip';
import { ListItem } from '@/components/list-item';
import { LoadingSpinner } from '@/components/loading-spinner';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { mockAppointments } from '@/mocks/appointments';
import type { Appointment } from '@/types';
import { formatDate } from '@/utils/format-date';
import { getUpcomingBusinessDays } from '@/utils/get-upcoming-business-days';

const OFFICE_LOCATION = 'Ayuntamiento de Aguilar de la Frontera, Plaza de la Constitución';

const PROCEDURES = [
  { name: 'Empadronamiento', durationMinutes: 15 },
  { name: 'Licencia de obras', durationMinutes: 30 },
  { name: 'Información general', durationMinutes: 10 },
  { name: 'Registro de documentos', durationMinutes: 10 },
];

const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];

const UPCOMING_DAYS = getUpcomingBusinessDays(6);

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateChipLabel(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

type Step = 'procedure' | 'datetime' | 'form' | 'confirmation';

export default function AppointmentsScreen() {
  const isLoading = useSimulatedLoading();
  const [view, setView] = useState<'book' | 'my-appointments'>('book');
  const [step, setStep] = useState<Step>('procedure');
  const [procedure, setProcedure] = useState<string | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantContact, setApplicantContact] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);

  // Keyed by date+time only, not by procedure: assumes a single reception
  // window handles every procedure at the town hall, so one appointment
  // occupies that slot regardless of which trámite it's for. Revisit if a
  // future iteration models several parallel desks.
  const isSlotTaken = useMemo(() => {
    const takenKeys = new Set(
      [...mockAppointments, ...myAppointments]
        .filter((appointment) => appointment.status === 'confirmed')
        .map((appointment) => `${appointment.date}|${appointment.time}`),
    );
    return (candidateDateKey: string, candidateTime: string) =>
      takenKeys.has(`${candidateDateKey}|${candidateTime}`);
  }, [myAppointments]);

  function resetWizard() {
    setStep('procedure');
    setProcedure(null);
    setDateKey(null);
    setTime(null);
    setApplicantName('');
    setApplicantContact('');
    setFormError(null);
  }

  function handleConfirm() {
    if (!procedure || !dateKey || !time) {
      return;
    }
    const newAppointment: Appointment = {
      id: `apt-user-${Date.now()}`,
      procedure,
      date: dateKey,
      time,
      applicantName,
      applicantContact,
      status: 'confirmed',
    };
    setMyAppointments((current) => [newAppointment, ...current]);
    resetWizard();
    setView('my-appointments');
  }

  function handleCancelAppointment(id: string) {
    setMyAppointments((current) =>
      current.map((appointment) =>
        appointment.id === id ? { ...appointment, status: 'cancelled' } : appointment,
      ),
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner label="Cargando trámites…" />
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.viewSwitch}>
              <FilterChip
                label="Nueva cita"
                selected={view === 'book'}
                onPress={() => setView('book')}
              />
              <FilterChip
                label="Mis citas"
                selected={view === 'my-appointments'}
                onPress={() => setView('my-appointments')}
              />
            </View>

            {view === 'book' ? (
              <View style={styles.wizard}>
                {step !== 'procedure' ? (
                  <Button
                    title="Atrás"
                    variant="ghost"
                    onPress={() =>
                      setStep((current) =>
                        current === 'confirmation'
                          ? 'form'
                          : current === 'form'
                            ? 'datetime'
                            : 'procedure',
                      )
                    }
                    style={styles.backButton}
                  />
                ) : null}

                {step === 'procedure' ? (
                  <View style={styles.stepList}>
                    <ThemedText type="smallBold">¿Qué trámite necesitas?</ThemedText>
                    {PROCEDURES.map((item) => (
                      <ListItem
                        key={item.name}
                        title={item.name}
                        subtitle={`${item.durationMinutes} min aprox.`}
                        onPress={() => {
                          setProcedure(item.name);
                          setStep('datetime');
                        }}
                      />
                    ))}
                  </View>
                ) : null}

                {step === 'datetime' && procedure ? (
                  <View style={styles.stepList}>
                    <ThemedText type="smallBold">Elige fecha</ThemedText>
                    <View style={styles.chipRow}>
                      {UPCOMING_DAYS.map((day) => {
                        const key = toDateKey(day);
                        return (
                          <FilterChip
                            key={key}
                            label={formatDateChipLabel(day)}
                            selected={dateKey === key}
                            onPress={() => {
                              setDateKey(key);
                              setTime(null);
                            }}
                          />
                        );
                      })}
                    </View>

                    {dateKey ? (
                      <>
                        <ThemedText type="smallBold">Elige hora</ThemedText>
                        <View style={styles.chipRow}>
                          {TIME_SLOTS.map((slot) => {
                            const taken = isSlotTaken(dateKey, slot);
                            return (
                              <FilterChip
                                key={slot}
                                label={taken ? `${slot} (ocupada)` : slot}
                                selected={time === slot}
                                disabled={taken}
                                onPress={() => setTime(slot)}
                              />
                            );
                          })}
                        </View>
                      </>
                    ) : null}

                    <Button
                      title="Continuar"
                      onPress={() => setStep('form')}
                      disabled={!dateKey || !time}
                      style={styles.continueButton}
                    />
                  </View>
                ) : null}

                {step === 'form' ? (
                  <View style={styles.stepList}>
                    <ThemedText type="smallBold">Tus datos</ThemedText>
                    <TextField
                      label="Nombre"
                      value={applicantName}
                      onChangeText={setApplicantName}
                    />
                    <TextField
                      label="Teléfono o email"
                      value={applicantContact}
                      onChangeText={setApplicantContact}
                      keyboardType="email-address"
                    />
                    {formError ? (
                      <ThemedText type="small" themeColor="danger" accessibilityLiveRegion="polite">
                        {formError}
                      </ThemedText>
                    ) : null}
                    <Button
                      title="Continuar"
                      onPress={() => {
                        if (!applicantName.trim() || !applicantContact.trim()) {
                          setFormError('Rellena tu nombre y un contacto.');
                          return;
                        }
                        setFormError(null);
                        setStep('confirmation');
                      }}
                      style={styles.continueButton}
                    />
                  </View>
                ) : null}

                {step === 'confirmation' && procedure && dateKey && time ? (
                  <Card style={styles.summaryCard}>
                    <ThemedText type="smallBold">Resumen de la cita</ThemedText>
                    <ThemedText type="default">{procedure}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {formatDate(dateKey)}, {time}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {OFFICE_LOCATION}
                    </ThemedText>
                    <Button
                      title="Confirmar cita"
                      onPress={handleConfirm}
                      style={styles.continueButton}
                    />
                  </Card>
                ) : null}
              </View>
            ) : (
              <FlatList
                data={myAppointments}
                keyExtractor={(appointment) => appointment.id}
                contentContainerStyle={styles.myAppointmentsList}
                ListEmptyComponent={
                  <EmptyState
                    emoji="🏛️"
                    title="Aún no has pedido ninguna cita"
                    description="Pide una desde la pestaña 'Nueva cita'."
                  />
                }
                renderItem={({ item }) => (
                  <Card style={styles.appointmentCard}>
                    <View style={styles.appointmentHeader}>
                      <ThemedText type="default">{item.procedure}</ThemedText>
                      <Badge
                        label={item.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                        variant={item.status === 'confirmed' ? 'primary' : 'neutral'}
                      />
                    </View>
                    <ThemedText type="small" themeColor="textSecondary">
                      {formatDate(item.date)}, {item.time}
                    </ThemedText>
                    {item.status === 'confirmed' ? (
                      <Button
                        title="Cancelar cita"
                        variant="secondary"
                        onPress={() => handleCancelAppointment(item.id)}
                        style={styles.cancelButton}
                      />
                    ) : null}
                  </Card>
                )}
              />
            )}
          </View>
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
    flex: 1,
    gap: Spacing.three,
    padding: Spacing.four,
  },
  viewSwitch: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  wizard: {
    gap: Spacing.three,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  stepList: {
    gap: Spacing.two,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  continueButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
  },
  summaryCard: {
    gap: Spacing.one,
  },
  myAppointmentsList: {
    gap: Spacing.three,
  },
  appointmentCard: {
    gap: Spacing.one,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  cancelButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
  },
});
