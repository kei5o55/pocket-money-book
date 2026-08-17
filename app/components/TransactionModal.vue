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
    alert('なまえ（りゆう）を 入力してね！')
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
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fade-in"
    >
      <div
        class="bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-700/60 transition-all space-y-6 relative overflow-hidden text-slate-100"
      >
        <!-- 背景アクセントグラデーション -->
        <div
          :class="[
            'absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-20',
            type === 'in' ? 'bg-emerald-500' : 'bg-rose-500'
          ]"
        />

        <!-- 閉じるボタン -->
        <button
          @click="isOpen = false"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-2 rounded-xl bg-slate-800/60 border border-slate-700/40 hover:bg-slate-700/60 transition"
        >
          <X class="w-4 h-4" />
        </button>

        <!-- ヘッダー -->
        <div class="flex items-center gap-3">
          <div
            :class="[
              'p-3 rounded-2xl border',
              type === 'in'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            ]"
          >
            <ArrowDownLeft v-if="type === 'in'" class="w-5 h-5" />
            <ArrowUpRight v-else class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-bold text-white">
              {{ type === 'in' ? 'おかねを もらった' : 'おかねを つかった' }}
            </h2>
            <p class="text-xs text-slate-400">新しい記録を追加します</p>
          </div>
        </div>

        <!-- フォーム領域 -->
        <div class="space-y-4">
          <!-- 金額入力 -->
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">いくら？（円）</label>
            <div class="relative flex items-center">
              <input
                v-model.number="form.amount"
                type="number"
                step="10"
                class="w-full text-center text-3xl font-black bg-slate-950/60 border rounded-2xl py-3.5 focus:outline-none transition-all tracking-tight"
                :class="[
                  type === 'in'
                    ? 'text-emerald-400 border-emerald-500/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50'
                    : 'text-rose-400 border-rose-500/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50'
                ]"
              />
            </div>
          </div>

          <!-- 理由・項目入力 -->
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">
              {{ type === 'in' ? 'なんの おかね？（理由）' : 'なにを かったの？（理由）' }}
            </label>
            <input
              v-model="form.title"
              type="text"
              :placeholder="type === 'in' ? '例: おてつだい、お小遣い' : '例: ジュース、おかし'"
              class="w-full text-sm font-medium text-slate-200 bg-slate-950/60 border border-slate-700/60 rounded-2xl p-3.5 focus:outline-none transition-all placeholder:text-slate-600"
              :class="type === 'in' ? 'focus:border-emerald-500/80' : 'focus:border-rose-500/80'"
            />
          </div>
        </div>

        <!-- 登録ボタン -->
        <button
          @click="handleSubmit"
          class="w-full flex items-center justify-center gap-2 text-white font-semibold text-sm py-3.5 rounded-2xl shadow-lg transition-all active:scale-[0.98]"
          :class="[
            type === 'in'
              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
              : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50'
          ]"
        >
          <Check class="w-4 h-4 stroke-[2.5]" />
          <span>記録を保存する</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>