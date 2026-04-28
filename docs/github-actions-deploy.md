# 前端 GitHub Actions 自动部署教程

## 1. 自动化目标

当前前端部署流程已经自动化为：推送 `release/20260328` 分支后，GitHub Actions 自动构建静态文件，并同步到服务器 Nginx 目录。

自动化后的流程：

1. 拉取最新前端代码。
2. 使用 Node.js 18 安装依赖，并通过 `--legacy-peer-deps` 兼容当前 Nuxt 3 与编辑器依赖的 peer dependency 冲突。
3. 执行 `npm run generate`。
4. 校验 `.output/public/index.html` 是否存在。
5. 使用 SSH 连接服务器。
6. 使用 `rsync --delete` 将 `.output/public/` 同步到 `/www/nginx/html/`。
7. 保留服务器上的 `.user.ini` 文件。

## 2. Workflow 文件

前端 workflow 文件位置：

```text
.github/workflows/deploy-release.yml
```

触发方式：

```yaml
on:
  push:
    branches:
      - release/20260328
  workflow_dispatch:
```

含义：

- 推送到 `release/20260328` 时自动部署。
- 也可以在 GitHub 页面手动点击 `Run workflow` 部署。

## 3. GitHub Secrets 配置

前端仓库必须配置这个 Secret：

| 名称 | 说明 |
| --- | --- |
| `DEPLOY_SSH_PRIVATE_KEY` | GitHub Actions 连接服务器使用的 SSH 私钥 |

私钥内容在本机：

```bash
/Users/rengang/.ssh/osh_github_actions_deploy_key
```

复制私钥到剪贴板：

```bash
pbcopy < /Users/rengang/.ssh/osh_github_actions_deploy_key
```

GitHub 配置路径：

```text
前端仓库 -> Settings -> Secrets and variables -> Actions -> New repository secret
```

## 4. 默认部署参数

workflow 已内置默认参数：

| 参数 | 默认值 |
| --- | --- |
| 服务器 | `43.242.200.25` |
| SSH 用户 | `root` |
| SSH 端口 | `58753` |
| 前端部署目录 | `/www/nginx/html` |
| Node.js 版本 | `18` |

如果以后服务器信息变化，可以在 GitHub Variables 中覆盖：

| Variable | 用途 |
| --- | --- |
| `DEPLOY_HOST` | 覆盖服务器 IP 或域名 |
| `DEPLOY_USER` | 覆盖 SSH 用户 |
| `DEPLOY_PORT` | 覆盖 SSH 端口 |
| `FRONTEND_DEPLOY_PATH` | 覆盖前端部署目录 |

## 5. 手动触发部署

1. 打开 GitHub 前端仓库。
2. 进入 `Actions`。
3. 选择 `Deploy Frontend Release`。
4. 点击 `Run workflow`。
5. 分支选择 `release/20260328`。
6. 点击确认执行。

## 6. 本地等价测试命令

本地构建：

```bash
cd /Users/rengang/chuangye/osh-projects/osh-frontend
npm run generate
```

校验构建产物：

```bash
test -d .output/public && test -f .output/public/index.html
```

模拟上传但不真正覆盖服务器：

```bash
rsync -azn --delete --exclude='.user.ini' \
  -e "ssh -i /Users/rengang/.ssh/osh_github_actions_deploy_key -p 58753" \
  .output/public/ \
  root@43.242.200.25:/www/nginx/html/
```

真实上传：

```bash
rsync -az --delete --exclude='.user.ini' \
  -e "ssh -i /Users/rengang/.ssh/osh_github_actions_deploy_key -p 58753" \
  .output/public/ \
  root@43.242.200.25:/www/nginx/html/
```

## 7. 部署后验证

检查 Nginx 容器：

```bash
ssh -i /Users/rengang/.ssh/osh_github_actions_deploy_key -p 58753 root@43.242.200.25 \
  "cd /opt/docker-apps && docker-compose ps nginx"
```

检查前端 HTTP：

```bash
curl -I http://43.242.200.25/
```

预期结果：

```text
HTTP/1.1 200 OK
Server: nginx
```

## 8. 故障排查

### 8.1 SSH 失败

检查 GitHub Secret 是否配置完整：

```text
DEPLOY_SSH_PRIVATE_KEY
```

检查服务器是否启用公钥登录：

```bash
ssh -p 58753 root@43.242.200.25 "sshd -T | grep pubkeyauthentication"
```

预期：

```text
pubkeyauthentication yes
```

### 8.2 前端页面没更新

检查 Actions 日志里的 `Upload frontend files` 是否成功。

检查服务器目录修改时间：

```bash
ssh -i /Users/rengang/.ssh/osh_github_actions_deploy_key -p 58753 root@43.242.200.25 \
  "ls -lah /www/nginx/html | head"
```

### 8.3 构建失败

先本地执行：

```bash
npm ci --legacy-peer-deps
npm run generate
```

如果本地也失败，优先修复前端构建问题，再重新推送 `release/20260328`。


### 8.4 npm ci 报 ERESOLVE

当前项目使用 `nuxt@3.6.5`，而 `@umoteam/umo-editor-nuxt@0.1.2` 声明了 `nuxt >=4.0.0` 的 peer dependency。为了不在部署流程里强行升级 Nuxt，workflow 使用：

```bash
npm ci --legacy-peer-deps
```

如果未来升级到 Nuxt 4，并确认编辑器依赖完全兼容，可以再改回标准的 `npm ci`。
