<template>
  <div class="flex gap-8 bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px] overflow-hidden">
    
    <aside class="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col gap-2">
      <button 
        @click="changeVerticalTab('see')"
        :class="[
          verticalTab === 'see' 
            ? 'bg-[#0F52BA] text-white shadow-sm' 
            : 'text-[#1E293B] hover:bg-gray-100',
          'w-full text-left px-4 py-3 rounded-md font-medium text-sm transition-all flex items-center space-x-3'
        ]"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
        <span>Voir les Sections</span>
      </button>

      <button 
        @click="changeVerticalTab('create')"
        :class="[
          verticalTab === 'create' 
            ? 'bg-[#0F52BA] text-white shadow-sm' 
            : 'text-[#1E293B] hover:bg-gray-100',
          'w-full text-left px-4 py-3 rounded-md font-medium text-sm transition-all flex items-center space-x-3'
        ]"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        <span>{{ isEditing ? 'Modifier la Section' : 'Créer une Section' }}</span>
      </button>
    </aside>

    <div class="flex-1 p-6 flex flex-col relative">
      
      <div v-if="errorMessage" class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex justify-between items-center text-sm">
        <span>{{ errorMessage }}</span>
        <button @click="errorMessage = null" class="font-bold hover:text-red-900">&times;</button>
      </div>
      <div v-if="successMessage" class="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-[#10B981] rounded-md flex justify-between items-center text-sm font-medium">
        <span>{{ successMessage }}</span>
        <button @click="successMessage = null" class="font-bold hover:text-emerald-900">&times;</button>
      </div>

      <div v-if="verticalTab === 'see'" class="space-y-4 flex-1 flex flex-col">
        <h2 class="text-xl font-bold text-[#1E293B] mb-4">Liste des Sections</h2>

        <div v-if="sections.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pr-1">
          <div 
            v-for="section in sections" 
            :key="section.id"
            @click="fetchSectionDetails(section.id)"
            class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-[#6366F1] cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group relative"
          >
            <div>
              <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block">{{ section.Location || section.location || 'Localisation N/A' }}</span>
                
                <div class="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click.stop="prepareEdit(section)" class="text-gray-400 hover:text-blue-600 transition-colors" title="Modifier">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button @click.stop="handleDeleteSection(section.id)" class="text-gray-400 hover:text-red-600 transition-colors" title="Supprimer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
              <h4 class="font-bold text-[#1E293B] text-lg">{{ section.name }}</h4>
              <p class="text-gray-600 text-sm mt-2">
                Capacité : {{ section.capacity || 'N/A' }} personnes
                </p>
              <div v-if="section.testName" class="mt-2 text-sm text-gray-500 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Test : {{ section.testName }}
              </div>
            </div>
            <div class="text-xs text-gray-400 mt-4 flex items-center justify-between">
              <span>Créé le : {{ formatDate(section.createdAt) }}</span>
              <span class="text-[#0F52BA] font-medium flex items-center">Détails &rarr;</span>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 text-gray-400 text-sm">
          Aucune section trouvée.
        </div>
      </div>

      <div v-else-if="verticalTab === 'create'" class="max-w-2xl">
        <h2 class="text-xl font-bold text-[#1E293B] mb-6">
          {{ isEditing ? 'Modifier la section' : 'Créer une nouvelle section' }}
        </h2>
        
        <form @submit.prevent="handleSubmitSection" class="space-y-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Nom de la section <span class="text-red-500">*</span></label>
              <input v-model="form.name" type="text" required class="w-full p-2.5 bg-[#F8FAFC] border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#0F52BA]" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Localisation <span class="text-red-500">*</span></label>
              <input v-model="form.location" type="text" required class="w-full p-2.5 bg-[#F8FAFC] border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#0F52BA]" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Capacité (personnes) <span class="text-red-500">*</span></label>
            <input v-model.number="form.capacity" type="number" min="1" required class="w-full p-2.5 bg-[#F8FAFC] border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#0F52BA]" />
          </div>

          <div class="border border-gray-200 rounded-md p-4 bg-gray-50">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-bold text-gray-700">Inclure un Test ? (Optionnel)</label>
              <input v-model="form.includeTest" type="checkbox" class="w-4 h-4 text-[#0F52BA] rounded border-gray-300 focus:ring-[#0F52BA]" />
            </div>
            
            <div v-if="form.includeTest" class="space-y-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Nom du test <span class="text-red-500">*</span></label>
                <input v-model="form.testName" type="text" :required="form.includeTest" class="w-full p-2.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#0F52BA]" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Durée (minutes) <span class="text-red-500">*</span></label>
                  <input v-model.number="form.testDurationMinutes" type="number" min="1" :required="form.includeTest" placeholder="Ex: 60" class="w-full p-2.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#0F52BA]" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Temps du résultat (minutes) <span class="text-red-500">*</span></label>
                  <input v-model.number="form.testTimeOfResultMinutes" type="number" min="1" :required="form.includeTest" placeholder="Ex: 120" class="w-full p-2.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#0F52BA]" />
                </div>
              </div>
            </div>
          </div>

          <div class="pt-2 flex gap-3">
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="bg-[#0F52BA] hover:bg-blue-800 text-white font-medium text-sm px-6 py-2.5 rounded-md shadow-sm transition-colors disabled:opacity-50"
            >
              {{ isSubmitting ? 'Traitement...' : (isEditing ? 'Mettre à jour la section' : 'Créer la section') }}
            </button>
            <button 
              v-if="isEditing" 
              type="button"
              @click="cancelEdit"
              class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-sm px-6 py-2.5 rounded-md transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="selectedSection" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-md w-full shadow-xl overflow-hidden border border-gray-100 transform transition-all animate-fade-in">
        
        <div class="bg-[#0F52BA] p-4 text-white flex justify-between items-center">
          <h3 class="font-bold text-base">Détails de la Section</h3>
          <button @click="selectedSection = null" class="text-white hover:text-gray-200 text-xl font-bold">&times;</button>
        </div>
        
        <div class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block mb-1">{{ selectedSection.Location || selectedSection.location }}</span>
            <h4 class="text-xl font-bold text-[#1E293B]">{{ selectedSection.name }}</h4>
          </div>
          
          <hr class="border-gray-100" />
          
          <div class="space-y-3 text-sm text-[#1E293B]">
            <div class="flex justify-between">
              <div>
                <strong class="text-gray-400 text-xs uppercase block">Créé le</strong>
                {{ formatDate(selectedSection.createdAt) }}
              </div>
              <div class="text-right">
                <strong class="text-gray-400 text-xs uppercase block">Mise à jour</strong>
                {{ formatDate(selectedSection.updatedAt) }}
              </div>
            </div>
             <p class="text-gray-500 text-sm mt-2">
                Capacité : {{ selectedSection.capacity || 'N/A' }} personnes
              </p>

            <div v-if="selectedSection.test" class="mt-4 bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
              <div class="flex items-center gap-2 mb-3 border-b border-indigo-100 pb-2">
                <svg class="w-5 h-5 text-[#0F52BA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <strong class="text-[#0F52BA] text-sm uppercase">Test Rattaché</strong>
              </div>
              
              <div class="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                <p class="col-span-2"><strong class="text-gray-500 font-medium">Nom :</strong> {{ selectedSection.test.name }}</p>
                <p><strong class="text-gray-500 font-medium">Durée :</strong> <br/>{{ formatDuration(selectedSection.test.duration) }}</p>
                <p><strong class="text-gray-500 font-medium">Résultat en :</strong> <br/>{{ formatDuration(selectedSection.test.TimeOfResult || selectedSection.test.timeOfResult) }}</p>
                
                <div class="col-span-2 flex justify-between mt-2 pt-2 border-t border-indigo-50/50">
                  <p><strong class="text-gray-400 font-medium block text-xs">Créé le :</strong> <span class="text-xs">{{ formatDate(selectedSection.test.createdAt) }}</span></p>
                  <p class="text-right"><strong class="text-gray-400 font-medium block text-xs">Mis à jour :</strong> <span class="text-xs">{{ formatDate(selectedSection.test.updatedAt) }}</span></p>
                </div>
              </div>
            </div>
            
            <div v-else class="text-gray-400 italic text-sm p-3 bg-gray-50 rounded-md border border-gray-100 text-center">
              Aucun test n'est rattaché à cette section.
            </div>
          </div>
        </div>

        <div class="bg-gray-50 px-6 py-3 flex justify-between items-center border-t border-gray-100">
          <button @click="handleDeleteSection(selectedSection.id); selectedSection = null" class="text-red-600 hover:text-red-800 text-sm font-medium">
            Supprimer la section
          </button>
          <button @click="selectedSection = null" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium text-xs hover:bg-gray-300 transition-colors">
            Fermer
          </button>
        </div>
        
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import keycloak from '../services/keycloak'

const BASE_URL = 'http://localhost:9090/api/sections'

// États de navigation
const verticalTab = ref('see')

// États des données
const sections = ref([])
const selectedSection = ref(null)
const isSubmitting = ref(false)

// États d'édition
const isEditing = ref(false)
const editingId = ref(null)

// Messages
const errorMessage = ref(null)
const successMessage = ref(null)

// Blueprint du formulaire
const defaultForm = {
  name: '',
  location: '',
  capacity: 10,
  includeTest: false,
  testName: '',
  testDurationMinutes: 60,
  testTimeOfResultMinutes: 120
}
const form = ref({ ...defaultForm })

const resetMessages = () => {
  errorMessage.value = null
  successMessage.value = null
}

const getAuthHeaders = () => {
  const token = keycloak?.token || ''
  return { 'Authorization': `Bearer ${token}` }
}

const handleAxiosError = (err, fallbackMessage) => {
  if (err.response?.data?.error) {
    errorMessage.value = err.response.data.error
  } else if (err.response?.data?.message) {
    errorMessage.value = err.response.data.message
  } else {
    errorMessage.value = fallbackMessage
  }
}

// Utilitaire de formatage de date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }
  return new Date(dateString).toLocaleDateString('fr-FR', options)
}

// Utilitaire pour formater les durées ISO (ex: "PT60M" -> "60 minutes", "PT2H" -> "2 heures")
const formatDuration = (isoDuration) => {
  if (!isoDuration) return 'Non spécifiée'
  const minutesMatch = isoDuration.match(/PT(\d+)M/i)
  const hoursMatch = isoDuration.match(/PT(\d+)H/i)
  
  if (minutesMatch) return `${minutesMatch[1]} minutes`
  if (hoursMatch) return `${hoursMatch[1]} heures`
  return isoDuration.replace('PT', '').toLowerCase()
}

// Changer d'onglet
const changeVerticalTab = (tab) => {
  verticalTab.value = tab
  resetMessages()
  if (tab === 'see') {
    fetchSections()
    cancelEdit()
  }
}

// ----------------------------------------------------
// API : GET TOUTES LES SECTIONS
// ----------------------------------------------------
const fetchSections = async () => {
  resetMessages()
  try {
    const response = await axios.get(BASE_URL, { headers: getAuthHeaders() })
    if (response.data && Array.isArray(response.data.content)) {
      sections.value = response.data.content
      console.log("Sections récupérées :", response.data.content)
    } else if (Array.isArray(response.data)) {
      sections.value = response.data
    } else {
      sections.value = []
    }
  } catch (err) {
    handleAxiosError(err, "Impossible de charger les sections.")
  }
}

// ----------------------------------------------------
// API : GET DÉTAILS D'UNE SECTION
// ----------------------------------------------------
const fetchSectionDetails = async (id) => {
  resetMessages()
  try {
    const response = await axios.get(`${BASE_URL}/${id}`, { headers: getAuthHeaders() })
    selectedSection.value = response.data
    console.log("Détails de la section récupérés :", response.data)
  } catch (err) {
    handleAxiosError(err, "Erreur lors de la récupération des détails.")
  }
}

// ----------------------------------------------------
// API : DELETE SECTION
// ----------------------------------------------------
const handleDeleteSection = async (id) => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette section ?")) return

  resetMessages()
  try {
    await axios.delete(`${BASE_URL}/${id}`, { headers: getAuthHeaders() })
    successMessage.value = "La section a été supprimée avec succès."
    fetchSections()
  } catch (err) {
    handleAxiosError(err, "Erreur lors de la suppression de la section.")
  }
}

// ----------------------------------------------------
// PRÉPARER LE FORMULAIRE POUR L'ÉDITION
// ----------------------------------------------------
const prepareEdit = (section) => {
  resetMessages()
  isEditing.value = true
  editingId.value = section.id
  verticalTab.value = 'create'
  
  // Vérifie si un test est lié (selon le DTO simple de la liste ou le DTO détaillé si appelé via la modale)
  const hasTest = !!section.testName || !!section.test
  
  form.value = {
    ...defaultForm,
    name: section.name,
    location: section.Location || section.location,
    capacity: section.capacity || 10,
    includeTest: hasTest,
    testName: section.test?.name || section.testName || '',
    testDurationMinutes: 60, 
    testTimeOfResultMinutes: 120
  }

  // Si on possède l'objet 'test' complet, on pré-remplit les durées
  if (section.test) {
    if (section.test.duration) {
      const matchDuration = section.test.duration.match(/\d+/)
      if (matchDuration) form.value.testDurationMinutes = parseInt(matchDuration[0], 10)
    }
    const timeOfResultStr = section.test.TimeOfResult || section.test.timeOfResult
    if (timeOfResultStr) {
      const matchResult = timeOfResultStr.match(/\d+/)
      if (matchResult) form.value.testTimeOfResultMinutes = parseInt(matchResult[0], 10)
    }
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editingId.value = null
  form.value = { ...defaultForm }
}

// ----------------------------------------------------
// API : POST (CRÉER) ET PUT (METTRE À JOUR)
// ----------------------------------------------------
const handleSubmitSection = async () => {
  resetMessages()
  isSubmitting.value = true

  const payload = {
    name: form.value.name,
    location: form.value.location,
    capacity: form.value.capacity,
    test: null
  }

  if (form.value.includeTest) {
    payload.test = {
      name: form.value.testName,
      duration: `PT${form.value.testDurationMinutes}M`,
      timeOfResult: `PT${form.value.testTimeOfResultMinutes}M`
    }
  }

  try {
    if (isEditing.value && editingId.value) {
      await axios.put(`${BASE_URL}/${editingId.value}`, payload, { headers: getAuthHeaders() })
      successMessage.value = "La section a été mise à jour avec succès."
    } else {
      await axios.post(BASE_URL, payload, { headers: getAuthHeaders() })
      successMessage.value = "La section a été créée avec succès."
    }
    cancelEdit()
  } catch (err) {
    handleAxiosError(err, "Erreur lors de l'enregistrement de la section. Vérifiez les données saisies.")
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchSections()
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