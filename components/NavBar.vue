<template>
  <div class="navbar">
    <div class="container">
      <n-button text class="title-btn">开源助手</n-button>

      <ui-menu>
        <ui-menu-item
          v-for="(item, index) in menus"
          :key="index"
          :active="isMenuItemActive(item)"
          @click="handleOpen(item.path)"
          class="menu-item"
          :class="{ 'menu-item-active': isMenuItemActive(item) }"
        >
          {{ item.name }}
        </ui-menu-item>
      </ui-menu>

      <n-button circle class="search-btn" @click="openSearch">
        <template #icon>
          <n-icon><Search /></n-icon>
        </template>
      </n-button>
      <nuxt-link to="/login" v-if="!user">
        <n-button secondary strong>登录</n-button>
      </nuxt-link>

      <n-dropdown v-else :options="userOptions" @select="handleSelect">
        <n-avatar
          round
          size="small"
          :src="
            user.avatar ||
            'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'
          "
        />
      </n-dropdown>
    </div>
  </div>
  <div class="navbar-margin"></div>
  <SearchBar ref="SearchBarRef" />
</template>

<script setup>
import {
  NButton,
  NIcon,
  NDropdown,
  NAvatar,
  createDiscreteApi,
} from 'naive-ui';
import { Search } from '@vicons/ionicons5';

const user = useUser();

const route = useRoute();
const menus = [
  {
    name: '首页',
    path: '/',
  },
  {
    name: '考试',
    path: '/paper/1',
    match: [
      {
        name: 'paper-page',
      },
    ],
  },
  {
    name: '拼团',
    path: '/list/group/1',
    match: [
      {
        name: 'list-type-page',
        params: {
          type: 'group',
        },
      },
    ],
  },
  {
    name: '秒杀',
    path: '/list/flashsale/1',
    match: [
      {
        name: 'list-type-page',
        params: {
          type: 'flashsale',
        },
      },
    ],
  },
  {
    name: '直播',
    path: '/list/live/1',
    match: [
      {
        name: 'list-type-page',
        params: {
          type: 'live',
        },
      },
    ],
  },
  // {
  //   name: '课程',
  //   path: '/list/course/1',
  //   match: [
  //     {
  //       name: 'list-type-page',
  //       params: {
  //         type: 'column',
  //       },
  //     },
  //   ],
  // },
  {
    name: '课程',
    path: '/course/1', // 对应你图片中的信息差/星号项目
    match: [{ name: 'course-page' }],
  },
  {
    name: '电子书',
    path: '/list/book/1',
    match: [
      {
        name: 'list-type-page',
        params: {
          type: 'book',
        },
      },
    ],
  },
  {
    name: '社区',
    path: '/bbs/0/1',
    match: [
      {
        name: 'bbs-bbs_id-page',
      },
    ],
  },
  /* --- 【标注：新模块补充开始】 --- */
  {
    name: '答疑',
    path: '/question_answer', // 修改路径，不再共用 bbs
    match: [{ name: 'question_answer' }],
  },
  {
    name: '工具',
    path: '/tool', // 对应工具模块
    match: [{ name: 'tool' }],
  },
  {
    name: '信息差',
    path: '/info_gap/1', // 对应你图片中的信息差/星号项目
    match: [{ name: 'info_gap-page' }],
  },
];
function handleOpen(path) {
  navigateTo(path);
}
const isMenuItemActive = (item) => {
  if (item.match) {
    let i = item.match.findIndex((o) => {
      let res = true;
      if (o.params && typeof o.params === 'object') {
        res =
          Object.keys(o.params).findIndex(
            (k) => route.params[k] == o.params[k]
          ) != -1;
      }
      return o.name == route.name && res;
    });
    return i != -1;
  }
  return route.path == item.path;
};

const userOptions = [
  {
    label: '用户中心',
    key: 'center',
  },
  {
    label: '退出',
    key: 'logout',
  },
];

const SearchBarRef = ref(null);
const openSearch = () => SearchBarRef.value.open();

const handleSelect = (k) => {
  console.log(k);
  switch (k) {
    case 'logout':
      const { dialog } = createDiscreteApi(['dialog']);
      dialog.warning({
        content: '是否要退出登录？',
        positiveText: '退出',
        negativeText: '取消',
        onPositiveClick: async () => {
          await useLogout();
        },
      });
      break;
    case 'center':
      navigateTo({
        path: '/user/history/1',
      });
      break;
  }
};
</script>

<style>
/* 导航栏容器 */
.navbar {
  z-index: 1000;
  background: linear-gradient(90deg, #165d69 0%, #26a67a 100%);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 内容容器 */
.container {
  height: 60px;
  display: flex;
  align-items: center;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
}

/* 标题按钮 */
.title-btn {
  font-size: 20px !important;
  font-weight: 700 !important;
}

/* 菜单容器 */
.menu {
  display: flex;
  align-items: center;
  padding-left: 16px;
  padding-right: 16px;
}

/* 菜单项 */
.menu-item {
  transition: all 0.2s;
  padding: 4px 8px;
  margin: 0 4px;
  border-radius: 4px;
}

/* hover效果 */
.menu-item:hover {
  background-color: #eff6ff;
  color: #1d4ed8;
}

/* active效果 */
.menu-item:active {
  background-color: #dbeafe !important;
}

/* 激活态菜单项 */
.menu-item-active {
  background-color: #dbeafe !important;
  color: #2563eb !important;
}

/* 搜索按钮 */
.search-btn {
  margin-left: auto;
  margin-right: 12px;
}

/* 占位高度 */
.navbar-margin {
  width: 100%;
  height: 80px;
}

/* flex utilities */
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.h-\[60px\] {
  height: 60px;
}
</style>
