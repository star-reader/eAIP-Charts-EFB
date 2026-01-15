# eAIP Charts EFB

eAIP Charts EFB是SKYline模拟飞行俱乐部全新推出的中国电子航空资料汇编(eAIP)电子飞行包，可阅览全国AIP航图信息。

## 简介

eAIP Charts EFB是基于Vue 3+PWA构建的跨平台Web应用，支持查看eAIP China的各种航图，包括机场图、航路图、SUP、AIC、NOTAM等。

### 主要功能

- **机场航图查阅** - 支持查阅eAIP中的机场图、进离场程序、仪表进近程序等
- **航路图查看** - 提供航路图和区域图的浏览功能
- **AIP文档** - 集成 SUP、AIC、NOTAM 等官方航空文档
- **PDF阅读器** - 内置高性能PDF查看器，支持缩放、旋转、平移等操作
- **响应式设计** - 完美适配桌面端和移动端设备

## 技术架构

### 前端技术栈
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 前端构建工具
- **Vue Router** - 路由管理器
- **SCSS** - CSS 预处理器

### 核心依赖
- **vue-pdf-embed** - PDF 文档渲染
- **naive-ui** - Vue 3 UI 组件库
- **pubsub-js** - 组件间通信


## 开发环境

### 环境要求
- Node.js 20+
- pnpm (推荐) 或 npm

### 安装依赖
```bash
pnpm install
```

### 配置环境变量与API
复制 `.env.example` 文件到 `.env` 并将``VITE_API_BASE_URL``修改为你的API地址
API中包含以下部分：
- `data`文件夹：与从eAIP官网下载的压缩包解压后格式一致
- `latest.json`: 包含版本号信息，与`data`文件夹版本对应一致

`latest.json`示例格式如下：
```json
{
    "name": "EAIP2025-08.V1.3",
    "cycle": "2508",
    "version_id": 2508
}
```

后续发布升级时，请保证新数据的`version_id`大于旧数据的`version_id`，系统依赖识别此属性来更新本地导航数据。


### 开发模式
```bash
pnpm run dev
```

### 构建应用
```bash
pnpm run build
```

欢迎开发者踊跃提issue与PR以共同优化本项目！

## 项目结构

```
src/
├── components/          # 组件目录
│   ├── Common/         # 通用组件
│   ├── Navs/           # 导航组件
│   └── Selection/      # 选择面板组件
├── pages/              # 页面组件
├── services/           # 业务逻辑
│   └── storage/        # 数据存储
├── styles/             # 样式文件
├── router/             # 路由配置
└── stores/             # 状态管理
```

## 使用说明

1. **选择类别** - 在主导航中选择要查看的航图类别
2. **选择具体项目** - 在子导航中选择具体的航图类型或机场
3. **浏览航图** - 在弹出的选择面板中选择要查看的航图
4. **PDF操作** - 使用右侧控制面板进行缩放、旋转等操作


## 📄 许可证

本项目采用 GPL-3.0 license 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情
