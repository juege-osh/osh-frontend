1.git 密钥配置

如果是mac把如下命令中的邮箱跟用户名改成你自己的 然后直接执行就好 然后把生成的公钥放到https://github.com/settings/ssh/new 界面的key里

如果是windows 就让ai改成适配windows的命令

bash -c '#!/bin/bash
set -e
YOUR_GITHUB_EMAIL="1402272093@qq.com"
YOUR_GITHUB_USERNAME="juege-osh"
chmod 700 ~/.ssh 2>/dev/null || echo ".ssh目录权限已正常"
chmod 600 ~/.ssh/id_rsa ~/.ssh/id_ed25519 2>/dev/null || echo "密钥文件权限已正常"
chmod 644 ~/.ssh/id_rsa.pub ~/.ssh/id_ed25519.pub 2>/dev/null || echo "公钥文件权限已正常"
cat > ~/.ssh/config << EOF
# 工作账号（原有id_rsa密钥）
Host github.com-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_rsa
  IdentitiesOnly yes

# 个人账号juege-osh（id_ed25519密钥）
Host github.com-juege
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes

# 默认密钥（工作账号，保持原有逻辑）
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_rsa
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config
eval "$(ssh-agent -s)" > /dev/null 2>&1
ssh-add -D > /dev/null 2>&1
ssh-add ~/.ssh/id_rsa > /dev/null 2>&1 && echo "✅ 工作密钥(id_rsa)已添加到代理"
ssh-add ~/.ssh/id_ed25519 > /dev/null 2>&1 && echo "✅ 个人密钥(id_ed25519)已添加到代理"
echo -e "\n========================================"
echo -e "\033[33m📋 请复制以下公钥（全选）：\033[0m"
echo -e "========================================"
cat ~/.ssh/id_ed25519.pub
echo -e "========================================\n"
echo -e "\033[34m🔍 正在验证juege-osh账号连接...\033[0m"
if ssh -T git@github.com-juege 2>&1 | grep -q "Hi $YOUR_GITHUB_USERNAME!"; then
    echo -e "\033[32m🎉 配置成功！克隆仓库命令：\033[0m"
    echo "git clone git@github.com-juege:juege-osh/osh-frontend.git"
else
    echo -e "\033[31m⚠️  连接未通过！先把上面的公钥添加到GitHub：\033[0m"
    echo "👉 地址：https://github.com/settings/ssh/new"
    echo -e "\033[32m✅ 添加公钥后，再执行克隆命令即可！\033[0m"
fi'
2.clone项目

git clone git@github.com-juege:juege-osh/osh-frontend.git




3.环境准备

node安装v18.17.0 版本的 

可以去node官网 也可以让ai教你弄


4.依赖安装与启动

npm install && npm run dev




5.访问如下地址 成功即可

http://localhost:3000/


