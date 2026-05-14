<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import keycloak from '../services/keycloak'

const documents = ref([])

const loading = ref(true)

const error = ref(null)

onMounted(async () => {

  try {

    const response = await axios.get(
      'http://localhost:9090/api/documents',
      {
        headers: {
          Authorization: `Bearer ${keycloak.token}`
        }
      }
    )

    // if backend returns a Spring Page
    documents.value = response.data.content

  } catch (err) {

    console.error(err)

    error.value = 'Erreur lors du chargement des documents'

  } finally {

    loading.value = false

  }

})
</script>

<template>

  <div class="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-[#0F52BA]">

    <h2 class="text-xl font-semibold text-slate-800 mb-4">
      Résultats & Ordonnances
    </h2>

    <div
      v-if="loading"
      class="text-slate-500"
    >
      Chargement...
    </div>

    <div
      v-else-if="error"
      class="text-red-500"
    >
      {{ error }}
    </div>

    <div
      v-else-if="documents.length === 0"
      class="text-slate-500"
    >
      Aucun document trouvé
    </div>

    <div
      v-else
    >

      <div
        v-for="document in documents"
        :key="document.id"
        class="group flex items-center justify-between p-3 border-b border-slate-100 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
      >

        <div>

          <p class="text-slate-800 font-medium text-sm">
            {{ document.name }}
          </p>

          <p class="text-slate-400 text-xs mt-1">
            {{
              new Date(document.createdAt).toLocaleDateString(
                'fr-FR',
                {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                }
              )
            }}
          </p>

        </div>

        <button
          class="text-[#0F52BA] text-sm font-medium"
        >
          Voir PDF →
        </button>

      </div>

    </div>

  </div>

</template>