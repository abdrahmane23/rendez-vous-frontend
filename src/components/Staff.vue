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
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <span>Voir le Personnel</span>
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
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
        </svg>
        <span>Créer un Employé</span>
      </button>
    </aside>

    <div class="flex-1 p-6 flex flex-col">
      
      <div v-if="errorMessage" class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex justify-between items-center text-sm">
        <span>{{ errorMessage }}</span>
        <button @click="errorMessage = null" class="font-bold hover:text-red-900">&times;</button>
      </div>
      <div v-if="successMessage" class="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-[#10B981] rounded-md flex justify-between items-center text-sm font-medium">
        <span>{{ successMessage }}</span>
        <button @click="successMessage = null" class="font-bold hover:text-emerald-900">&times;</button>
      </div>

      <div v-if="verticalTab === 'see'" class="space-y-4 flex-1 flex flex-col">
        <div class="relative max-w-md">
          <input 
            v-model="searchQuery" 
            @input="fetchExaminers"
            type="text" 
            placeholder="Rechercher par nom ou spécialité..." 
            class="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-gray-200 rounded-md text-sm text-[#1E293B] focus:outline-none focus:border-[#6366F1] transition-colors"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        <div v-if="examiners.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pr-1">
          <div 
            v-for="ex in examiners" 
            :key="ex.id"
            @click="fetchExaminerDetails(ex.id)"
            class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-[#6366F1] cursor-pointer transition-all hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div class="flex flex-wrap gap-2 mb-2">
                <div class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block">
                  {{ ex.field || 'N/A' }}
                </div>
                <div class="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded inline-block uppercase tracking-wider">
                  {{ ex.role }}
                </div>
              </div>
              <h4 class="font-bold text-[#1E293B] text-base">{{ ex.firstName }} {{ ex.name }}</h4>
            </div>
            <div class="text-xs text-gray-400 mt-4 flex items-center justify-between">
              <span>ID: {{ ex.id ? String(ex.id).substring(0,8) : '...' }}...</span>
              <span class="text-[#0F52BA] font-medium flex items-center">Détails &rarr;</span>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 text-gray-400 text-sm">
          Aucun membre du personnel trouvé.
        </div>
      </div>

      <div v-else-if="verticalTab === 'create'" class="max-w-2xl">
        <h2 class="text-lg font-bold text-[#1E293B] mb-4">Enregistrer un nouveau collaborateur</h2>
        
        <form @submit.prevent="handleCreateExaminer" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Rôle / Fonction <span class="text-red-500">*</span></label>
            <select 
              v-model="form.selectedRole" 
              required 
              class="w-full p-2.5 bg-[#F8FAFC] border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#0F52BA]"
            >
              <option value="EXAMINER">Examinateur</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Nom <span class="text-red-500">*</span></label>
              <input v-model="form.name" type="text" required class="w-full p-2.5 bg-[#F8FAFC] border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#0F52BA]" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Prénom <span class="text-red-500">*</span></label>
              <input v-model="form.firstName" type="text" required class="w-full p-2.5 bg-[#F8FAFC] border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#0F52BA]" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Nom d'utilisateur (userName) <span class="text-red-500">*</span></label>
            <input v-model="form.userName" type="text" required placeholder="Ex: jdoe" class="w-full p-2.5 bg-[#F8FAFC] border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#0F52BA]" />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Spécialité / Domaine <span class="text-red-500">*</span></label>
            <input v-model="form.field" type="text" required placeholder="Ex: Radiologie, Administration, Biologie..." class="w-full p-2.5 bg-[#F8FAFC] border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#0F52BA]" />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Adresse Email <span class="text-red-500">*</span></label>
            <input v-model="form.email" type="email" required placeholder="exemple@sante.ma" class="w-full p-2.5 bg-[#F8FAFC] border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#0F52BA]" />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Numéro de Téléphone <span class="text-red-500">*</span></label>
            <input v-model="form.number" type="text" required placeholder="Uniquement des chiffres" class="w-full p-2.5 bg-[#F8FAFC] border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#0F52BA]" />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Adresse Postale <span class="text-red-500">*</span></label>
            <textarea v-model="form.address" rows="3" required class="w-full p-2.5 bg-[#F8FAFC] border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#0F52BA]"></textarea>
          </div>

          <div class="pt-2">
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="bg-[#0F52BA] hover:bg-blue-800 text-white font-medium text-sm px-6 py-2.5 rounded-md shadow-sm transition-colors disabled:opacity-50"
            >
              {{ isSubmitting ? 'Création...' : 'Créer le profil' }}
            </button>
          </div>
        </form>
      </div>

    </div>

    <div v-if="selectedExaminer" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-md w-full shadow-xl overflow-hidden border border-gray-100 transform transition-all animate-fade-in">
        <div class="bg-[#0F52BA] p-4 text-white flex justify-between items-center">
          <h3 class="font-bold text-base">Fiche du Personnel</h3>
          <button @click="selectedExaminer = null" class="text-white hover:text-gray-200 text-xl font-bold">&times;</button>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex gap-2">
            <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block">{{ selectedExaminer.field || 'N/A' }}</span>
            <span class="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded inline-block uppercase tracking-wider">{{ selectedExaminer.role }}</span>
          </div>
          <div>
            <h4 class="text-xl font-bold text-[#1E293B]">{{ selectedExaminer.firstName }} {{ selectedExaminer.name }}</h4>
            <p v-if="selectedExaminer.userName" class="text-sm text-gray-500 mt-1">@{{ selectedExaminer.userName }}</p>
          </div>
          <hr class="border-gray-100" />
          <div class="space-y-2 text-sm text-[#1E293B]">
            <p><strong class="text-gray-400 text-xs uppercase block">Email</strong> {{ selectedExaminer.email }}</p>
            <p><strong class="text-gray-400 text-xs uppercase block">Téléphone</strong> {{ selectedExaminer.number }}</p>
            <p><strong class="text-gray-400 text-xs uppercase block">Adresse</strong> {{ selectedExaminer.address }}</p>
          </div>
        </div>
        <div class="bg-gray-50 px-6 py-3 flex justify-end">
          <button @click="selectedExaminer = null" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium text-xs hover:bg-gray-300 transition-colors">
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

const BASE_URL = 'http://localhost:9090/api/examiner'

// Navigation states
const verticalTab = ref('see')      

// Data States
const searchQuery = ref('')
const examiners = ref([])
const selectedExaminer = ref(null)
const isSubmitting = ref(false)

// Messages States
const errorMessage = ref(null)
const successMessage = ref(null)

// Form blueprint initialized with a default role
const form = ref({
  selectedRole: 'EXAMINER',
  userName: '',
  name: '',
  firstName: '',
  address: '',
  email: '',
  number: '',
  field: ''
})

const resetMessages = () => {
  errorMessage.value = null
  successMessage.value = null
}

const changeVerticalTab = (tab) => {
  verticalTab.value = tab
  resetMessages()
  if (tab === 'see') {
    fetchExaminers()
  }
}

const getAuthHeaders = (extraHeaders = {}) => {
  const token = keycloak?.token || ''
  return {
    'Authorization': `Bearer ${token}`,
    ...extraHeaders
  }
}

const handleAxiosError = (err, fallbackMessage) => {
  if (err.response && err.response.data && err.response.data.error) {
    errorMessage.value = err.response.data.error
  } else if (err.response) {
    errorMessage.value = `Erreur serveur (${err.response.status}): Quelque chose s'est mal passé.`
  } else {
    errorMessage.value = fallbackMessage
  }
}

// ENDPOINT: GET api/examiner
const fetchExaminers = async () => {
  resetMessages()
  try {
    const config = {
      headers: getAuthHeaders(),
      params: searchQuery.value.trim() ? { query: searchQuery.value.trim() } : {}
    }
    
    const response = await axios.get(BASE_URL, config)
    
    let parsedList = []
    if (response.data && Array.isArray(response.data.content)) {
      parsedList = response.data.content
    } else if (Array.isArray(response.data)) {
      parsedList = response.data
    } else if (response.data && typeof response.data === 'object') {
      const secondaryKey = Object.keys(response.data).find(k => Array.isArray(response.data[k]))
      if (secondaryKey) parsedList = response.data[secondaryKey]
    }

    // Filtrage local persistant
    examiners.value = parsedList.filter(ex => {
      if (!ex || !ex.role) return false
      const roleUpper = String(ex.role).trim().toUpperCase()
      return roleUpper === 'EXAMINER' || roleUpper === 'ADMIN'
    })
    
  } catch (err) {
    handleAxiosError(err, "Impossible de se connecter au serveur backend.")
  }
}

// ENDPOINT: GET api/examiner/{id}
const fetchExaminerDetails = async (id) => {
  resetMessages()
  try {
    const response = await axios.get(`${BASE_URL}/${id}`, {
      headers: getAuthHeaders()
    })
    selectedExaminer.value = response.data
  } catch (err) {
    handleAxiosError(err, "Erreur lors de la récupération des détails.")
  }
}

// ENDPOINT: POST api/examiner (or api/examiner/admin)
const handleCreateExaminer = async () => {
  resetMessages()
  
  const numberRegex = /^[0-9]+$/
  if (!numberRegex.test(form.value.number)) {
    errorMessage.value = "Le numéro de téléphone doit contenir uniquement des chiffres."
    return
  }

  isSubmitting.value = true

  // Détermination de l'URL cible selon le choix de l'utilisateur
  let targetUrl = BASE_URL
  if (form.value.selectedRole === 'ADMIN') {
    targetUrl = `${BASE_URL}/admin`
  }

  // Extraction des données payload avec userName
  const payload = {
    userName: form.value.userName,
    name: form.value.name,
    firstName: form.value.firstName,
    address: form.value.address,
    email: form.value.email,
    number: form.value.number,
    field: form.value.field
  }

  try {
    await axios.post(targetUrl, payload, {
      headers: getAuthHeaders()
    })

    const roleLabel = form.value.selectedRole === 'ADMIN' ? 'Administrateur' : 'Examinateur'
    successMessage.value = `Le profil (${roleLabel}) pour ${form.value.firstName} ${form.value.name} a été créé avec succès.`
    
    // Reset Form
    form.value = { selectedRole: 'EXAMINER', userName: '', name: '', firstName: '', address: '', email: '', number: '', field: '' }
  } catch (err) {
    handleAxiosError(err, "Erreur de connexion lors de l'envoi du formulaire.")
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchExaminers()
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