# 服务器详情页后端接口需求文档

##  概述

本文档详细说明了服务器详情页（`pages/group/server/[id].vue`）所需的后端接口规范，包括新增接口和扩展现有接口的建议。

---

## 🔄 接口复用策略

### 1. 复用现有拼团详情接口

**接口**: `GET /pc/group/work/detail?activityId={id}`

**已返回字段**（无需修改）:
- `title`: 拼团活动标题
- `cpu`: CPU配置
- `memory`: 内存配置
- `storage`: 存储配置
- `totalDuration`: 总使用时长（月）
- `serverStartTime`: 服务器开始使用时间
- `serverEndTime`: 服务器结束使用时间
- `remainingMonths`: 剩余月数
- `serverTutorialUrl`: 外链教程URL（可选）

**前端使用**: 左侧信息栏展示服务器基础信息

---

## 🆕 新增接口需求

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
    ],
    "serverTutorialUrl": "https://example.com/tutorial/server-config"
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
| serverTutorialUrl | String | 否 | 外链教程URL（可选，如拼团详情接口已有则无需返回） |

---

### 接口 2: 获取SSH连接信息

**接口地址**: `GET /pc/group/server/ssh-info?activityId={id}`

**认证要求**: 需要登录（Token验证）+ 权限校验（仅拼团成功且当前用户已参团可访问）

**功能说明**: 返回服务器的SSH连接信息，用于用户远程登录服务器。

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
| remark | String | 否 | 备注信息（如使用注意事项） |

#### 权限校验逻辑

```java
// 伪代码示例
public boolean canAccessSshInfo(Long activityId, Long userId) {
    // 1. 检查拼团活动状态是否为"已成功"（status = 2）
    Activity activity = activityMapper.selectById(activityId);
    if (activity.getStatus() != 2) {
        return false;
    }
    
    // 2. 检查当前用户是否参团成功
    boolean isJoined = workUserMapper.existsByActivityIdAndUserId(activityId, userId);
    if (!isJoined) {
        return false;
    }
    
    // 3. 检查服务器是否已分配
    Server server = serverMapper.selectByActivityId(activityId);
    if (server == null || server.getIp() == null) {
        return false;
    }
    
    return true;
}
```

---

## 🔧 扩展现有接口建议

### 方案 A: 扩展现有拼团详情接口（推荐）

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
        { "title": "步骤1", "description": "说明1" },
        { "title": "步骤2", "description": "说明2" }
      ]
    },
    
    // 新增：SSH连接信息（仅当status=2且用户已参团时返回）
    "sshInfo": {
      "ip": "192.168.1.100",
      "port": 22,
      "username": "root",
      "password": "Abc123456!",
      "remark": "备注信息"
    }
  }
}
```

**优势**:
- ✅ 减少HTTP请求次数（从3次降至1次）
- ✅ 数据一致性更好
- ✅ 前端代码更简洁

**劣势**:
- ❌ 接口响应体变大
- ❌ 权限校验逻辑复杂（需要条件返回sshInfo）

---

### 方案 B: 保持独立接口（当前实现）

**优势**:
- ✅ 职责分离清晰
- ✅ 权限控制更精细
- ✅ 可按需加载（懒加载）

**劣势**:
- ❌ 需要3次HTTP请求
- ❌ 前端代码稍复杂

---

## 📊 前端数据流图

```
用户访问 /group/server/{id}
    ↓
1. GET /pc/group/work/detail?activityId={id}
    → 获取服务器基础信息（左侧信息栏）
    ↓
2. GET /pc/group/server/tutorial?activityId={id}
    → 获取服务器详细介绍（右侧上部）
    ↓
3. GET /pc/group/server/ssh-info?activityId={id}
    → 获取SSH连接信息（右侧中部）
    ↓
4. （可选）GET /pc/group/server/tutorial?activityId={id}
    → 获取图文教程富文本内容（右侧下部）
```

---

##  前端字段映射关系

### 服务器基础信息（左侧信息栏）

| 前端字段 | 后端字段 | 显示格式 |
|---------|---------|---------|
| data.title | activity.title | 活动标题 |
| data.cpu | activity.cpu | CPU配置 |
| data.memory | activity.memory | 内存配置 |
| data.storage | activity.storage | 存储配置 |
| data.totalDuration | activity.totalDuration | `{值} 个月` |
| data.serverStartTime | activity.serverStartTime | `YYYY-MM-DD HH:mm` |
| data.serverExpireTime | activity.serverEndTime | `YYYY-MM-DD HH:mm` |
| data.remainingMonths | activity.remainingMonths | `Math.ceil(值) 个月` |

### 服务器详细介绍（右侧上部）

| 前端字段 | 后端字段 | 渲染方式 |
|---------|---------|---------|
| serverIntro.serviceDescription | tutorial.serviceDescription | v-html（富文本） |
| serverIntro.featureList | tutorial.featureList | v-for 循环渲染 |
| serverIntro.configurationGuide | tutorial.configurationGuide | n-steps 组件 |
| serverIntro.serverTutorialUrl | tutorial.serverTutorialUrl | 外链按钮 |

### SSH连接信息（右侧中部）

| 前端字段 | 后端字段 | 交互方式 |
|---------|---------|---------|
| sshInfo.ip | ssh.ip | 点击复制 |
| sshInfo.port | ssh.port | 直接显示（默认22） |
| sshInfo.username | ssh.username | 点击复制 |
| sshInfo.password | ssh.password | 显示/隐藏切换 + 点击复制 |
| sshInfo.remark | ssh.remark | 斜体显示 |

---

## 🔒 安全建议

### 1. SSH密码安全
- ✅ 密码应加密存储（如AES加密）
- ✅ 返回给前端时应解密
- ✅ 建议提供"重置密码"功能
- ✅ 记录密码查看日志

### 2. 权限控制
- ✅ 必须验证用户已登录
- ✅ 必须验证拼团状态为"已成功"
- ✅ 必须验证用户已参团成功
- ✅ 建议添加访问频率限制（如每分钟最多5次）

### 3. 数据脱敏（可选）
- ✅ 日志中不应记录完整IP和密码
- ✅ 数据库审计日志应脱敏处理

---

## 📝 数据库设计建议

### 表 1: group_server_tutorial（服务器教程表）

```sql
CREATE TABLE `group_server_tutorial` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `activity_id` BIGINT NOT NULL COMMENT '关联的活动ID',
  `service_description` TEXT COMMENT '服务内容说明（HTML富文本）',
  `feature_list` JSON COMMENT '功能特性列表（JSON数组）',
  `configuration_guide` JSON COMMENT '配置指南（JSON数组）',
  `tutorial_url` VARCHAR(500) COMMENT '外链教程URL',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_activity_id` (`activity_id`),
  CONSTRAINT `fk_tutorial_activity` FOREIGN KEY (`activity_id`) REFERENCES `group_activity`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务器教程配置表';
```

### 表 2: group_server_info（服务器信息表）

```sql
CREATE TABLE `group_server_info` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `activity_id` BIGINT NOT NULL COMMENT '关联的活动ID',
  `ip` VARCHAR(45) NOT NULL COMMENT '服务器IP地址',
  `port` INT DEFAULT 22 COMMENT 'SSH端口',
  `username` VARCHAR(50) NOT NULL COMMENT '登录用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '登录密码（加密存储）',
  `remark` VARCHAR(500) COMMENT '备注信息',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-已回收',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_activity_id` (`activity_id`),
  CONSTRAINT `fk_server_activity` FOREIGN KEY (`activity_id`) REFERENCES `group_activity`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务器连接信息表';
```

---

## ✅ 实施优先级

### Phase 1: 核心功能（必须）
- [ ] 实现 `GET /pc/group/server/tutorial` 接口
- [ ] 实现 `GET /pc/group/server/ssh-info` 接口
- [ ] 完善权限校验逻辑
- [ ] 前端接入并测试

### Phase 2: 优化功能（建议）
- [ ] 实现密码重置功能
- [ ] 添加SSH连接日志记录
- [ ] 实现富文本编辑器（后台管理教程内容）

### Phase 3: 增强功能（可选）
- [ ] 支持多服务器配置（一台活动对应多台服务器）
- [ ] 实现服务器状态监控（在线/离线）
- [ ] 添加在线SSH终端（Web Terminal）

---

## 📞 联系方式

如有疑问，请联系前端开发团队。

**文档版本**: v1.0  
**最后更新**: 2026-05-05
