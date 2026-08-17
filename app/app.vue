<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Wallet, Settings, Plus, Minus, History, Sparkles, Shield, User, RefreshCw } from 'lucide-vue-next'
import TransactionModal from '~/components/TransactionModal.vue'
import { getStateFromIDB, saveStateToIDB } from '~/utils/db'

interface HistoryItem {
  id: number
  type: 'in' | 'out'
  title: string
  amount: number
  date: string
}

// リアクティブな状態管理
const balance = useState<number>('balance', () => 1200)
const isParentMode = useState<boolean>('isParentMode', () => false)
const history = useState<HistoryItem[]>('history', () => [
  { id: 1, type: 'in', title: 'おこづかい', amount: 500, date: '8/15' },
  { id: 2, type: 'out', title: 'ジュース', amount: 120, date: '8/16' }
])

const isModalOpen = ref(false)
const modalType = ref<'in' | 'out'>('in')
const isLoaded = ref(false) // 初回ロード完了フラグ（初期値による上書き防止）

// ----------------------------------------------------
// IndexedDB からのデータ復元 & 自動保存
// ----------------------------------------------------
onMounted(async () => {
  try {
    const savedBalance = await getStateFromIDB<number>('balance')
    const savedHistory = await getStateFromIDB<HistoryItem[]>('history')

    if (savedBalance !== undefined) balance.value = savedBalance
    if (savedHistory !== undefined) history.value = savedHistory
  } catch (e) {
    console.error('IndexedDB ロード失敗:', e)
  } finally {
    isLoaded.value = true
  }
})

// 状態が変化したら IndexedDB へ自動保存（ロード完了後のみ実行）
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

// ----------------------------------------------------
// アクション処理
// ----------------------------------------------------
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
    date: '今日'
  })
}

const handleAddDirect = (amount: number, title: string) => {
  balance.value += amount
  history.value.unshift({
    id: Date.now(),
    type: 'in',
    title,
    amount,
    date: '今日'
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
    date: '今日'
  })
}

// データ初期化（DBも削除・初期化）
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
  <div class="min-h-screen bg-slate-100 text-slate-800 font-sans p-4 md:p-8 flex flex-col items-center justify-center">
    
    <div class="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[720px]">
      
      <!-- 左カラム：子ども用UI -->
      <section class="lg:col-span-6 bg-amber-50 border-r border-slate-200 flex flex-col relative select-none">
        <header class="bg-amber-400 p-4 shadow-sm flex justify-between items-center rounded-b-3xl">
          <div class="flex items-center gap-2">
            <Wallet class="w-7 h-7 text-amber-950" />
            <h1 class="text-xl font-black text-amber-950 tracking-wider">
              おこづかいちょう
            </h1>
          </div>
          
          <button
            @click="isParentMode = !isParentMode"
            :class="[
              'p-2 rounded-full border-2 transition',
              isParentMode
                ? 'bg-slate-800 text-white border-slate-900'
                : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
            ]"
          >
            <Settings class="w-4 h-4" />
          </button>
        </header>

        <div class="p-6 flex flex-col gap-6 flex-1 overflow-y-auto max-w-md mx-auto w-full">
          <div v-if="isParentMode" class="bg-slate-800 text-slate-100 p-3 rounded-2xl text-xs flex justify-between items-center shadow-md">
            <span class="flex items-center gap-1.5 font-bold">
              <Shield class="w-4 h-4 text-amber-400" />
              おうちのひと モード
            </span>
            <button @click="isParentMode = false" class="text-amber-400 font-bold underline text-[11px]">
              とじる
            </button>
          </div>

          <!-- 残高カード -->
          <div class="bg-white border-4 border-amber-300 rounded-3xl p-6 text-center shadow-md relative overflow-hidden">
            <div class="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
              <Sparkles class="w-32 h-32 text-amber-500" />
            </div>
            <p class="text-xs font-bold text-slate-400 mb-1">いまのおかね</p>
            <div class="flex justify-center items-baseline gap-1 text-amber-500">
              <span class="text-5xl font-black tracking-tight">
                {{ balance.toLocaleString() }}
              </span>
              <span class="text-xl font-bold">えん</span>
            </div>
          </div>

          <!-- 操作ボタン -->
          <div class="grid grid-cols-2 gap-4">
            <button
              @click="openModal('in')"
              class="flex flex-col items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-500 active:translate-y-1 text-white font-black text-lg py-5 rounded-3xl shadow-[0_5px_0_#059669] active:shadow-none transition-all"
            >
              <Plus class="w-7 h-7 stroke-[3]" />
              <span>もらった！</span>
            </button>

            <button
              @click="openModal('out')"
              class="flex flex-col items-center justify-center gap-2 bg-rose-400 hover:bg-rose-500 active:translate-y-1 text-white font-black text-lg py-5 rounded-3xl shadow-[0_5px_0_#e11d48] active:shadow-none transition-all"
            >
              <Minus class="w-7 h-7 stroke-[3]" />
              <span>つかった！</span>
            </button>
          </div>

          <!-- 履歴 -->
          <div class="bg-white border-2 border-amber-200 rounded-3xl p-5 shadow-sm flex-1">
            <div class="flex items-center gap-2 mb-3 text-slate-500 border-b border-amber-100 pb-2">
              <History class="w-4 h-4" />
              <h2 class="text-xs font-bold">つかった・もらった きろく</h2>
            </div>

            <ul class="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1">
              <li
                v-for="item in history"
                :key="item.id"
                class="flex justify-between items-center text-xs font-bold bg-amber-50/50 p-2 rounded-xl"
              >
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-slate-400 font-normal">{{ item.date }}</span>
                  <span>{{ item.title }}</span>
                </div>
                <span :class="item.type === 'in' ? 'text-emerald-600' : 'text-rose-500'">
                  {{ item.type === 'in' ? '+' : '-' }}{{ item.amount }}円
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 右カラム：PC開発用ダッシュボード -->
      <section class="lg:col-span-6 p-8 bg-slate-50 flex flex-col justify-between">
        <div class="space-y-6">
          <div class="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span class="text-xs font-mono font-bold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-md">DEV MODE</span>
              <h2 class="text-lg font-bold text-slate-800 mt-2">開発用コントロールパネル</h2>
            </div>
            <button 
              @click="handleReset" 
              class="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 bg-white border border-slate-300 px-3 py-1.5 rounded-lg shadow-sm transition"
            >
              <RefreshCw class="w-3.5 h-3.5" />
              データを初期化
            </button>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div class="flex items-center gap-2 text-slate-700 font-bold text-sm">
              <Shield class="w-4 h-4 text-slate-500" />
              <span>保護者機能テスト</span>
            </div>
            <p class="text-xs text-slate-500 leading-relaxed">
              画面左上のギアアイコンを押すか、以下のスイッチで「親モード」の表示状態を確認できます。
            </p>
            <button
              @click="isParentMode = !isParentMode"
              class="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              :class="isParentMode ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'"
            >
              <User class="w-4 h-4" />
              現在の状態: {{ isParentMode ? '親モード ON' : '子どもモード' }}
            </button>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 class="text-xs font-bold text-slate-700">クイックトランザクション追加</h3>
            <div class="grid grid-cols-2 gap-2">
              <button 
                @click="handleAddDirect(500, 'おこづかい')" 
                class="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 transition"
              >
                +500円（定額）
              </button>
              <button 
                @click="handleUseDirect(120, 'ジュース')" 
                class="py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition"
              >
                -120円（購入）
              </button>
            </div>
          </div>

          <div class="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-[11px] space-y-2">
            <div class="text-slate-400 font-bold border-b border-slate-700 pb-1">State Log</div>
            <div>balance: <span class="text-amber-400">{{ balance }}</span></div>
            <div>isParentMode: <span class="text-sky-400">{{ isParentMode }}</span></div>
            <div>isLoaded: <span class="text-purple-400">{{ isLoaded }}</span></div>
            <div>history_count: <span class="text-emerald-400">{{ history.length }}</span></div>
          </div>
        </div>

        <p class="text-[11px] text-slate-400 text-center mt-6">
          Next Step: Supabase 連携・PWA 設定
        </p>
      </section>

    </div>

    <TransactionModal
      v-model="isModalOpen"
      :type="modalType"
      @submit="handleTransactionSubmit"
    />

  </div>
</template>