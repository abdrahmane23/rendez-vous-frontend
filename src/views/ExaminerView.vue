<template>
  <div class="min-h-screen bg-[#F0FDF4] p-6">
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-end mb-6">
        <button @click="logout" class="text-slate-500 hover:text-red-600 flex items-center gap-2 transition">
          <span class="text-sm font-medium">Close Session</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-lg border border-[#10B981]/20 p-8 text-center">
        <div class="inline-block px-4 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-bold mb-4 uppercase">Clinical Access</div>
        <h1 class="text-2xl font-semibold text-slate-800">Medical Examiner Console</h1>
        <p class="mt-4 text-slate-600 italic">This is the <span class="text-[#10B981] font-bold underline">Examiner View</span>.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import keycloak from '../services/keycloak';
const logout = () => keycloak.logout({ redirectUri: window.location.origin });
</script>