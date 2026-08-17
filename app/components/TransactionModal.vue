<!-- components/TransactionModal.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Check } from 'lucide-vue-next'

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

// モーダルが開くたびに初期値をリセット
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
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in"
        >
        <div
            class="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border-4 transition-all space-y-5 relative"
            :class="type === 'in' ? 'border-emerald-300' : 'border-rose-300'"
        >
            <!-- 閉じるボタン -->
            <button
            @click="isOpen = false"
            class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full bg-slate-100"
            >
            <X class="w-5 h-5" />
            </button>

            <!-- ヘッダー -->
            <div class="text-center">
            <span class="text-3xl">{{ type === 'in' ? '🪙' : '🛍️' }}</span>
            <h2 class="text-xl font-black text-slate-800 mt-1">
                {{ type === 'in' ? 'おかねを もらった！' : 'おかねを つかった！' }}
            </h2>
            </div>

            <!-- フォーム領域 -->
            <div class="space-y-4">
            <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">いくら？（えん）</label>
                <input
                v-model.number="form.amount"
                type="number"
                step="10"
                class="w-full text-center text-3xl font-black border-2 rounded-2xl py-3 focus:outline-none transition-colors"
                :class="[
                    type === 'in'
                    ? 'text-emerald-600 bg-emerald-50/50 border-emerald-300 focus:ring-2 focus:ring-emerald-400'
                    : 'text-rose-600 bg-rose-50/50 border-rose-300 focus:ring-2 focus:ring-rose-400'
                ]"
                />
            </div>

            <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">
                {{ type === 'in' ? 'なんの おかね？（りゆう）' : 'なにを かったの？（りゆう）' }}
                </label>
                <input
                v-model="form.title"
                type="text"
                :placeholder="type === 'in' ? '例: おてつだい、お小遣い' : '例: ジュース、おかし'"
                class="w-full text-base font-bold text-slate-700 bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 focus:outline-none transition-colors"
                :class="type === 'in' ? 'focus:border-emerald-400' : 'focus:border-rose-400'"
                />
            </div>
            </div>

            <!-- 登録ボタン -->
            <button
            @click="handleSubmit"
            class="w-full flex items-center justify-center gap-2 text-white font-black text-lg py-4 rounded-2xl shadow-md transition-all active:scale-[0.98]"
            :class="[
                type === 'in'
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                : 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
            ]"
            >
            <Check class="w-6 h-6 stroke-[3]" />
            <span>とうろく する！</span>
            </button>
        </div>
        </div>
    </Teleport>
</template>