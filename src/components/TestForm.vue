<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import keycloak from '../services/keycloak';

const emit = defineEmits(['submit', 'cancel', 'done']);

// --- STATE MANAGEMENT ---
const testSections = ref([]); 
const availableTimeSlots = ref([]); 

// Choix de la section interne : 'libre' (Section 1) ou 'slots' (Section 2)
const activeSection = ref('libre'); 

const loadingSections = ref(false);
const loadingSlots = ref(false);   
const isSubmitting = ref(false);
const showSuccessScreen = ref(false); 

const errorMessage = ref('');
const slotErrorMessage = ref('');    
const submitErrorMessage = ref(''); 

// Form Selections
const selectedSectionId = ref('');
const selectedDate = ref('');
const selectedTime = ref(''); 
const selectedSlot = ref(''); 

// --- DYNAMIC HINT FOR SECTION 1 ---
const currentSelectedSection = computed(() => {
  return testSections.value.find(s => s.id === selectedSectionId.value);
});

const durationHintMessage = computed(() => {
  if (!currentSelectedSection.value || !currentSelectedSection.value.duration) return '';
  
  const durationStr = currentSelectedSection.value.duration; // Format ISO "PT10M"
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  let totalMinutes = 0;
  if (match) {
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    totalMinutes = (hours * 60) + minutes;
  }

  if (totalMinutes <= 0 || totalMinutes >= 60) {
    return "💡 Veuillez choisir un horaire adapté au planning du service.";
  }

  const intervals = [];
  for (let min = 0; min < 60; min += totalMinutes) {
    intervals.push(`:${min.toString().padStart(2, '0')}`);
  }

  return `💡 Pour cet examen (${totalMinutes} min), l'heure doit se terminer par : ${intervals.join(', ')}`;
});

// --- FETCH TEST SECTIONS (SECTION 1 & 2 COMMON) ---
onMounted(async () => {
  loadingSections.value = true;
  errorMessage.value = '';
  try {
    if (keycloak && keycloak.updateToken) await keycloak.updateToken(30);

    const response = await axios.get('http://localhost:9090/api/sections', {
      headers: { Authorization: `Bearer ${keycloak.token}` }
    });
    
    const rawList = Array.isArray(response.data) ? response.data : (response.data.content || []);
    // Filtrage pour ne garder que les départements de test (testName non nul et différent de 'none')
    testSections.value = rawList.filter(s => s.testName && s.testName.toLowerCase() !== 'none');
  } catch (error) {
    console.error("Erreur sections:", error);
    errorMessage.value = "Impossible de récupérer les services de test.";
  } finally {
    loadingSections.value = false;
  }
});

// --- SECTION 2 LOGIC: FETCH & DISTINCT AVAILABLE TIMESLOTS ---
const fetchAvailableTestTimes = async () => {
  if (!selectedSectionId.value) {
    availableTimeSlots.value = [];
    return;
  }

  loadingSlots.value = true;
  slotErrorMessage.value = '';
  selectedSlot.value = ''; 

  try {
    if (keycloak && keycloak.updateToken) await keycloak.updateToken(30);

    const response = await axios.get(`http://localhost:9090/api/appointements/sections/${selectedSectionId.value}/available-times-for-test`, {
      headers: { Authorization: `Bearer ${keycloak.token}` }
    });

    const rawSlots = Array.isArray(response.data) ? response.data : [];
    
    // 🌟 FILTRAGE DISTINCT : On élimine les doublons de Start
    const uniqueSlots = [];
    const seenStarts = new Set();

    for (const slot of rawSlots) {
      const startTime = slot.Start || slot.start;
      if (!seenStarts.has(startTime)) {
        seenStarts.add(startTime);
        uniqueSlots.push(slot);
      }
    }

    // Tri chronologique
    uniqueSlots.sort((a, b) => new Date(a.Start || a.start) - new Date(b.Start || b.start));
    availableTimeSlots.value = uniqueSlots;

  } catch (error) {
    console.error("Erreur créneaux:", error);
    slotErrorMessage.value = "Erreur lors de la récupération des plages horaires.";
    availableTimeSlots.value = [];
  } finally {
    loadingSlots.value = false;
  }
};

// Si l'utilisateur change de méthode ou de section, on adapte les données
watch(selectedSectionId, () => {
  if (activeSection.value === 'slots') {
    fetchAvailableTestTimes();
  }
});

watch(activeSection, (newVal) => {
  if (newVal === 'slots') {
    fetchAvailableTestTimes();
  } else {
    selectedSlot.value = '';
  }
});

// --- SUBMIT FUNCTION (COMMON FOR BOTH SECTIONS) ---
const runFormSubmission = async () => {
  if (isSubmitting.value) return; 

  isSubmitting.value = true;
  submitErrorMessage.value = '';

  let formattedLocalDateTime = '';

  if (activeSection.value === 'libre') {
    // Section 1
    formattedLocalDateTime = `${selectedDate.value}T${selectedTime.value}:00`;
  } else {
    // Section 2
    formattedLocalDateTime = selectedSlot.value;
  }

  try {
    if (keycloak && keycloak.updateToken) await keycloak.updateToken(30);

    await axios.post(
      `http://localhost:9090/api/appointements/TestSections/${selectedSectionId.value}`,
      {}, 
      {
        headers: { Authorization: `Bearer ${keycloak.token}` },
        params: { startTime: formattedLocalDateTime }
      }
    );

    showSuccessScreen.value = true;
  } catch (error) {
    console.error("Erreur soumission:", error);
    if (error.response && error.response.data && error.response.data.error) {
      submitErrorMessage.value = error.response.data.error;
    } else {
      submitErrorMessage.value = "Une erreur est survenue lors de la réservation.";
    }
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
      <h3 class="text-lg font-bold text-slate-800 mb-2">Examen Réservé avec succès !</h3>
      <p class="text-xs text-slate-500 mb-8 max-w-xs">Votre rendez-vous d'examen a été enregistré.</p>
      <button type="button" @click="handleDone" class="px-8 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl w-full sm:w-auto">
        Terminer
      </button>
    </div>

    <template v-else>
      <div class="p-8 overflow-y-auto max-h-[460px] flex-1">
        
        <div class="mb-5">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">1. Sélection du Type d'Examen</label>
          <div v-if="loadingSections" class="text-xs text-slate-400 py-2">⏳ Chargement des examens...</div>
          <select v-else v-model="selectedSectionId" class="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F52BA]">
            <option value="" disabled>Choisir un examen</option>
            <option v-for="sec in testSections" :key="sec.id" :value="sec.id">{{ sec.testName }}</option>
          </select>
        </div>

        <div v-if="selectedSectionId" class="mb-6">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">2. Méthode de réservation</label>
          <div class="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/40">
            <button 
              type="button" 
              @click="activeSection = 'libre'"
              :class="activeSection === 'libre' ? 'bg-white text-slate-800 shadow-sm font-bold' : 'text-slate-500 font-medium'"
              class="py-2 text-xs rounded-lg transition-all text-center"
            >
              Section 1 : Saisie Libre
            </button>
            <button 
              type="button" 
              @click="activeSection = 'slots'"
              :class="activeSection === 'slots' ? 'bg-white text-slate-800 shadow-sm font-bold' : 'text-slate-500 font-medium'"
              class="py-2 text-xs rounded-lg transition-all text-center"
            >
              Section 2 : Créneaux Disponibles
            </button>
          </div>
        </div>

        <div v-if="selectedSectionId && activeSection === 'libre'" class="space-y-4 mb-6 animate-fadeIn">
          <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wide border-b pb-1.5 border-slate-100">Saisie de la Date & Heure</h4>
          
          <div>
            <span class="text-[11px] text-slate-400 block mb-1">Date d'examen :</span>
            <input type="date" v-model="selectedDate" class="w-full sm:w-1/2 px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50" />
          </div>
          
          <div v-if="selectedDate" class="space-y-1">
            <span class="text-[11px] text-slate-400 block mb-1">Heure de l'examen :</span>
            
            <span class="text-[10px] text-blue-600 font-semibold block bg-blue-50/60 py-2 px-3 rounded border border-blue-100 w-full sm:w-2/3 mb-2">
              {{ durationHintMessage }}
            </span>
            
            <input type="time" v-model="selectedTime" class="w-full sm:w-1/2 px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:bg-white focus:border-[#0F52BA]" />
          </div>
        </div>

        <div v-if="selectedSectionId && activeSection === 'slots'" class="space-y-4 animate-fadeIn">
          <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wide border-b pb-1.5 border-slate-100">Plages Horaires Ouvertes</h4>
          
          <div v-if="loadingSlots" class="text-xs text-slate-400 italic py-3">🔄 Recherche des créneaux distincts disponibles...</div>
          <div v-else-if="slotErrorMessage" class="text-xs text-red-500 py-1">⚠️ {{ slotErrorMessage }}</div>
          
          <div v-else>
            <div v-if="availableTimeSlots.length === 0" class="text-xs text-amber-600 bg-amber-50 border border-amber-100 p-4 rounded-xl">
              Aucun créneau libre trouvé pour cet examen.
            </div>

            <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button 
                v-for="(slot, idx) in availableTimeSlots" :key="idx"
                type="button"
                @click="selectedSlot = (slot.Start || slot.start)" 
                :class="selectedSlot === (slot.Start || slot.start) ? 'bg-[#0F52BA] border-[#0F52BA] text-white shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'"
                class="text-[11px] font-semibold py-2.5 px-3 border rounded-xl text-center transition-all flex flex-col items-center justify-center"
              >
                {{ formatDtoDateTime(slot.Start || slot.start) }}
              </button>
            </div>
          </div>
        </div>

      </div>

      <div v-if="submitErrorMessage" class="px-8 pb-2">
        <div class="text-xs text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg flex items-start gap-2">
          <span>❌</span>
          <span>{{ submitErrorMessage }}</span>
        </div>
      </div>

      <div class="p-4 bg-slate-50 border-t flex justify-end gap-3 mt-auto">
        <button type="button" @click="emit('cancel')" :disabled="isSubmitting" class="px-5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl disabled:opacity-50">Annuler</button>
        <button 
          type="button" @click="runFormSubmission"
          :disabled="!selectedSectionId || (activeSection === 'libre' ? (!selectedDate || !selectedTime) : !selectedSlot) || isSubmitting"
          class="px-6 py-2 text-xs font-bold text-white bg-[#0F52BA] rounded-xl shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="isSubmitting">⏳ Enregistrement...</span>
          <span v-else>Confirmer le Rendez-vous</span>
        </button>
      </div>
    </template>

  </div>
</template>