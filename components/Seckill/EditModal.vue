<template>
  <n-modal
    :show="show"
    :title="formData.id ? '编辑秒杀商品' : '新增秒杀商品'"
    preset="card"
    style="width: 560px;"
    :mask-closable="false"
    @update:show="$emit('update:show', $event)"
  >
    <n-form ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="90px">

      <!-- 商品类型 -->
      <n-form-item label="商品类型" path="goods_type">
        <n-select
          v-model:value="formData.goods_type"
          :options="typeOptions"
          placeholder="请选择商品类型"
          @update:value="formData.goods_id = null; formData.title = ''; formData.cover = ''; formData.original_price = 0"
        />
      </n-form-item>

      <!-- 商品名称（手动填写，兼容所有类型） -->
      <n-form-item label="商品名称" path="title">
        <n-input v-model:value="formData.title" placeholder="请输入商品名称" />
      </n-form-item>

      <!-- 商品ID（关联原始商品） -->
      <n-form-item label="商品ID" path="goods_id">
        <n-input-number
          v-model:value="formData.goods_id"
          placeholder="填写对应商品的ID"
          style="width: 100%"
          :min="1"
        />
        <template #feedback>
          <span style="font-size:12px;color:#9ca3af">填写课程/电子书/题库/会员等对应表的主键ID</span>
        </template>
      </n-form-item>

      <!-- 封面图 -->
      <n-form-item label="封面图URL" path="cover">
        <n-input v-model:value="formData.cover" placeholder="请输入封面图片地址" />
      </n-form-item>

      <!-- 原价 -->
      <n-form-item label="原价" path="original_price">
        <n-input-number
          v-model:value="formData.original_price"
          :min="0"
          :precision="2"
          style="width: 100%"
          placeholder="原价"
        >
          <template #prefix>¥</template>
        </n-input-number>
      </n-form-item>

      <!-- 秒杀价 -->
      <n-form-item label="秒杀价" path="seckill_price">
        <n-input-number
          v-model:value="formData.seckill_price"
          :min="0"
          :precision="2"
          style="width: 100%"
          placeholder="秒杀价"
        >
          <template #prefix>¥</template>
        </n-input-number>
      </n-form-item>

      <!-- 名额 -->
      <n-form-item label="名额总量" path="quota">
        <n-input-number
          v-model:value="formData.quota"
          :min="0"
          style="width: 100%"
          placeholder="0 表示不限量"
        />
        <template #feedback>
          <span style="font-size:12px;color:#9ca3af">填 0 表示不限量</span>
        </template>
      </n-form-item>

      <!-- 每人限购 -->
      <n-form-item label="每人限购" path="limit_per_user">
        <n-input-number
          v-model:value="formData.limit_per_user"
          :min="0"
          style="width: 100%"
          placeholder="0 表示不限"
        />
        <template #feedback>
          <span style="font-size:12px;color:#9ca3af">填 0 表示不限购</span>
        </template>
      </n-form-item>

    </n-form>

    <template #footer>
      <div style="display:flex;justify-content:flex-end;gap:8px;">
        <n-button @click="$emit('update:show', false)">取消</n-button>
        <n-button type="primary" :loading="loading" @click="handleSubmit">
          {{ formData.id ? '保存修改' : '确认新增' }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup>
import { NModal, NForm, NFormItem, NInput, NInputNumber, NSelect, NButton, createDiscreteApi } from 'naive-ui'

const props = defineProps({
  show: Boolean,
  initData: { type: Object, default: null }, // 编辑时传入，新增时为 null
})
const emit = defineEmits(['update:show', 'success'])

const { message } = createDiscreteApi(['message'])
const formRef = ref(null)
const loading = ref(false)

const typeOptions = [
  { label: '网课', value: 'course' },
  { label: '电子书', value: 'book' },
  { label: '题库', value: 'exam' },
  { label: '月会员', value: 'vip_month' },
  { label: '年会员', value: 'vip_year' },
]

const defaultForm = () => ({
  id: null,
  goods_type: 'course',
  goods_id: null,
  title: '',
  cover: '',
  original_price: 0,
  seckill_price: 0,
  quota: 0,
  limit_per_user: 1,
})

const formData = reactive(defaultForm())

const rules = {
  goods_type:     [{ required: true, message: '请选择商品类型', trigger: 'change' }],
  title:          [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  goods_id:       [{ required: true, type: 'number', message: '请填写商品ID', trigger: 'blur' }],
  seckill_price:  [{ required: true, type: 'number', message: '请填写秒杀价', trigger: 'blur' }],
  original_price: [{ required: true, type: 'number', message: '请填写原价', trigger: 'blur' }],
}

// 弹窗打开时回填数据
watch(() => props.show, (val) => {
  if (!val) return
  if (props.initData) {
    Object.assign(formData, { ...defaultForm(), ...props.initData })
  } else {
    Object.assign(formData, defaultForm())
  }
})

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    if (formData.id) {
      // 编辑 — 调用修改接口
      await useSeckillGoodsUpdateApi({ ...formData })
      message.success('修改成功')
    } else {
      // 新增 — 调用新增接口
      await useSeckillGoodsAddApi({ ...formData })
      message.success('新增成功')
    }
    emit('update:show', false)
    emit('success')
  } catch (e) {
    message.error(formData.id ? '修改失败' : '新增失败')
  } finally {
    loading.value = false
  }
}
</script>
