<template>
  <div class="hot-course">
    <div class="header">
      <h2>热门好课</h2>
    </div>

    <div class="grid">
      <div
        v-for="item in courseList"
        :key="item.id"
        class="card"
        @click="goDetail(item.id)"
      >
        <div class="cover">
          <img :src="item.pic" alt="" />
        </div>
        <div class="info">
          <div class="name">{{ item.name }}</div>
          <div class="price">{{ item.price }}</div>
          <div class="tags">
            <!-- 把 span 改成 NuxtLink，实现可点击跳转 -->
            <NuxtLink
              v-for="t in item.tags"
              :key="t"
              :to="`/list?tag=${t}`"
              class="tag-link"
              @click.stop
            >
              #{{ t }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { courseList, fetchCourses } = useCourses()

onMounted(() => {
  fetchCourses()
})

const router = useRouter()
const goDetail = (id) => {
  router.push(`/detail/${id}`)
}
</script>

<style scoped>
.hot-course {
  max-width: 1100px;
  margin: 0 auto;
  padding: 30px 20px;
}

.header h2 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: 0.2s;
}

.card:hover {
  transform: translateY(-4px);
}

.cover {
  width: 100%;
  height: 160px;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  padding: 14px;
}

.name {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price {
  font-size: 16px;
  color: #fb7299;
  font-weight: bold;
  margin-bottom: 6px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
  color: #999;
}

/* 新增：可点击标签的样式 */
.tag-link {
  color: #999;
  text-decoration: none;
  transition: color 0.2s;
}

.tag-link:hover {
  color: #fb7299; /* hover 时和价格同色，保持视觉统一 */
}
</style>