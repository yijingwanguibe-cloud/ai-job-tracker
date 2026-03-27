# 🚀 AI Job Tracker 部署指南（Vercel 一键部署）

## 方案：只使用 Vercel（推荐！）

Vercel 在国内访问更快，而且可以同时托管前端和后端！

---

## 第一步：准备代码仓库

### 1. 初始化 Git 仓库
```bash
cd "my-job website"
git init
git add .
git commit -m "Initial commit"
```

### 2. 创建 GitHub 仓库
- 访问 https://github.com/new
- 创建新仓库（名称：`ai-job-tracker`）
- 不要勾选 "Initialize this repository with a README"

### 3. 推送到 GitHub
```bash
git remote add origin https://github.com/你的用户名/ai-job-tracker.git
git branch -M main
git push -u origin main
```

---

## 第二步：一键部署到 Vercel

### 1. 注册 Vercel 账号
- 访问 https://vercel.com
- 使用 GitHub 账号登录

### 2. 导入项目
1. 点击 **"Add New..."** → **"Project"**
2. 选择你的 GitHub 仓库 `ai-job-tracker`
3. 点击 **"Import"**

### 3. 配置项目（默认即可，不需要改）
- **Project Name**: `ai-job-tracker`
- **Framework Preset**: `Vite`
- **Root Directory**: 留空

### 4. 部署！
点击 **"Deploy"**

### 5. 完成！
部署成功后，你会得到一个访问 URL，类似：
```
https://ai-job-tracker.vercel.app
```

---

## ✅ 部署完成！

现在你可以：
1. 访问 Vercel 提供的 URL 使用你的网站
2. 分享这个 URL 给朋友，他们也能使用了！

---

## 📝 为什么只需要 Vercel？

- **前端**：Vercel 自动部署 React 应用
- **后端**：Vercel Edge Functions 自动处理 `api/` 目录下的文件
- **访问速度**：Vercel 在中国有 CDN 节点，访问更快
- **完全免费**：个人使用完全免费！

---

## 🔧 本地开发

```bash
# 安装依赖
npm install

# 启动开发环境（前端+后端）
npm run dev
```

有问题随时问我！😊
