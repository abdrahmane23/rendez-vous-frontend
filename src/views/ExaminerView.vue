<template>
  <div class="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
    <div class="fixed top-4 right-4 z-[9999] space-y-2">
  <div
    v-for="notification in notifications"
    :key="notification.id"
    class="bg-white border-l-4 border-[#0F52BA] shadow-lg rounded-lg p-4 min-w-[320px]"
  >
    <div class="font-semibold text-[#0F52BA]">
      Notification
    </div>

    <div class="text-sm text-slate-700 mt-1">
      {{ notification.message }}
    </div>

    <div class="text-xs text-slate-400 mt-2">
      {{ formatDateTime(notification.timestamp) }}
    </div>
  </div>
</div>
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F52BA] text-white">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-500">Espace examinateur</p>
            <h1 class="text-lg font-bold text-[#1E293B]">{{ examinerName }}</h1>
          </div>
        </div>

        <button
          @click="logout"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Déconnexion
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="rounded-lg border border-slate-200 bg-white p-5">
          <p class="text-sm font-semibold text-slate-500">Shifts à venir</p>
          <p class="mt-2 text-3xl font-bold text-[#0F52BA]">{{ shifts.length }}</p>
        </div>

        <div class="rounded-lg border border-slate-200 bg-white p-5">
          <p class="text-sm font-semibold text-slate-500">Rendez-vous chargés</p>
          <p class="mt-2 text-3xl font-bold text-[#10B981]">{{ appointments.length }}</p>
        </div>

        <div class="rounded-lg border border-slate-200 bg-white p-5">
          <p class="text-sm font-semibold text-slate-500">Prochain shift</p>
          <p class="mt-2 text-base font-bold text-[#1E293B]">{{ nextShiftLabel }}</p>
        </div>
      </section>

      <div
        v-if="pageError"
        class="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
      >
        {{ pageError }}
      </div>

      <section class="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <aside class="rounded-lg border border-slate-200 bg-white">
          <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 class="font-bold text-[#1E293B]">Upcoming shifts</h2>
              <p class="text-sm text-slate-500">Planning actif de l'examinateur</p>
            </div>
            <button
              @click="loadShifts"
              class="rounded-lg bg-[#0F52BA] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0c4295]"
            >
              Refresh
            </button>
          </div>

          <div v-if="loadingShifts" class="p-5 text-sm text-slate-500">Chargement des shifts...</div>

          <div v-else-if="shifts.length === 0" class="p-5 text-sm text-slate-500">
            Aucun shift à venir.
          </div>

          <div v-else class="divide-y divide-slate-100">
            <button
              v-for="shift in shifts"
              :key="shift.id"
              @click="selectShift(shift)"
              class="block w-full px-5 py-4 text-left transition hover:bg-slate-50"
              :class="selectedShift?.id === shift.id ? 'bg-blue-50 ring-1 ring-inset ring-[#0F52BA]/20' : ''"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="font-semibold text-[#1E293B]">{{ shift.sectionName || shift.section?.name || 'Section' }}</p>
                  <p class="mt-1 text-sm text-slate-500">{{ formatDate(shift.start) }}</p>
                </div>
                <span class="rounded-full bg-[#10B981]/10 px-2 py-1 text-xs font-bold text-[#10B981]">
                  {{ shift.status }}
                </span>
              </div>
              <p class="mt-3 text-sm font-semibold text-[#0F52BA]">
                {{ formatTime(shift.start) }} - {{ formatTime(shift.end) }}
              </p>
            </button>
          </div>
        </aside>

        <section class="rounded-lg border border-slate-200 bg-white">
          <div class="border-b border-slate-200 px-5 py-4">
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 class="font-bold text-[#1E293B]">Rendez-vous du shift</h2>
                <p class="text-sm text-slate-500">{{ selectedShiftTitle }}</p>
              </div>

              <button
                v-if="selectedShift"
                @click="loadAppointments(selectedShift.id)"
                class="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#0F52BA]/30 hover:bg-blue-50 hover:text-[#0F52BA]"
              >
                Actualiser
              </button>
            </div>
          </div>

          <div v-if="!selectedShift" class="p-8 text-center text-sm text-slate-500">
            Sélectionnez un shift pour afficher les rendez-vous.
          </div>

          <div v-else-if="loadingAppointments" class="p-8 text-center text-sm text-slate-500">
            Chargement des rendez-vous...
          </div>

          <div v-else-if="appointments.length === 0" class="p-8 text-center text-sm text-slate-500">
            Aucun rendez-vous dans ce shift.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Heure</th>
                  <th class="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Patient</th>
                  <th class="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Statut</th>
                  <th class="px-5 py-3 text-right text-xs font-bold uppercase text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                <tr v-for="appointment in appointments" :key="appointment.id">
                  <td class="whitespace-nowrap px-5 py-4 text-sm font-semibold text-[#1E293B]">
                    {{ formatTime(appointment.start) }}
                  </td>
                  <td class="px-5 py-4">
                    <button
                      @click="openHistory(appointment)"
                      class="text-left group"
                    >
                      <span class="block text-sm font-semibold text-[#0F52BA] group-hover:underline">{{ patientLabel(appointment) }}</span>
                      <span class="block text-xs text-slate-500">{{ shortId(appointment.id) }}</span>
                    </button>
                  </td>
                  <td class="px-5 py-4">
                    <span
                      class="rounded-full px-2.5 py-1 text-xs font-bold"
                      :class="statusClass(localStatus(appointment.id))"
                    >
                      {{ localStatus(appointment.id) }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex flex-wrap justify-end gap-2">
                      <button
                        @click="markCompleted(appointment)"
                        class="rounded-lg bg-[#10B981] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#0d9668]"
                      >
                        Completed
                      </button>
                      <button
                        @click="markNonAttended(appointment)"
                        class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        Non attended
                      </button>
                      <button v-if="appointment.type ==='CONSULTATION'"
                        @click="openReportModal(appointment, 'consultation')"
                        class="rounded-lg bg-[#0F52BA] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#0c4295]"
                      >
                        Consultation
                      </button>
                      <button v-if="appointment.type === 'TEST'"
                        @click="openReportModal(appointment, 'result')"
                        class="rounded-lg bg-[#6366F1] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#4f46e5]"
                      >
                        Résultat
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>

    <div
      v-if="historyAppointment"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      @click.self="closeHistory"
    >
      <div class="w-full max-w-2xl rounded-lg bg-white shadow-xl max-h-[90vh] flex flex-col">
        
        <div class="border-b border-slate-200 px-5 py-4 flex justify-between items-center bg-slate-50 rounded-t-lg">
          <div>
            <h3 class="font-bold text-[#1E293B]">Historique du patient</h3>
            <p class="text-sm text-slate-500">{{ patientLabel(historyAppointment) }}</p>
          </div>
          <button @click="closeHistory" class="text-slate-400 hover:text-slate-600 transition">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div class="p-5 overflow-y-auto flex-1">
          
          <div v-if="patientHistory.error" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {{ patientHistory.error }}
          </div>

          <div v-if="!historyDetail.data">
            
            <div v-if="patientHistory.loading" class="text-center text-slate-500 text-sm py-8">
              Chargement de l'historique...
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="font-bold text-[#0F52BA] mb-3 flex items-center gap-2 border-b pb-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  Consultations ({{ patientHistory.consultations.length }})
                </h4>
                <div v-if="patientHistory.consultations.length === 0" class="text-sm text-slate-500 italic">Aucune consultation.</div>
                <div class="space-y-3">
                  <button 
                    v-for="item in patientHistory.consultations" :key="item.id"
                    @click="loadHistoryDetail(item.id, 'consultation')"
                    class="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-[#0F52BA] hover:bg-blue-50 transition"
                  >
                    <p class="text-xs font-bold text-slate-500 mb-1">{{ formatDateTime(item.createdAt) }}</p>
                    <p class="text-sm font-semibold text-[#1E293B]">Par: {{ item.examinerName || 'Inconnu' }}</p>
                  </button>
                </div>
              </div>

              <div>
                <h4 class="font-bold text-[#10B981] mb-3 flex items-center gap-2 border-b pb-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  Tests de Résultat ({{ patientHistory.testResults.length }})
                </h4>
                <div v-if="patientHistory.testResults.length === 0" class="text-sm text-slate-500 italic">Aucun résultat.</div>
                <div class="space-y-3">
                  <button 
                    v-for="item in patientHistory.testResults" :key="item.id"
                    @click="loadHistoryDetail(item.id, 'test-result')"
                    class="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-[#10B981] hover:bg-emerald-50 transition"
                  >
                    <p class="text-xs font-bold text-slate-500 mb-1">{{ formatDateTime(item.createdAt) }}</p>
                    <p class="text-sm font-semibold text-[#1E293B]">Par: {{ item.examinerName || 'Inconnu' }}</p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="animate-fade-in">
            <button @click="historyDetail.data = null" class="mb-4 text-sm font-semibold text-[#0F52BA] hover:underline flex items-center gap-1">
              &larr; Retour à la liste
            </button>
            
            <div v-if="historyDetail.loading" class="text-center text-slate-500 text-sm py-8">
              Chargement des détails...
            </div>
            
            <div v-else-if="historyDetail.error" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {{ historyDetail.error }}
            </div>

            <div v-else class="space-y-4 rounded-lg bg-slate-50 p-5 border border-slate-200">
              <h4 class="font-bold text-[#1E293B] text-lg mb-2">
                Détail du {{ historyDetail.type === 'consultation' ? 'rapport de consultation' : 'résultat de test' }}
              </h4>
              
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-xs font-bold uppercase text-slate-500">Créé le</p>
                  <p class="font-semibold text-[#1E293B]">{{ formatDateTime(historyDetail.data.createdAt) }}</p>
                </div>
                <div>
                  <p class="text-xs font-bold uppercase text-slate-500">Rendez-vous du</p>
                  <p class="font-semibold text-[#1E293B]">{{ formatDateTime(historyDetail.data.appointmentStart) }}</p>
                </div>
                <div class="col-span-2">
                  <p class="text-xs font-bold uppercase text-slate-500">Examinateur</p>
                  <p class="font-semibold text-[#1E293B]">{{ historyDetail.data.examinerName }}</p>
                </div>
                <div class="col-span-2 pt-2 border-t border-slate-200">
                  <p class="text-xs font-bold uppercase text-slate-500 mb-1">URL du Rapport</p>
                  <a 
                    v-if="historyDetail.data.reportUrl || historyDetail.data.ReportUrl" 
                    :href="historyDetail.data.reportUrl || historyDetail.data.ReportUrl" 
                    target="_blank" 
                    class="text-[#0F52BA] hover:underline break-all"
                  >
                    {{ historyDetail.data.reportUrl || historyDetail.data.ReportUrl }}
                  </a>
                  <p v-else class="text-slate-400 italic">Aucun lien disponible</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="flex justify-end border-t border-slate-200 px-5 py-4 bg-slate-50 rounded-b-lg">
          <button
            @click="closeHistory"
            class="rounded-lg bg-[#1E293B] px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="reportModal.appointment"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      @click.self="closeReportModal"
    >
      <form class="w-full max-w-lg rounded-lg bg-white shadow-xl" @submit.prevent="submitReport">
        <div class="border-b border-slate-200 px-5 py-4">
          <h3 class="font-bold text-[#1E293B]">{{ reportModalTitle }}</h3>
          <p class="text-sm text-slate-500">{{ formatDateTime(reportModal.appointment.start) }}</p>
        </div>
        <div class="p-5">
          <label class="block text-sm font-semibold text-[#1E293B]" for="reportUrl">Lien du rapport</label>
          <input
            id="reportUrl"
            v-model.trim="reportUrl"
            required
            class="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/15"
            placeholder="https://..."
          />
          <p v-if="actionError" class="mt-3 text-sm font-medium text-red-600">{{ actionError }}</p>
        </div>
        <div class="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            @click="closeReportModal"
            class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="submittingReport"
            class="rounded-lg bg-[#0F52BA] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ submittingReport ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </div>
  </div>

</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import axios from 'axios';
import keycloak from '../services/keycloak';
import { fetchEventSource } from '@microsoft/fetch-event-source';

const API_BASE_URL = 'http://localhost:9090/api';

const shifts = ref([]);
const appointments = ref([]);
const nextShift = ref(null);
const selectedShift = ref(null);
const loadingShifts = ref(false);
const loadingAppointments = ref(false);
const pageError = ref('');
const actionError = ref('');
const notifications = ref([]);

// --- NOUVEAUX ETATS POUR L'HISTORIQUE ---
const historyAppointment = ref(null);
const patientHistory = reactive({
  testResults: [],
  consultations: [],
  loading: false,
  error: ''
});
const historyDetail = reactive({
  data: null,
  type: '',
  loading: false,
  error: ''
});
// -----------------------------------------

const appointmentStatuses = reactive({});
const reportUrl = ref('');
const submittingReport = ref(false);
const reportModal = reactive({
  appointment: null,
  type: 'consultation'
});

const authHeaders = computed(() => ({
  Authorization: `Bearer ${keycloak.token}`
}));

const examinerName = computed(() => {
  const token = keycloak.tokenParsed || {};
  return token.name || token.preferred_username || 'Examinateur';
});

const nextShiftLabel = computed(() => {
  if (!nextShift.value) return 'Aucun';
  return `${formatDate(nextShift.value.start)} · ${formatTime(nextShift.value.start)}`;
});

const selectedShiftTitle = computed(() => {
  if (!selectedShift.value) return 'Aucun shift sélectionné';
  const sectionName = selectedShift.value.sectionName || selectedShift.value.section?.name || 'Section';
  return `${sectionName} · ${formatDate(selectedShift.value.start)} · ${formatTime(selectedShift.value.start)}-${formatTime(selectedShift.value.end)}`;
});

const reportModalTitle = computed(() => (
  reportModal.type === 'result'
    ? 'Saisir un résultat'
    : 'Saisir une consultation'
));

onMounted(async () => {
  await loadShifts();
  subscribeToNotifications();
});

const request = () => axios.create({
  baseURL: API_BASE_URL,
  headers: authHeaders.value
});
const subscribeToNotifications = async () => {
  try {
    await keycloak.updateToken(30);

    await fetchEventSource(
      'http://localhost:9090/api/notifications/subscribe',
      {
        method: 'GET',

        headers: {
          Authorization: `Bearer ${keycloak.token}`
        },

        onopen(response) {
          console.log('SSE connection opened');

          if (!response.ok) {
            throw new Error(
              `Failed to connect: ${response.status}`
            );
          }
        },

        onmessage(event) {
          try {
            const notification = JSON.parse(event.data);

            const id = Date.now();

            notifications.value.unshift({
              id,
              message: notification.message,
              timestamp: notification.timestamp
            });

            setTimeout(() => {
              notifications.value =
                notifications.value.filter(
                  n => n.id !== id
                );
            }, 5000);

          } catch (error) {
            console.error(
              'Failed to parse notification:',
              error
            );
          }
        },

        onclose() {
          console.log('SSE connection closed');
        },

        onerror(error) {
          console.error('SSE error:', error);

          throw error; // enables automatic reconnect behavior
        }
      }
    );

  } catch (error) {
    console.error(
      'Notification subscription failed:',
      error
    );
  }
};
const loadShifts = async () => {
  loadingShifts.value = true;
  pageError.value = '';

  try {
    const [upcomingResponse, nextResponse] = await Promise.allSettled([
      request().get('/shifts/upcoming', { params: { size: 20 } }),
      request().get('/shifts/upcoming/next')
    ]);

    if (upcomingResponse.status === 'fulfilled') {
      shifts.value = upcomingResponse.value.data.content || [];
    } else {
      shifts.value = [];
      pageError.value = getErrorMessage(upcomingResponse.reason, 'Impossible de charger les shifts.');
    }

    nextShift.value = nextResponse.status === 'fulfilled' ? nextResponse.value.data : null;

    if (!selectedShift.value && shifts.value.length > 0) {
      await selectShift(shifts.value[0]);
    } else if (selectedShift.value) {
      const stillExists = shifts.value.find((shift) => shift.id === selectedShift.value.id);
      selectedShift.value = stillExists || shifts.value[0] || null;
      if (selectedShift.value) {
        await loadAppointments(selectedShift.value.id);
      }
    }
  } finally {
    loadingShifts.value = false;
  }
};

const selectShift = async (shift) => {
  selectedShift.value = shift;
  await loadAppointments(shift.id);
};

const loadAppointments = async (shiftId) => {
  loadingAppointments.value = true;
  actionError.value = '';

  try {
    const response = await request().get(`/appointements/shifts/${shiftId}`);
    appointments.value = response.data || [];
  } catch (error) {
    appointments.value = [];
    pageError.value = getErrorMessage(error, 'Impossible de charger les rendez-vous.');
  } finally {
    loadingAppointments.value = false;
  }
};

const markCompleted = async (appointment) => {
  await runAppointmentAction(
    () => request().post(`/appointements/${appointment.id}/complete`),
    appointment.id,
    'COMPLETED'
  );
};

const markNonAttended = async (appointment) => {
  await runAppointmentAction(
    () => request().post(`/appointements/${appointment.id}/non-attended`),
    appointment.id,
    'NON_ATTENDED'
  );
};

const runAppointmentAction = async (action, appointmentId, status) => {
  actionError.value = '';
  try {
    await action();
    appointmentStatuses[appointmentId] = status;
  } catch (error) {
    actionError.value = getErrorMessage(error, "L'action n'a pas pu être effectuée.");
    pageError.value = actionError.value;
  }
};

const openReportModal = (appointment, type) => {
  reportModal.appointment = appointment;
  reportModal.type = type;
  reportUrl.value = '';
  actionError.value = '';
};

const closeReportModal = () => {
  reportModal.appointment = null;
  reportUrl.value = '';
  actionError.value = '';
};

const submitReport = async () => {
  if (!reportModal.appointment) return;

  submittingReport.value = true;
  actionError.value = '';

  const endpoint = reportModal.type === 'result'
    ? `/appointements/${reportModal.appointment.id}/test-results`
    : `/appointements/${reportModal.appointment.id}/consultations`;

  try {
    await request().post(endpoint, { reportUrl: reportUrl.value });
    appointmentStatuses[reportModal.appointment.id] = 'FINALIZED';
    closeReportModal();
  } catch (error) {
    actionError.value = getErrorMessage(error, "Le rapport n'a pas pu être enregistré.");
  } finally {
    submittingReport.value = false;
  }
};

// ==============================================
// GESTION DE L'HISTORIQUE PATIENT
// ==============================================
const openHistory = async (appointment) => {
  historyAppointment.value = appointment;
  historyDetail.data = null; // Réinitialiser les détails
  
  // Chercher l'id patient depuis l'appointment
  const patientId = appointment.patientId || appointment.patient?.id;
  console.log("Patient ID trouvé:", patientId);
  
  if (!patientId) {
    patientHistory.error = "L'identifiant du patient est introuvable.";
    return;
  }

  await loadPatientHistory(patientId);
};

const loadPatientHistory = async (patientId) => {
  patientHistory.loading = true;
  patientHistory.error = '';
  patientHistory.testResults = [];
  patientHistory.consultations = [];

  try {
    const [testsRes, consRes] = await Promise.allSettled([
      request().get(`/test-result/patient/${patientId}`),
      request().get(`/consultation/patient/${patientId}`)
    ]);

    if (testsRes.status === 'fulfilled') patientHistory.testResults = testsRes.value.data || [];
    if (consRes.status === 'fulfilled') patientHistory.consultations = consRes.value.data || [];
  } catch (error) {
    patientHistory.error = "Erreur lors du chargement de l'historique du patient.";
  } finally {
    patientHistory.loading = false;
  }
};

const loadHistoryDetail = async (id, type) => {
  historyDetail.loading = true;
  historyDetail.error = '';
  historyDetail.type = type;
  historyDetail.data = null;

  try {
    const endpoint = type === 'consultation' 
      ? `/consultation/${id}` 
      : `/test-result/${id}`; // Modifié selon convention standard REST
    
    const res = await request().get(endpoint);
    historyDetail.data = res.data;
  } catch (error) {
    historyDetail.error = "Impossible de charger les détails du document.";
  } finally {
    historyDetail.loading = false;
  }
};

const closeHistory = () => {
  historyAppointment.value = null;
  historyDetail.data = null;
};
// ==============================================

const localStatus = (appointmentId) => appointmentStatuses[appointmentId] || 'ACTIVE';

const statusClass = (status) => {
  const classes = {
    ACTIVE: 'bg-blue-50 text-[#0F52BA]',
    COMPLETED: 'bg-emerald-50 text-[#10B981]',
    NON_ATTENDED: 'bg-amber-50 text-amber-700',
    FINALIZED: 'bg-indigo-50 text-[#6366F1]'
  };
  return classes[status] || 'bg-slate-100 text-slate-600';
};

const patientLabel = (appointment) => appointment?.patientName || appointment?.patient?.name || 'Patient';

const shortId = (id) => (id ? `ID ${id.slice(0, 8)}` : 'ID non disponible');

const formatDate = (value) => {
  if (!value) return '--';
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }).format(new Date(value));
};

const formatTime = (value) => {
  if (!value) return '--:--';
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
};

const formatDateTime = (value) => {
  if (!value) return '--';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
};

const getErrorMessage = (error, fallback) => (
  error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback
);

const logout = () => keycloak.logout({ redirectUri: window.location.origin });
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>