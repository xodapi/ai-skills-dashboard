# 🌍 Конкурентный ландшафт и стратегическое позиционирование

Анализ стартапов, open-source проектов и существующих решений в области навыков, портфолио и графов компетенций.

---

## 📊 Ландшафт рынка (2026)

### 1. Коммерческие платформы Proof-of-Work

#### **Peerlist** (peerlist.io)
**Что делают:**
- Профессиональная сеть с автоматическим парсингом GitHub, Substack, Hashnode, Product Hunt
- Заменяет текстовое резюме лентой подтвержденных артефактов
- Peer verification (взаимные верификации от коллег)

**Сильные стороны:**
- Автоматическая агрегация из 4+ источников
- Social proof через peer recommendations
- Живая лента активности

**Слабости:**
- Нет AI orchestration навыков
- Фокус на open-source contribution (игнорирует private enterprise code)
- Нет адаптивной оценки навыков

**Что взять:**
- ✅ Концепцию "Proof-of-Work" вместо self-reported skills
- ✅ Автоматический парсинг GitHub repos
- ✅ Peer verification mechanism
- ✅ Public profile URLs (`/u/username`)

---

#### **ShowProof** (showproof.io)
**Что делают:**
- Автосинхронизация с GitHub (языки, contributions, repos)
- LinkedIn import
- ATS-compatible резюме generation

**Сильные стороны:**
- GitHub language detection
- Resume export в разных форматах

**Слабости:**
- Только для разработчиков с GitHub
- Нет learning paths
- Нет практических упражнений

**Что взять:**
- ✅ Автоопределение tech stack из GitHub commits
- ✅ ATS-compatible PDF export
- ✅ Language breakdown с процентами

---

#### **Getfolio.dev** (getfolio.dev)
**Что делают:**
- Portfolio generator для developers
- GitHub API integration
- Синхронизация с Dev.to и Hashnode

**Что взять:**
- ✅ Автосинхронизация tech articles
- ✅ Visual portfolio cards
- ✅ One-click portfolio generation

---

#### **Fueler** (fueler.io)
**Что делают:**
- Витрина компетенций
- Встраивание Figma-прототипов, dashboards, repos
- Client testimonials привязаны к артефактам

**Что взять:**
- ✅ Embedded interactive demos
- ✅ Testimonials linked to specific projects
- ✅ Rich media portfolio (не только код)

---

#### **Badge**
**Что делают:**
- AI-агент формирует Trust Score
- Верифицированные отзывы от бывших коллег
- Обход шаблонных LinkedIn recommendations

**Что взять:**
- ✅ AI-generated Trust Score
- ✅ Structured peer verification (не free-text)
- ✅ Anti-gaming measures

---

### 2. Skills Intelligence платформы

#### **Workera** (workera.ai)
**Что делают:**
- Прецизионная оценка навыков в AI/Data Science
- Адаптивные калиброванные тесты
- Интерактивные практические задания в sandbox
- Персональные skill gaps

**Сильные стороны:**
- Адаптивные тесты (как GRE - сложность меняется по ходу)
- Isolated environments для практики
- Precision skill gap analysis

**Слабости:**
- Только AI/ML/Data Science
- Платные assessments
- Нет learning content (только оценка)

**Что взять:**
- ✅ Adaptive testing algorithm
- ✅ Sandbox environments для безопасного code execution
- ✅ Precision skill gap visualization
- ✅ Calibrated difficulty (не self-reported)

---

#### **Eightfold AI** (eightfold.ai)
**Что делают:**
- Корпоративные динамические графы навыков
- Предиктивные ML модели для маппинга смежных компетенций
- Автоподбор ролей под скрытый потенциал

**Что взять:**
- ✅ Skills graph visualization (force-directed D3.js)
- ✅ Adjacent skills recommendations
- ✅ Hidden potential discovery (навыки которые можно быстро освоить)

---

#### **HowNow AI** (hownow.com)
**Что делают:**
- 30,000+ навыков в библиотеке
- Граф компетенций + smart learning paths

**Что взять:**
- ✅ Large taxonomy reference (можем интегрировать Lightcast 34K skills)
- ✅ Smart learning path algorithm (shortest path to goal)

---

### 3. Open-Source проекты

#### **roadmap.sh** (github.com/kamranahmedse/developer-roadmap)
**Статистика:**
- ⭐ 320K+ stars
- 📈 Самый популярный roadmap проект

**Что делают:**
- Интерактивные карьерные треки (AI Engineer, MLOps, Frontend, etc.)
- Markdown-based content
- Community-driven updates

**Что взять:**
- ✅ Interactive roadmap visualization
- ✅ Progress tracking на roadmap
- ✅ Community contribution model
- ✅ AI Engineer / Prompt Engineering треки (актуально для 2026)

---

#### **Thoughtworks Tech Radar** (github.com/thoughtworks/build-your-own-radar)
**Что делают:**
- Радар технологий (4 квадранта × 4 кольца)
- Кольца: Adopt, Trial, Assess, Hold
- Квадранты: Tools, Techniques, Platforms, Languages

**Что взять:**
- ✅ Tech Radar visualization (D3.js)
- ✅ Radar для персонального tech stack ("My Technology Radar")
- ✅ Movement tracking (навык из "Assess" → "Adopt")
- ✅ JSON/CSV configuration

**Реализация:**
```typescript
// Новая страница: /my-radar
interface TechRadarItem {
  name: string;
  quadrant: "languages" | "frameworks" | "tools" | "techniques";
  ring: "adopt" | "trial" | "assess" | "hold";
  moved: "in" | "out" | "none";
}
```

---

#### **graph-of-skills** (github.com/graph-of-skills/graph-of-skills)
**Что делают:**
- Открытый движок построения графов навыков
- SKILL.md файлы как единица
- Векторные эмбеддинги + лексический матч
- Графовый reranking для связывания

**Что взять:**
- ✅ SKILL.md формат (markdown описания навыков)
- ✅ Vector embeddings для semantic search
- ✅ Graph reranking algorithm
- ✅ Skill relationship scoring

---

#### **SWE-bench** (github.com/swe-bench/SWE-bench)
**Что делают:**
- Benchmark для верификации кода
- Docker containers для isolated execution
- Реальные GitHub issues как задачи
- Fail-to-Pass и Pass-to-Pass тесты

**Что взять:**
- ✅ Docker-based code execution sandbox
- ✅ Реальные задачи из GitHub issues
- ✅ Automated test validation
- ✅ Benchmark scoring для AI-generated code

**Критично для нас:** Это решает проблему безопасного запуска пользовательского кода!

---

#### **OSMT (Open Skills Management Tool)** (WGU)
**Что делают:**
- Open-source инструмент для стандартизации навыков
- Rich Skill Descriptors (RSD) формат
- JSON-LD schema
- Версионирование навыков

**Что взять:**
- ✅ RSD формат для структурированных навыков
- ✅ JSON-LD для linked data
- ✅ Skill versioning (навыки меняются со временем)

---

### 4. Открытые таксономии и стандарты

#### **Lightcast Open Skills Taxonomy**
**Статистика:**
- 34,000+ навыков
- 31 категория
- 400+ подкатегорий
- Обновляется каждые 2 недели
- Парсинг сотен миллионов вакансий

**Что взять:**
- ✅ Интегрировать как reference taxonomy
- ✅ Использовать для автоматического тегирования
- ✅ Маппинг наших навыков на Lightcast IDs

---

#### **ESCO API** (Европейская классификация)
**Статистика:**
- REST API
- 28 языков
- URI для каждого навыка
- Бесплатный

**Что взять:**
- ✅ Multilingual skill names (для интернационализации)
- ✅ Стандартные URI для навыков
- ✅ EU skills framework integration

---

#### **Model Context Protocol (MCP)** (Anthropic)
**Что делают:**
- Открытый протокол для AI context
- Стандартизация между IDE, knowledge bases, LLMs
- Автоматическое извлечение сигналов активности

**Что взять:**
- ✅ MCP integration для автоматического skill detection
- ✅ IDE activity signals (VSCode, Cursor, etc.)
- ✅ Context sharing между tools

**КРИТИЧНО:** Это позволит автоматически определять навыки из реальной работы разработчика!

---

## 🏗️ Анализ собственных проектов

### **vibe-content-lab** (lab.syntog.ru)
**Релевантные компоненты:**

#### 1. RAG Architecture
```
- Document chunking
- OpenAI embeddings (text-embedding-3-small)
- Chroma vector DB
- Source citations
- Retrieval evaluation (hit@k, MRR)
```

**Что взять:**
- ✅ RAG для semantic search по упражнениям и навыкам
- ✅ Citation-first approach (всегда показывать источники)
- ✅ Retrieval evaluation metrics (качество поиска)
- ✅ Ground-truth test set для валидации

#### 2. Security Model
```
- HMAC webhook validation
- Cost approval workflow (estimate → confirm)
- Audit trail (SQLite)
- Server-only secrets
```

**Что взять:**
- ✅ Two-step approval для AI actions (estimate → confirm)
- ✅ Audit trail для всех AI operations
- ✅ Cost tracking per user

#### 3. n8n Automation
```
- Scheduled workflows
- Health checks
- Telegram notifications
```

**Что взять:**
- ✅ Scheduled daily challenges via n8n
- ✅ Health monitoring для AI services
- ✅ Notification system (email/Telegram/Slack)

---

### **synaps-research-radar** (synaps-research-radar)
**Релевантные компоненты:**

#### 1. Evidence Cards System
```json
{
  "status": "approved",
  "source_url": "https://...",
  "date": "2026-08-01",
  "tier": "peer-reviewed",
  "claims": [
    {
      "statement": "...",
      "limitations": "...",
      "source_reference": "page 15"
    }
  ],
  "human_review": {
    "approval": "approved",
    "reviewer": "owner",
    "date": "2026-08-02"
  }
}
```

**Что взять:**
- ✅ Evidence-based skill claims (не self-reported)
- ✅ Source tier system (peer-reviewed > blog post)
- ✅ Human review workflow
- ✅ Provenance tracking (откуда данные)

#### 2. Automated Metadata Collection
```python
# scripts/collect_metadata.py
- Fetch from arXiv, Crossref, manual queue
- Deduplicate by DOI/arXiv ID/title hash
- Offline validation (no API keys in CI)
- GitHub Actions artifact (14-day retention)
```

**Что взять:**
- ✅ Automated skill data collection from public sources
- ✅ Deduplication logic
- ✅ Offline validation for CI/CD
- ✅ Draft → Review → Approved workflow

#### 3. JSON Schema Validation
```python
# scripts/validate_cards.py
# Uses ONLY stdlib (no external deps)
import json
import jsonschema
```

**Что взять:**
- ✅ Stdlib-only validation (для CI без dependencies)
- ✅ JSON Schema для skill definitions
- ✅ Strict contract enforcement

---

### **synaps-research-vault** (vault.syntog.ru)
**Релевантные компоненты:**

#### 1. Security Model
```typescript
- Argon2id password hashing
- SHA-256 session tokens
- CSRF + Origin validation
- HttpOnly, Secure, SameSite=Lax cookies
- Rate limiting (in-memory)
```

**Что взять:**
- ✅ Enterprise-grade auth model
- ✅ CSRF protection
- ✅ Session management
- ✅ Rate limiting для API endpoints

#### 2. Project Contours (Context-aware tagging)
```typescript
interface ProjectApplicability {
  itemId: string;
  projectId: string;
  matchPhrases: string[];
  matchLocation: "title" | "abstract";
  ownerDecision: "confirmed" | "rejected" | null;
  ownerNote: string | null;
}
```

**Что взять:**
- ✅ Context-aware skill tagging
- ✅ Match phrases + location (для explainability)
- ✅ Human-in-the-loop approval
- ✅ Owner notes для customization

#### 3. Research Intelligence Agent
```
- Daily draft worker (never auto-publishes)
- USD 2 protective reserve (max 3 editorial calls)
- Public metadata only (никогда private data)
- Russian editorial protocol
- Deterministic title/abstract gate before LLM
```

**Что взять:**
- ✅ AI agent с protective reserve (cost control)
- ✅ Never auto-publish principle
- ✅ Deterministic pre-filtering перед LLM calls
- ✅ Editorial protocol для consistency

#### 4. Starter Taxonomy Installation
```typescript
// Idempotent, adds only missing system profiles
// Doesn't overwrite user fields or rules
- 12 directions (AI Change Management, Knowledge Provenance, etc.)
- Material types (Research, Case Study, Patent, Framework)
- Verification signals (Weak Signal, Needs Verification, Candidate)
```

**Что взять:**
- ✅ Idempotent taxonomy installation
- ✅ System profiles + user customization
- ✅ Verification signals taxonomy
- ✅ Weak signal detection workflow

---

## 🎯 Конкурентное позиционирование AI Skills Dashboard

### Наши уникальные преимущества:

#### 1. **AI-Native от дизайна** (vs. всех конкурентов)
- ❌ **Peerlist/ShowProof:** оценивают traditional coding
- ✅ **Мы:** AI orchestration, agent management, AI code review как first-class skills

#### 2. **Практика + Оценка + Обучение** (vs. fragmented solutions)
- ❌ **Workera:** только оценка, нет learning content
- ❌ **Roadmap.sh:** только roadmaps, нет практики
- ✅ **Мы:** integrated learning path + exercises + assessment + portfolio

#### 3. **Evidence-Based Skills** (vs. self-reported)
- ❌ **LinkedIn:** self-reported skills (все пишут что хотят)
- ❌ **GitHub README:** manual curation
- ✅ **Мы:** proof-of-work через validated exercises + GitHub parsing + peer verification

#### 4. **Docker Sandbox Execution** (vs. toy exercises)
- ❌ **LeetCode:** только algorithm problems (оторваны от реальности)
- ❌ **Codecademy:** browser-only простой код
- ✅ **Мы:** SWE-bench style real tasks в Docker containers

#### 5. **AI Era Skills Taxonomy** (vs. outdated 2020 skills)
- ❌ **Все платформы:** "Learn Python", "Build CRUD API"
- ✅ **Мы:** "Orchestrate 3 AI agents", "Review AI-generated OAuth", "Architect for AI implementation"

---

## 🚀 Стратегический план интеграции

### Phase 1: Evidence & Proof-of-Work (Q3 2026)

#### 1.1 GitHub Integration (от ShowProof + Peerlist)
```typescript
// Автоматический парсинг GitHub
interface GitHubProfile {
  repos: Repo[];
  languages: { [lang: string]: number }; // bytes per language
  contributions: ContributionDay[];
  stars_received: number;
  followers: number;
}

// Skill detection rules
const SKILL_PATTERNS = {
  "AI Orchestration": {
    files: ["**/agent*.py", "**/crew*.yaml", "**/autogen*.py"],
    packages: ["langchain", "crewai", "autogen"],
    commits: ["agent", "orchestrat", "multi-agent"]
  },
  "MCP Integration": {
    files: ["**/.mcp/*.json", "**/mcp-server-*.ts"],
    packages: ["@modelcontextprotocol/sdk"]
  }
  // ... 50+ patterns
}
```

**Задачи:**
- [ ] GitHub OAuth integration
- [ ] Repo analysis API
- [ ] Language detection
- [ ] Skill pattern matching
- [ ] Auto-populate user skills from GitHub

---

#### 1.2 Tech Radar (от Thoughtworks)
```typescript
// Новая страница: /my-radar
// D3.js visualization: 4 квадранта × 4 кольца
// Auto-populated from GitHub + manual additions
```

**Задачи:**
- [ ] Tech Radar component (D3.js)
- [ ] Auto-populate from GitHub languages
- [ ] Drag-and-drop ring movement
- [ ] Share radar as image/URL
- [ ] Compare radar with job requirements

---

#### 1.3 Peer Verification (от Badge + Peerlist)
```typescript
interface PeerEndorsement {
  skill: string;
  endorser: User;
  context: string; // "Worked together on Project X"
  strength: "knows" | "proficient" | "expert";
  verified: boolean; // both users confirmed they worked together
}
```

**Задачи:**
- [ ] Peer endorsement flow
- [ ] LinkedIn-style skill endorsements
- [ ] Work relationship verification
- [ ] Trust score calculation
- [ ] Anti-gaming measures (mutual verification required)

---

### Phase 2: Advanced Assessment (Q4 2026)

#### 2.1 Adaptive Testing (от Workera)
```typescript
// Адаптивный алгоритм: сложность меняется по ходу теста
interface AdaptiveTest {
  currentDifficulty: number; // 1.0 = beginner, 5.0 = expert
  adjustmentRate: number; // 0.5 = conservative, 1.0 = aggressive
  confidenceInterval: [number, number];
}

// После каждого ответа:
// - Правильно → difficulty += 0.5
// - Неправильно → difficulty -= 0.5
// Останавливаемся когда confidenceInterval < 0.5
```

**Задачи:**
- [ ] Adaptive difficulty algorithm
- [ ] Item Response Theory (IRT) calibration
- [ ] Confidence interval calculation
- [ ] Skill level estimation (1-10 scale)

---

#### 2.2 Docker Sandbox (от SWE-bench)
```typescript
// Isolated code execution
interface SandboxEnvironment {
  image: string; // "python:3.11-slim"
  timeout: number; // 30 seconds
  memory: string; // "512m"
  network: "none"; // no internet access
  readonly: string[]; // ["/usr", "/lib"]
}

// User submits code → run in Docker → validate tests
```

**Задачи:**
- [ ] Docker API integration
- [ ] Security sandboxing (no network, limited memory)
- [ ] Test runner (pytest, jest, etc.)
- [ ] Real-time logs streaming
- [ ] Fail-to-Pass validation

---

#### 2.3 MCP Integration (от Anthropic MCP)
```typescript
// Auto-detect skills from IDE activity
interface MCPSignal {
  source: "vscode" | "cursor" | "terminal";
  action: "code_completion" | "ai_chat" | "command_run";
  language: string;
  tool: string; // "Claude", "Copilot", "Cursor"
  timestamp: Date;
}

// Passive skill detection: не требует ручного ввода
```

**Задачи:**
- [ ] MCP server integration
- [ ] VSCode/Cursor extension
- [ ] Activity signal collection
- [ ] Passive skill detection
- [ ] Privacy controls (opt-in)

---

### Phase 3: Skills Graph & Intelligence (Q1 2027)

#### 3.1 Skills Graph (от Eightfold + graph-of-skills)
```typescript
// Force-directed graph visualization
interface SkillNode {
  id: string;
  name: string;
  level: number; // user's proficiency
  category: string;
}

interface SkillEdge {
  from: string;
  to: string;
  type: "prerequisite" | "related" | "alternative";
  strength: number; // 0-1
}

// Vector embeddings для semantic similarity
// Graph algorithms для shortest learning path
```

**Задачи:**
- [ ] Skills graph data structure
- [ ] Vector embeddings (OpenAI text-embedding-3-small)
- [ ] Force-directed D3.js visualization
- [ ] Shortest path algorithm (Dijkstra)
- [ ] Adjacent skills recommendations

---

#### 3.2 RAG для Skills Search (от vibe-content-lab)
```typescript
// Semantic search по упражнениям и навыкам
interface RAGQuery {
  query: string;
  top_k: number;
  filters?: {
    difficulty?: "easy" | "medium" | "hard";
    category?: string;
  };
}

// Returns: ranked exercises + source citations
```

**Задачи:**
- [ ] Chroma vector DB setup
- [ ] Embedding all exercises/skills
- [ ] Semantic search API
- [ ] Citation display (источник каждой рекомендации)
- [ ] Retrieval evaluation (hit@k, MRR)

---

#### 3.3 Evidence Cards (от synaps-research-radar)
```typescript
// Structured skill claims с источниками
interface SkillClaim {
  skill: string;
  statement: string; // "Can orchestrate 3+ AI agents"
  evidence: {
    type: "exercise" | "project" | "peer" | "github";
    source_url: string;
    date: Date;
    tier: "verified" | "self-reported";
  }[];
  limitations: string; // "Only tested in sandbox environments"
  human_review: {
    approved: boolean;
    reviewer: string;
    date: Date;
  };
}
```

**Задачи:**
- [ ] Evidence card schema
- [ ] Multi-source evidence aggregation
- [ ] Tier scoring (verified > self-reported)
- [ ] Human review workflow
- [ ] Public skill claims на profile page

---

### Phase 4: AI Intelligence (Q2 2027)

#### 4.1 Skill Auto-Detection Agent (от vault Research Intelligence)
```typescript
// Daily worker: analyze user activity → suggest skills
interface SkillDetectionAgent {
  sources: ["github", "exercises", "mcp"];
  protectiveReserve: number; // USD 2 per day
  autoPublish: false; // always needs human approval
  
  workflow: [
    "collect_signals",      // GitHub commits, exercise completions, MCP activity
    "deterministic_filter", // pre-LLM: remove noise
    "llm_analysis",        // extract skills (max 3 calls)
    "create_draft",        // never auto-approve
    "notify_user"          // "We detected 5 new skills - review?"
  ];
}
```

**Задачи:**
- [ ] Daily cron job
- [ ] Multi-source signal aggregation
- [ ] LLM skill extraction
- [ ] Draft → Review → Approve workflow
- [ ] Cost tracking (protective reserve)

---

#### 4.2 Learning Path Generator
```typescript
// AI-generated personalized learning path
interface LearningPath {
  goal: string; // "Become AI-Native Engineer"
  current_skills: string[];
  skill_gaps: string[];
  estimated_time: number; // hours
  
  steps: {
    skill: string;
    why: string; // "Needed for orchestrating multi-agent systems"
    exercises: Exercise[];
    estimated_hours: number;
  }[];
}
```

**Задачи:**
- [ ] Goal setting UI
- [ ] Skill gap analysis
- [ ] Path optimization (shortest route)
- [ ] Time estimation
- [ ] Progress tracking

---

## 📊 Feature Comparison Matrix

| Feature | LinkedIn | Peerlist | ShowProof | Workera | Roadmap.sh | **AI Skills** |
|---------|----------|----------|-----------|---------|------------|---------------|
| Self-reported skills | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GitHub integration | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Peer verification | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Adaptive assessment | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Practice exercises | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Learning paths | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| AI orchestration skills | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Docker sandbox | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Skills graph | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| MCP integration | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Tech radar | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Evidence-based claims | ❌ | ⚠️ | ⚠️ | ✅ | ❌ | ✅ |

**Легенда:**
- ✅ Full support
- ⚠️ Partial support
- ❌ Not supported

---

## 💡 Ключевые инсайты

### 1. **Никто не фокусируется на AI-era skills**
Все платформы учат традиционному кодингу. Мы — первые кто фокусируется на AI orchestration, agent management, AI code review.

### 2. **Fragmented ecosystem**
- Peerlist: portfolio
- Workera: assessment
- Roadmap.sh: learning paths
- **Мы:** все в одном (integrated)

### 3. **Open-source components доступны**
- Tech Radar (Thoughtworks) - MIT license
- Skills Graph (graph-of-skills) - Apache 2.0
- SWE-bench - MIT license
- Можем взять и адаптировать

### 4. **Стандарты существуют**
- Lightcast: 34K skills taxonomy (бесплатный)
- ESCO: EU skills framework
- MCP: Anthropic protocol
- Можем интегрировать вместо изобретения велосипеда

### 5. **Security patterns проверены**
- vibe-content-lab: HMAC + cost approval
- vault: Argon2id + CSRF + rate limiting
- Можем переиспользовать архитектуру

---

## 🎯 Immediate Action Items

### Приоритет 1 (Next Sprint):
1. **GitHub Integration**
   - OAuth setup (уже начали)
   - Repo analysis API
   - Auto-populate skills

2. **Evidence Cards Schema**
   - JSON Schema validation
   - Multi-source evidence
   - Human review workflow

3. **Tech Radar Page**
   - D3.js visualization
   - Auto-populate from GitHub
   - Share as image/URL

### Приоритет 2 (Q4 2026):
4. **Docker Sandbox**
   - SWE-bench integration
   - Security sandboxing
   - Real GitHub issues as exercises

5. **Adaptive Testing**
   - IRT algorithm
   - Difficulty adjustment
   - Confidence intervals

6. **MCP Integration**
   - VSCode extension
   - Passive skill detection
   - Privacy controls

### Приоритет 3 (Q1 2027):
7. **Skills Graph**
   - Vector embeddings
   - Force-directed visualization
   - Shortest path algorithm

8. **RAG Search**
   - Chroma vector DB
   - Semantic exercise search
   - Citation display

9. **AI Intelligence Agent**
   - Daily skill detection
   - Draft → Review workflow
   - Cost protection

---

## 📚 Resources

### Open-Source Repos to Fork:
1. **thoughtworks/build-your-own-radar** - Tech Radar UI
2. **graph-of-skills/graph-of-skills** - Skills Graph engine
3. **swe-bench/SWE-bench** - Code execution sandbox
4. **kamranahmedse/developer-roadmap** - Roadmap content

### APIs to Integrate:
1. **Lightcast Open Skills API** - 34K skills taxonomy
2. **ESCO API** - EU skills framework
3. **GitHub API** - Repo analysis
4. **OpenAI Embeddings API** - Vector search

### Standards to Adopt:
1. **MCP (Model Context Protocol)** - Anthropic
2. **RSD (Rich Skill Descriptors)** - OSMT
3. **JSON-LD** - Linked data for skills

---

*Составлено на основе анализа 15+ коммерческих платформ, 10+ open-source проектов, и 3 внутренних проектов (vibe-content-lab, synaps-research-radar, synaps-research-vault).*
