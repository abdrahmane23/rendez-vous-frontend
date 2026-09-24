<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import keycloak from '../services/keycloak'

const appointments = ref([])

const loading = ref(true)

const error = ref(null)

onMounted(async () => {
  try {
    const response = await axios.get(
      'http://localhost:9090/api/appointements/upcoming-appointements',
      {
        headers: {
          Authorization: `Bearer ${keycloak.token}`
        }
      }
    )

    appointments.value = response.data.content
    console.log('Rendez-vous à venir:', appointments.value)
  } catch (err) {
    console.error(err)
    error.value = 'Erreur lors du chargement des rendez-vous'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-[#0F52BA]">
    <h2 class="text-xl font-semibold text-slate-800 mb-4">
      Prochains Rendez-vous
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
      v-else-if="appointments.length === 0"
      class="text-slate-500"
    >
      Aucun rendez-vous trouvé
    </div>

    <div v-else>
      <div
        v-for="appointment in appointments"
        :key="appointment.id"
        class="bg-slate-50 rounded-lg p-4 mb-3 border border-slate-200"
      >
        <div class="flex justify-between items-start mb-2">
          <span class="font-bold text-[#0F52BA]">
            {{
              new Date(appointment.start).toLocaleDateString(
                'fr-FR',
                {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                }
              )
            }}
          </span>

          <span
            class="bg-blue-100 text-[#0F52BA] text-xs px-2 py-1 rounded-full font-semibold"
          >
            {{
              new Date(appointment.start).toLocaleTimeString(
                'fr-FR',
                {
                  hour: '2-digit',
                  minute: '2-digit'
                }
              )
            }}
          </span>
        </div>

        <div class="flex items-center justify-between">
          <p class="text-slate-800 font-medium">
            Rendez-vous médical
          </p>

          <span
            class="text-xs px-2 py-1 rounded-full font-semibold"
            :class="
              appointment.type === 'CONSULTATION'
                ? 'bg-green-100 text-green-700'
                : 'bg-orange-100 text-orange-700'
            "
          >
            {{ appointment.type }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>