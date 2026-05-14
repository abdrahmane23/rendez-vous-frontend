<template>
  <div class="min-h-screen bg-red-50 flex items-center justify-center p-6 text-center">
    <div class="space-y-6">
      <h1 class="text-9xl font-extrabold text-red-100">403</h1>
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-red-100">
        <h2 class="text-2xl font-bold text-red-600 mb-2">Role Error</h2>
        <p class="text-slate-500 mb-6">Your account doesn't have the correct roles assigned.</p>
        
        <button 
          @click="resetAndLogout"
          class="px-6 py-3 bg-[#1E293B] text-white rounded-lg font-medium hover:bg-black transition"
        >
          Logout & Try Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import keycloak from '../services/keycloak';

const resetAndLogout = () => {
  // This clears the Keycloak tokens and redirects to the login screen
  keycloak.logout({ redirectUri: window.location.origin });
};
</script>