# 园区电动车充电桩监控系统

一个简单易用的充电桩实时监控网页应用，让你随时了解园区内所有充电桩的运行状态。

---

## 这个项目是什么？

想象一下，你管理着一个大型园区的多个电动车充电站。每天你都需要知道：
- 哪些充电桩正在使用？
- 哪些充电桩是空闲的？
- 有没有充电桩坏了需要维修？
- 有没有充电桩离线了？

以前，你可能需要跑到每个充电站去查看，或者登录多个系统。现在，只需要打开这个网页，所有信息一目了然！

---

## 功能介绍

### 1. 一屏看全

打开网页，你就能看到：
- **顶部**：显示总共有多少个充电站、多少个充电桩
- **统计卡片**：一眼看到空闲、充电中、故障、离线的数量
- **充电站列表**：每个充电站的详细信息

### 2. 实时更新

- 数据每 **20 秒**自动刷新一次
- 显示倒计时和进度条，让你知道下次刷新是什么时候
- 也可以点击「立即刷新」按钮手动更新

### 3. 状态一目了然

每个充电桩用不同颜色表示状态：

| 颜色 | 状态 | 含义 |
|:---:|:---:|:---|
| 🟢 绿色 | 空闲 | 可以使用 |
| 🔴 红色 | 充电中 | 正在给车充电 |
| 🟡 黄色 | 故障 | 坏了，需要维修 |
| ⚪ 灰色 | 离线 | 设备断网了 |

### 4. 详细信息

点击每个充电站，可以看到：
- 每个充电桩的编号
- 当前状态
- 充电功率（正在充电时显示）
- 已充电量（正在充电时显示）

---

## 技术栈（用了什么技术？）

即使你是技术小白，也可以了解一下这个项目用到了哪些技术：

| 技术 | 是什么 | 用来做什么 |
|------|--------|-----------|
| **React** | 一个前端框架 | 用来构建网页界面，就像搭积木一样组装页面 |
| **TypeScript** | JavaScript 的升级版 | 让代码更稳定，减少错误 |
| **Vite** | 构建工具 | 让开发更快，网页加载更快 |
| **Tailwind CSS** | CSS 框架 | 让页面更漂亮，不用手写复杂的样式 |
| **Axios** | HTTP 请求库 | 用来从服务器获取数据 |

---

## 项目结构（代码是怎么组织的？）

```
charging-monitor/
│
├── src/                        # 源代码目录
│   │
│   ├── config/                 # 配置文件夹
│   │   └── index.ts            # 存放 API 地址、刷新间隔、充电站信息
│   │
│   ├── services/               # 服务文件夹
│   │   └── api.ts              # 负责从服务器获取数据
│   │
│   ├── components/             # 组件文件夹
│   │   ├── StationCard.tsx     # 充电站卡片组件（显示单个充电站）
│   │   ├── RefreshCountdown.tsx # 刷新倒计时组件（独立隔离更新状态）
│   │   └── ErrorBoundary.tsx   # 错误边界组件（防止白屏崩溃）
│   │
│   ├── hooks/                  # 自定义 Hook 文件夹
│   │   └── useStationData.ts   # 管理数据获取和自动刷新
│   │
│   ├── types/                  # 类型定义文件夹
│   │   └── index.ts            # 定义数据结构
│   │
│   ├── utils/                  # 工具函数文件夹
│   │   └── stationUtils.ts     # 各种工具函数（格式化、计算等）
│   │
│   ├── App.tsx                 # 主页面组件
│   ├── index.css               # 全局样式
│   └── main.tsx                # 入口文件
│
├── public/                     # 静态资源（图片等）
├── index.html                  # 网页入口
├── package.json                # 项目配置
└── README.md                   # 就是这个说明文件
```

---

## 开发思路

### 整体架构

```
用户打开网页
      ↓
App.tsx（主页面）开始运行
      ↓
useStationData（获取数据）
      ↓
从服务器 API 获取数据
      ↓
处理数据（解析状态、计算统计）
      ↓
显示在页面上（StationCard 卡片）
      ↓
每 20 秒自动重复上述过程
```

### 数据流

```
┌──────────────┐
│   配置文件    │  ← 存放 API 地址、充电站信息
│   config/    │
└──────┬───────┘
       ↓
┌──────────────┐
│   数据获取    │  ← 从服务器拉取数据
│  hooks/      │
└──────┬───────┘
       ↓
┌──────────────┐
│   数据处理    │  ← 解析状态、计算统计
│   utils/     │
└──────┬───────┘
       ↓
┌──────────────┐
│   页面展示    │  ← 渲染到网页上
│ components/  │
└──────────────┘
```

### 核心模块说明

#### 1. 配置模块 (`src/config/index.ts`)

把所有配置放在一个地方，方便修改：

```typescript
// API 地址
export const API_CONFIG = {
  BASE_URL: 'https://api.dingdingzn.com/...',
  TIMEOUT: 10000,  // 10 秒超时
};

// 刷新间隔：20 秒
export const REFRESH_INTERVAL = 20000;

// 充电站列表
export const STATIONS = [
  { id: 'station1', name: 'A6门充电站', equipmentCode: '26450360' },
  { id: 'station2', name: 'B3门充电站', equipmentCode: '26450315' },
  // ...
];
```

#### 2. 数据获取 (`src/hooks/useStationData.ts`)

这是一个自定义 Hook，负责：
- 从服务器获取数据
- 每 20 秒自动刷新
- 管理加载状态（独立 `isLoading` 状态）
- 处理错误情况（失败时保留上次数据）
- 暴露 `lastFetchTime` 与倒计时同步

#### 3. 状态解析 (`src/utils/stationUtils.ts`)

服务器返回的数据格式可能不一样，这个模块负责统一解析：

```
服务器返回的数据
       ↓
检查各种可能的字段（socketStatusName、online、errorCode...）
       ↓
统一转换为：空闲 / 充电中 / 故障 / 离线
```

#### 4. 页面展示 (`src/components/StationCard.tsx`)

每个充电站显示为一个卡片：
- 顶部：充电站名称、设备编号
- 中间：统计数据（总数、空闲、充电中...）
- 底部：每个充电桩的详细状态

---

## 快速开始

### 准备工作

你需要安装：
- **Node.js**（版本 18 或以上）- [下载地址](https://nodejs.org/)
- **npm**（随 Node.js 一起安装）

### 安装步骤

1. **下载项目**

```bash
git clone https://github.com/你的用户名/charging-monitor.git
cd charging-monitor
```

2. **安装依赖**

```bash
npm install
```

3. **启动开发服务器**

```bash
npm run dev
```

4. **打开浏览器**

访问 http://localhost:5173

### 常用命令

| 命令 | 作用 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览构建结果 |
| `npm run lint` | 检查代码问题 |

---

## 配置说明

### 添加新充电站

编辑 `src/config/index.ts` 文件，在 `STATIONS` 数组中添加：

```typescript
export const STATIONS = [
  // 现有配置...
  {
    id: 'station5',           // 唯一标识
    name: '新充电站',          // 显示名称
    equipmentCode: '26450XXX', // 设备编号
  },
];
```

### 修改刷新间隔

编辑 `src/config/index.ts` 文件：

```typescript
export const REFRESH_INTERVAL = 30000; // 改为 30 秒（单位：毫秒）
```

---

## 充电站信息

当前监控的充电站：

| 充电站名称 | 设备编号 |
|-----------|---------|  
| A6门充电站 | 26450360 |
| B3门充电站 | 26450315 |
| B6门充电站 | 26450343 |
| C8门充电站 | 26450344 |

---

## 常见问题

### Q: 页面显示「网络错误」怎么办？

A: 检查以下几点：
1. 确保电脑已连接网络
2. 确认 API 服务器是否正常运行
3. 检查 API 地址是否正确

### Q: 如何部署到服务器？

A:
1. 运行 `npm run build` 构建项目
2. 将 `dist` 文件夹的内容上传到服务器
3. 配置 Nginx 或其他 Web 服务器指向该目录

### Q: 如何修改界面样式？

A: 项目使用 Tailwind CSS，直接在组件的 `className` 中修改样式类即可。

---

## 许可证

MIT License - 可以自由使用和修改

---

## 版本信息

**园区充电桩监控系统 v2.2 (稳定性 & 代码质量优化版)**

Bug 修复：
- 修复 `isLoading` 状态始终为 false，刷新按钮无法显示加载态的问题
- 修复 API 请求失败时桩位数据被清空的问题，现在会保留上次成功的数据
- 修复倒计时与实际数据刷新存在时间漂移的问题，改为基于 `lastFetchTime` 同步
- 移除 `useStationData` 中未使用的 `REFRESH_INTERVAL_SECONDS` 变量

性能优化：
- `StationCard` 不再重复计算 `stats`，直接复用 Hook 中的计算结果
- 在 `extractPileList` 中缓存 `parseStatus` 结果，避免多次重复解析
- `animate-pulse` 脉冲动画仅应用于充电中和故障状态，减少不必要的 GPU 开销

代码质量：
- 修正 `index.html` 的 `lang` 属性为 `zh-CN`
- 合并 `App.css` 到 `index.css`，减少冗余文件
- 使用 `STATUS_CONFIG` 集中管理卡片和徽章样式，替代冗长的三元表达式
- 移除配置中未使用的 `location` 字段
- 新增 `ErrorBoundary` 组件，防止渲染异常导致白屏
- 移除冗余的 `autoprefixer` 依赖（Tailwind CSS v4 已内置）

**园区充电桩监控系统 v2.1 (性能优化版)**

- 提取 `RefreshCountdown` 组件，彻底隔离倒计时状态，避免全局 DOM 每秒重绘
- 引入 `React.memo` 阻断非活跃 `StationCard` 的无关渲染
- 引入 `useMemo` 缓存派生出的总统计数据，降低 CPU 消耗
- 修正 `stationUtils` 数据解析器中的未知状态 Fallback，避免误报“可用”
- 优化了项目 HTML 结构和 SEO Metadata

**园区充电桩监控系统 v2.0**

- 使用 React 19 + TypeScript 5.9 重构
- 优化代码结构，提升可维护性
- 完善文档和注释