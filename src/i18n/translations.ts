import {
  AdditionalVenture,
  CommunityServiceItem,
  EducationItem,
  Model3DItem,
  PortfolioData,
  PortfolioProject,
  ProfileInfo,
  SketchItem,
  WorkExperience,
} from '../types/portfolio';
import { CategoryFilter } from '../utils/portfolioLogic';

export type Locale = 'en' | 'zh';

export const LOCALE_STORAGE_KEY = 'hqy_arch_locale_v1';

export function loadInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang === 'zh') return 'zh';
    if (urlLang === 'en') return 'en';

    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'zh' || stored === 'en') return stored;
  } catch {
    // ignore storage access issues
  }
  return 'en';
}

export const UI_TEXT = {
  en: {
    pageTitle: 'Huang Qiyuan — Architecture CV & Portfolio',
    footerBrandSuffix: 'Architecture CV & Portfolio',
    switchToLanguageLabel: '中文',
    switchToLanguageAria: 'Switch language to Simplified Chinese',
    header: {
      primaryNavAria: 'Primary navigation',
      mobileNavAria: 'Mobile navigation',
      openMenuAria: 'Open navigation menu',
      closeMenuAria: 'Close navigation menu',
      nav: {
        works: 'Works',
        cv: 'Curriculum Vitae',
        sketches: 'Sketches',
        models: '3D Models',
        contact: 'Contact',
      },
      footerCv: 'CV',
      ownerStudio: 'Owner Studio',
    },
    hero: {
      exploreWorks: 'Explore Selected Works',
      copyLink: 'Copy Portfolio Link',
      linkCopied: 'Link Copied',
      canvasGroupAria: 'Drafting canvas surface',
      surfaceLabel: 'Surface:',
      draftingPaper: 'Drafting Paper',
      draftingGrid: 'Drafting Grid',
      handDrawn: 'Hand Drawn',
      platePrefix: 'PL. 00',
      inspectAriaPrefix: 'Inspect',
      metrics: {
        honours: 'NUS M.Arch · Second Upper Honours',
        firms: 'Architectural Firms · SG & Shanghai',
        projects: 'Studio, Climatic & BIM Projects',
        studies: 'Pen & Graphite Architectural Studies',
      },
    },
    works: {
      eyebrow: '01. Architectural Portfolio',
      heading: 'Selected Works',
      searchAria: 'Search projects by title, software, or topic',
      searchPlaceholder: 'Search projects or tools...',
      categoryTabAria: 'Filter projects by discipline',
      categories: {
        All: 'All',
        'NUS Year 3': 'NUS Year 3',
        'NUS Year 2': 'NUS Year 2',
        'NUS Year 1': 'NUS Year 1',
        'Individual BIM': 'Individual BIM',
        Professional: 'Professional',
      } as Record<CategoryFilter, string>,
      skillFilterPrefix: 'Skill filter:',
      showingCount: (shown: number, total: number) => `Showing ${shown} of ${total}`,
      emptyTitle: 'No matching architectural works',
      emptyHint: 'Adjust your discipline tab, clear the skill filter, or try a different search keyword.',
      resetFilters: 'Reset All Filters',
      plateSingular: 'Plate',
      platePlural: 'Plates',
      viewPlates: 'View Plates',
      showArchive: (remaining: number) => `Show Full Archive (+${remaining} More Projects)`,
      showFeaturedOnly: 'Show Featured Projects Only',
      openAria: (title: string) => `Open ${title} case study and drawing plates`,
    },
    lightbox: {
      ariaSuffix: 'architectural plates',
      noPlate: 'NO PLATE',
      resetZoomAria: 'Reset plate zoom',
      zoomInAria: 'Zoom in drawing plate',
      prevPlateAria: 'Previous drawing plate',
      nextPlateAria: 'Next drawing plate',
      thumbAria: (plateNumber: string, caption: string) => `View ${plateNumber}: ${caption}`,
      closeAria: 'Close project viewer',
      categoryLabel: 'Category',
      scaleLabel: 'Scale / Deliverable',
      locationLabel: 'Location',
      toolsLabel: 'Software & Methods',
      thesisHeading: 'Design Thesis',
      highlightsHeading: 'Key Deliverables',
      browseHint: 'Use ← / → keys to browse plates',
    },
    cv: {
      eyebrow: '04. Curriculum Vitae',
      heading: 'Practice, Education & Technical Proficiencies',
      printCv: 'Print CV',
      experienceHeading: 'Architectural Experience',
      highlightingRoles: 'Highlighting roles using',
      clearSkillAria: (skill: string) => `Clear ${skill} skill filter`,
      expandAria: (company: string) => `Expand details for ${company}`,
      collapseAria: (company: string) => `Collapse details for ${company}`,
      toolsUsed: 'Tools used:',
      educationHeading: 'Education',
      gpaPrefix: 'GPA',
      courseworkLabel: 'Relevant Coursework:',
      venturesHeading: 'Design-Build Fabrication & Property Advisory',
      skillsHeading: 'Software & Technical Skills',
      resetSkill: 'Reset',
      skillsHint: 'Select any tool to highlight matching firms and filter portfolio projects.',
      communityHeading: 'Community Service & Leadership',
    },
    sketches: {
      eyebrow: '02. Observational Studies',
      heading: 'Hand-Drawn Sketches & Ink Studies',
      subtitle:
        'Freehand pen and graphite architectural observations spanning vernacular thresholds, classical vaults, European silhouettes, and Singapore waterfront landmarks.',
      inspectAria: (title: string) => `Inspect sketch: ${title}`,
      dialogAria: (title: string) => `Sketch study: ${title}`,
      zoomInAria: 'Zoom in sketch',
      zoomOutAria: 'Zoom out sketch',
      prevAria: 'Previous sketch',
      nextAria: 'Next sketch',
      closeAria: 'Close sketch viewer',
    },
    models: {
      eyebrow: '03. Spatial Archive',
      heading: '3D Models & Physical Studies',
      subtitle:
        'Interactive spatial models exported from architectural studio workflows alongside companion physical model and site photographs.',
      modelSingular: 'Model',
      modelPlural: 'Models',
      selectorAria: 'Select 3D architectural model',
      emptyTitle: 'No 3D Models Published Yet',
      emptyHint: 'Add your first .glb or .obj architectural model inside Owner Studio → 3D Models.',
      viewModeAria: 'Model showcase view mode',
      tab3d: '3D Model',
      tabPhotos: (count: number) => `Model Photos (${count})`,
      expandPhoto: 'Expand Photo',
      structuralHeading: (count: number) => `Structural Models (${count})`,
      selectVariantAria: 'Select structural study model',
      initializing3d: 'Initializing 3D Viewport...',
      scrollToLoad: 'Interactive 3D model loads automatically when in view',
      viewPhotosFallback: 'View Physical Photos',
      noPhotosTitle: 'No Physical Model Photos Yet',
      noPhotosHint:
        'Upload physical model photographs in Owner Studio → 3D Models to showcase them here alongside the 3D viewer.',
      prevPhotoAria: 'Previous physical model photo',
      nextPhotoAria: 'Next physical model photo',
      yearOfStudyLabel: 'Year of Study',
      yearLabel: 'Year',
      scaleLabel: 'Model Scale',
      activeVariantPrefix: 'Active Study Model',
      companionHeading: 'Companion Photographs',
      photoSingular: 'Photo',
      photoPlural: 'Photos',
      noCompanionTitle: 'No companion photos uploaded yet',
      noCompanionHint: 'Add physical model or studio photos anytime in Owner Studio → 3D Models.',
      closePhotoViewerAria: 'Close photo viewer',
    },
    viewer3d: {
      viewportAria: (title: string) => `Interactive 3D viewport for ${title}`,
      renderModeAria: '3D render mode',
      materials: 'Materials',
      clay: 'Clay',
      wireframe: 'Wireframe',
      orbit: 'Orbit',
      reset: 'Reset',
      resetTitle: 'Reset camera view',
      enterFullscreen: 'Enter fullscreen 3D viewer',
      exitFullscreen: 'Exit fullscreen 3D viewer',
      loading: 'Loading 3D Geometry...',
      viewPhotosFallback: 'View Physical Photos',
      unavailable: '3D Preview Unavailable',
      loadError: 'Could not load 3D model file. Check that the asset path is accessible.',
      controlsHint: 'Drag to orbit · Scroll to zoom · Right-drag to pan',
    },
    share: {
      eyebrow: '05. Contact & Inquiries',
      heading: 'Direct Contact & Portfolio Dossier',
      description:
        'Open to architectural studio internships, research collaborations, and full-time opportunities across Singapore and international practices. Feel free to reach out directly or share this interactive portfolio.',
      emailLabel: 'Email:',
      phoneLabel: 'Phone:',
      shareLinkLabel: 'Shareable Portfolio Link',
      copyLink: 'Copy Link',
      copied: 'Copied',
      printCvSummary: 'Print CV Summary',
    },
  },
  zh: {
    pageTitle: '黄启元 — 建筑学简历与作品集',
    footerBrandSuffix: '建筑学个人简历与作品集',
    switchToLanguageLabel: 'EN',
    switchToLanguageAria: 'Switch language to English',
    header: {
      primaryNavAria: '主导航',
      mobileNavAria: '移动端导航',
      openMenuAria: '打开导航菜单',
      closeMenuAria: '关闭导航菜单',
      nav: {
        works: '作品精选',
        cv: '个人简历',
        sketches: '建筑手绘',
        models: '三维模型',
        contact: '联系与分享',
      },
      footerCv: '简历',
      ownerStudio: '后台管理',
    },
    hero: {
      exploreWorks: '浏览精选作品',
      copyLink: '复制作品集链接',
      linkCopied: '链接已复制',
      canvasGroupAria: '图纸背景切换',
      surfaceLabel: '底纸：',
      draftingPaper: '绘图纸底',
      draftingGrid: '建筑网格',
      handDrawn: '手绘原稿',
      platePrefix: 'PL. 00',
      inspectAriaPrefix: '查看',
      metrics: {
        honours: '新加坡国立大学建筑学硕士 · 二等一级荣誉',
        firms: '建筑事务所实习经验 · 新加坡与上海',
        projects: '设计课、气候建筑与 BIM 作品',
        studies: '钢笔与铅笔建筑观察手绘',
      },
    },
    works: {
      eyebrow: '01. 建筑作品集',
      heading: '精选作品',
      searchAria: '按项目名称、软件或主题搜索作品',
      searchPlaceholder: '搜索项目或软件工具...',
      categoryTabAria: '按类别筛选建筑作品',
      categories: {
        All: '全部',
        'NUS Year 3': 'NUS 大三',
        'NUS Year 2': 'NUS 大二',
        'NUS Year 1': 'NUS 大一',
        'Individual BIM': '个人 BIM 实践',
        Professional: '事务所项目',
      } as Record<CategoryFilter, string>,
      skillFilterPrefix: '技能筛选：',
      showingCount: (shown: number, total: number) => `显示 ${shown} / ${total} 项`,
      emptyTitle: '未找到匹配的建筑作品',
      emptyHint: '请尝试切换作品分类、清除技能筛选，或更换搜索关键词。',
      resetFilters: '重置全部筛选',
      plateSingular: '张图纸',
      platePlural: '张图纸',
      viewPlates: '查看图纸',
      showArchive: (remaining: number) => `展开完整作品档案（另含 ${remaining} 项）`,
      showFeaturedOnly: '仅显示精选作品',
      openAria: (title: string) => `查看 ${title} 项目详情与图纸`,
    },
    lightbox: {
      ariaSuffix: '建筑图纸浏览',
      noPlate: '暂无图纸',
      resetZoomAria: '重置图纸缩放',
      zoomInAria: '放大图纸',
      prevPlateAria: '上一张图纸',
      nextPlateAria: '下一张图纸',
      thumbAria: (plateNumber: string, caption: string) => `查看 ${plateNumber}：${caption}`,
      closeAria: '关闭项目详情',
      categoryLabel: '项目分类',
      scaleLabel: '比例 / 成果',
      locationLabel: '项目地点',
      toolsLabel: '软件与技术方法',
      thesisHeading: '设计概念与阐述',
      highlightsHeading: '核心成果',
      browseHint: '可使用键盘 ← / → 方向键切换图纸',
    },
    cv: {
      eyebrow: '04. 个人简历',
      heading: '实践经历、教育背景与专业技能',
      printCv: '打印简历',
      experienceHeading: '建筑实践经历',
      highlightingRoles: '已高亮使用以下工具的经历：',
      clearSkillAria: (skill: string) => `清除 ${skill} 技能筛选`,
      expandAria: (company: string) => `展开 ${company} 详细经历`,
      collapseAria: (company: string) => `收起 ${company} 详细经历`,
      toolsUsed: '使用工具：',
      educationHeading: '教育背景',
      gpaPrefix: 'GPA',
      courseworkLabel: '核心课程：',
      venturesHeading: '自主建造实践与房产空间咨询',
      skillsHeading: '软件与专业技术能力',
      resetSkill: '重置',
      skillsHint: '点击任意工具标签，可高亮关联实习经历并筛选对应作品集项目。',
      communityHeading: '社区服务与领导力',
    },
    sketches: {
      eyebrow: '02. 观察性手绘研究',
      heading: '建筑手绘与钢笔速写',
      subtitle:
        '以钢笔与铅笔记录建筑空间观察，涵盖传统民居入口、古典拱券、欧洲历史立面及新加坡滨水地标。',
      inspectAria: (title: string) => `查看手绘作品：${title}`,
      dialogAria: (title: string) => `手绘研究：${title}`,
      zoomInAria: '放大手绘作品',
      zoomOutAria: '缩小手绘作品',
      prevAria: '上一幅手绘',
      nextAria: '下一幅手绘',
      closeAria: '关闭手绘浏览窗',
    },
    models: {
      eyebrow: '03. 空间数字档案',
      heading: '三维模型与实体模型研究',
      subtitle:
        '直接从建筑设计课数字工作流导出的交互式三维模型，并附配套实体模型制作及展览现场照片。',
      modelSingular: '个模型',
      modelPlural: '个模型',
      selectorAria: '选择三维建筑模型',
      emptyTitle: '暂未发布三维模型',
      emptyHint: '请前往“后台管理 → 3D 模型”上传您的首个 .glb 或 .obj 模型。',
      viewModeAria: '模型展示视图切换',
      tab3d: '三维模型',
      tabPhotos: (count: number) => `实体照片 (${count})`,
      expandPhoto: '查看大图',
      structuralHeading: (count: number) => `结构学习模型 (${count})`,
      selectVariantAria: '选择结构模型变体',
      initializing3d: '正在初始化三维视口...',
      scrollToLoad: '滚动至此区域将自动加载交互式三维模型',
      viewPhotosFallback: '查看实体照片',
      noPhotosTitle: '暂无实体模型照片',
      noPhotosHint: '可在“后台管理 → 3D 模型”上传实体模型摄影图片与三维视口联动展示。',
      prevPhotoAria: '上一张实体模型照片',
      nextPhotoAria: '下一张实体模型照片',
      yearOfStudyLabel: '学年与设计课',
      yearLabel: '年份',
      scaleLabel: '模型比例',
      activeVariantPrefix: '当前结构模型',
      companionHeading: '配套实体模型照片',
      photoSingular: '张照片',
      photoPlural: '张照片',
      noCompanionTitle: '暂未上传配套照片',
      noCompanionHint: '可在后台管理中随时添加实体模型或场地照片。',
      closePhotoViewerAria: '关闭照片浏览窗',
    },
    viewer3d: {
      viewportAria: (title: string) => `${title} 的交互式三维视口`,
      renderModeAria: '三维渲染模式',
      materials: '材质',
      clay: '白模',
      wireframe: '线框',
      orbit: '旋转',
      reset: '重置视角',
      resetTitle: '重置相机视角',
      enterFullscreen: '全屏查看三维模型',
      exitFullscreen: '退出全屏',
      loading: '正在加载三维几何模型...',
      viewPhotosFallback: '查看实体照片',
      unavailable: '三维预览暂不可用',
      loadError: '无法加载三维模型文件，请检查资源路径是否可访问。',
      controlsHint: '左键拖拽旋转 · 滚轮缩放 · 右键拖拽平移',
    },
    share: {
      eyebrow: '05. 联系与合作咨询',
      heading: '直接联系与作品集分享',
      description:
        '现开放新加坡及国际建筑事务所实习、学术研究合作及全职岗位接洽。欢迎通过邮件或领英直接联系，或复制链接分享此交互式建筑作品集。',
      emailLabel: '邮箱：',
      phoneLabel: '电话：',
      shareLinkLabel: '可分享的作品集链接',
      copyLink: '复制链接',
      copied: '已复制',
      printCvSummary: '打印简历摘要',
    },
  },
} as const;

const ZH_PROFILE: Partial<ProfileInfo> = {
  fullName: '黄启元',
  roleTitle: '建筑学硕士候选人 · 空间系统与适应性遗产',
  institutionLine: '新加坡国立大学 (NUS) · 建筑学硕士（辅修经济学）',
  location: '新加坡 & 上海',
  availability: '开放建筑事务所实习与研究合作机会',
  statement:
    '探索如何将适应性历史遗产框架、被动式热带气候构造与严谨的 BIM 施工图工作流结合，使当代城市建筑在延续物质文脉的同时持续演进。',
  heroPlateCaption: 'PL. 00 · 传统庭院门槛空间，铅笔与钢笔写生研究',
};

const ZH_PROJECTS: Record<
  string,
  Partial<Omit<PortfolioProject, 'plates'>> & {
    plates?: Record<string, { caption: string; scale?: string }>;
  }
> = {
  'permeable-sports-corridor': {
    title: '渗透式运动走廊',
    subtitle: '模块化管状肋架脊椎与适应性社区体育基础设施',
    studioOrContext: 'NUS 设计课 · 大三下学期 (Studio CLR)',
    location: '新加坡体育场与室外跑道片区',
    scale: '1:200 & A0 展板',
    summary:
      '一条贯穿室外跑道与室内体育馆的弧形模块化管状运动走廊，通过韵律感骨骼肋架、可渗透网面活动层及双功能地面公共广场激发社区活力。',
    description:
      '本项目源于城市微空间调研——以“围栏”（运动的引导元素）与“排水沟”（停留的节点元素）为切入点，在室外跑道与室内体育馆之间编织出一条蜿蜒的运动走廊。空间沿“开放平坦的跑道入口—半遮蔽中段训练空间—封闭渐变的室内体育馆外壳”展开，铰接式管肋结构体系上方容纳封闭舞蹈室、挑高攀岩竖井及开放运动平台，底层则整合了具备雨水收集功能的双用途停车场与社区白空间。',
    highlights: [
      '将场地中的围栏与排水沟渠转化为模块化节点、渗透率、减法、旋转及铰接肋架构造系统。',
      '构筑“开放平坦（跑道端）→ 开放而围合 → 封闭渐变（体育馆端）”的连续空间梯度。',
      '设计 1:200 双功能社区地面广场与雨水收集系统，上部覆盖轻盈透明的网格一层运动中庭。',
    ],
    plates: {
      'y3s2-p1': {
        caption: '场地测绘 — 色彩总图、节点/渗透率矩阵与城市微空间调研',
        scale: '总平面 (A1)',
      },
      'y3s2-p2': {
        caption: '功能与场地 — 渗透式运动走廊爆炸轴测图（遮阳、高程、开放度）',
        scale: 'A0 轴测图',
      },
      'y3s2-p3': {
        caption: '一层与二层平面图 — 双用途地面白空间与渗透网格中庭',
        scale: '1:200 (A1)',
      },
      'y3s2-p4': {
        caption: '构造迭代 1 与 4 — 节点拼装、体量削减、旋转及铰接肋架力学机制',
        scale: '构造研究 (A1)',
      },
      'y3s2-p5': {
        caption: '空间功能透视 — 封闭舞蹈室、高耸攀岩筒体与开放走廊',
        scale: '空间透视',
      },
      'y3s2-p6': {
        caption: '功能轴测与剖面分析 — 管状肋架韵律结构凸显图',
        scale: 'A1 轴测图',
      },
      'y3s2-p7': {
        caption: '纵向空间梯度总立面 — 从跑道端（开放平坦）过渡至室内馆（封闭渐变）',
        scale: 'A0 立面图',
      },
      'y3s2-p8': {
        caption: '详图展板（西段）— 跑道渗透界限、看台与骨骼构架',
        scale: 'A1 详图',
      },
      'y3s2-p9': {
        caption: '详图展板（东段）— 渐变保护性外壳界面与室内体育馆空间视图',
        scale: 'A1 详图',
      },
    },
  },
  '3rs-heritage-rethought': {
    title: "3R's V.2 — 重思遗产保护",
    subtitle: '新加坡传统店屋的适应性“构件工具箱”保护体系',
    studioOrContext: 'NUS Studio CM · 大三上学期',
    location: '新加坡历史保护街区',
    scale: '1:50 & 1:100',
    summary:
      '超越静态立面保留，将新加坡店屋拆解为可自由重组的建筑“构件工具箱”，灵活适配餐厅、诊所与美术馆等当代社区功能。',
    description:
      '针对新加坡店屋保护区“严格原貌留存政策”与“当代城市生活演进”之间的张力，本课题提出了一套富有生命力的适应性保护系统。通过对历史建筑的认知、拆解、重组与精细化修复，屋面、墙体、柱式、桁架与过渡门槛等构件被系统编目，并在三种不同修复策略下重新部署至多处城市地块：选择性保留（餐厅）、纠偏性复原（诊所）与创造性修复（美术馆）。',
    highlights: [
      '系统编目 30 余类模块化店屋传统构造构件，形成爆炸轴测“构件工具箱”。',
      '在主街区地块及两处对比基地（B3 紧凑现代型与 C2 开阔自然型）完成多场景验证。',
      '绘制完整的 1:50 街区总平面、纵剖面及 1:100 分类型装配详图与材料表。',
    ],
    plates: {
      '3rs-p1': { caption: '街区综合轴测图 — 适应性店屋城市肌理', scale: '轴测图' },
      '3rs-p2': { caption: "3R's V2 构件工具箱爆炸分解图与数字装配迭代", scale: '1:200' },
      '3rs-p3': { caption: '一层与二层街区平面、设计准则手册及纵剖面图', scale: '1:50' },
      '3rs-p4': { caption: '对比基地（B3 紧凑型与 C2 开阔型）及结构节点详图', scale: '1:50' },
      '3rs-p5': { caption: '餐厅类型学 — 选择性保留策略与材料构造清单', scale: '1:100' },
      '3rs-p6': { caption: '诊所类型学 — 纠偏性复原策略与爆炸装配图', scale: '1:100' },
      '3rs-p7': { caption: '美术馆类型学 — 创造性修复策略与多层平面', scale: '1:100' },
      '3rs-p8': { caption: '设计研究论文与历史建筑保护政策框架', scale: '论文展板' },
    },
  },
  'bend-boo-climatic-facade': {
    title: 'Bend-Boo — 弯曲竹构气候表皮改造',
    subtitle: 'NUS COM 2 教学楼被动式文丘里通风与曲面竹构立面设计',
    studioOrContext: 'NUS 气候生态与建筑 · 大二下学期',
    location: '新加坡国立大学肯特岗校区',
    scale: '1:50 实体模型',
    summary:
      '融合起伏曲面竹构遮阳、文丘里风道屋顶与采光竖井的生物气候表皮改造，显著降低热带教学楼空调与照明能耗。',
    description:
      '本改造旨在打破 COM 2 教学楼均质单调的楼层空间，创造富有个体辨识度且自然舒适的学习环境。通过将刚性平直遮阳百叶演化为连续起伏的曲面竹构表皮，每间教室均获得独特的采光断面与景观视野；配合顶部文丘里拔风罩、半透明垂直风井及三层可移动吸音隔断，最大化利用热带季风与柔和间接自然光。',
    highlights: [
      '在 30°–150° 太阳高度角下对四组实体与数字立面方案（竹材、叠层、曲率、旋转）完成日照测试。',
      '整合双组文丘里屋顶风帽，利用烟囱效应带动共享中庭风井与采光井的自然降温。',
      '手工制作精细的 1:50 建筑比例模型及模块化竹木立面测试装置。',
    ],
    plates: {
      'bb-p1': { caption: '场地地形气流分析、各层平面及起伏竹构立面图', scale: '1:200' },
      'bb-p2': { caption: '1:50 建筑实体比例模型与模块化立面实验构件', scale: '1:50 模型' },
      'bb-p3': { caption: '空间组合策略 — 曲面表皮与可适应教室单元布置', scale: '轴测图' },
      'bb-p4': { caption: '被动式环境剖面图 — 文丘里风井与日光导光井', scale: '剖面图' },
      'bb-p5': { caption: '场地适配调校 — 文丘里屋顶、曲面围护与可变平面布局', scale: '分析图' },
      'bb-p6': { caption: '四种立面迭代方案与日照仪太阳直射测试矩阵', scale: '数据矩阵' },
    },
  },
  'open-celmer': {
    title: 'Open-Celmer × Oppenheimer',
    subtitle: '电影空间转译与模块化木构体量聚合',
    studioOrContext: 'NUS Studio Shin Yokoo (Unit 2) · 大二上学期',
    location: '新加坡丹戎巴葛与华利街',
    scale: '1:50 & 1:100',
    summary:
      '位于丹戎巴葛都市地块的模块化椴木居住聚合体：围绕蜿蜒混凝土核心筒与醒目橙色悬挑楼梯矩阵组织居住单元。',
    description:
      '本作品在 NUS Studio Shin Yokoo（Unit 2）连续两个研究阶段中完成，选址新加坡丹戎巴葛路、客纳街与华利街交界的高密度城市填补地块。第一阶段（Oppenheimer — 双面叙事）将影片中的光影撕裂与“悲伤五个阶段”转译为锐利切口、不可达开口与受控采光井；第二阶段（Open-Celmer）将模块化 A/B/C 居住单元围绕蜿蜒有机的中央虚空间进行排列组合，由钢筋混凝土曲线核心筒与钢制剪力梁共同承重，在紧凑都市语境中平衡绿化、穿堂风与醒目的室外橙红连廊楼梯。',
    highlights: [
      '第一阶段（奥本海默）：从悲伤五阶段与科学家内心对立中提取 2D/3D 情绪空间剖面。',
      '第二阶段（Open-Celmer）：建立三层模块化聚合语法（A、B、C、A+A*、A+B+C），串联曲线核心通廊。',
      '深化 1:50 单元一与单元二平剖面、层间悬挑橙色楼梯系统及 RC 核心筒+钢梁复合结构。',
    ],
    plates: {
      'oc-p01': { caption: 'Open-Celmer — 最终三维体量聚合模型与建筑轴测图', scale: '轴测图' },
      'oc-p02': { caption: '终期评图综合展板 — 第一阶段（奥本海默）与第二阶段（Open-Celmer）', scale: '终期展板' },
      'oc-p03': { caption: '第一阶段 · 概念 —《奥本海默》电影分析、视觉意向与光影研究', scale: '日志 01' },
      'oc-p04': { caption: '第一阶段 · 灵感 — 悲伤五阶段空间几何提取', scale: '日志 02' },
      'oc-p05': { caption: '第一阶段 · 空间转译 — 三维转化、三角交界面与开口研究', scale: '日志 03' },
      'oc-p06': { caption: '第一阶段 · 场地背景 — 丹戎巴葛 / 华利街的自然与都市动线冲突', scale: '场地研究' },
      'oc-p07': { caption: '第一阶段 · 情绪剖面 — 形态生成、变体演化与渲染模型', scale: '日志 05' },
      'oc-p08': { caption: '第一阶段 · 总览展板 —《奥本海默：双面叙事》技术图纸', scale: '1:50' },
      'oc-p09': { caption: '第二阶段 · 体量研究 — 自然流畅曲线与人工锐利体块对比', scale: '日志 06' },
      'oc-p10': { caption: '第二阶段 · 堆叠形式 — A/B/C 模块化分层置换与形态变换', scale: '日志 07' },
      'oc-p11': { caption: '第二阶段 · 聚合研究 — 简洁型、导向型及留白型多层堆叠方式', scale: '日志 08' },
      'oc-p12': { caption: '第二阶段 · 交通流线 — 室外楼梯、层间穿梭路径与实体模型推敲', scale: '日志 09' },
      'oc-p13': { caption: '第二阶段 · 平面与流线 — 蜿蜒自然通廊与垂直立体交通', scale: '平面与轴测' },
      'oc-p14': { caption: '第二阶段 · 居住单元 — 单元一与单元二技术平剖面图纸', scale: '1:50' },
      'oc-p15': { caption: '第二阶段 · 纵剖面与互锁楼梯群组轴测图', scale: '剖面图' },
      'oc-p16': { caption: '第二阶段 · 结构体系研究 — RC 核心墙体、钢剪力梁与聚合矩阵', scale: '1:100' },
    },
  },
  'xinjin-zhi-art-museum': {
    title: '新津知美术馆 — 构造与光环境研究',
    subtitle: '拉索悬挂瓦片立面节点详图与微气候采光实测实验',
    studioOrContext: 'NUS 建筑构造与气候技术 · 大二',
    location: '案例研究（成都 / NUS 实验室）',
    scale: '1:20 详图与实验箱',
    summary:
      '通过自制室外测试箱与二分二至太阳模拟，定量解析隈研吾新津知美术馆钢索悬挂陶瓦表皮的受力机制与滤光性能。',
    description:
      '本研究深入剖析了新津知美术馆立面的拉索张力系统、L 型钢鳍支撑件及基底反射水池。团队建造了两套实体立面试验盒，并在平行与垂直太阳方位角下进行户外实测，对比不同瓦片密度（55% vs 25% 覆盖率）及双层滤波构造对降低热带眩光的效果。',
    highlights: [
      '绘制细致的拉索张力、不锈钢线夹与 L 型钢挑耳受力传递节点详图。',
      '记录春分/秋分与夏至/冬至时段真实照度 (Lux) 与温度差对比数据集。',
      '验证双层半透明挂瓦构造对柔化强热带阳光直射的有效性。',
    ],
    plates: {
      'xz-p1': { caption: '悬瓦立面结构装配、气候分析与实测照度数据汇总表', scale: '1:20 详图' },
    },
  },
  'the-flow-form-finding': {
    title: '流动之力 — 流体与动态找形研究',
    subtitle: '气泡水喷发流体模拟、攀岩肢体力学测绘与多材质实验建造',
    studioOrContext: 'NUS Studio AL (Unit 3) · 大一',
    location: '新加坡国立大学建筑设计室',
    scale: '参数化找形与模型',
    summary:
      '大一实验性找形课题：将薄荷糖引爆碳酸饮料的喷发轨迹（Flexhopper 粒子模拟与蜡/灰板/木块浇筑）及攀岩受力平衡转化为放样雕塑空间。',
    description:
      '本作品在 NUS 大一 Studio AL (Unit 3) 完成，通过两张高密度展板探讨瞬时物理能量与人体动力学如何直接生成空间形态。第一部分《流动 (The Flow)》利用双机位追踪可乐、百事与 Kickapoo 在不同剂量薄荷糖触发下的二氧化碳喷射轨迹，并在 Rhino/Grasshopper (Flexhopper) 中重建流体粒子场，继而以铸蜡、灰板等高线叠层、旋削木块及 3D 打印完成实体材质转译；第二部分《平衡与动态放样》测绘垂直、横向与斜向攀岩动作中的肢体张力对比，通过锥面放样形成负空间建筑原型，并以激光切割格栅切片制作构造模型。',
    highlights: [
      '第一部分（流动）：双角度拍摄气泡喷发轨迹并依托 Flexhopper 插件实现流体形态参数化模拟。',
      '跨材质实体建造测试：覆盖浇筑石蜡、灰板等高线叠层、实木车削、3D 打印及激光切割华夫格构。',
      '第二部分（平衡与动态放样）：将攀岩动作测绘为等轴测 BALANCE 受力图谱并转化为负空间建筑雕塑。',
    ],
    plates: {
      'y1-flow-p1': { caption: '展板 I · 流动 — 饮料喷发实验、Flexhopper 模拟、轨迹测绘与材质模型', scale: '终期展板 I' },
      'y1-flow-p2': { caption: '展板 II · 平衡与动态放样 — 攀岩动作映射、轴测研究与实体原型', scale: '终期展板 II' },
    },
  },
  'project-army-camp': {
    title: '军营记忆 — 数字化建筑重建',
    subtitle: '基于历史影像还原已拆除军营的 Revit BIM 与 AutoCAD 图纸档案',
    studioOrContext: '独立 BIM 测绘与数字化留存',
    location: '新加坡',
    scale: 'BIM LOD 300',
    summary:
      '仅凭有限的历史照片与卫星影像，对一座已拆除军营建筑群进行全套三维 Revit BIM 与二维 CAD 复原建档。',
    description:
      '为留存服役期间驻地军营的空间记忆而自主发起的复原项目。在缺乏原始施工图纸的情况下，通过比对谷歌卫星图及个人留影，三角测算推导场地高差、结构柱网、坡屋面轮廓及周边绿化，并在 Revit 与 AutoCAD 中协同完成全套平面、多向立面及日光白模渲染。',
    highlights: [
      '完全依靠影像线索与卫星参考精准还原建筑体量比例与层高关系。',
      '产出协同一致的 Revit 三维信息模型、AutoCAD 平立面图纸及日照渲染效果。',
      '展现了严密的自主 BIM 制图标准与空间“逆向测绘”能力。',
    ],
    plates: {
      'camp-p1': { caption: 'Revit 场地体量、室外透视与 AutoCAD 平立面图纸', scale: 'BIM / CAD' },
      'camp-p2': { caption: '军营建筑群白模体量与日光阴影渲染分析', scale: '透视效果' },
    },
  },
  'hangzhou-school-model': {
    title: '杭州校园空间重塑设计',
    subtitle: 'BIM 校园总图、运动场合院空间与立面韵律深化',
    studioOrContext: '独立建筑建模与方案深化',
    location: '中国 · 杭州',
    scale: '校园总体规划',
    summary:
      '运用 SketchUp、AutoCAD 与 Revit 协同工作流，对既有校园设计方案以中央绿色庭院与田径运动场为核心进行空间再构与立面优化。',
    description:
      '基于实践参考设计图纸，将二维平面图全面转化为立体校园空间模型，重点优化了中心生态绿庭、架空入口门楼、教学楼立面开窗韵律及红砖教学翼与坡屋顶的材质对比。',
    highlights: [
      '准确解读工程 CAD 图纸并在三维阶段实现空间层级与材质表达的提升。',
      '协调多层合院平面图、四向完整建筑立面及鸟瞰总图透视。',
      '将标准田径场与中央景观庭院融入清晰流畅的校园步行流线。',
    ],
    plates: {
      'hz-p1': { caption: '校园透视鸟瞰、田径场高空视角、CAD 平面及四向建筑立面图', scale: '总图规划' },
    },
  },
  'walk-in-wardrobe-detailing': {
    title: '室内精细构造 — 步入式衣帽间详图',
    subtitle: '定制木作立面图、剖面构造及可建造施工图表达',
    studioOrContext: '室内工程制图专项练习',
    location: '新加坡',
    scale: '1:20 木作详图',
    summary:
      '高精度室内工程制图图纸，详尽标示定制衣帽间挂衣分区、暗藏灯槽构造、储物搁板模数及长虹玻璃隔断细节。',
    description:
      '专注家具木作可加工性的严格 AutoCAD 施工图训练，涵盖全尺寸标注的室内立面、竖向构造剖面、抽屉开启净空、玻璃门扇开启示意及五金构件索引编号。',
    highlights: [
      '完成全套带精确尺寸标注的木作立面、竖向剖面及平面布置图。',
      '深化暗藏灯带槽口、分层储物模数、抽屉净空与长虹玻璃推拉门节点。',
      '严格遵循专业 CAD 图层规范与建筑制图标注层级标准。',
    ],
    plates: {
      'wd-p1': { caption: 'AutoCAD 定制木作立面图、构造剖面与五金细部详图', scale: '1:20' },
    },
  },
};

const ZH_EXPERIENCES: Record<string, Partial<WorkExperience>> = {
  'exp-gmp': {
    company: 'GMP 建筑师事务所（冯·格康，玛格及合伙人）',
    role: '建筑设计实习生',
    location: '中国 · 上海',
    period: '2025年6月 – 2025年8月',
    highlights: [
      '在 GMP 上海办公室完成为期两个月的建筑设计实习，参与国际竞赛与概念阶段方案推进。',
      '构建多轮 Rhino 三维体量推演模型，并在 Illustrator 与 Photoshop 中完成分析图谱及高级汇报表现展板。',
      '担任中德/中英双语技术沟通桥梁，精准传达方案评审意见以保障团队竞赛节点高效衔接。',
    ],
  },
  'exp-dp': {
    company: 'DP Architects (缔博建筑师事务所)',
    role: '建筑设计实习生',
    location: '新加坡',
    period: '2024年6月 – 2024年8月',
    highlights: [
      '使用 Rhino、SketchUp、Revit 与 AutoCAD 协助推进商业及公共项目体量模型更新与平面施工图修订。',
      '编制面向新加坡市区重建局 (URA) 与陆路交通管理局 (LTA) 的法定报批图纸与指标校核资料。',
      '为资深建筑师梳理多专业审图修改意见并整合成清晰的甲方汇报演示文稿。',
    ],
  },
  'exp-uci': {
    company: 'UCI International',
    role: '建筑实习生',
    location: '新加坡',
    period: '2021年1月 – 2021年4月',
    highlights: [
      '入职后迅速自学掌握 Revit 与 AutoCAD，独立交付空间三维模型及二维施工图纸。',
      '在资深建筑师指导下维护图纸版本修订记录并严格遵循企业级 CAD 图层管理规范。',
    ],
  },
};

const ZH_EDUCATION: Record<string, Partial<EducationItem>> = {
  'edu-nus': {
    institution: '新加坡国立大学 (NUS)',
    degree: '建筑学硕士学位（辅修经济学）',
    period: '2023年8月 – 2027年5月',
    honours: '二等一级荣誉学位 (Second Upper Class Honours)',
    coursework: [
      '建筑设计工作室 1–6',
      '设计思维',
      '建筑历史与理论 1 & 2',
      '空间计算思维',
      '建筑构造与结构体系',
      'AI 辅助设计',
      '气候生态与建筑',
    ],
  },
};

const ZH_SKILL_CATEGORIES: Record<string, string> = {
  'sg-autodesk': 'Autodesk 与 BIM 协同',
  'sg-modeling': '三维建模与气候分析',
  'sg-adobe': '平面图解与后期表现',
  'sg-render': '实时渲染可视化',
  'sg-fab': '数字化建造与模型制作',
};

const ZH_VENTURES: Record<string, Partial<AdditionalVenture>> = {
  'v-balcony': {
    title: '住宅阳台改造与 3D 打印定制构件',
    category: '自主建造与数字化制造',
    summary:
      '使用 SketchUp 建立完整住宅阳台改造模型，设计并用 3D 打印机自主制造定制五金连接件，随后与家人协作完成现场实体施工。',
  },
  'v-housing': {
    title: '新加坡持牌房产咨询与空间改造可视化',
    category: '建筑空间与不动产策划',
    summary:
      '通过新加坡房地产经纪人 (RES) 执照考试；善于结合定制三维建筑模型与室内改造效果图，帮助客户直观评估并推广房产空间潜力。',
  },
};

const ZH_COMMUNITY: Record<string, Partial<CommunityServiceItem>> = {
  'cs-yard': {
    organization: '新加坡国立大学社区服务俱乐部 (CSC)',
    role: '志愿引导员 · 特奥会青年运动员日 (YARD)',
    location: '新加坡杨厝港体育馆',
    period: '2023年10月',
    details: ['引导二十余名残障儿童参与融合板球趣味训练，提升孩子们的身体协调性与自信心。'],
  },
  'cs-thailand': {
    organization: '泰北山区社区志愿支教团',
    role: '活动组织者与支教老师',
    location: '泰国 · 清莱',
    period: '2014, 2017, 2018, 2019年',
    details: [
      '累计四次策划并带队前往泰北清莱山区村落开展教育帮扶志愿活动。',
      '教授数学与英语课程，助力当地小学毕业生顺利升入城区中学。',
    ],
  },
  'cs-pya': {
    organization: '青年警察大使计划 · Bright Sparkz',
    role: '交通安全工作坊讲师',
    location: '新加坡 Sparklekidz 幼儿园',
    period: '2017年',
    details: ['策划并主持互动安全课堂，向学龄前儿童普及日常道路交通安全常识。'],
  },
};

const ZH_SKETCHES: Record<string, Partial<SketchItem>> = {
  'sk-01': {
    title: '传统庭院门槛写生',
    subject: '木构与砖墙传统入口门楼',
    medium: '螺旋素描本铅笔速写',
  },
  'sk-02': {
    title: '现代主义曲顶教堂',
    subject: '抛物线立面与柳叶窗构成',
    medium: '纸本针管笔线稿',
  },
  'sk-03': {
    title: '穹顶装饰亭阁研究',
    subject: '肋架穹顶与雕花立面光影研究',
    medium: '铅笔排线素描',
  },
  'sk-04': {
    title: '悬挑立体绿化塔楼',
    subject: '错落空中露台体量构成',
    medium: '纸本铅笔草图',
  },
  'sk-05': {
    title: '拱顶大学图书馆',
    subject: '一点透视室内结构纵深写生',
    medium: '钢笔与铅笔混合研究',
  },
  'sk-06': {
    title: '山巅中式宝塔写生',
    subject: '重檐挑角与层叠石阶路径',
    medium: '纸本针管笔写生',
  },
  'sk-07': {
    title: '古典双层阅览拱廊',
    subject: '通高书库与夹层回廊研究',
    medium: '纸本钢笔速写',
  },
  'sk-08': {
    title: '转角塔楼与尖顶建筑',
    subject: '欧洲历史砖石建筑立面细部',
    medium: '钢笔排线明暗研究',
  },
  'sk-09': {
    title: '山坡城堡与叠落屋顶',
    subject: '山地等高线地形与石砌堡垒',
    medium: '钢笔交叉排线速写',
  },
  'sk-10': {
    title: '罗马斗兽场结构写生',
    subject: '古典多层连续券柱式韵律',
    medium: '纸本细线针管笔',
  },
  'sk-11': {
    title: '滨海湾金沙与艺术科学博物馆',
    subject: '新加坡海湾城市天际线地标',
    medium: '钢笔与石墨研究',
  },
  'sk-12': {
    title: '百叶钟楼亭顶细部',
    subject: '木百叶窗与叠瓦坡顶节点',
    medium: '纸本钢笔速写',
  },
};

const ZH_MODELS: Record<
  string,
  Partial<Omit<Model3DItem, 'photos' | 'variants'>> & {
    photos?: Record<string, string>;
    variants?: Record<string, { label: string; systemType: string; description: string }>;
  }
> = {
  'y3s2-permeable-sports-corridor': {
    title: '渗透式运动走廊',
    subtitle: '模块化管状肋脊与社区体育基础设施',
    studioOrContext: 'NUS 大三 · 下学期 (Studio CLR)',
    scale: '1:200 实体与数字模型',
    description:
      '蜿蜒于室外跑道与室内体育馆之间的曲线管状运动走廊。波纹白色结构外壳、互锁金属肋架拱圈与实木楼板共同构筑从开放渗透入口至遮蔽体育主场的连续空间体验。',
    photos: {
      'y3s2-ph-01': '主视角 3/4 实体模型 — 白色波纹外壳、金属拱肋与地形台座',
      'y3s2-ph-02': '评图展览现场 — 实体模型与“生长型社区中心”主题展板',
      'y3s2-ph-03': '入口透视视角 — 金属肋拱、弧形木框与跑道衔接',
      'y3s2-ph-04': '顶视构造细节 — 互锁金属拱肋与波纹管状外壳',
      'y3s2-ph-05': '剖面空间透视 — 木拱框架、室内楼层平台与褶皱外壳',
    },
  },
  'y3s1-model': {
    title: "3R's V.2 — 店屋保护系统",
    subtitle: '新加坡传统店屋的适应性“构件工具箱”保护体系',
    studioOrContext: 'NUS 大三 · 上学期 (Studio CM)',
    scale: '1:50 & 1:100 数字建筑模型',
    description:
      '新加坡店屋适应性保护框架的高精度三维建筑模型（涵盖选择性保留、纠偏性复原与创造性修复三大策略）。支持自由旋转、缩放及材质/白模/线框模式切换。',
    photos: {
      'y3s1-ph-01': '街区主透视实体模型与评图展板',
      'y3s1-ph-02': '片区俯瞰总览与穿孔木格栅立面',
      'y3s1-ph-03': '行人视角街道景观与传统五脚基柱廊',
      'y3s1-ph-04': '顶视总平面 — 弧形空间脊椎与陶土红瓦坡顶',
      'y3s1-ph-05': '高架街道通廊与天窗采光韵律',
    },
  },
  'y2s2-bend-boo': {
    title: 'Bend-Boo 竹构改造',
    subtitle: 'NUS COM 2 教学楼被动式文丘里通风与曲面竹构立面设计',
    studioOrContext: 'NUS 大二 · 下学期（气候生态与建筑）',
    scale: '1:50 实体与数字模型',
    description:
      '针对新加坡国立大学 COM 2 教学楼的生物气候竹构表皮与文丘里风帽改造。连续波浪状竹构遮阳百叶调节室内采光深度，抬升的屋顶风帽与垂直风井共同强化热带被动式自然通风。',
    photos: {
      'y2s2-ph-01': '1:50 实体比例模型与展板成果',
      'y2s2-ph-02': '背立面视图 — 竹构楼梯核心与文丘里拔风屋顶',
      'y2s2-ph-03': '3/4 轴测视角 — 起伏立面韵律与气候分析图解',
      'y2s2-ph-04': '立面构造细部 — 叠层遮阳构件与屋顶风帽节点',
      'y2s2-ph-05': '室内平面研究 — 曲面表皮对教室空间的微调分化',
    },
  },
  'ar2328-structural-systems': {
    title: 'AR2328 结构体系',
    subtitle: '钢筋混凝土框架、大跨度钢结构与曲面形态受力学研究',
    studioOrContext: 'NUS 大二 · AR2328 结构体系课程',
    scale: '结构构件与柱网空间模型',
    description:
      '为 AR2328《建筑构造与结构体系》课程研制的六组结构学习数字模型，系统演进覆盖钢筋混凝土框架推演、大跨度钢结构桁架体系及曲面受弯空间壳体。',
    variants: {
      'ar2328-rc-final': {
        label: 'RC 终版空间框架',
        systemType: '钢筋混凝土 · 空间框架结构',
        description: '完整钢筋混凝土结构框架，统筹柱网、主次梁、楼梯核心与悬挑空间模块。',
      },
      'ar2328-steel-final': {
        label: '钢结构终版空间',
        systemType: '结构钢 · 大跨度空间装配体系',
        description: '大跨度钢结构展馆完整组装，包含钢柱节点、主桁架、楼板、玻璃幕墙与交通系统。',
      },
      'ar2328-steel-frame': {
        label: '钢框架体系研究',
        systemType: '结构钢 · 构件与节点传力研究',
        description: '聚焦主次钢构件层级划分、斜撑几何形式与结构荷载传递路径迭代。',
      },
      'ar2328-rc-draft-2': {
        label: 'RC 框架草模二',
        systemType: '钢筋混凝土 · 结构跨度迭代',
        description: '中期混凝土结构单元优化模型，推敲梁柱交接节点、楼板开洞与竖向传力。',
      },
      'ar2328-rc-draft-1': {
        label: 'RC 框架草模一',
        systemType: '钢筋混凝土 · 基础柱网体量',
        description: '早期钢筋混凝土网格与框架原型推敲，测试柱距节奏与空间尺度比例。',
      },
      'ar2328-curve-study': {
        label: '曲面跨度形态研究',
        systemType: '形态受力几何 · 连续曲面壳体',
        description: '探索连续拱壳/肋片曲率变化及其在大跨度覆盖下的空间结构表现。',
      },
    },
  },
  'y2s1-open-celmer': {
    title: 'Open-Celmer × Oppenheimer',
    subtitle: '模块化木构居住盒体、雕塑感混凝土核心筒与橙色交通矩阵',
    studioOrContext: 'NUS 大二 · 上学期 (Studio Shin Yokoo)',
    scale: '1:50 & 1:100 实体与数字模型',
    description:
      '高密度模块化居住综合体设计：以温润椴木堆叠单元及开放式木构桁架与纯白雕塑感钢筋混凝土核心筒、白色钢制工字梁及鲜明橙色悬挑交通步道形成强烈戏剧性对比。',
    photos: {
      'y2s1-ph-01': '主侧立面 — 白色核心筒与层叠橙色室外交通流线',
      'y2s1-ph-02': '正立面对比 — 模块化椴木居住盒体 vs. 开放式结构桁架',
      'y2s1-ph-03': '3/4 轴测视角 — 曲线混凝土核心筒、钢工字梁与体量组合',
      'y2s1-ph-04': '内部局部特写 — 悬挑橙色楼梯与钢梁搭接节点',
      'y2s1-ph-05': '顶视俯瞰图 — 有机弯曲中庭通廊与木构格栅框体',
    },
  },
};

export function localizePortfolioData(data: PortfolioData, locale: Locale): PortfolioData {
  if (locale === 'en') return data;

  return {
    ...data,
    profile: {
      ...data.profile,
      ...ZH_PROFILE,
    },
    projects: data.projects.map((project) => {
      const zh = ZH_PROJECTS[project.id];
      if (!zh) return project;
      const { plates: zhPlates, ...rest } = zh;
      return {
        ...project,
        ...rest,
        plates: project.plates.map((plate) => {
          const zp = zhPlates?.[plate.id];
          if (!zp) return plate;
          return {
            ...plate,
            caption: zp.caption,
            scale: zp.scale ?? plate.scale,
          };
        }),
      };
    }),
    experiences: data.experiences.map((exp) => {
      const zh = ZH_EXPERIENCES[exp.id];
      return zh ? { ...exp, ...zh } : exp;
    }),
    education: data.education.map((edu) => {
      const zh = ZH_EDUCATION[edu.id];
      return zh ? { ...edu, ...zh } : edu;
    }),
    skillGroups: data.skillGroups.map((group) => {
      const zhCat = ZH_SKILL_CATEGORIES[group.id];
      return zhCat ? { ...group, category: zhCat } : group;
    }),
    ventures: data.ventures.map((venture) => {
      const zh = ZH_VENTURES[venture.id];
      return zh ? { ...venture, ...zh } : venture;
    }),
    communityService: data.communityService.map((item) => {
      const zh = ZH_COMMUNITY[item.id];
      return zh ? { ...item, ...zh } : item;
    }),
    sketches: data.sketches.map((sketch) => {
      const zh = ZH_SKETCHES[sketch.id];
      return zh ? { ...sketch, ...zh } : sketch;
    }),
    models: data.models.map((model) => {
      const zh = ZH_MODELS[model.id];
      if (!zh) return model;
      const { photos: zhPhotos, variants: zhVariants, ...rest } = zh;
      return {
        ...model,
        ...rest,
        photos: model.photos.map((photo) => ({
          ...photo,
          caption: zhPhotos?.[photo.id] ?? photo.caption,
        })),
        variants: model.variants?.map((variant) => {
          const zv = zhVariants?.[variant.id];
          return zv ? { ...variant, ...zv } : variant;
        }),
      };
    }),
  };
}
