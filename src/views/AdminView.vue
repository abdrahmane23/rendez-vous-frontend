<template>
  <div class="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans">
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
    
    <nav class="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
      <div class="flex items-center space-x-3">
        <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-md">
          <svg class="w-4 h-4 text-[#0F52BA]" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
          </svg>
        </div>
        <span class="text-xl font-bold text-[#1E293B]">Sante Clinique</span>
      </div>

      <div class="flex items-center space-x-6">

        <div class="relative">
          <button @click="isDropdownOpen = !isDropdownOpen" class="flex items-center space-x-2 focus:outline-none">
            <div class="flex items-center justify-center w-8 h-8 bg-[#0F52BA] text-white rounded-full">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <span class="font-medium text-sm">Admin</span>
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>

          <div v-if="isDropdownOpen" class="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-md shadow-lg py-1 z-10">
            <div class="px-4 py-3 border-b border-gray-100">
              <p class="text-xs text-gray-500 uppercase font-semibold">Connecté en tant que</p>
              <p class="text-sm font-bold text-[#1E293B] mt-1">Admin Principal</p>
              <p class="text-sm text-gray-500">admin@santeclinique.ma</p>
            </div>
            <a 
              href="#" 
              @click.prevent="handleLogout"
              class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center font-medium"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Se déconnecter
            </a>
          </div>
        </div>
      </div>
    </nav>

    <div class="px-8 pt-8 bg-[#F8FAFC]">
      <header class="mb-6">
        <h1 class="text-3xl font-bold text-[#1E293B]">Espace Admin</h1>
        <p class="text-gray-500 mt-2 text-sm">Bienvenue, voici le panneau de contrôle de la clinique.</p>
      </header>

      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="currentTab = tab.id"
            :class="[
              currentTab === tab.id 
                ? 'border-[#0F52BA] text-[#0F52BA]' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </div>

    <main class="p-8">
      <component :is="activeComponent" />
    </main>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Import Keycloak instance to handle session destruction
import keycloak from '../services/keycloak'

// Import your 4 tab components
import StaffTab from '../components/Staff.vue'
import SectionsTab from '../components/Sections.vue'
import ShiftsTab from '../components/Shifts.vue'
import StatistiquesTab from '../components/Statistiques.vue'
import { fetchEventSource } from '@microsoft/fetch-event-source';


// Dropdown state
const isDropdownOpen = ref(false)
const notifications = ref([]);


// Tabs configuration
const tabs = [
  { id: 'staff', name: 'Staff' },
  { id: 'sections', name: 'Sections' },
  { id: 'shifts', name: 'Shifts' },
  { id: 'statistiques', name: 'Statistiques' }
]

// Current active tab state
const currentTab = ref('staff')

// Computed property to render the correct component dynamically
const activeComponent = computed(() => {
  switch (currentTab.value) {
    case 'staff': return StaffTab
    case 'sections': return SectionsTab
    case 'shifts': return ShiftsTab
    case 'statistiques': return StatistiquesTab
    default: return StaffTab
  }
})
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

// FIXED: Added logout handler execution logic
const handleLogout = () => {
  if (keycloak) {
    keycloak.logout({
      redirectUri: window.location.origin // Redirects the admin back to your app landing page post-logout
    })
  } else {
    console.error("Keycloak service is not initialized.")
  }
}
</script>