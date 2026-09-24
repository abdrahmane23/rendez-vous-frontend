<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import keycloak from '../services/keycloak';

const emit = defineEmits(['submit', 'cancel', 'done']);

// --- GESTION DES ONGLETS INTERNES ---
const activeTab = ref(1); 

// --- STATE MANAGEMENT ---
const sections = ref([]); 
const examiners = ref([]); 
const availableTimeSlots = ref([]); 
const globalTimeSlotsMap = ref({}); 

const loadingSections = ref(false);
const loadingExaminers = ref(false);
const loadingSlots = ref(false);   
const loadingGlobalSlots = ref(false); 
const isSubmitting = ref(false);
const showSuccessScreen = ref(false); 

const errorMessage = ref('');
const examinerErrorMessage = ref('');
const slotErrorMessage = ref('');    
const globalSlotErrorMessage = ref(''); 
const submitErrorMessage = ref(''); 

// Form Selections
const selectedSectionId = ref('');
const selectedDate = ref('');
const selectedTime = ref(''); 
const selectedSlot = ref(''); 
const selectedDoctorId = ref(null);
const selectedDoctorName = ref(''); 

// --- INITIAL FETCH: SERVICES DE CONSULTATION ---
onMounted(async () => {
  loadingSections.value = true;
  errorMessage.value = '';
  try {
    if (keycloak && keycloak.updateToken) await keycloak.updateToken(30);

    const response = await axios.get('http://localhost:9090/api/sections', {
      headers: { Authorization: `Bearer ${keycloak.token}` }
    });
    
    const rawList = Array.isArray(response.data) ? response.data : (response.data.content || []);
    console.log("Réponse brute des sections :", rawList);
    sections.value = rawList.filter(s => !s.testName || s.testName.toLowerCase() === 'none');
    console.log("Sections de consultation récupérées :", sections.value);
  } catch (error) {
    console.error("Erreur sections:", error);
    errorMessage.value = "Impossible de récupérer les services.";
  } finally {
    loadingSections.value = false;
  }
});

// --- ONGLET 1 : RECHERCHE DES MEDECINS DISPONIBLES ---
const fetchAvailableExaminers = async () => {
  if (activeTab.value !== 1) return; 

  const startTimeVal = selectedTime.value;
  if (!selectedSectionId.value || !selectedDate.value || !startTimeVal) {
    examiners.value = [];
    return;
  }

  loadingExaminers.value = true;
  examinerErrorMessage.value = '';

  try {
    if (keycloak && keycloak.updateToken) await keycloak.updateToken(30);
    const formattedLocalDateTime = `${selectedDate.value}T${startTimeVal}:00`;

    const response = await axios.get(`http://localhost:9090/api/examiner/available/${selectedSectionId.value}`, {
      headers: { Authorization: `Bearer ${keycloak.token}` },
      params: { startTime: formattedLocalDateTime }
    });

    examiners.value = Array.isArray(response.data) ? response.data : (response.data.content || []);
  } catch (error) {
    console.error("Erreur examinateurs filtrés:", error);
    examinerErrorMessage.value = "Erreur lors du filtrage des praticiens disponibles.";
  } finally {
    loadingExaminers.value = false;
  }
};

// --- ONGLET 2 : TOUS LES MEDECINS D'UN SERVICE ---
const fetchAllExaminersBySection = async () => {
  if (activeTab.value !== 2 || !selectedSectionId.value) {
    return;
  }

  loadingExaminers.value = true;
  examinerErrorMessage.value = '';

  try {
    if (keycloak && keycloak.updateToken) await keycloak.updateToken(30);

    const response = await axios.get(`http://localhost:9090/api/examiner/all/${selectedSectionId.value}`, {
      headers: { Authorization: `Bearer ${keycloak.token}` }
    });
    
     examiners.value = Array.isArray(response.data) ? response.data : (response.data.content || []);
    console.log( examiners.value.length);
  } catch (error) {
    console.error("Erreur récupération tous examinateurs:", error);
    examinerErrorMessage.value = "Impossible de charger les médecins du département.";
  } finally {
    loadingExaminers.value = false;
  }
};

// --- ONGLET 2 : CRÉNEAUX DISPONIBLES PAR PRATICIEN ---
const fetchDoctorAvailableTimes = async (doctor) => {
  selectedDoctorId.value = doctor.id;
  selectedDoctorName.value = doctor.name || `${doctor.firstName} ${doctor.lastName}`;
  selectedSlot.value = ''; 
  loadingSlots.value = true;
  slotErrorMessage.value = '';

  try {
    if (keycloak && keycloak.updateToken) await keycloak.updateToken(30);

    const response = await axios.get(`http://localhost:9090/api/appointements/sections/${selectedSectionId.value}/available-times/${doctor.id}`, {
      headers: { Authorization: `Bearer ${keycloak.token}` }
    });

    const allSlots = Array.isArray(response.data) ? response.data : [];
    const now = new Date(); // Date et heure actuelles

    // Filtrer pour ne garder que les créneaux futurs
    availableTimeSlots.value = allSlots.filter(slot => {
      // Gérer la casse selon la structure (Start ou start)
      const startTimeString = slot.start || slot.Start; 
      
      if (!startTimeString) return false; // Ignorer si le format est invalide

      const slotStartTime = new Date(startTimeString);
      return slotStartTime > now;
    });

  } catch (error) {
    console.error("Erreur créneaux horaires:", error);
    slotErrorMessage.value = "Erreur lors de la récupération des disponibilités de ce médecin.";
    availableTimeSlots.value = [];
  } finally {
    loadingSlots.value = false;
  }
};

// --- ONGLET 3 : RECHERCHE GLOBALE (MAP) ---
const fetchGlobalAvailableTimes = async () => {
  if (activeTab.value !== 3 || !selectedSectionId.value) {
    globalTimeSlotsMap.value = {};
    return;
  }

  loadingGlobalSlots.value = true;
  globalSlotErrorMessage.value = '';

  try {
    if (keycloak && keycloak.updateToken) await keycloak.updateToken(30);

    const response = await axios.get(`http://localhost:9090/api/appointements/sections/${selectedSectionId.value}/available-times`, {
      headers: { Authorization: `Bearer ${keycloak.token}` }
    });

    globalTimeSlotsMap.value = response.data || {};
  } catch (error) {
    console.error("Erreur créneaux globaux:", error);
    globalSlotErrorMessage.value = "Impossible de charger les horaires du département.";
    globalTimeSlotsMap.value = {};
  } finally {
    loadingGlobalSlots.value = false;
  }
};

// --- WATCHERS NETTOYÉS (SANS EFFETS DE BORD) ---
watch([selectedDate, selectedTime], () => {
  if (activeTab.value === 1) fetchAvailableExaminers();
});

watch(selectedSectionId, () => {
  // Reset complet et unique lors du changement de département principal
  selectedDate.value = '';
  selectedTime.value = '';
  selectedSlot.value = '';
  selectedDoctorId.value = null;
  selectedDoctorName.value = '';
  examiners.value = [];
  availableTimeSlots.value = [];
  globalTimeSlotsMap.value = {};

  if (activeTab.value === 1) fetchAvailableExaminers();
  if (activeTab.value === 2) fetchAllExaminersBySection();
  if (activeTab.value === 3) fetchGlobalAvailableTimes(); 
});

watch(activeTab, (newTab) => {
  // Reset lors du changement de méthode/onglet
  selectedDate.value = '';
  selectedTime.value = '';
  selectedSlot.value = '';
  selectedDoctorId.value = null;
  selectedDoctorName.value = '';
  examiners.value = [];
  availableTimeSlots.value = [];
  globalTimeSlotsMap.value = {}; 
  submitErrorMessage.value = '';

  if (newTab === 1) fetchAvailableExaminers();
  if (newTab === 2) fetchAllExaminersBySection();
  if (newTab === 3) fetchGlobalAvailableTimes();
});

// --- SUBMIT ---
const runFormSubmission = async () => {
  if (isSubmitting.value) return; 

  isSubmitting.value = true;
  submitErrorMessage.value = '';

  const formattedLocalDateTime = activeTab.value === 1 
    ? `${selectedDate.value}T${selectedTime.value}:00` 
    : selectedSlot.value;

  try {
    if (keycloak && keycloak.updateToken) await keycloak.updateToken(30);

    await axios.post(
      `http://localhost:9090/api/appointements/sections/${selectedSectionId.value}/${selectedDoctorId.value}`,
      {}, 
      {
        headers: { Authorization: `Bearer ${keycloak.token}` },
        params: { startTime: formattedLocalDateTime }
      }
    );

    showSuccessScreen.value = true;
  } catch (error) {
    console.error("Erreur création rendez-vous:", error);
    submitErrorMessage.value = error.response?.data?.error || "Une erreur est survenue lors de la création du rendez-vous.";
  } finally {
    isSubmitting.value = false;
  }
};

const formatDtoDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  const dateObj = new Date(dateTimeString);
  return dateObj.toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const handleDone = () => {
  emit('submit');
  emit('done'); 
};
</script>

<template>
  <div class="flex flex-col h-full justify-between flex-1 relative">
    
    <div v-if="showSuccessScreen" class="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center p-8 text-center h-full">
      <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
        <span class="text-3xl">✅</span>
      </div>
      <h3 class="text-lg font-bold text-slate-800 mb-2">Rendez-vous Confirmé !</h3>
      <p class="text-xs text-slate-500 mb-8 max-w-xs">
        Votre consultation a été enregistrée avec succès. Le praticien a été notifié.
      </p>
      <button type="button" @click="handleDone" class="px-8 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md w-full sm:w-auto">
        Terminer
      </button>
    </div>

    <template v-else>
      <div class="p-8 overflow-y-auto max-h-[460px] flex-1">
        
        <div class="mb-5">
          <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">1. Sélection du Département</label>
          <div v-if="loadingSections" class="text-xs text-slate-400 py-2">⏳ Chargement des services...</div>
          <select v-else v-model="selectedSectionId" class="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F52BA]">
            <option value="" disabled>Choisir un département</option>
            <option v-for="sec in sections" :key="sec.id" :value="sec.id">{{ sec.name }}</option>
          </select>
        </div>

        <div v-if="selectedSectionId" class="mb-6">
          <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">2. Méthode de Réservation</label>
          
          <div class="bg-slate-100 p-1 rounded-xl flex gap-1 w-full">
            <button 
              type="button" 
              @click="activeTab = 1" 
              :class="activeTab === 1 ? 'bg-white text-slate-800 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'" 
              class="flex-1 text-center py-2 text-xs rounded-lg transition-all"
            >
              Saisie Libre
            </button>
            <button 
              type="button" 
              @click="activeTab = 2" 
              :class="activeTab === 2 ? 'bg-white text-slate-800 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'" 
              class="flex-1 text-center py-2 text-xs rounded-lg transition-all"
            >
              Par Praticien
            </button>
            <button 
              type="button" 
              @click="activeTab = 3" 
              :class="activeTab === 3 ? 'bg-white text-slate-800 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'" 
              class="flex-1 text-center py-2 text-xs rounded-lg transition-all"
            >
              Vue Globale
            </button>
          </div>
        </div>

        <div v-if="selectedSectionId && activeTab === 1" class="space-y-4 mb-6">
          <div>
            <span class="text-[11px] text-slate-400 block mb-1">Date de consultation :</span>
            <input type="date" v-model="selectedDate" class="w-full sm:w-1/2 px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50" />
          </div>
          <div v-if="selectedDate" class="space-y-1">
            <span class="text-[11px] text-slate-400 block">Heure de début :</span>
            <span class="text-[10px] text-blue-600 font-semibold block bg-blue-50 py-1 px-2 rounded border border-blue-100 w-full sm:w-1/2">
              💡 L'heure doit se terminer par : :00, :20, ou :40
            </span>
            <input type="time" v-model="selectedTime" class="w-full sm:w-1/2 px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:bg-white focus:border-[#0F52BA]" />
          </div>

          <div v-if="selectedDate && selectedTime">
            <hr class="border-slate-100 my-4" />
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Praticiens disponibles sur cette plage</label>
            <div v-if="loadingExaminers" class="text-xs text-slate-400 italic py-3">🔄 Recherche de médecins libres...</div>
            <div v-else-if="examinerErrorMessage" class="text-xs text-red-500 py-1">⚠️ {{ examinerErrorMessage }}</div>
            <div v-else>
              <div v-if="examiners.length === 0" class="text-xs text-amber-600 bg-amber-50 border border-amber-100 p-3 rounded-xl">
                Aucun médecin n'est disponible à cette heure précise pour ce service.
              </div>
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div v-for="doc in examiners" :key="doc.id" @click="selectedDoctorId = doc.id" :class="selectedDoctorId === doc.id ? 'border-[#0F52BA] bg-blue-50 ring-1 ring-[#0F52BA]' : 'border-slate-200 bg-white'" class="border rounded-xl p-3 cursor-pointer flex items-center gap-3 transition-all">
                  <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs">👨‍⚕️</div>
                  <div>
                    <h5 class="text-xs font-bold text-slate-800">{{ doc.name || `${doc.firstName} ${doc.lastName}` }}</h5>
                    <p class="text-[10px] text-emerald-600 font-medium">Libre sur ce créneau</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedSectionId && activeTab === 2" class="mt-4">
          <div v-if="!selectedDoctorId">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Choisir un Praticien du Département</label>
            <div v-if="loadingExaminers" class="text-xs text-slate-400 italic py-3">⏳ Chargement des médecins actifs...</div>
            <div v-else-if="examinerErrorMessage" class="text-xs text-red-500 py-1">⚠️ {{ examinerErrorMessage }}</div>
            <div v-else>
              <div v-if="examiners.length === 0" class="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl">Aucun médecin disponible dans ce département.</div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div 
                  v-for="doc in examiners" :key="doc.id" 
                  @click="fetchDoctorAvailableTimes(doc)" 
                  class="border border-slate-200 bg-white hover:border-[#0F52BA] hover:shadow-sm rounded-xl p-3.5 cursor-pointer flex items-center gap-3 transition-all"
                >
                  <div class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm">👨‍⚕️</div>
                  <div class="flex-1">
                    <h5 class="text-xs font-bold text-slate-800">{{ doc.name || `${doc.firstName} ${doc.lastName}` }}</h5>
                    <p class="text-[10px] text-slate-400">Cliquez pour voir les disponibilités</p>
                  </div>
                  <span class="text-slate-300 text-xs">➔</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs">👨‍⚕️</div>
                <div>
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Médecin Sélectionné</span>
                  <h4 class="text-xs font-bold text-slate-800">{{ selectedDoctorName }}</h4>
                </div>
              </div>
              <button type="button" @click="selectedDoctorId = null; availableTimeSlots = []; selectedSlot = '';" class="text-[11px] font-bold text-[#0F52BA] hover:underline px-2 py-1">
                Modifier
              </button>
            </div>

            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sélectionner un Créneau Libre</label>
            <div v-if="loadingSlots" class="text-xs text-slate-400 italic py-3">🔄 Récupération du planning...</div>
            <div v-else-if="slotErrorMessage" class="text-xs text-red-500 py-1">⚠️ {{ slotErrorMessage }}</div>
            <div v-else>
              <div v-if="availableTimeSlots.length === 0" class="text-xs text-amber-600 bg-amber-50 border border-amber-100 p-4 rounded-xl">
                Ce médecin n'a aucun créneau libre actuellement.
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button 
                  v-for="(slot, idx) in availableTimeSlots" :key="idx"
                  type="button"
                  @click="selectedSlot = (slot.Start || slot.start)" 
                  :class="selectedSlot === (slot.Start || slot.start) ? 'bg-[#0F52BA] border-[#0F52BA] text-white shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'"
                  class="text-[11px] font-semibold py-2.5 px-3 border rounded-xl text-center transition-all"
                >
                  {{ formatDtoDateTime(slot.Start || slot.start) }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedSectionId && activeTab === 3" class="mt-4">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Disponibilités globales du service</label>
          
          <div v-if="loadingGlobalSlots" class="text-xs text-slate-400 italic py-3">🔄 Récupération de tous les plannings du service...</div>
          <div v-else-if="globalSlotErrorMessage" class="text-xs text-red-500 py-1">⚠️ {{ globalSlotErrorMessage }}</div>
          
          <div v-else>
            <div v-if="Object.keys(globalTimeSlotsMap).length === 0" class="text-xs text-amber-600 bg-amber-50 border border-amber-100 p-4 rounded-xl">
              Aucun créneau disponible dans ce service actuellement.
            </div>
            
            <div v-else class="space-y-5">
              <div v-for="(slots, docId, index) in globalTimeSlotsMap" :key="docId" class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <h4 class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">👨‍⚕️</span>
                  Praticien {{ index + 1 }}
                </h4>
                
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button 
                    v-for="(slot, idx) in slots" :key="idx"
                    type="button"
                    @click="selectedDoctorId = docId; selectedSlot = (slot.Start || slot.start)" 
                    :class="(selectedDoctorId === docId && selectedSlot === (slot.Start || slot.start)) ? 'bg-[#0F52BA] border-[#0F52BA] text-white shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'"
                    class="text-[11px] font-semibold py-2 px-2 border rounded-lg text-center transition-all"
                  >
                    {{ formatDtoDateTime(slot.Start || slot.start) }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div v-if="submitErrorMessage" class="px-8 pb-2">
        <div class="text-xs text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg flex items-start gap-2">
          <span>❌</span> <span>{{ submitErrorMessage }}</span>
        </div>
      </div>

      <div class="p-4 bg-slate-50 border-t flex justify-end gap-3 mt-auto">
        <button type="button" @click="emit('cancel')" :disabled="isSubmitting" class="px-5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl disabled:opacity-50">Annuler</button>
        <button 
          type="button" @click="runFormSubmission"
          :disabled="!selectedSectionId || (!selectedDoctorId) || (activeTab === 1 ? (!selectedDate || !selectedTime) : !selectedSlot) || isSubmitting"
          class="px-6 py-2 text-xs font-bold text-white bg-[#0F52BA] rounded-xl shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="isSubmitting">⏳ Création en cours...</span>
          <span v-else>Confirmer le Rendez-vous</span>
        </button>
      </div>
    </template>

  </div>
</template>