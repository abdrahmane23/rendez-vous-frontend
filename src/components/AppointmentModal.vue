<script setup>
import { ref } from 'vue';
import ConsultationForm from './ConsultationForm.vue';
import TestForm from './TestForm.vue';

const props = defineProps({
  isOpen: { type: Boolean, required: true }
});

const emit = defineEmits(['close', 'submit']);

// Step tracking states: 'choice', 'consultation', 'test'
const step = ref('choice');

const handleFinalSubmit = (data) => {
  emit('submit', data);
  close();
};

const close = () => {
  step.value = 'choice';
  emit('close');
};
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div @click="close" class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>

      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-100 z-10 transform transition-all flex flex-col md:flex-row min-h-[580px]">
        
        <div class="md:w-1/3 bg-slate-50 p-6 border-r border-slate-100 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 text-[#0F52BA] font-bold text-base mb-6">
              <span>💙</span><span>Sante Clinique</span>
            </div>
            
            <h3 class="text-xl font-bold text-slate-800 mb-2">Prise de RDV</h3>
            
            <p class="text-xs text-slate-500 leading-relaxed mb-6">
              {{ step === 'choice' ? 'Choisissez le type de rendez-vous.' : 'Sélectionnez votre méthode de prise de rendez-vous ci-dessous.' }}
            </p>

            <div v-if="step === 'consultation'" class="flex flex-col gap-2 mt-4">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Options de Consultation</p>
              
              <div class="w-full text-left p-3 rounded-xl border border-[#0F52BA] bg-white text-[#0F52BA] shadow-xs text-xs font-bold flex items-center gap-2.5">
                <span>🩺</span> Formulaire de Consultation
              </div>
            </div>

            <div v-else-if="step === 'test'" class="flex flex-col gap-2 mt-4">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Options d'Analyses</p>
              
              <div class="w-full text-left p-3 rounded-xl border border-[#6366F1] bg-white text-[#6366F1] shadow-xs text-xs font-bold flex items-center gap-2.5">
                <span>🔬</span> Formulaire de Test
              </div>
            </div>
          </div>

          <div>
            <button 
              v-if="step !== 'choice'" 
              @click="step = 'choice'" 
              class="text-xs font-bold text-slate-400 hover:text-slate-600 transition flex items-center gap-1 mb-4"
            >
              ← Retour aux types
            </button>
            
            <div v-if="step === 'choice'" class="space-y-2.5 text-[11px] text-slate-400 font-medium border-t border-slate-200/60 pt-4">
              <div class="flex items-center gap-2 text-[#10B981]">
                <span class="w-4 h-4 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[9px]">1</span> Type de rendez-vous
              </div>
              <div class="flex items-center gap-2">
                <span class="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px]">2</span> Informations détaillées
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 flex flex-col relative bg-white">
          <button @click="close" class="absolute top-5 right-5 text-slate-400 hover:text-slate-600 z-20 text-lg">✕</button>

          <div v-if="step === 'choice'" class="p-10 flex-1 flex flex-col justify-center">
            <h4 class="text-lg font-bold text-slate-800 mb-8 text-center">Que souhaitez-vous planifier ?</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto w-full">
              <div @click="step = 'consultation'" class="group border border-slate-200 hover:border-[#0F52BA] p-6 rounded-xl cursor-pointer transition-all hover:shadow-md text-center bg-slate-50/50 hover:bg-white">
                <div class="w-14 h-14 bg-blue-100 text-[#0F52BA] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition text-xl">Doc</div>
                <h5 class="font-bold text-sm text-slate-800">Consultation</h5>
                <p class="text-[11px] text-slate-400 mt-1">Généraliste ou Spécialiste</p>
              </div>
              <div @click="step = 'test'" class="group border border-slate-200 hover:border-[#6366F1] p-6 rounded-xl cursor-pointer transition-all hover:shadow-md text-center bg-slate-50/50 hover:bg-white">
                <div class="w-14 h-14 bg-indigo-100 text-[#6366F1] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition text-xl">Lab</div>
                <h5 class="font-bold text-sm text-slate-800">Analyse / Test</h5>
                <p class="text-[11px] text-slate-400 mt-1">Laboratoire ou Imagerie</p>
              </div>
            </div>
          </div>

          <ConsultationForm 
            v-else-if="step === 'consultation'" 
            @cancel="close" 
            @submit="handleFinalSubmit" 
          />

          <TestForm 
            v-else-if="step === 'test'" 
            @cancel="close" 
            @submit="handleFinalSubmit" 
          />
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>