<!-- components/MonthlySummary.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight, ArrowDownLeft, ArrowUpRight, Calendar } from 'lucide-vue-next'

interface HistoryItem {
  id: number
  type: 'in' | 'out'
  title: string
  amount: number
  date: string // 例: "8/15", "2026-08-15", "今日" など
}

const props = defineProps<{
  history: HistoryItem[]
}>()

// 現在選択されている年月（初期値は当月）
const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth() + 1) // 1〜12

// 前の月へ
const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

// 次の月へ
const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

// 選択中の月の履歴を抽出
// ※ 履歴の `date` から月を判別します（"8/15" 形式や "今日" などの簡易表記に対応）
const filteredHistory = computed(() => {
  return props.history.filter((item) => {
    if (item.date === '今日' || item.date === 'きょう') {
      const today = new Date()
      return today.getFullYear() === currentYear.value && (today.getMonth() + 1) === currentMonth.value
    }
    
    // "8/15" や "08/15" のような形式から月を取得
    const match = item.date.match(/^(\d{1,2})\//)
    if (match) {
      const itemMonth = parseInt(match[1], 10)
      return itemMonth === currentMonth.value
    }
    
    return true // 形式が不確定な場合は一旦表示
  })
})

// 選択中の月の「ふえた総額」
const totalIn = computed(() => {
  return filteredHistory.value
    .filter((item) => item.type === 'in')
    .reduce((sum, item) => sum + item.amount, 0)
})

// 選択中の月の「つかった総額」
const totalOut = computed(() => {
  return filteredHistory.value
    .filter((item) => item.type === 'out')
    .reduce((sum, item) => sum + item.amount, 0)
})
</script>

<template>
  <div class="bg-amber-50/80 border-4 border-amber-200 rounded-[32px] p-5 md:p-6 space-y-5">
    
    <!-- 月切り替えヘッダー -->
    <div class="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border-2 border-amber-200 shadow-sm">
      <button
        @click="prevMonth"
        class="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 transition active:scale-95"
      >
        <ChevronLeft class="w-6 h-6 stroke-[3]" />
      </button>

      <div class="flex items-center gap-2 text-amber-950 font-black text-xl">
        <Calendar class="w-5 h-5 text-amber-500" />
        <span>{{ currentMonth }}がつ</span>
        <span class="text-xs text-amber-700/60 font-bold self-end mb-0.5">({{ currentYear }}ねん)</span>
      </div>

      <button
        @click="nextMonth"
        class="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 transition active:scale-95"
      >
        <ChevronRight class="w-6 h-6 stroke-[3]" />
      </button>
    </div>

    <!-- 今月の合計カード (ふえた・つかった) -->
    <div class="grid grid-cols-2 gap-3">
      <!-- ふえた合計 -->
      <div class="bg-emerald-100/70 border-2 border-emerald-300 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
        <span class="text-xs font-black text-emerald-800 bg-emerald-200/80 px-2.5 py-0.5 rounded-full mb-1">
          ふえたおかね
        </span>
        <div class="flex items-baseline gap-0.5">
          <span class="text-2xl md:text-3xl font-black text-emerald-700">
            +{{ totalIn.toLocaleString() }}
          </span>
          <span class="text-xs font-bold text-emerald-800">円</span>
        </div>
      </div>

      <!-- つかった合計 -->
      <div class="bg-rose-100/70 border-2 border-rose-300 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
        <span class="text-xs font-black text-rose-800 bg-rose-200/80 px-2.5 py-0.5 rounded-full mb-1">
          つかったおかね
        </span>
        <div class="flex items-baseline gap-0.5">
          <span class="text-2xl md:text-3xl font-black text-rose-600">
            -{{ totalOut.toLocaleString() }}
          </span>
          <span class="text-xs font-bold text-rose-800">円</span>
        </div>
      </div>
    </div>

    <!-- その月の履歴一覧 -->
    <div class="space-y-2">
      <div class="flex items-center justify-between px-1">
        <h3 class="text-xs font-black text-amber-900">このつきの きろく</h3>
        <span class="text-xs font-bold text-amber-700/70">{{ filteredHistory.length }}けん</span>
      </div>

      <div v-if="filteredHistory.length === 0" class="text-center py-8 bg-white/60 rounded-2xl border-2 border-dashed border-amber-200">
        <p class="text-xs font-bold text-amber-800/60">このつきの きろくは ないよ！</p>
      </div>

      <ul v-else class="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
        <li
          v-for="item in filteredHistory"
          :key="item.id"
          class="flex justify-between items-center text-xs p-3 rounded-2xl bg-white border border-amber-200/80 shadow-sm"
        >
          <div class="flex items-center gap-3">
            <div
              :class="[
                'p-1.5 rounded-xl text-white',
                item.type === 'in' ? 'bg-emerald-400' : 'bg-rose-400'
              ]"
            >
              <ArrowDownLeft v-if="item.type === 'in'" class="w-4 h-4 stroke-[3]" />
              <ArrowUpRight v-else class="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <p class="font-bold text-slate-800 text-sm">{{ item.title }}</p>
              <p class="text-[10px] text-slate-400 font-bold">{{ item.date }}</p>
            </div>
          </div>

          <span :class="['font-black text-base', item.type === 'in' ? 'text-emerald-600' : 'text-slate-700']">
            {{ item.type === 'in' ? '+' : '-' }}{{ item.amount.toLocaleString() }}円
          </span>
        </li>
      </ul>
    </div>

  </div>
</template>