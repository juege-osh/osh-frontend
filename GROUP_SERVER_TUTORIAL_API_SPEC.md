# 拼团模块服务器教程功能完整接口文档

## 📋 概述

本文档详细说明了**拼团详情页**和**服务器详情页**中服务器拼团详细介绍功能所需的后端接口规范。

---

## ✅ 前端实现状态

### 已完成的修改

#### 1. 拼团详情页（`pages/group/work/[id].vue`）
- ✅ 新增"服务器拼团详细介绍"卡片（位于参团用户列表之后）
- ✅ 展示拼团服务内容（HTML富文本）
- ✅ 展示服务器功能特性列表（网格布局）
- ✅ 展示配置指南步骤（垂直步骤条）
- ✅ 复用 `useGetServerTutorialApi` 接口

#### 2. 服务器详情页（`pages/group/server/[id].vue`）
- ✅ 新增"服务器拼团详细介绍"卡片
- ✅ 新增"SSH连接信息"卡片
- ✅ 完整的数据加载、复制、显隐切换功能
- ✅ 响应式布局和样式

---

##  前端已实现的 API 调用

### API 1: 获取服务器配置教程详情

**接口定义**: `useGetServerTutorialApi(activityId)`

**请求方式**: `GET /pc/group/server/tutorial?activityId={id}`

**使用位置**:
- ✅ 拼团详情页：`pages/group/work/[id].vue`
- ✅ 服务器详情页：`pages/group/server/[id].vue`

**前端数据处理**:
```javascript
// 加载服务器教程详情
const tutorialResult = await useGetServerTutorialApi(activityId)
serverIntro.value = {
    serviceDescription: tutorialResult.data.value?.serviceDescription || '',
    featureList: tutorialResult.data.value?.featureList || [],
    configurationGuide: tutorialResult.data.value?.configurationGuide || []
}
```

---

## 🔧 后端接口需求

### 接口 1: 获取服务器配置教程详情

**接口地址**: `GET /pc/group/server/tutorial?activityId={id}`

**认证要求**: 需要登录（Token验证）

**功能说明**: 返回服务器拼团的详细介绍内容，包括服务内容、功能特性、配置指南等。

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| activityId | Number/String | 是 | 拼团活动ID |

#### 响应格式

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "activityId": 1,
    "serviceDescription": "<p>本拼团提供高性能云服务器租赁服务，包含以下内容：</p><ul><li>独享服务器资源</li><li>专业运维支持</li><li>7×24小时技术保障</li></ul>",
    "featureList": [
      "4核8G高性能配置",
      "200GB SSD高速存储",
      "独立IP地址",
      "SSH远程访问",
      "预装基础开发环境",
      "支持Docker容器部署",
      "自动备份与快照",
      "DDoS防护基础版"
    ],
    "configurationGuide": [
      {
        "title": "获取服务器连接信息",
        "description": "在左侧信息栏查看SSH连接信息，使用SSH工具（如PuTTY、Xshell）连接服务器"
      },
      {
        "title": "初始化系统环境",
        "description": "更新软件包列表：sudo apt update && sudo apt upgrade -y"
      },
      {
        "title": "安装所需服务",
        "description": "根据需求安装对应服务，如Nginx、MySQL、Node.js等"
      },
      {
        "title": "配置防火墙",
        "description": "开放必要端口：sudo ufw allow 80/tcp && sudo ufw allow 443/tcp"
      },
      {
        "title": "验证部署结果",
        "description": "访问服务器IP或域名，确认服务正常运行"
      }
    ]
  }
}
```

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| activityId | Number | 是 | 活动ID |
| serviceDescription | String | 否 | 拼团提供的具体服务内容说明（支持HTML富文本） |
| featureList | Array[String] | 否 | 服务器功能特性列表（字符串数组） |
| configurationGuide | Array[Object] | 否 | 配置指南步骤数组 |
| configurationGuide[].title | String | 是 | 步骤标题 |
| configurationGuide[].description | String | 是 | 步骤详细说明 |

#### 权限控制

- ✅ 所有已登录用户均可访问
- ✅ 无需验证是否参团（拼团详情页展示给所有访客）

---

### 接口 2: 获取SSH连接信息（仅服务器详情页使用）

**接口地址**: `GET /pc/group/server/ssh-info?activityId={id}`

**认证要求**: 需要登录 + 权限校验

**功能说明**: 返回服务器的SSH连接信息。

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| activityId | Number/String | 是 | 拼团活动ID |

#### 响应格式

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "activityId": 1,
    "ip": "192.168.1.100",
    "port": 22,
    "username": "root",
    "password": "Abc123456!",
    "remark": "请及时修改默认密码，建议定期备份重要数据"
  }
}
```

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| activityId | Number | 是 | 活动ID |
| ip | String | 是 | 服务器IP地址 |
| port | Number | 否 | SSH端口，默认22 |
| username | String | 是 | 登录用户名 |
| password | String | 是 | 登录密码 |
| remark | String | 否 | 备注信息 |

#### 权限控制

- ✅ 必须验证用户已登录
- ✅ 必须验证拼团状态为"已成功"（status=2）
- ✅ 必须验证当前用户已参团成功

---

## 🔄 扩展现有接口方案（可选）

### 方案 A: 扩展拼团详情接口

**接口**: `GET /pc/group/work/detail?activityId={id}`

**新增字段**:

```json
{
  "activity": {
    // ... 原有字段 ...
    
    // 新增：服务器详细介绍
    "serverIntro": {
      "serviceDescription": "<p>服务内容说明...</p>",
      "featureList": ["特性1", "特性2", "特性3"],
      "configurationGuide": [
        { "title": "步骤1", "description": "说明1" }
      ]
    }
  }
}
```

**优势**:
- ✅ 减少HTTP请求次数（从2次降至1次）
- ✅ 数据一致性更好

**劣势**:
- ❌ 接口响应体变大
-  需要修改现有接口

---

## 📊 前端数据流图

### 拼团详情页

```
用户访问 /group/work/{id}
    ↓
1. GET /pc/group/work/detail?activityId={id}
    → 获取拼团基础信息
    ↓
2. GET /pc/group/server/tutorial?activityId={id}
    → 获取服务器详细介绍
    ↓
渲染：拼团信息 + 参团用户 + 服务器介绍 + 服务器信息（如已成团）
```

### 服务器详情页

```
用户访问 /group/server/{id}
    ↓
1. GET /pc/group/work/detail?activityId={id}
    → 获取服务器基础信息（左侧信息栏）
    ↓
2. GET /pc/group/server/tutorial?activityId={id}
    → 获取服务器详细介绍
    ↓
3. GET /pc/group/server/ssh-info?activityId={id}
    → 获取SSH连接信息
    ↓
渲染：服务器信息 + 服务器介绍 + SSH信息 + 图文教程
```

---

## 📝 数据库设计建议

### 表: group_server_tutorial（服务器教程表）

```sql
CREATE TABLE `group_server_tutorial` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `activity_id` BIGINT NOT NULL COMMENT '关联的活动ID',
  `service_description` TEXT COMMENT '服务内容说明（HTML富文本）',
  `feature_list` JSON COMMENT '功能特性列表（JSON数组）',
  `configuration_guide` JSON COMMENT '配置指南（JSON数组）',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_activity_id` (`activity_id`),
  CONSTRAINT `fk_tutorial_activity` FOREIGN KEY (`activity_id`) REFERENCES `group_activity`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务器教程配置表';
```

### JSON 字段示例

**feature_list**:
```json
["4核8G高性能配置", "200GB SSD高速存储", "独立IP地址"]
```

**configuration_guide**:
```json
[
  {
    "title": "获取服务器连接信息",
    "description": "在左侧信息栏查看SSH连接信息..."
  },
  {
    "title": "初始化系统环境",
    "description": "更新软件包列表..."
  }
]
```

---

## 🔒 安全建议

### 1. 数据加密
- ✅ SSH密码应加密存储（AES加密）
- ✅ 返回给前端时应解密
- ✅ 建议提供"重置密码"功能

### 2. 访问控制
- ✅ 教程接口：所有登录用户可访问
- ✅ SSH信息：仅拼团成功的参团成员可访问
- ✅ 记录访问日志（谁、何时、查看了什么）

### 3. 内容安全
- ✅ HTML富文本应过滤危险标签（如 `<script>`）
- ✅ 建议后台使用富文本编辑器时启用XSS防护

---

## ✅ 实施步骤

### Phase 1: 核心接口实现（必须）

- [ ] 创建 `group_server_tutorial` 数据库表
- [ ] 实现 `GET /pc/group/server/tutorial` 接口
- [ ] 实现 `GET /pc/group/server/ssh-info` 接口（服务器详情页用）
- [ ] 完善权限校验逻辑
- [ ] 前端联调测试

### Phase 2: 后台管理功能（建议）

- [ ] 实现教程内容编辑界面（富文本编辑器）
- [ ] 实现功能特性列表编辑（标签输入）
- [ ] 实现配置指南步骤编辑（动态表单）
- [ ] 实现SSH信息管理界面

### Phase 3: 优化与增强（可选）

- [ ] 实现密码重置功能
- [ ] 添加SSH连接日志记录
- [ ] 支持多服务器配置
- [ ] 实现服务器状态监控

---

## 📞 联系方式

如有疑问，请联系前端开发团队。

**文档版本**: v2.0  
**最后更新**: 2026-05-05  
**适用范围**: 拼团详情页 + 服务器详情页
