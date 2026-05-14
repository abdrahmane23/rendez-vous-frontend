<template>
  <div class="min-h-screen bg-slate-100 p-6">
    <div class="bg-[#1E293B] text-white p-4 rounded-lg mb-8 flex justify-between items-center shadow-lg">
      <span class="font-black tracking-widest uppercase">Admin Console</span>
      <button @click="logout" class="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-xs font-bold uppercase transition">
        Exit System
      </button>
    </div>

    <div class="max-w-md mx-auto bg-white rounded-lg shadow-2xl border-l-8 border-[#1E293B] p-8">
      <h1 class="text-xl font-bold text-[#1E293B]">System Management</h1>
      <p class="text-sm text-slate-400">This is the <span class="text-[#6366F1] font-mono">Admin View</span>.</p>
    </div>
  </div>
</template>

<script setup>
import keycloak from '../services/keycloak';
const logout = () => keycloak.logout({ redirectUri: window.location.origin });
</script>