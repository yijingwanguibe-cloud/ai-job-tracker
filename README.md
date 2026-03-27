# 🚀 AI Job Tracker

一个帮你追踪求职进度、AI解析职位描述、生成模拟面试策略的全栈应用！

## 功能特性

- ✨ **智能职位解析**：AI自动提取公司、岗位、投递方式等信息
- 📊 **求职看板**：表格展示，支持多维度筛选
- 🗂️ **个人知识库**：记录你的面经、经历、复盘
- 🎙️ **模拟面试**：AI生成定制化自我介绍和面试题
- 💾 **本地存储**：数据安全存储在浏览器中

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发环境（前端+后端）
npm run dev

# 只启动前端
npm run dev:frontend

# 只启动后端
npm run dev:backend
```

### 部署上线

详细的部署指南请查看 [DEPLOY.md](./DEPLOY.md)

## 技术栈

- **前端**：React + TypeScript + Vite + Tailwind CSS
- **状态管理**：Zustand
- **路由**：React Router DOM
- **后端**：Express + Node.js
- **AI**：DeepSeek API
- **部署**：Vercel（前端）+ Render（后端）

## 项目结构

```
.
├── src/
│   ├── components/       # React组件
│   ├── pages/           # 页面组件
│   ├── types.ts         # TypeScript类型定义
│   ├── store.ts         # Zustand状态管理
│   ├── config.ts        # 配置文件
│   └── mockAI.ts        # AI解析逻辑
├── server/
│   └── index.js         # Express后端服务
├── DEPLOY.md            # 部署指南
└── README.md            # 本文件
```

## License

MIT
