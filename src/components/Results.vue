<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import keycloak from '../services/keycloak'

const documents = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const headers = {
      Authorization: `Bearer ${keycloak?.token || ''}`
    }

    // Requêtes simultanées vers les deux endpoints
    const [testResponse, consultResponse] = await Promise.all([
      axios.get('http://localhost:9090/api/test-result', { headers }),
      axios.get('http://localhost:9090/api/consultation', { headers })
    ])

    // Gestion du retour (Spring Page ou Liste simple)
    const tests = Array.isArray(testResponse.data?.content) ? testResponse.data.content : (Array.isArray(testResponse.data) ? testResponse.data : [])
    const consults = Array.isArray(consultResponse.data?.content) ? consultResponse.data.content : (Array.isArray(consultResponse.data) ? consultResponse.data : [])

    // Formatage des Tests
    const mappedTests = tests.map(item => ({
      id: item.id,
      title: 'Résultat de Test',
      examinerName: item.examinerName,
      createdAt: item.createdAt,
      reportUrl: item.ReportUrl, // Attention à la majuscule renvoyée par le DTO
      type: 'TEST'
    }))

    // Formatage des Consultations
    const mappedConsults = consults.map(item => ({
      id: item.id,
      title: 'Consultation',
      examinerName: item.examinerName,
      createdAt: item.createdAt,
      reportUrl: item.ReportUrl,
      type: 'CONSULTATION'
    }))

    // Combinaison des deux tableaux et tri par date (le plus récent en premier)
    documents.value = [...mappedTests, ...mappedConsults].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

  } catch (err) {
    console.error(err)
    error.value = 'Erreur lors du chargement des documents.'
  } finally {
    loading.value = false
  }
})

// Fonction pour ouvrir le PDF dans un nouvel onglet
const openPdf = (url) => {
  if (url) {
    window.open(url, '_blank')
  } else {
    alert("Le lien du document n'est pas disponible.")
  }
}
</script>

<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-[#0F52BA]">
    <h2 class="text-xl font-semibold text-slate-800 mb-4">
      Résultats & Consultations
    </h2>

    <div v-if="loading" class="text-slate-500">
      Chargement...
    </div>

    <div v-else-if="error" class="text-red-500">
      {{ error }}
    </div>

    <div v-else-if="documents.length === 0" class="text-slate-500">
      Aucun document trouvé
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="document in documents"
        :key="document.id"
        class="group flex items-center justify-between p-3 border border-slate-100 hover:border-blue-200 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
      >
        <div class="flex items-start gap-3">
          <div 
            :class="[
              'p-2 rounded-md',
              document.type === 'TEST' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'
            ]"
          >
            <svg v-if="document.type === 'TEST'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>

          <div>
            <p class="text-slate-800 font-medium text-sm flex items-center gap-2">
              {{ document.title }}
              <span class="text-xs font-normal text-slate-500" v-if="document.examinerName">
                - {{ document.examinerName }}
              </span>
            </p>

            <p class="text-slate-400 text-xs mt-1">
              {{
                new Date(document.createdAt).toLocaleDateString(
                  'fr-FR',
                  { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
                )
              }}
            </p>
          </div>
        </div>

        <button
          @click.stop="openPdf(document.reportUrl)"
          class="text-[#0F52BA] hover:text-blue-800 text-sm font-medium px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          Voir PDF →
        </button>
      </div>
    </div>
  </div>
</template>