<template>
  <div class="min-h-screen bg-[#F8FAFC]">
    
    <nav class="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-[#0F52BA]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
            </svg>
          </div>
          <span class="text-xl font-bold text-slate-800 hidden sm:block">Sante Clinique</span>
        </div>

        <div class="flex items-center gap-4 md:gap-6">
          
          <button 
            @click="isModalOpen = true"
            class="bg-[#0F52BA] hover:bg-[#0d459c] text-white font-bold py-2.5 px-4 md:px-6 rounded-lg transition-colors shadow-sm flex items-center gap-2 text-sm md:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            <span class="hidden sm:inline">Nouveau Rendez-vous</span>
            <span class="sm:hidden">Nouveau</span>
          </button>

          <div class="h-8 w-px bg-slate-200 hidden sm:block"></div>

          <div class="relative">
            <div @click.stop="isProfileOpen = !isProfileOpen" class="flex items-center gap-2 cursor-pointer group">
              <div class="w-10 h-10 bg-[#0F52BA] rounded-full flex items-center justify-center text-white shadow-sm group-hover:bg-[#0d459c] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span class="font-semibold text-slate-700 hidden md:block">
                {{ userProfile.firstName || 'Patient' }}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 transition-transform hidden md:block" :class="{'rotate-180': isProfileOpen}" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>

            <div 
              v-if="isProfileOpen" 
              v-click-outside="() => isProfileOpen = false"
              class="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden"
            >
              <div class="p-4 border-b border-slate-50 bg-slate-50/50">
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Connecté en tant que</p>
                <p class="text-slate-800 font-bold mt-1">{{ userProfile.fullName }}</p>
                <p class="text-slate-500 text-sm truncate">{{ userProfile.email }}</p>
              </div>
              <div class="p-2">
                <button 
                  @click="logout"
                  class="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto p-4 md:p-8">
      <header class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-slate-800">Espace Patient</h1>
        <p class="text-slate-500 mt-1">Bienvenue, voici le résumé de votre dossier médical.</p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingAppointments />
        <Results />
      </div>
    </main>

    <AppointmentModal 
      :is-open="isModalOpen" 
      @close="isModalOpen = false" 
      @submit="handleModalSubmit"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import keycloak from '../services/keycloak';
import AppointmentModal from '../components/AppointmentModal.vue';
import Results from '../components/Results.vue';
import UpcomingAppointments from '../components/UpcomingAppointements.vue';

// ADJUSTMENT 3: Import our newly created Modal Component and define state flags

const isProfileOpen = ref(false);
const isModalOpen = ref(false); // Controls tracking state if modal layout handles render visibility

const userProfile = ref({
  firstName: '',
  fullName: '',
  email: ''
});

// Capture sub-component payloads if you ever want to push new entries directly to UpcomingAppointments
const handleModalSubmit = (formData) => {
  console.log('Nouveau rendez-vous créé avec succès:', formData);
  
  // Close the popup window
  isModalOpen.value = false;
  
  // Note: Later on, you can make an API request here using axios/fetch 
  // or use an event bus/Pinia store to refresh the <UpcomingAppointements /> list instantly!
};

onMounted(() => {
  if (keycloak.tokenParsed) {
    userProfile.value = {
      firstName: keycloak.tokenParsed.given_name || '',
      fullName:
        keycloak.tokenParsed.name ||
        `${keycloak.tokenParsed.given_name || ''} ${keycloak.tokenParsed.family_name || ''}`,
      email: keycloak.tokenParsed.email || ''
    };
  }
});

const logout = () =>
  keycloak.logout({
    redirectUri: window.location.origin
  });

const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };

    document.addEventListener('click', el.clickOutsideEvent);
  },

  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  }
};
</script>