<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Wallet, Settings, Plus, Minus, History, Shield, User, RefreshCw, ChevronDown, ChevronUp, Loader2 } from 'lucide-vue-next'
import TransactionModal from '~/components/TransactionModal.vue'
import MonthlySummary from '~/components/MonthlySummary.vue'
import { getStateFromIDB, saveStateToIDB } from '~/utils/db'

interface HistoryItem {
  id: number
  type: 'in' | 'out'
  title: string
  amount: number
  date: string
}

// 初期値を空（または0）ベースにしておき、IDB復元待ちにする
const balance = useState<number>('balance', () => 1200)
const isParentMode = useState<boolean>('isParentMode', () => false)
const history = useState<HistoryItem[]>('history', () => [
  { id: 1, type: 'in', title: 'おこづかい', amount: 500, date: '8/15' },
  { id: 2, type: 'out', title: 'ジュース', amount: 120, date: '8/16' }
])

const isModalOpen = ref(false)
const modalType = ref<'in' | 'out'>('in')
const isLoaded = ref(false) // 読み込み状態フラグ
const showDevPanel = ref(false)

// IndexedDB からのデータ復元 & 自動保存
onMounted(async () => {
  try {
    const savedBalance = await getStateFromIDB<number>('balance')
    const savedHistory = await getStateFromIDB<HistoryItem[]>('history')

    if (savedBalance !== undefined) balance.value = savedBalance
    if (savedHistory !== undefined) history.value = savedHistory
  } catch (e) {
    console.error('IndexedDB ロード失敗:', e)
  } finally {
    // 復元処理（成功・失敗問わず）完了後に表示フラグを立てる
    isLoaded.value = true
  }
})

watch(balance, (newVal) => {
  if (isLoaded.value) saveStateToIDB('balance', newVal)
})

watch(
  history,
  (newVal) => {
    if (isLoaded.value) saveStateToIDB('history', newVal)
  },
  { deep: true }
)

const openModal = (type: 'in' | 'out') => {
  modalType.value = type
  isModalOpen.value = true
}

const handleTransactionSubmit = (data: { amount: number; title: string; type: 'in' | 'out' }) => {
  const amountNum = Number(data.amount)

  if (data.type === 'out' && balance.value < amountNum) {
    alert('おかねが たりないよ！')
    return
  }

  if (data.type === 'in') {
    balance.value += amountNum
  } else {
    balance.value -= amountNum
  }

  history.value.unshift({
    id: Date.now(),
    type: data.type,
    title: data.title,
    amount: amountNum,
    date: 'きょう'
  })
}

const handleAddDirect = (amount: number, title: string) => {
  balance.value += amount
  history.value.unshift({
    id: Date.now(),
    type: 'in',
    title,
    amount,
    date: 'きょう'
  })
}

const handleUseDirect = (amount: number, title: string) => {
  if (balance.value < amount) {
    alert('おかねが たりないよ！')
    return
  }
  balance.value -= amount
  history.value.unshift({
    id: Date.now(),
    type: 'out',
    title,
    amount,
    date: 'きょう'
  })
}

const handleReset = async () => {
  balance.value = 1200
  history.value = [
    { id: 1, type: 'in', title: 'おこづかい', amount: 500, date: '8/15' },
    { id: 2, type: 'out', title: 'ジュース', amount: 120, date: '8/16' }
  ]
  await saveStateToIDB('balance', balance.value)
  await saveStateToIDB('history', history.value)
}
</script>

<template>
  <div class="min-h-screen bg-amber-100/60 text-slate-800 font-sans p-4 md:p-6 flex flex-col items-center justify-center">
    
    <!-- 1. ロード中表示（isLoadedがfalseのとき） -->
    <div v-if="!isLoaded" class="flex flex-col items-center justify-center space-y-4 py-12">
      <div class="p-4 bg-amber-400 text-white rounded-3xl shadow-lg animate-bounce">
        <Wallet class="w-10 h-10" />
      </div>
      <div class="flex items-center gap-2 text-amber-900 font-black text-lg">
        <Loader2 class="w-5 h-5 animate-spin text-amber-600" />
        <span>じゅんび中...</span>
      </div>
    </div>

    <!-- 2. メイン画面表示（isLoadedがtrueになったらフェードイン表示） -->
    <template v-else>
      <!-- メインアプリカード -->
      <div class="w-full max-w-lg bg-white rounded-[32px] border-4 border-amber-300 shadow-xl overflow-hidden p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
        
        <!-- ヘッダー -->
        <header class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-amber-400 text-white rounded-2xl shadow-md rotate-[-3deg]">
              <Wallet class="w-7 h-7" />
            </div>
            <div>
              <h1 class="text-2xl font-black text-amber-900 tracking-wide">おこづかいちょう</h1>
            </div>
          </div>
          
          <button
            @click="isParentMode = !isParentMode"
            :class="[
              'p-2.5 rounded-2xl border-2 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm',
              isParentMode
                ? 'bg-amber-100 border-amber-400 text-amber-800'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
            ]"
          >
            <Settings class="w-4 h-4" />
            <span>{{ isParentMode ? 'おうちの人' : '設定' }}</span>
          </button>
        </header>

        <!-- 保護者モードバナー -->
        <div v-if="isParentMode" class="bg-amber-50 border-2 border-amber-300 text-amber-900 p-3.5 rounded-2xl text-xs flex justify-between items-center shadow-inner">
          <span class="flex items-center gap-2 font-bold">
            <Shield class="w-4 h-4 text-amber-600" />
            おうちの人モード（かんり画面）
          </span>
          <button @click="isParentMode = false" class="text-amber-700 hover:underline font-bold">
            とじる
          </button>
        </div>

        <!-- 残高表示 -->
        <div class="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-amber-300 to-amber-400 p-6 text-center shadow-lg border-4 border-amber-200">
          <span class="inline-block bg-white/80 text-amber-900 text-xs font-black px-3 py-1 rounded-full shadow-sm mb-1">
            いまのおかね
          </span>
          
          <div class="flex items-center justify-center gap-1 my-1">
            <span class="text-5xl md:text-6xl font-black tracking-tight text-amber-950 drop-shadow-sm">
              {{ balance.toLocaleString() }}
            </span>
            <span class="text-2xl font-bold text-amber-900 self-end mb-1">えん</span>
          </div>
        </div>

        <!-- アクションボタン -->
        <div class="grid grid-cols-2 gap-4">
          <button
            @click="openModal('in')"
            class="flex flex-col items-center justify-center gap-1 bg-emerald-400 hover:bg-emerald-500 active:scale-95 text-white font-black text-lg py-5 px-4 rounded-3xl shadow-[0_6px_0_#059669] active:shadow-none active:translate-y-1 transition-all border-2 border-emerald-300"
          >
            <div class="p-2 rounded-full bg-white/20">
              <Plus class="w-7 h-7 stroke-[3]" />
            </div>
            <span>もらった</span>
          </button>

          <button
            @click="openModal('out')"
            class="flex flex-col items-center justify-center gap-1 bg-rose-400 hover:bg-rose-500 active:scale-95 text-white font-black text-lg py-5 px-4 rounded-3xl shadow-[0_6px_0_#e11d48] active:shadow-none active:translate-y-1 transition-all border-2 border-rose-300"
          >
            <div class="p-2 rounded-full bg-white/20">
              <Minus class="w-7 h-7 stroke-[3]" />
            </div>
            <span>つかった</span>
          </button>
        </div>

        <!-- 取引履歴 -->
        <div class="bg-amber-50/60 border-2 border-amber-200 rounded-3xl p-4 space-y-3">
          <div class="flex items-center justify-between px-1">
            <div class="flex items-center gap-2 text-amber-900">
              <History class="w-4 h-4 text-amber-600" />
              <h2 class="text-sm font-black">つかった・もらった きろく</h2>
            </div>
            <span class="text-xs font-bold text-amber-700/70">{{ history.length }}けん</span>
          </div>

          <ul class="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            <li
              v-for="item in history"
              :key="item.id"
              class="flex justify-between items-center text-xs p-3 rounded-2xl bg-white border border-amber-200/80 shadow-sm"
            >
              <div class="flex items-center gap-3">
                <span
                  :class="[
                    'px-2.5 py-1 rounded-xl font-black text-[11px]',
                    item.type === 'in' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  ]"
                >
                  {{ item.type === 'in' ? 'もらった' : 'つかった' }}
                </span>
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

          <div class="pt-2">
            <MonthlySummary :history="history" />
          </div>
        </div>
        
      </div>

      <!-- 開発者パネル -->
      <div class="w-full max-w-lg mt-4">
        <button 
          @click="showDevPanel = !showDevPanel" 
          class="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-600 py-2 px-4 rounded-xl bg-amber-200/40 border border-amber-300/50 transition"
        >
          <span class="font-mono font-bold">DEV CONTROL PANEL</span>
          <component :is="showDevPanel ? ChevronUp : ChevronDown" class="w-4 h-4" />
        </button>

        <div v-if="showDevPanel" class="mt-2 bg-slate-800 text-slate-100 p-5 rounded-3xl space-y-4 text-xs shadow-lg">
          <div class="flex items-center justify-between border-b border-slate-700 pb-3">
            <span class="font-mono font-bold text-indigo-400">DEV PANEL</span>
            <button 
              @click="handleReset" 
              class="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-lg transition"
            >
              <RefreshCw class="w-3 h-3" />
              初期化
            </button>
          </div>

          <div class="space-y-2">
            <p class="text-slate-400 font-bold">モード切り替えテスト</p>
            <button
              @click="isParentMode = !isParentMode"
              class="w-full py-2 px-3 rounded-xl font-bold bg-slate-700 hover:bg-slate-600 transition flex items-center justify-center gap-2"
            >
              <User class="w-3.5 h-3.5" />
              状態: {{ isParentMode ? '親モード ON' : '子どもモード' }}
            </button>
          </div>

          <div class="space-y-2">
            <p class="text-slate-400 font-bold">クイックテスト</p>
            <div class="grid grid-cols-2 gap-2">
              <button 
                @click="handleAddDirect(500, 'おこづかい')" 
                class="py-2 bg-emerald-500/20 text-emerald-300 font-bold rounded-xl border border-emerald-500/30 hover:bg-emerald-500/30"
              >
                +500円
              </button>
              <button 
                @click="handleUseDirect(120, 'ジュース')" 
                class="py-2 bg-rose-500/20 text-rose-300 font-bold rounded-xl border border-rose-500/30 hover:bg-rose-500/30"
              >
                -120円
              </button>
            </div>
          </div>

          <div class="bg-slate-900 p-3 rounded-xl font-mono text-[10px] space-y-1">
            <div class="flex justify-between"><span>balance:</span> <span class="text-amber-400">{{ balance }}</span></div>
            <div class="flex justify-between"><span>isParentMode:</span> <span class="text-indigo-400">{{ isParentMode }}</span></div>
            <div class="flex justify-between"><span>history_count:</span> <span>{{ history.length }}</span></div>
          </div>
        </div>
      </div>

      <TransactionModal
        v-model="isModalOpen"
        :type="modalType"
        @submit="handleTransactionSubmit"
      />
    </template>

  </div>
</template>