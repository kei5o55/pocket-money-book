<!-- components/TransactionModal.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Check, ArrowDownLeft, ArrowUpRight } from 'lucide-vue-next'

const props = defineProps<{
  type: 'in' | 'out'
}>()

const isOpen = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  (e: 'submit', payload: { amount: number; title: string; type: 'in' | 'out' }): void
}>()

const form = ref({
  amount: 100,
  title: ''
})

watch(isOpen, (newVal) => {
  if (newVal) {
    form.value = {
      amount: props.type === 'in' ? 100 : 120,
      title: ''
    }
  }
})

const handleSubmit = () => {
  if (!form.value.title.trim()) {
    alert('りゆうを 入力してね！')
    return
  }
  if (form.value.amount <= 0) {
    alert('きんがくを 入力してね！')
    return
  }

  emit('submit', {
    ...form.value,
    type: props.type
  })

  isOpen.value = false
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div
        class="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl border-4 border-amber-300 transition-all space-y-6 relative overflow-hidden text-slate-800"
      >
        <!-- 閉じるボタン -->
        <button
          @click="isOpen = false"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-2xl bg-amber-50 border border-amber-200 transition"
        >
          <X class="w-5 h-5 stroke-[2.5]" />
        </button>

        <!-- ヘッダー -->
        <div class="flex items-center gap-3">
          <div
            :class="[
              'p-3 rounded-2xl text-white shadow-md',
              type === 'in' ? 'bg-emerald-400' : 'bg-rose-400'
            ]"
          >
            <ArrowDownLeft v-if="type === 'in'" class="w-6 h-6 stroke-[3]" />
            <ArrowUpRight v-else class="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <h2 class="text-xl font-black text-slate-800">
              {{ type === 'in' ? 'おかねを もらった' : 'おかねを つかった' }}
            </h2>
          </div>
        </div>

        <!-- フォーム領域 -->
        <div class="space-y-4">
          <!-- 金額入力 -->
          <div>
            <label class="block text-xs font-black text-amber-900 mb-1.5">いくら？（円）</label>
            <div class="relative flex items-center">
              <input
                v-model.number="form.amount"
                type="number"
                step="10"
                class="w-full text-center text-4xl font-black bg-amber-50/50 border-2 rounded-2xl py-3 focus:outline-none transition-all tracking-tight"
                :class="[
                  type === 'in'
                    ? 'text-emerald-600 border-emerald-300 focus:border-emerald-500'
                    : 'text-rose-600 border-rose-300 focus:border-rose-500'
                ]"
              />
            </div>
          </div>

          <!-- 理由・項目入力 -->
          <div>
            <label class="block text-xs font-black text-amber-900 mb-1.5">
              {{ type === 'in' ? 'なにで もらった？' : 'なにに つかった？' }}
            </label>
            <input
              v-model="form.title"
              type="text"
              :placeholder="type === 'in' ? '例: おてつだい、おこづかい' : '例: ジュース、おかし'"
              class="w-full text-base font-bold text-slate-800 bg-amber-50/50 border-2 border-amber-200 rounded-2xl p-3.5 focus:outline-none focus:border-amber-400 transition-all placeholder:text-slate-300"
            />
          </div>
        </div>

        <!-- 登録ボタン -->
        <button
          @click="handleSubmit"
          class="w-full flex items-center justify-center gap-2 text-white font-black text-lg py-4 rounded-2xl transition-all active:scale-95 shadow-md active:shadow-none active:translate-y-1"
          :class="[
            type === 'in'
              ? 'bg-emerald-400 hover:bg-emerald-500 shadow-[0_4px_0_#059669]'
              : 'bg-rose-400 hover:bg-rose-500 shadow-[0_4px_0_#e11d48]'
          ]"
        >
          <Check class="w-6 h-6 stroke-[3]" />
          <span>できた</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>