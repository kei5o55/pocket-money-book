<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Wallet, Settings, Plus, Minus, History, Shield, User, RefreshCw, ArrowUpRight, ArrowDownLeft } from 'lucide-vue-next'
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
const isLoaded = ref(false)

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
  <div class="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8 flex items-center justify-center">
    
    <div class="w-full max-w-5xl bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[720px]">
      
      <!-- 左カラム：メインアプリUI (クリーン・洗練されたトーン) -->
      <section class="lg:col-span-7 bg-slate-900/50 p-6 md:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-700/50 relative">
        
        <!-- ヘッダー -->
        <header class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
              <Wallet class="w-6 h-6" />
            </div>
            <div>
              <h1 class="text-lg font-bold tracking-tight text-white">おこづかい帳</h1>
              <p class="text-xs text-slate-400">Balance & History</p>
            </div>
          </div>
          
          <button
            @click="isParentMode = !isParentMode"
            :class="[
              'p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2',
              isParentMode
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            ]"
          >
            <Settings class="w-4 h-4" />
          </button>
        </header>

        <div class="space-y-6 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          
          <!-- 親モードバナー -->
          <div v-if="isParentMode" class="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3.5 rounded-2xl text-xs flex justify-between items-center backdrop-blur-sm">
            <span class="flex items-center gap-2 font-medium">
              <Shield class="w-4 h-4 text-amber-400" />
              保護者管理モードが有効です
            </span>
            <button @click="isParentMode = false" class="text-amber-400 hover:underline text-[11px] font-semibold">
              閉じる
            </button>
          </div>

          <!-- 残高カード（カードデザイン＋モダングラデーション） -->
          <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-7 text-white shadow-xl shadow-indigo-950/40 border border-indigo-400/20">
            <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            
            <span class="text-xs font-medium tracking-wider uppercase text-indigo-200/80">現在の残高</span>
            
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-5xl font-black tracking-tight text-white">
                {{ balance.toLocaleString() }}
              </span>
              <span class="text-lg font-medium text-indigo-200">円</span>
            </div>
          </div>

          <!-- アクションボタン（モダンなフラットボタンスタイル） -->
          <div class="grid grid-cols-2 gap-3">
            <button
              @click="openModal('in')"
              class="group relative flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-[0.98] border border-emerald-500/30 text-emerald-400 font-semibold text-sm py-4 rounded-2xl transition-all"
            >
              <div class="p-1.5 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30 transition">
                <Plus class="w-4 h-4 stroke-[2.5]" />
              </div>
              <span>もらった</span>
            </button>

            <button
              @click="openModal('out')"
              class="group relative flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 active:scale-[0.98] border border-rose-500/30 text-rose-400 font-semibold text-sm py-4 rounded-2xl transition-all"
            >
              <div class="p-1.5 rounded-lg bg-rose-500/20 group-hover:bg-rose-500/30 transition">
                <Minus class="w-4 h-4 stroke-[2.5]" />
              </div>
              <span>つかった</span>
            </button>
          </div>

          <!-- 取引履歴 -->
          <div class="bg-slate-800/50 border border-slate-700/60 rounded-3xl p-5 flex-1 flex flex-col">
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-700/40">
              <div class="flex items-center gap-2 text-slate-400">
                <History class="w-4 h-4" />
                <h2 class="text-xs font-semibold uppercase tracking-wider">履歴</h2>
              </div>
              <span class="text-[11px] text-slate-500">{{ history.length }} 件</span>
            </div>

            <ul class="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
              <li
                v-for="item in history"
                :key="item.id"
                class="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-800/80 border border-slate-700/30 hover:border-slate-600/50 transition"
              >
                <div class="flex items-center gap-3">
                  <div
                    :class="[
                      'p-1.5 rounded-lg',
                      item.type === 'in' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    ]"
                  >
                    <ArrowDownLeft v-if="item.type === 'in'" class="w-3.5 h-3.5" />
                    <ArrowUpRight v-else class="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p class="font-medium text-slate-200">{{ item.title }}</p>
                    <p class="text-[10px] text-slate-500">{{ item.date }}</p>
                  </div>
                </div>

                <span :class="['font-semibold text-sm', item.type === 'in' ? 'text-emerald-400' : 'text-slate-300']">
                  {{ item.type === 'in' ? '+' : '-' }}{{ item.amount.toLocaleString() }}円
                </span>
              </li>
            </ul>
          </div>
        </div>

        <p class="text-[11px] text-slate-500 text-center mt-4">PWA / Supabase Ready</p>
      </section>

      <!-- 右カラム：PC開発者コントロールパネル -->
      <section class="lg:col-span-5 p-6 md:p-8 bg-slate-800/30 flex flex-col justify-between">
        <div class="space-y-6">
          <div class="flex items-center justify-between border-b border-slate-700/50 pb-4">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">DEV</span>
              <h2 class="text-sm font-semibold text-slate-200">コントロールパネル</h2>
            </div>
            <button 
              @click="handleReset" 
              class="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl transition"
            >
              <RefreshCw class="w-3.5 h-3.5" />
              初期化
            </button>
          </div>

          <!-- 親モード切替テスト -->
          <div class="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50 space-y-3">
            <div class="flex items-center gap-2 text-slate-300 font-medium text-xs">
              <Shield class="w-4 h-4 text-indigo-400" />
              <span>保護者機能テスト</span>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">
              表示フラグを切り替えて、親用UIのトグル動作を確認できます。
            </p>
            <button
              @click="isParentMode = !isParentMode"
              class="w-full py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 border"
              :class="isParentMode 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                : 'bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-700'"
            >
              <User class="w-3.5 h-3.5" />
              状態: {{ isParentMode ? '親モード ON' : '子どもモード' }}
            </button>
          </div>

          <!-- クイックテスト -->
          <div class="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50 space-y-3">
            <h3 class="text-xs font-medium text-slate-300">クイックトランザクション追加</h3>
            <div class="grid grid-cols-2 gap-2">
              <button 
                @click="handleAddDirect(500, 'おこづかい')" 
                class="py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-xl border border-emerald-500/20 transition"
              >
                +500円 (入金)
              </button>
              <button 
                @click="handleUseDirect(120, 'ジュース')" 
                class="py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium rounded-xl border border-rose-500/20 transition"
              >
                -120円 (出金)
              </button>
            </div>
          </div>

          <!-- リアクティブ状態ログ -->
          <div class="bg-slate-950/80 text-slate-300 p-4 rounded-2xl font-mono text-[11px] space-y-2 border border-slate-800">
            <div class="text-slate-500 font-bold border-b border-slate-800 pb-1 flex justify-between">
              <span>STATE MONITOR</span>
              <span class="text-emerald-400">● Live</span>
            </div>
            <div class="flex justify-between"><span>balance:</span> <span class="text-indigo-400 font-bold">{{ balance }}</span></div>
            <div class="flex justify-between"><span>isParentMode:</span> <span class="text-amber-400">{{ isParentMode }}</span></div>
            <div class="flex justify-between"><span>isLoaded:</span> <span class="text-emerald-400">{{ isLoaded }}</span></div>
            <div class="flex justify-between"><span>history_count:</span> <span class="text-slate-400">{{ history.length }}</span></div>
          </div>
        </div>

        <p class="text-[11px] text-slate-500 text-center mt-6">
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