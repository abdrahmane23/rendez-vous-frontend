<template>
  <div class="flex gap-8 bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px] overflow-hidden">
    
    <aside class="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col gap-2">
      <button 
        @click="changeVerticalTab('sections')"
        :class="[
          verticalTab === 'sections' ? 'bg-[#0F52BA] text-white shadow-sm' : 'text-[#1E293B] hover:bg-gray-100',
          'w-full text-left px-4 py-3 rounded-md font-medium text-sm transition-all flex items-center space-x-3'
        ]"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
        <span>Shifts par Section</span>
      </button>

      <button 
        @click="changeVerticalTab('examiners')"
        :class="[
          verticalTab === 'examiners' ? 'bg-[#0F52BA] text-white shadow-sm' : 'text-[#1E293B] hover:bg-gray-100',
          'w-full text-left px-4 py-3 rounded-md font-medium text-sm transition-all flex items-center space-x-3'
        ]"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
        <span>Shifts par Examinateur</span>
      </button>

      <button 
        @click="changeVerticalTab('create')"
        :class="[
          verticalTab === 'create' ? 'bg-[#0F52BA] text-white shadow-sm' : 'text-[#1E293B] hover:bg-gray-100',
          'w-full text-left px-4 py-3 rounded-md font-medium text-sm transition-all flex items-center space-x-3'
        ]"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        <span>Créer un Shift</span>
      </button>
    </aside>

    <div class="flex-1 p-6 flex flex-col relative overflow-y-auto max-h-[800px]">
      
      <div v-if="errorMessage" class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex justify-between items-center text-sm">
        <span>{{ errorMessage }}</span>
        <button @click="errorMessage = null" class="font-bold hover:text-red-900">&times;</button>
      </div>
      <div v-if="successMessage" class="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-[#10B981] rounded-md flex justify-between items-center text-sm font-medium">
        <span>{{ successMessage }}</span>
        <button @click="successMessage = null" class="font-bold hover:text-emerald-900">&times;</button>
      </div>

      <div v-if="verticalTab === 'sections'" class="space-y-4">
        
        <div v-if="!selectedSectionId">
          <h2 class="text-xl font-bold text-[#1E293B] mb-4">Choisissez une Section</h2>
          <div v-if="sections.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div 
              v-for="section in sections" :key="section.id"
              @click="selectSection(section.id)"
              class="p-4 border border-gray-200 rounded-lg hover:border-[#0F52BA] hover:shadow-md cursor-pointer transition-all bg-white"
            >
              <h4 class="font-bold text-gray-800 text-lg">{{ section.name }}</h4>
            </div>
          </div>
          <p v-else class="text-gray-500 italic text-sm">Aucune section trouvée.</p>
        </div>

        <div v-else>
          <div class="flex items-center gap-3 mb-6">
            <button @click="selectedSectionId = null; shifts = []" class="text-sm font-medium text-gray-500 hover:text-[#0F52BA] flex items-center gap-1">
              &larr; Retour
            </button>
            <h2 class="text-xl font-bold text-[#1E293B]">Shifts de la section</h2>
          </div>

          <div v-if="shifts.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ShiftCard 
              v-for="shift in shifts" :key="shift.id"
              :shift="shift"
              context="section"
              @viewDetails="fetchShiftDetails"
              @delete="handleDeleteShift"
              @cancel="handleCancelShift"
              @complete="handleCompleteShift"
              @nonAttended="handleNonAttendedShift"
            />
          </div>
          <p v-else class="text-gray-500 italic text-sm p-8 bg-gray-50 rounded text-center">Aucun shift planifié pour cette section.</p>
        </div>
      </div>

      <div v-if="verticalTab === 'examiners'" class="space-y-4">
        
        <div v-if="!selectedExaminerId">
          <h2 class="text-xl font-bold text-[#1E293B] mb-4">Choisissez un Examinateur</h2>
          <div v-if="examiners.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div 
              v-for="examiner in examiners" :key="examiner.id"
              @click="selectExaminer(examiner.id)"
              class="p-4 border border-gray-200 rounded-lg hover:border-[#0F52BA] hover:shadow-md cursor-pointer transition-all bg-white"
            >
              <h4 class="font-bold text-gray-800 text-lg">{{ examiner.firstName }} {{ examiner.name }}</h4>
            </div>
          </div>
          <p v-else class="text-gray-500 italic text-sm">Aucun examinateur trouvé.</p>
        </div>

        <div v-else>
          <div class="flex items-center gap-3 mb-6">
            <button @click="selectedExaminerId = null; shifts = []" class="text-sm font-medium text-gray-500 hover:text-[#0F52BA] flex items-center gap-1">
              &larr; Retour
            </button>
            <h2 class="text-xl font-bold text-[#1E293B]">Shifts de l'examinateur</h2>
          </div>

          <div v-if="shifts.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ShiftCard 
              v-for="shift in shifts" :key="shift.id"
              :shift="shift"
              context="examiner"
              @viewDetails="fetchShiftDetails"
              @delete="handleDeleteShift"
              @cancel="handleCancelShift"
              @complete="handleCompleteShift"
              @nonAttended="handleNonAttendedShift"
            />
          </div>
          <p v-else class="text-gray-500 italic text-sm p-8 bg-gray-50 rounded text-center">Aucun shift planifié pour cet examinateur.</p>
        </div>
      </div>

      <div v-else-if="verticalTab === 'create'" class="max-w-2xl">
        <h2 class="text-xl font-bold text-[#1E293B] mb-6">Créer un nouveau Shift</h2>
        
        <div class="bg-blue-50 text-blue-800 p-4 rounded-md text-sm mb-6 border border-blue-200">
          <strong>Règles de planification :</strong>
          <ul class="list-disc ml-5 mt-1">
            <li>L'heure de début doit être dans le futur.</li>
            <li>L'heure de début et de fin doivent être des heures piles (ex: 08:00, 14:00).</li>
            <li>La durée du shift doit être comprise entre 2 et 8 heures.</li>
          </ul>
        </div>

        <form @submit.prevent="handleCreateShift" class="space-y-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Section <span class="text-red-500">*</span></label>
              <select v-model="form.sectionId" required class="w-full p-2.5 bg-[#F8FAFC] border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#0F52BA]">
                <option disabled value="">Sélectionnez une section</option>
                <option v-for="section in sections" :key="section.id" :value="section.id">
                  {{ section.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Examinateur <span class="text-red-500">*</span></label>
              <select v-model="form.examinerId" required class="w-full p-2.5 bg-[#F8FAFC] border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#0F52BA]">
                <option disabled value="">Sélectionnez un examinateur</option>
                <option v-for="examiner in examiners" :key="examiner.id" :value="examiner.id">
                  {{ examiner.firstName }} {{ examiner.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Début du Shift <span class="text-red-500">*</span></label>
              <input v-model="form.startTime" type="datetime-local" step="3600" required class="w-full p-2.5 bg-[#F8FAFC] border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#0F52BA]" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Fin du Shift <span class="text-red-500">*</span></label>
              <input v-model="form.endTime" type="datetime-local" step="3600" required class="w-full p-2.5 bg-[#F8FAFC] border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#0F52BA]" />
            </div>
          </div>

          <div class="pt-2">
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="bg-[#0F52BA] hover:bg-blue-800 text-white font-medium text-sm px-6 py-2.5 rounded-md shadow-sm transition-colors disabled:opacity-50"
            >
              {{ isSubmitting ? 'Création en cours...' : 'Enregistrer le Shift' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="selectedShiftDetails" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-sm w-full shadow-xl overflow-hidden border border-gray-100 transform transition-all animate-fade-in">
        <div class="bg-[#0F52BA] p-4 text-white flex justify-between items-center">
          <h3 class="font-bold text-base">Détails du Shift</h3>
          <button @click="selectedShiftDetails = null" class="text-white hover:text-gray-200 text-xl font-bold">&times;</button>
        </div>
        
        <div class="p-6 space-y-4">
          <div class="flex justify-between items-center">
            <p><strong class="text-gray-500 text-sm">ID:</strong> <span class="text-xs text-gray-400 block break-all">{{ selectedShiftDetails.id }}</span></p>
            <span :class="['text-[10px] font-bold uppercase px-2 py-1 rounded-md border', getStatusBadgeClasses(selectedShiftDetails.status)]">
              {{ selectedShiftDetails.status || 'EN ATTENTE' }}
            </span>
          </div>
          
          <hr class="border-gray-100" />
          
          <div class="space-y-3 text-sm text-[#1E293B]">
            <p><strong class="text-gray-500">Début :</strong> <br/>{{ formatDate(selectedShiftDetails.start) }}</p>
            <p><strong class="text-gray-500">Fin :</strong> <br/>{{ formatDate(selectedShiftDetails.end) }}</p>
            <hr class="border-gray-100" />
            
            <p v-if="selectedShiftDetails.sectionName"><strong class="text-gray-500">Section :</strong> {{ selectedShiftDetails.sectionName }}</p>
            <p v-if="selectedShiftDetails.examinerName"><strong class="text-gray-500">Examinateur :</strong> {{ selectedShiftDetails.examinerName }}</p>
            
            <div class="mt-4 flex justify-between text-xs text-gray-400">
              <span>Créé : {{ formatDateShort(selectedShiftDetails.createdAt) }}</span>
              <span>Maj : {{ formatDateShort(selectedShiftDetails.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 px-6 py-3 flex justify-end border-t border-gray-100">
          <button @click="selectedShiftDetails = null" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium text-xs hover:bg-gray-300 transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, defineComponent, h } from 'vue'
import axios from 'axios'
import keycloak from '../services/keycloak'

const BASE_URL = 'http://localhost:9090/api'

// États globaux
const verticalTab = ref('sections')
const errorMessage = ref(null)
const successMessage = ref(null)
const isSubmitting = ref(false)

// Données principales
const sections = ref([])
const examiners = ref([])
const shifts = ref([])

// Sélections actives
const selectedSectionId = ref(null)
const selectedExaminerId = ref(null)
const selectedShiftDetails = ref(null)

// Formulaire création
const form = ref({
  sectionId: '',
  examinerId: '',
  startTime: '',
  endTime: ''
})

// === UTILITAIRES ===
const resetMessages = () => {
  errorMessage.value = null
  successMessage.value = null
}

const getAuthHeaders = () => {
  return { 'Authorization': `Bearer ${keycloak?.token || ''}` }
}

const handleApiError = (err, fallback) => {
  console.error(err)
  if (err.response?.data?.error) {
    errorMessage.value = err.response.data.error
  } else {
    errorMessage.value = fallback
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString('fr-FR', {
    weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit'
  })
}

const formatDateShort = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('fr-FR')
}

// Helper pour les couleurs du badge de statut
const getStatusBadgeClasses = (status) => {
  if (!status) return 'bg-blue-50 text-blue-700 border-blue-200' 
  const s = status.toUpperCase()
  if (s === 'COMPLETED' || s === 'TERMINE' || s === 'DONE') {
    return 'bg-green-50 text-green-700 border-green-200'
  }
  if (s === 'CANCELLED' || s === 'ANNULE') {
    return 'bg-red-50 text-red-700 border-red-200'
  }
  if (s === 'NON_ATTENDED' || s === 'ABSENT') {
    return 'bg-purple-50 text-purple-700 border-purple-200'
  }
  return 'bg-blue-50 text-blue-700 border-blue-200'
}

// Rafraichir l'onglet actif après une action
const refreshCurrentTab = () => {
  if (verticalTab.value === 'sections' && selectedSectionId.value) {
    selectSection(selectedSectionId.value)
  } else if (verticalTab.value === 'examiners' && selectedExaminerId.value) {
    selectExaminer(selectedExaminerId.value)
  }
}

// === NAVIGATION ===
const changeVerticalTab = (tab) => {
  verticalTab.value = tab
  resetMessages()
  selectedSectionId.value = null
  selectedExaminerId.value = null
  shifts.value = []
  
  if (tab === 'sections' || tab === 'create') fetchSections()
  if (tab === 'examiners' || tab === 'create') fetchExaminers()
}

// === API CALLS : GET LISTES ===
const fetchSections = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/sections`, { headers: getAuthHeaders() })
    sections.value = Array.isArray(res.data?.content) ? res.data.content : (Array.isArray(res.data) ? res.data : [])
  } catch (err) {
    handleApiError(err, "Erreur lors du chargement des sections.")
  }
}

const fetchExaminers = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/examiner`, { headers: getAuthHeaders() })
    const allExaminers = Array.isArray(res.data?.content) ? res.data.content : (Array.isArray(res.data) ? res.data : [])
    examiners.value = allExaminers.filter(e => e.role === 'EXAMINER')
  } catch (err) {
    handleApiError(err, "Erreur lors du chargement des examinateurs.")
  }
}

// === API CALLS : SELECTION & SHIFTS ===
const selectSection = async (id) => {
  resetMessages()
  selectedSectionId.value = id
  try {
    const res = await axios.get(`${BASE_URL}/shifts/sections/${id}`, { headers: getAuthHeaders() })
    shifts.value = Array.isArray(res.data?.content) ? res.data.content : (Array.isArray(res.data) ? res.data : [])
  } catch (err) {
    handleApiError(err, "Erreur lors de la récupération des shifts pour cette section.")
    selectedSectionId.value = null
  }
}

const selectExaminer = async (id) => {
  resetMessages()
  selectedExaminerId.value = id
  try {
    const res = await axios.get(`${BASE_URL}/shifts/examiners/${id}`, { headers: getAuthHeaders() })
    shifts.value = Array.isArray(res.data?.content) ? res.data.content : (Array.isArray(res.data) ? res.data : [])
  } catch (err) {
    handleApiError(err, "Erreur lors de la récupération des shifts pour cet examinateur.")
    selectedExaminerId.value = null
  }
}

// === API CALLS : ACTIONS SUR UN SHIFT ===
const fetchShiftDetails = async (shiftId) => {
  resetMessages()
  try {
    const res = await axios.get(`${BASE_URL}/shifts/${shiftId}`, { headers: getAuthHeaders() })
    selectedShiftDetails.value = res.data
  } catch (err) {
    handleApiError(err, "Erreur lors de l'ouverture des détails du shift.")
  }
}

const handleDeleteShift = async (shiftId) => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce shift ?")) return
  resetMessages()
  try {
    await axios.delete(`${BASE_URL}/shifts/${shiftId}`, { headers: getAuthHeaders() })
    successMessage.value = "Le shift a été supprimé avec succès."
    refreshCurrentTab()
  } catch (err) {
    handleApiError(err, "Erreur lors de la suppression du shift.")
  }
}

const handleCancelShift = async (shiftId) => {
  if (!confirm("Voulez-vous vraiment annuler ce shift ?")) return
  resetMessages()
  try {
    await axios.put(`${BASE_URL}/shifts/cancel/${shiftId}`, {}, { headers: getAuthHeaders() })
    successMessage.value = "Le shift a été annulé avec succès."
    refreshCurrentTab()
  } catch (err) {
    handleApiError(err, "Erreur lors de l'annulation du shift.")
  }
}

const handleCompleteShift = async (shiftId) => {
  if (!confirm("Voulez-vous marquer ce shift comme complété ?")) return
  resetMessages()
  try {
    await axios.put(`${BASE_URL}/shifts/complete/${shiftId}`, {}, { headers: getAuthHeaders() })
    successMessage.value = "Le shift a été complété avec succès."
    refreshCurrentTab()
  } catch (err) {
    handleApiError(err, "Erreur lors de la complétion du shift.")
  }
}

const handleNonAttendedShift = async (shiftId) => {
  if (!confirm("Voulez-vous marquer ce shift comme non assisté (absent) ?")) return
  resetMessages()
  try {
    await axios.put(`${BASE_URL}/shifts/non_attended/${shiftId}`, {}, { headers: getAuthHeaders() })
    successMessage.value = "Le shift a été marqué comme non assisté."
    refreshCurrentTab()
  } catch (err) {
    handleApiError(err, "Erreur lors de la mise à jour du shift.")
  }
}

// === API CALLS : CRÉATION ===
const handleCreateShift = async () => {
  resetMessages()

  const startDate = new Date(form.value.startTime)
  const endDate = new Date(form.value.endTime)
  const now = new Date()

  if (startDate <= now) {
    errorMessage.value = "La date de début doit être dans le futur."
    return
  }

  if (startDate.getMinutes() !== 0 || startDate.getSeconds() !== 0 || endDate.getMinutes() !== 0 || endDate.getSeconds() !== 0) {
    errorMessage.value = "Les heures de début et de fin doivent être des heures piles (ex: 08:00, 14:00)."
    return
  }

  const diffHours = (endDate - startDate) / (1000 * 60 * 60)
  if (diffHours < 2 || diffHours > 8) {
    errorMessage.value = "La durée du shift doit être comprise entre 2h et 8h."
    return
  }

  isSubmitting.value = true

  const payload = {
    startTime: form.value.startTime,
    endTime: form.value.endTime
  }

  try {
    await axios.post(`${BASE_URL}/shifts/sections/${form.value.sectionId}/${form.value.examinerId}`, payload, {
      headers: getAuthHeaders()
    })
    successMessage.value = "Le shift a été créé avec succès !"
    form.value = { sectionId: '', examinerId: '', startTime: '', endTime: '' }
  } catch (err) {
    handleApiError(err, "Erreur lors de la création du shift.")
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchSections()
})

// === COMPOSANT INTERNE : CARTE DE SHIFT ===
const ShiftCard = defineComponent({
  props: {
    shift: Object,
    context: String
  },
  emits: ['viewDetails', 'delete', 'cancel', 'complete', 'nonAttended'],
  setup(props, { emit }) {
    return () => h('div', {
      class: 'p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-indigo-400 transition-all flex flex-col justify-between group relative cursor-pointer',
      onClick: () => emit('viewDetails', props.shift.id)
    }, [
      h('div', { class: 'flex justify-between items-start mb-2' }, [
        h('div', { class: 'flex items-center gap-2' }, [
          h('span', { class: 'text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block' }, 
            `${new Date(props.shift.start).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})} - ${new Date(props.shift.end).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}`
          ),
          h('span', { class: `text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusBadgeClasses(props.shift.status)}` }, 
            props.shift.status || 'ATTENTE'
          )
        ]),
        
        // Actions (Opacité 0 -> 100 au survol)
        h('div', { class: 'opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 bg-white pl-2' }, [
          
          // Bouton Compléter
          h('button', {
            class: 'text-gray-400 hover:text-green-600 transition-colors p-1',
            title: 'Marquer comme complété',
            onClick: (e) => { e.stopPropagation(); emit('complete', props.shift.id); }
          }, [
            h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
              h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 13l4 4L19 7' })
            ])
          ]),

          // Bouton Non Assisté
          h('button', {
            class: 'text-gray-400 hover:text-purple-600 transition-colors p-1',
            title: 'Marquer comme non assisté',
            onClick: (e) => { e.stopPropagation(); emit('nonAttended', props.shift.id); }
          }, [
            h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
              h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zm13-2l-4 4m0-4l4 4' })
            ])
          ]),

          // Bouton Annuler
          h('button', {
            class: 'text-gray-400 hover:text-orange-500 transition-colors p-1',
            title: 'Annuler le shift',
            onClick: (e) => { e.stopPropagation(); emit('cancel', props.shift.id); }
          }, [
            h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
              h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' })
            ])
          ]),

          // Bouton Supprimer
          h('button', {
            class: 'text-gray-400 hover:text-red-600 transition-colors p-1',
            title: 'Supprimer',
            onClick: (e) => { e.stopPropagation(); emit('delete', props.shift.id); }
          }, [
            h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
              h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' })
            ])
          ])
        ])
      ]),
      h('div', { class: 'mt-2 text-sm text-[#1E293B] font-medium' }, [
        h('p', {}, new Date(props.shift.start).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })),
        props.context === 'section' && props.shift.examinerName ? h('p', { class: 'text-gray-500 mt-1 font-normal' }, `Examinateur : ${props.shift.examinerName}`) : null,
        props.context === 'examiner' && props.shift.sectionName ? h('p', { class: 'text-gray-500 mt-1 font-normal' }, `Section : ${props.shift.sectionName}`) : null
      ])
    ])
  }
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>