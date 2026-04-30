<template>
  <div class="seckill-card" :class="{ selected }" @click="handleCardClick">
    <!-- 勾选框（仅选择模式下显示） -->
    <div class="card-checkbox" v-if="selectable" @click.stop="$emit('toggle', item.id)">
      <div class="checkbox" :class="{ checked: selected }">
        <svg v-if="selected" width="10" height="10" viewBox="0 0 12 12" fill="none">
          <polyline points="2,6 5,9 10,3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>

    <!-- 封面 -->
    <div class="card-cover" :class="item.goods_type === 'book' ? 'cover-book' : 'cover-course'">
      <img :src="item.cover || '/default-cover.jpg'" :alt="item.title" />
      <div class="quota-badge" v-if="item.quota > 0">🔥 限量{{ item.quota }}名</div>
    </div>

    <!-- 内容区 -->
    <div class="card-body">
      <h4 class="card-title">{{ item.title }}</h4>

      <div class="card-meta" v-if="item.goods_type !== 'book'">
        <span>⭐ {{ item.teacher_name || '未知讲师' }}</span>
        <span class="meta-divider">|</span>
        <span>{{ item.student_count || 0 }}人已学</span>
      </div>
      <div class="card-meta" v-else>
        <span>✍️ {{ item.author || '未知作者' }}</span>
        <span class="meta-divider">|</span>
        <span>{{ item.format || 'PDF' }}</span>
      </div>

      <div class="card-info">
        <template v-if="item.goods_type === 'course'">
          📚 {{ item.lesson_count || 0 }}课时
          <span class="info-divider">|</span>
          {{ item.valid_days > 0 ? item.valid_days + '天' : '永久有效' }}
        </template>
        <template v-else-if="item.goods_type === 'book'">
          📖 {{ item.page_count || 0 }}页 <span class="info-divider">|</span> {{ item.format || 'PDF' }}
        </template>
        <template v-else-if="item.goods_type === 'exam'">
          📝 {{ item.question_count || 0 }}题 <span class="info-divider">|</span> 通过率{{ item.pass_rate || 0 }}%
        </template>
      </div>

      <div class="card-divider" />

      <div class="card-price">
        <span class="price-original">¥{{ item.original_price }}</span>
        <span class="price-seckill">秒杀价 ¥{{ item.seckill_price }}</span>
      </div>

      <SeckillQuotaBar :quota="item.quota" :sold-count="item.sold_count" />

      <button
        class="buy-btn"
        :class="btnClass"
        :disabled="btnState === 'pending'"
        @click.stop="selectable ? $emit('toggle', item.id) : handleBuy()"
      >{{ btnText }}</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  item:       { type: Object,  required: true },
  session:    { type: Object,  default: () => ({}) },
  selected:   { type: Boolean, default: false },
  selectable: { type: Boolean, default: false },
})
const emit = defineEmits(['click', 'buy', 'toggle'])

const btnState = computed(() => {
  if (props.item.is_purchased) return 'purchased'
  if (props.session.status === 'pending') return 'pending'
  if (props.session.status === 'ended') return 'soldout'
  if (props.item.quota > 0 && props.item.sold_count >= props.item.quota) return 'soldout'
  return 'active'
})

const btnText = computed(() => {
  switch (btnState.value) {
    case 'purchased': return '去学习'
    case 'pending':   return '即将开始'
    case 'soldout':   return `¥${props.item.original_price} 原价购买`
    default:          return '立即抢购'
  }
})

const btnClass = computed(() => ({
  'btn-active':    btnState.value === 'active',
  'btn-pending':   btnState.value === 'pending',
  'btn-soldout':   btnState.value === 'soldout',
  'btn-purchased': btnState.value === 'purchased',
}))

function handleBuy() { emit('buy', props.item) }

// 选择模式下点卡片 = 勾选；普通模式下 = 跳转
function handleCardClick() {
  if (props.selectable) {
    emit('toggle', props.item.id)
  } else {
    emit('click', props.item)
  }
}
</script>

<style scoped>
.seckill-card {
  background: #fff;
  border: 1.5px solid #ebebeb;
  border-radius: 8px;
  overflow: visible;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}
.seckill-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  border-color: #e1251b;
}
.seckill-card.selected {
  border-color: #e1251b;
  box-shadow: 0 0 0 2px rgba(225,37,27,0.15);
}

/* 勾选框 */
.card-checkbox {
  position: absolute;
  top: -8px;
  left: -8px;
  z-index: 10;
}
.checkbox {
  width: 18px; height: 18px;
  border-radius: 4px;
  border: 2px solid #ddd;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  cursor: pointer;
}
.checkbox:hover { border-color: #e1251b; }
.checkbox.checked {
  background: #e1251b;
  border-color: #e1251b;
}

/* 封面 */
.card-cover {
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
  border-radius: 6px 6px 0 0;
}
.cover-course { height: 100px; }
.cover-book   { height: 120px; }
.card-cover img { width: 100%; height: 100%; object-fit: cover; }

.quota-badge {
  position: absolute;
  top: 0; left: 0;
  background: #e1251b;
  color: #fff;
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 0 0 6px 0;
  font-weight: 600;
}

/* 内容 */
.card-body { padding: 8px 10px 10px; }
.card-title {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  height: 34px;
}
.card-meta {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #999;
  margin-bottom: 2px;
}
.meta-divider { color: #ddd; }
.card-info { font-size: 11px; color: #999; margin-bottom: 4px; }
.info-divider { margin: 0 3px; color: #ddd; }
.card-divider { height: 1px; background: #f5f5f5; margin: 5px 0; }

.card-price {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 4px;
}
.price-original { font-size: 11px; color: #bbb; text-decoration: line-through; }
.price-seckill  { font-size: 15px; font-weight: 800; color: #e1251b; }

.buy-btn {
  width: 100%;
  padding: 6px 0;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 6px;
  transition: all 0.15s;
}
.btn-active    { background: #e1251b; color: #fff; }
.btn-active:hover { background: #c0392b; }
.btn-pending   { background: #f5f5f5; color: #bbb; cursor: not-allowed; }
.btn-soldout   { background: #f5f5f5; color: #888; border: 1px solid #e5e5e5; font-size: 11px; }
.btn-soldout:hover { background: #eee; }
.btn-purchased { background: #fff8f0; color: #e1251b; border: 1px solid #ffd0cc; }
</style>
