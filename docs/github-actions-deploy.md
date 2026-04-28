# 前端 GitHub Actions 自动部署教程

这份教程给第一次使用 GitHub Actions 的人看。你只要按步骤配置一次，以后前端代码推送到 `release/20260328` 分支后，GitHub 会自动构建前端并发布到服务器。

## 1. 这套自动部署会做什么

以前手动部署前端一般要做这些事：本地打包、连接服务器、上传 `.output/public` 到 Nginx 目录。现在这些事交给 GitHub Actions 自动做。

自动部署流程如下：

1. GitHub 拉取 `release/20260328` 分支的最新代码。
2. 安装 Node.js 18。
3. 执行 `npm ci --legacy-peer-deps` 安装依赖。
4. 执行 `npm run generate` 生成静态网站。
5. 检查 `.output/public/index.html` 是否存在。
6. 用 SSH 登录服务器。
7. 把 `.output/public/` 同步到服务器 `/www/nginx/html/`。
8. 保留服务器上的 `.user.ini`，避免误删服务器特殊配置。

对应 workflow 文件在：

```text
.github/workflows/deploy-release.yml
```

## 2. 第一次使用前必须准备什么

你需要准备 3 样东西：

| 要准备的东西 | 说明 |
| --- | --- |
| GitHub 仓库权限 | 你需要能进入仓库的 `Settings` 页面添加 Secret。 |
| 服务器 SSH 私钥 | GitHub Actions 用它登录服务器。 |
| release 分支 | 当前自动部署监听的是 `release/20260328`。 |

服务器公钥我已经配置过，服务器允许这把部署 key 登录。你只需要把私钥放进 GitHub Secret。

## 3. 配置 GitHub Secret

Secret 是 GitHub 保存敏感信息的地方。SSH 私钥不能写在代码里，必须放到 Secret。

### 3.1 复制私钥

在本机终端执行：

```bash
pbcopy < /Users/rengang/.ssh/osh_github_actions_deploy_key
```

执行后不会输出内容，这是正常的。私钥已经复制到剪贴板。

注意：不要把私钥发到聊天、文档、Issue 或代码里。

### 3.2 在 GitHub 页面添加 Secret

打开前端仓库：

```text
https://github.com/juege-osh/osh-frontend
```

按下面路径点击：

```text
Settings -> Secrets and variables -> Actions -> New repository secret
```

填写：

| 输入框 | 填什么 |
| --- | --- |
| Name | `DEPLOY_SSH_PRIVATE_KEY` |
| Secret | 粘贴刚才复制的私钥 |

最后点击 `Add secret` 保存。

## 4. 怎么触发自动部署

有两种方式。

### 4.1 推送代码自动部署

只要你把代码推送到：

```text
release/20260328
```

GitHub Actions 就会自动运行。

### 4.2 手动点击部署

如果你只是想重新部署一次，不想改代码，可以手动点。

操作路径：

```text
前端仓库 -> Actions -> Deploy Frontend Release -> Run workflow
```

选择分支：

```text
release/20260328
```

然后点击绿色按钮 `Run workflow`。

## 5. 怎么判断部署成功

进入前端仓库的 `Actions` 页面，点开最新的一条 `Deploy Frontend Release`。

如果看到绿色对勾，说明成功。

成功时一般会看到这些步骤都通过：

| 步骤 | 成功说明 |
| --- | --- |
| `Install dependencies` | 依赖安装成功。 |
| `Build static site` | 前端打包成功。 |
| `Validate build output` | `.output/public/index.html` 存在。 |
| `Configure SSH` | SSH key 写入成功。 |
| `Ensure remote directory exists` | 能连上服务器。 |
| `Upload frontend files` | 文件上传成功。 |

部署成功后浏览器访问：

```text
http://43.242.200.25/
```

如果页面正常打开，说明前端已经部署成功。

## 6. 常用服务器信息

workflow 已经内置下面这些默认值，正常不用改：

| 配置 | 默认值 |
| --- | --- |
| 服务器 IP | `43.242.200.25` |
| SSH 用户 | `root` |
| SSH 端口 | `58753` |
| 前端部署目录 | `/www/nginx/html` |
| Node.js 版本 | `18` |

如果以后服务器换了，不要改代码，优先在 GitHub Variables 里覆盖：

| Variable | 用途 |
| --- | --- |
| `DEPLOY_HOST` | 覆盖服务器 IP 或域名。 |
| `DEPLOY_USER` | 覆盖 SSH 用户。 |
| `DEPLOY_PORT` | 覆盖 SSH 端口。 |
| `FRONTEND_DEPLOY_PATH` | 覆盖前端部署目录。 |

配置位置：

```text
Settings -> Secrets and variables -> Actions -> Variables
```

## 7. 本地手动测试命令

如果 GitHub Actions 失败，可以先在本地跑一遍。

进入前端项目：

```bash
cd /Users/rengang/chuangye/osh-projects/osh-frontend
```

安装依赖：

```bash
npm ci --legacy-peer-deps
```

打包：

```bash
npm run generate
```

检查产物：

```bash
test -d .output/public && test -f .output/public/index.html
```

如果这三步本地都成功，说明前端代码本身可以打包。

## 8. 本地手动上传前端

正常不需要手动上传，只有排查问题时才用。

先模拟上传，不真正改服务器文件：

```bash
rsync -azn --delete --exclude='.user.ini' \
  -e "ssh -i /Users/rengang/.ssh/osh_github_actions_deploy_key -p 58753" \
  .output/public/ \
  root@43.242.200.25:/www/nginx/html/
```

确认没问题后，真实上传：

```bash
rsync -az --delete --exclude='.user.ini' \
  -e "ssh -i /Users/rengang/.ssh/osh_github_actions_deploy_key -p 58753" \
  .output/public/ \
  root@43.242.200.25:/www/nginx/html/
```

## 9. 部署后验证命令

检查 Nginx 容器是否运行：

```bash
ssh -i /Users/rengang/.ssh/osh_github_actions_deploy_key -p 58753 root@43.242.200.25 \
  "cd /opt/docker-apps && docker-compose ps nginx"
```

检查前端 HTTP 是否正常：

```bash
curl -I http://43.242.200.25/
```

成功时能看到类似：

```text
HTTP/1.1 200 OK
Server: nginx
```

## 10. 常见问题

### 10.1 卡在 Ensure remote directory exists

这个步骤失败，一般是 GitHub 不能 SSH 登录服务器。

优先检查：

| 检查项 | 怎么处理 |
| --- | --- |
| `DEPLOY_SSH_PRIVATE_KEY` 是否存在 | 去 GitHub 仓库 `Settings -> Secrets and variables -> Actions` 看。 |
| Secret 名字是否写错 | 必须完全等于 `DEPLOY_SSH_PRIVATE_KEY`。 |
| Secret 内容是否完整 | 重新执行 `pbcopy < /Users/rengang/.ssh/osh_github_actions_deploy_key`，再覆盖保存。 |
| 服务器端口是否正确 | 当前是 `58753`。 |

### 10.2 npm ci 报 ERESOLVE

当前项目使用 `nuxt@3.6.5`，而 `@umoteam/umo-editor-nuxt@0.1.2` 声明了 `nuxt >=4.0.0` 的 peer dependency。

所以部署脚本使用：

```bash
npm ci --legacy-peer-deps
```

不要随便改成 `npm ci`，否则 GitHub Actions 会安装依赖失败。

### 10.3 前端页面没有更新

先看 Actions 里的 `Upload frontend files` 是否成功。

再看服务器文件时间：

```bash
ssh -i /Users/rengang/.ssh/osh_github_actions_deploy_key -p 58753 root@43.242.200.25 \
  "ls -lah /www/nginx/html | head"
```

如果文件时间没变，说明上传没有成功。

### 10.4 Actions 是黄色圆圈

黄色圆圈表示还在运行，不是失败。等它变成绿色对勾或红色叉。

### 10.5 Actions 是红色叉

红色叉表示失败。点进去看哪个步骤红了，再按上面的常见问题排查。
