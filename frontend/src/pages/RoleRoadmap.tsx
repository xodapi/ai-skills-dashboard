import { useState } from 'react'
import { Link } from 'react-router-dom'

// 8 role roadmaps matching ARCHETYPES in demo_data.py
const ROADMAPS = [
  {
    id: 'junior_vibe',
    label: 'Junior / LLM Developer',
    icon: '🤖',
    color: '#10B981',
    description: 'Быстро строить AI-приложения с LLM API, Telegram боты, RAG системы',
    estimated_months: 3,
    nodes: [
      { id: 'python_basics', title: 'Python основы', skills: ['Python'], trainer: 'Python', status: 'required', desc: 'Функции, типизация, async/await, Pydantic' },
      { id: 'git', title: 'Git + CLI', skills: ['Git', 'Linux'], trainer: null, status: 'required', desc: 'Ветки, pull requests, базовые команды Linux' },
      { id: 'api_basics', title: 'REST API', skills: ['FastAPI', 'REST API'], trainer: 'FastAPI', status: 'required', desc: 'HTTP методы, Pydantic models, /docs' },
      { id: 'llm_api', title: 'OpenAI / LLM API', skills: ['OpenAI API', 'LLM'], trainer: null, status: 'required', desc: 'GPT-4o, системные промпты, токены и стоимость' },
      { id: 'langchain', title: 'LangChain + RAG', skills: ['LangChain', 'RAG'], trainer: 'LangChain', status: 'recommended', desc: 'Chains, agents, векторные базы, FAISS' },
      { id: 'docker_basic', title: 'Docker', skills: ['Docker'], trainer: 'Docker', status: 'recommended', desc: 'Dockerfile, docker-compose, образы' },
      { id: 'postgres', title: 'PostgreSQL', skills: ['PostgreSQL', 'SQL'], trainer: 'SQL', status: 'optional', desc: 'SELECT, JOIN, индексы, asyncpg' },
    ],
  },
  {
    id: 'ml_engineer',
    label: 'ML Engineer',
    icon: '🧠',
    color: '#22D3EE',
    description: 'Прикладной ML: рекомендации, ранжирование, fraud detection',
    estimated_months: 6,
    nodes: [
      { id: 'python_ml', title: 'Python + Pandas', skills: ['Python', 'Pandas', 'NumPy'], trainer: 'Pandas', status: 'required', desc: 'DataFrames, векторизация, профилирование' },
      { id: 'sql_ml', title: 'SQL + аналитика', skills: ['SQL', 'PostgreSQL'], trainer: 'SQL', status: 'required', desc: 'Window functions, CTE, агрегации' },
      { id: 'sklearn', title: 'scikit-learn', skills: ['scikit-learn', 'Machine Learning'], trainer: 'scikit-learn', status: 'required', desc: 'Pipeline, GridSearchCV, кросс-валидация' },
      { id: 'mlflow', title: 'MLflow', skills: ['MLflow'], trainer: 'MLflow', status: 'required', desc: 'Tracking, Model Registry, autolog' },
      { id: 'fastapi_ml', title: 'FastAPI для ML', skills: ['FastAPI'], trainer: 'FastAPI', status: 'required', desc: 'Inference API, Pydantic validation, lifespan' },
      { id: 'docker_ml', title: 'Docker', skills: ['Docker'], trainer: 'Docker', status: 'recommended', desc: 'ML Dockerfile, multi-stage, CUDA base images' },
      { id: 'pytorch_intro', title: 'PyTorch (основы)', skills: ['PyTorch', 'Deep Learning'], trainer: 'PyTorch', status: 'recommended', desc: 'Tensors, autograd, training loop' },
    ],
  },
  {
    id: 'nlp_llm_engineer',
    label: 'NLP / LLM Engineer',
    icon: '📝',
    color: '#818CF8',
    description: 'Fine-tuning LLM, RAG системы, production NLP сервисы',
    estimated_months: 8,
    nodes: [
      { id: 'python_adv', title: 'Python advanced', skills: ['Python'], trainer: 'Python', status: 'required', desc: 'Generators, decorators, async, профилирование' },
      { id: 'pytorch_nlp', title: 'PyTorch + Transformers', skills: ['PyTorch', 'Transformers', 'HuggingFace'], trainer: 'PyTorch', status: 'required', desc: 'Attention, BERT, fine-tuning' },
      { id: 'transformers_lib', title: 'HuggingFace Transformers', skills: ['Transformers', 'NLP'], trainer: 'Transformers', status: 'required', desc: 'Trainer API, pipeline, Tokenizer, PEFT/LoRA' },
      { id: 'rag_system', title: 'RAG системы', skills: ['LangChain', 'RAG', 'FAISS'], trainer: 'LangChain', status: 'required', desc: 'Vector stores, retrieval, context window' },
      { id: 'fastapi_nlp', title: 'Production API', skills: ['FastAPI', 'Docker'], trainer: 'FastAPI', status: 'required', desc: 'Async inference, batching, caching' },
      { id: 'mlflow_nlp', title: 'Experiment tracking', skills: ['MLflow'], trainer: 'MLflow', status: 'recommended', desc: 'NLP metrics, model registry, versioning' },
      { id: 'k8s_nlp', title: 'Kubernetes', skills: ['Kubernetes'], trainer: 'Kubernetes', status: 'optional', desc: 'Deployment, HPA, GPU tolerations' },
    ],
  },
  {
    id: 'cv_engineer',
    label: 'Computer Vision Engineer',
    icon: '👁️',
    color: '#F59E0B',
    description: 'Детекция объектов, сегментация, видеоаналитика',
    estimated_months: 8,
    nodes: [
      { id: 'python_cv', title: 'Python + NumPy', skills: ['Python', 'NumPy'], trainer: 'Python', status: 'required', desc: 'Array ops, broadcasting, vectorization' },
      { id: 'opencv', title: 'OpenCV', skills: ['OpenCV', 'Computer Vision'], trainer: 'OpenCV', status: 'required', desc: 'Image processing, feature extraction, tracking' },
      { id: 'pytorch_cv', title: 'PyTorch + torchvision', skills: ['PyTorch', 'Deep Learning'], trainer: 'PyTorch', status: 'required', desc: 'CNN архитектуры, transfer learning, AMP' },
      { id: 'albumentations', title: 'Albumentations', skills: ['Computer Vision'], trainer: 'Computer Vision', status: 'required', desc: 'Augmentation pipelines для CV' },
      { id: 'onnx', title: 'ONNX + оптимизация', skills: ['ONNX', 'TensorRT'], trainer: 'Computer Vision', status: 'recommended', desc: 'Quantization, TensorRT, inference < 10ms' },
      { id: 'docker_cv', title: 'Docker + CUDA', skills: ['Docker', 'CUDA'], trainer: 'Docker', status: 'recommended', desc: 'CUDA base images, GPU Docker runtime' },
      { id: 'k8s_cv', title: 'Kubernetes + GPU', skills: ['Kubernetes'], trainer: 'Kubernetes', status: 'optional', desc: 'nvidia.com/gpu resource limits, tolerations' },
    ],
  },
  {
    id: 'mlops_platform',
    label: 'MLOps Engineer',
    icon: '⚙️',
    color: '#F43F5E',
    description: 'ML инфраструктура: пайплайны, serving, мониторинг',
    estimated_months: 10,
    nodes: [
      { id: 'python_ops', title: 'Python + shell', skills: ['Python', 'Linux'], trainer: 'Python', status: 'required', desc: 'Скрипты, subprocess, pathlib, jinja2' },
      { id: 'docker_ops', title: 'Docker', skills: ['Docker'], trainer: 'Docker', status: 'required', desc: 'Multi-stage, non-root, healthcheck' },
      { id: 'k8s_ops', title: 'Kubernetes', skills: ['Kubernetes', 'MLOps'], trainer: 'Kubernetes', status: 'required', desc: 'Deployments, HPA, PVC, namespaces' },
      { id: 'airflow', title: 'Apache Airflow', skills: ['Airflow'], trainer: 'Airflow', status: 'required', desc: 'DAGs, XCom, sensors, backfill' },
      { id: 'mlflow_ops', title: 'MLflow', skills: ['MLflow'], trainer: 'MLflow', status: 'required', desc: 'Model registry, stage transitions, serving' },
      { id: 'terraform', title: 'Terraform', skills: ['Terraform'], trainer: 'Terraform', status: 'recommended', desc: 'IaC для облачных ML ресурсов (EKS, GKE)' },
      { id: 'monitoring', title: 'Prometheus + Grafana', skills: ['Prometheus', 'Grafana'], trainer: null, status: 'recommended', desc: 'ML метрики: latency, drift, accuracy' },
    ],
  },
  {
    id: 'data_scientist',
    label: 'Data Scientist',
    icon: '📊',
    color: '#A78BFA',
    description: 'Аналитика, A/B тесты, предиктивные модели, продуктовые эксперименты',
    estimated_months: 5,
    nodes: [
      { id: 'python_ds', title: 'Python + Pandas', skills: ['Python', 'Pandas', 'NumPy'], trainer: 'Pandas', status: 'required', desc: 'EDA, профилирование, очистка данных' },
      { id: 'sql_ds', title: 'SQL + Аналитика', skills: ['SQL', 'Statistics'], trainer: 'SQL', status: 'required', desc: 'Window functions, retention, funnel анализ' },
      { id: 'stats', title: 'Статистика и A/B', skills: ['Statistics', 'A/B Testing'], trainer: null, status: 'required', desc: 'Гипотезы, t-test, p-value, power analysis' },
      { id: 'sklearn_ds', title: 'scikit-learn', skills: ['scikit-learn', 'Machine Learning'], trainer: 'scikit-learn', status: 'required', desc: 'Regression, classification, feature selection' },
      { id: 'viz', title: 'Визуализация', skills: ['Matplotlib'], trainer: null, status: 'required', desc: 'Matplotlib, seaborn, plotly, дашборды' },
      { id: 'mlflow_ds', title: 'MLflow', skills: ['MLflow'], trainer: 'MLflow', status: 'recommended', desc: 'Experiment tracking, сравнение моделей' },
      { id: 'spark_ds', title: 'Spark (основы)', skills: ['Spark'], trainer: null, status: 'optional', desc: 'PySpark, DataFrames, агрегации на BigData' },
    ],
  },
  {
    id: 'ai_researcher',
    label: 'AI Research Scientist',
    icon: '🔬',
    color: '#F43F5E',
    description: 'Фундаментальные исследования: архитектуры нейросетей, оптимизация, публикации',
    estimated_months: 18,
    nodes: [
      { id: 'math', title: 'Высшая математика', skills: ['Mathematics'], trainer: null, status: 'required', desc: 'Линейная алгебра, теорвер, оптимизация' },
      { id: 'pytorch_research', title: 'PyTorch advanced', skills: ['PyTorch', 'CUDA'], trainer: 'PyTorch', status: 'required', desc: 'Custom operators, distributed training, Triton' },
      { id: 'transformers_research', title: 'Transformers deep dive', skills: ['Transformers', 'Deep Learning'], trainer: 'Transformers', status: 'required', desc: 'Архитектуры: BERT, GPT, ViT, Mamba' },
      { id: 'paper_impl', title: 'Воспроизведение статей', skills: ['PyTorch', 'HPC'], trainer: null, status: 'required', desc: 'arXiv → код → эксперименты → улучшения' },
      { id: 'mlflow_research', title: 'Experiment tracking', skills: ['MLflow'], trainer: 'MLflow', status: 'recommended', desc: 'Тысячи runs, сравнение конфигураций' },
      { id: 'cpp_research', title: 'C++ / CUDA kernels', skills: ['C++', 'CUDA'], trainer: null, status: 'optional', desc: 'Custom CUDA kernels, pybind11, libtorch' },
      { id: 'latex', title: 'LaTeX + академическое письмо', skills: ['LaTeX'], trainer: null, status: 'optional', desc: 'Написание статей для NeurIPS, ICML, ICLR' },
    ],
  },
  {
    id: 'llm_product_dev',
    label: 'LLM Product Developer',
    icon: '🚀',
    color: '#34D399',
    description: 'AI-продукты: чатботы, автоматизация, интеграция LLM в бизнес',
    estimated_months: 2,
    nodes: [
      { id: 'python_prod', title: 'Python', skills: ['Python'], trainer: 'Python', status: 'required', desc: 'async/await, Pydantic, типизация' },
      { id: 'fastapi_prod', title: 'FastAPI', skills: ['FastAPI'], trainer: 'FastAPI', status: 'required', desc: 'REST API, websocket, middleware' },
      { id: 'openai_prod', title: 'LLM API (OpenAI/Claude)', skills: ['OpenAI API', 'LLM'], trainer: null, status: 'required', desc: 'Prompting, structured output, tool calls' },
      { id: 'langchain_prod', title: 'LangChain', skills: ['LangChain', 'RAG'], trainer: 'LangChain', status: 'recommended', desc: 'Agents, memory, retrievers' },
      { id: 'redis_prod', title: 'Redis (кэш + очереди)', skills: ['Redis'], trainer: null, status: 'recommended', desc: 'Session cache, rate limiting, pub/sub' },
      { id: 'docker_prod', title: 'Docker', skills: ['Docker'], trainer: 'Docker', status: 'recommended', desc: 'Контейнеризация и деплой' },
      { id: 'telegram_prod', title: 'Telegram Bot API', skills: ['Telegram Bot API'], trainer: null, status: 'optional', desc: 'aiogram 3, FSM, inline keyboards' },
    ],
  },
]

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  required:    { color: '#F43F5E', label: 'Обязательно' },
  recommended: { color: '#F59E0B', label: 'Рекомендуется' },
  optional:    { color: '#64748B', label: 'Дополнительно' },
}

export function RoleRoadmap() {
  const [selected, setSelected] = useState(ROADMAPS[0].id)
  const [done, setDone] = useState<Set<string>>(new Set())

  const roadmap = ROADMAPS.find(r => r.id === selected)!
  const completedCount = roadmap.nodes.filter(n => done.has(n.id)).length
  const pct = Math.round((completedCount / roadmap.nodes.length) * 100)

  const toggleDone = (id: string) =>
    setDone(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span className="tag">Role Roadmap</span>
          <span className="tag" style={{ background: 'rgba(129,140,248,.1)', color: '#818CF8', borderColor: 'rgba(129,140,248,.25)' }}>
            Roadmap.sh стиль
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, var(--text-1), var(--accent))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          marginBottom: 8,
        }}>
          Учебные пути по ролям
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', maxWidth: 600, lineHeight: 1.7 }}>
          Выберите целевую роль — получите пошаговый план освоения навыков с интеграцией в тренажёры.
        </p>
      </section>

      {/* Role selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {ROADMAPS.map(r => (
          <button key={r.id} onClick={() => setSelected(r.id)}
            style={{
              padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600,
              background: selected === r.id ? `color-mix(in srgb, ${r.color} 15%, transparent)` : 'transparent',
              color: selected === r.id ? r.color : 'var(--text-2)',
              border: selected === r.id ? `1px solid color-mix(in srgb, ${r.color} 35%, transparent)` : '1px solid var(--border)',
              cursor: 'pointer', transition: 'all .15s',
            }}>
            {r.icon} {r.label}
          </button>
        ))}
      </div>

      {/* Roadmap header */}
      <div className="glass" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', marginBottom: 4 }}>
            {roadmap.icon} {roadmap.label}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-3)', maxWidth: 500 }}>{roadmap.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontWeight: 900, color: roadmap.color }}>{roadmap.estimated_months}</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)' }}>месяцев</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent)' }}>{pct}%</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)' }}>пройдено</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: 'var(--surface-4)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99, width: `${pct}%`,
          background: `linear-gradient(90deg, ${roadmap.color}, var(--accent))`,
          transition: 'width .4s ease',
        }} />
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_STYLE).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: v.color }} />
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{v.label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Пройдено</span>
        </div>
      </div>

      {/* Nodes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {roadmap.nodes.map((node, idx) => {
          const isDone = done.has(node.id)
          const st = STATUS_STYLE[node.status]
          const isLast = idx === roadmap.nodes.length - 1

          return (
            <div key={node.id} style={{ display: 'flex', gap: 0 }}>
              {/* Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
                <button
                  onClick={() => toggleDone(node.id)}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: isDone ? '#10B981' : `color-mix(in srgb, ${st.color} 15%, transparent)`,
                    border: isDone ? '2px solid #10B981' : `2px solid ${st.color}`,
                    cursor: 'pointer',
                    boxShadow: isDone ? '0 0 10px rgba(16,185,129,.4)' : 'none',
                    transition: 'all .2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: isDone ? '#fff' : st.color, fontWeight: 700,
                  }}>
                  {isDone ? '✓' : idx + 1}
                </button>
                {!isLast && (
                  <div style={{ width: 2, flex: 1, minHeight: 20, background: isDone ? '#10B981' : 'var(--border)', margin: '4px 0' }} />
                )}
              </div>

              {/* Card */}
              <div style={{
                flex: 1, marginLeft: 12, marginBottom: isLast ? 0 : 12,
                padding: '16px 18px', borderRadius: 12,
                background: isDone ? 'rgba(16,185,129,.04)' : 'var(--surface-2)',
                border: isDone ? '1px solid rgba(16,185,129,.2)' : '1px solid var(--border)',
                opacity: isDone ? .8 : 1,
                transition: 'all .2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: isDone ? 'var(--text-3)' : 'var(--text-1)', textDecoration: isDone ? 'line-through' : 'none' }}>
                        {node.title}
                      </p>
                      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: `color-mix(in srgb, ${st.color} 12%, transparent)`, color: st.color, border: `1px solid color-mix(in srgb, ${st.color} 25%, transparent)` }}>
                        {st.label}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>{node.desc}</p>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {node.skills.map(s => (
                        <span key={s} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'var(--surface-4)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  {node.trainer && (
                    <Link
                      to={`/trainer/${encodeURIComponent(node.trainer)}`}
                      style={{
                        padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: 'var(--accent-dim)', color: 'var(--accent)',
                        textDecoration: 'none',
                        border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                        flexShrink: 0, whiteSpace: 'nowrap',
                      }}>
                      🎯 Тренажёр
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom CTA */}
      {pct === 100 && (
        <div className="glass" style={{ padding: '28px', textAlign: 'center', border: '1px solid rgba(16,185,129,.3)' }}>
          <p style={{ fontSize: 36, marginBottom: 8 }}>🎉</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#10B981', marginBottom: 8 }}>
            Роль освоена!
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>
            Пора переходить к следующей роли или углублять навыки через Gap Analyzer.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link to="/gap-analyzer" style={{ padding: '10px 20px', borderRadius: 99, fontSize: 13, fontWeight: 600, background: '#10B981', color: '#fff', textDecoration: 'none' }}>
              ⊕ Gap Analyzer
            </Link>
            <Link to="/salary-calculator" style={{ padding: '10px 20px', borderRadius: 99, fontSize: 13, fontWeight: 600, background: 'var(--accent-dim)', color: 'var(--accent)', textDecoration: 'none', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}>
              💰 Проверить зарплату
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
