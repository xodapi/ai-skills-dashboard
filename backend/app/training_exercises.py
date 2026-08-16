"""
Training exercises derived from real vacancy requirements.
Each module contains theory, code challenges, and practical tasks from actual job descriptions.
"""

TRAINING_MODULES = {
    # ===== Python =====
    "Python": {
        "title": "Python для ML/AI инженера",
        "icon": "🐍",
        "level": "intermediate",
        "theory": """
**Python** — основной язык для машинного обучения и AI-разработки.

**Ключевые концепции для ML:**
- Типизация (type hints) и валидация данных (Pydantic)
- Generators и итераторы для работы с большими датасетами
- Декораторы для кэширования и профилирования
- Context managers для управления ресурсами
- Asyncio для параллельной обработки данных

**Современные практики:**
- Python 3.10+ (match/case, structural pattern matching)
- Type annotations для всех публичных функций
- Dataclasses для структур данных
- Pathlib вместо os.path
- f-strings для форматирования
""",
        "exercises": [
            {
                "type": "quiz",
                "question": "Какой паттерн используется для ленивой загрузки больших датасетов?",
                "options": [
                    "List comprehension",
                    "Generator expression",
                    "Lambda function",
                    "Map function"
                ],
                "correct": 1,
                "explanation": "Generator expression загружает данные по требованию, не занимая память для всего датасета сразу."
            },
            {
                "type": "code",
                "title": "Реальная задача: парсинг вакансий HH.ru",
                "description": "Создайте функцию для парсинга JSON ответа HH.ru API с валидацией через Pydantic.",
                "starter_code": """from pydantic import BaseModel, Field
from typing import Optional
import json

class Salary(BaseModel):
    # TODO: добавьте поля from_, to, currency

class Vacancy(BaseModel):
    id: int
    name: str
    # TODO: добавьте salary, experience, skills
    
def parse_vacancies(json_data: str) -> list[Vacancy]:
    # TODO: реализуйте парсинг
    pass

# Тестовые данные
test_data = '''
{
  "items": [
    {
      "id": 12345,
      "name": "ML Engineer",
      "salary": {"from": 200000, "to": 350000, "currency": "RUR"},
      "experience": {"id": "between3And6"},
      "key_skills": [{"name": "Python"}, {"name": "PyTorch"}]
    }
  ]
}
'''

vacancies = parse_vacancies(test_data)
print(f"Распарсено вакансий: {len(vacancies)}")
""",
                "solution": """from pydantic import BaseModel, Field
from typing import Optional, List
import json

class Salary(BaseModel):
    from_: Optional[int] = Field(None, alias='from')
    to: Optional[int] = None
    currency: str

class Experience(BaseModel):
    id: str

class KeySkill(BaseModel):
    name: str

class Vacancy(BaseModel):
    id: int
    name: str
    salary: Optional[Salary] = None
    experience: Optional[Experience] = None
    key_skills: List[KeySkill] = Field(default_factory=list)

def parse_vacancies(json_data: str) -> list[Vacancy]:
    data = json.loads(json_data)
    return [Vacancy(**item) for item in data['items']]
""",
                "test_cases": [
                    {"input": "test_data", "expected": "1 vacancy parsed"},
                ]
            },
            {
                "type": "terminal",
                "title": "Профилирование ML кода",
                "description": "Найдите узкое место в коде обучения модели с помощью cProfile.",
                "command": "python -m cProfile -s cumtime train.py",
                "expected_output": "Топ функций по времени выполнения"
            }
        ]
    },

    # ===== PyTorch =====
    "PyTorch": {
        "title": "PyTorch для production ML",
        "icon": "🔥",
        "level": "advanced",
        "theory": """
**PyTorch** — ведущий фреймворк для разработки и обучения нейронных сетей.

**Production best practices:**
- torch.compile() для ускорения (Python 3.10+)
- torch.jit для экспорта моделей
- Automatic Mixed Precision (AMP) для ускорения на GPU
- DataLoader с num_workers для параллельной загрузки
- Gradient checkpointing для больших моделей

**Типичные задачи из вакансий:**
- Fine-tuning предобученных моделей (Vision Transformers, BERT)
- Оптимизация inference (ONNX, TensorRT)
- Distributed training (DDP, FSDP)
- Custom datasets и data augmentation
""",
        "exercises": [
            {
                "type": "quiz",
                "question": "Какой метод PyTorch используется для экономии GPU памяти при обучении больших моделей?",
                "options": [
                    "torch.cuda.empty_cache()",
                    "gradient_checkpointing",
                    "torch.no_grad()",
                    "model.eval()"
                ],
                "correct": 1,
                "explanation": "Gradient checkpointing сохраняет только часть активаций, пересчитывая остальные при backward pass."
            },
            {
                "type": "code",
                "title": "Реальная задача: fine-tuning BERT для классификации",
                "description": "Fine-tune предобученный BERT для классификации отзывов на вакансии (позитивные/негативные).",
                "starter_code": """import torch
from transformers import BertTokenizer, BertForSequenceClassification
from torch.utils.data import Dataset, DataLoader

class ReviewDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=128):
        # TODO: инициализация
        pass
    
    def __len__(self):
        # TODO
        pass
    
    def __getitem__(self, idx):
        # TODO: токенизация и возврат словаря
        pass

def train_epoch(model, dataloader, optimizer, device):
    model.train()
    total_loss = 0
    
    for batch in dataloader:
        # TODO: forward pass, loss, backward, optimizer step
        pass
    
    return total_loss / len(dataloader)

# Данные: отзывы о вакансиях
texts = [
    "Отличная компания, интересные задачи, современный стек",
    "Зарплата ниже рынка, переработки, устаревшие технологии",
]
labels = [1, 0]  # 1 = positive, 0 = negative

tokenizer = BertTokenizer.from_pretrained('bert-base-multilingual-cased')
model = BertForSequenceClassification.from_pretrained('bert-base-multilingual-cased', num_labels=2)
""",
                "solution": """import torch
from transformers import BertTokenizer, BertForSequenceClassification, AdamW
from torch.utils.data import Dataset, DataLoader

class ReviewDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = self.texts[idx]
        label = self.labels[idx]
        
        encoding = self.tokenizer(
            text,
            max_length=self.max_len,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )
        
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }

def train_epoch(model, dataloader, optimizer, device):
    model.train()
    total_loss = 0
    
    for batch in dataloader:
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['labels'].to(device)
        
        optimizer.zero_grad()
        
        outputs = model(
            input_ids=input_ids,
            attention_mask=attention_mask,
            labels=labels
        )
        
        loss = outputs.loss
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item()
    
    return total_loss / len(dataloader)
""",
                "test_cases": [
                    {"input": "2 reviews", "expected": "Dataset created, model trains without errors"},
                ]
            },
            {
                "type": "terminal",
                "title": "Экспорт модели в ONNX",
                "description": "Экспортируйте обученную модель в ONNX для production deployment.",
                "command": "python -m torch.onnx.export model.pth model.onnx --opset-version 14",
                "expected_output": "model.onnx создан успешно"
            }
        ]
    },

    # ===== Docker =====
    "Docker": {
        "title": "Docker для ML/AI приложений",
        "icon": "🐳",
        "level": "intermediate",
        "theory": """
**Docker** — стандарт для упаковки и deployment ML моделей.

**ML-специфичные практики:**
- Multi-stage builds для уменьшения размера образа
- CUDA base images для GPU inference
- Volume mounting для моделей и данных
- Health checks для ML API
- .dockerignore для исключения datasets

**Production patterns:**
- Separate images: training vs inference
- Layer caching для ускорения builds
- Non-root user для безопасности
- Graceful shutdown для сохранения состояния
""",
        "exercises": [
            {
                "type": "quiz",
                "question": "Какой base image нужен для PyTorch с CUDA 11.8?",
                "options": [
                    "python:3.10-slim",
                    "nvidia/cuda:11.8-base",
                    "pytorch/pytorch:2.0-cuda11.8-cudnn8-runtime",
                    "ubuntu:22.04"
                ],
                "correct": 2,
                "explanation": "Официальные PyTorch images уже включают CUDA и cuDNN нужных версий."
            },
            {
                "type": "code",
                "title": "Реальная задача: Dockerfile для FastAPI + PyTorch",
                "description": "Создайте production-ready Dockerfile для ML API с FastAPI и PyTorch.",
                "starter_code": """# TODO: выберите base image
FROM ???

WORKDIR /app

# TODO: установите системные зависимости
RUN apt-get update && apt-get install -y \\
    ???

# TODO: скопируйте requirements и установите Python зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# TODO: скопируйте код приложения
COPY . .

# TODO: создайте non-root пользователя

# TODO: укажите health check

# TODO: запустите приложение
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
""",
                "solution": """# Multi-stage build: training stage не нужен в production
FROM pytorch/pytorch:2.0.1-cuda11.8-cudnn8-runtime

WORKDIR /app

# Системные зависимости для FastAPI
RUN apt-get update && apt-get install -y \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Копируем requirements отдельно для кэширования layer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код приложения
COPY ./app ./app
COPY ./models ./models

# Non-root user для безопасности
RUN useradd -m -u 1000 ml && chown -R ml:ml /app
USER ml

# Health check для Kubernetes/Docker Swarm
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \\
    CMD curl -f http://localhost:8000/health || exit 1

# Expose порт
EXPOSE 8000

# Production server с несколькими workers
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
""",
                "test_cases": [
                    {"input": "docker build", "expected": "Image builds successfully"},
                ]
            },
            {
                "type": "terminal",
                "title": "Multi-stage build для оптимизации",
                "description": "Создайте multi-stage Dockerfile: builder для установки зависимостей, runtime для запуска.",
                "command": "docker build --target runtime -t ml-api:prod .",
                "expected_output": "Размер образа уменьшен на 40-60%"
            }
        ]
    },

    # ===== Kubernetes =====
    "Kubernetes": {
        "title": "Kubernetes для ML/AI систем",
        "icon": "☸️",
        "level": "advanced",
        "theory": """
**Kubernetes** — оркестрация ML моделей в production.

**ML-специфичные концепции:**
- GPU node pools и tolerations
- Horizontal Pod Autoscaler (HPA) для scaling по метрикам
- StatefulSets для stateful ML services
- PersistentVolumes для моделей и кэшей
- Init containers для загрузки моделей

**Deployment patterns:**
- Blue-green для A/B тестирования моделей
- Canary releases для постепенного раскатывания
- Resource limits (CPU/GPU/memory) для предсказуемости
- Liveness/readiness probes для health monitoring
""",
        "exercises": [
            {
                "type": "quiz",
                "question": "Какой ресурс Kubernetes нужен для требования GPU node?",
                "options": [
                    "nodeSelector",
                    "tolerations + taints",
                    "nvidia.com/gpu resource limit",
                    "Все вышеперечисленные"
                ],
                "correct": 3,
                "explanation": "Для GPU нужны все три: nodeSelector для выбора GPU nodes, tolerations для GPU taints, и resource limits для запроса GPU."
            },
            {
                "type": "code",
                "title": "Реальная задача: Deployment для ML API с GPU",
                "description": "Создайте Kubernetes Deployment для PyTorch inference API с GPU и autoscaling.",
                "starter_code": """apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-inference
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ml-inference
  template:
    metadata:
      labels:
        app: ml-inference
    spec:
      containers:
      - name: api
        image: ml-api:latest
        ports:
        - containerPort: 8000
        # TODO: добавьте resource limits для GPU
        # TODO: добавьте liveness и readiness probes
        # TODO: добавьте environment variables
      # TODO: добавьте nodeSelector для GPU nodes
      # TODO: добавьте tolerations для GPU taints
---
# TODO: создайте HorizontalPodAutoscaler
""",
                "solution": """apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-inference
  namespace: production
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ml-inference
  template:
    metadata:
      labels:
        app: ml-inference
    spec:
      containers:
      - name: api
        image: ml-api:v1.0.0
        ports:
        - containerPort: 8000
          name: http
        resources:
          requests:
            memory: "4Gi"
            cpu: "2000m"
            nvidia.com/gpu: 1
          limits:
            memory: "8Gi"
            cpu: "4000m"
            nvidia.com/gpu: 1
        env:
        - name: MODEL_PATH
          value: "/models/bert-classifier"
        - name: BATCH_SIZE
          value: "32"
        - name: MAX_WORKERS
          value: "4"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
        volumeMounts:
        - name: models
          mountPath: /models
          readOnly: true
      volumes:
      - name: models
        persistentVolumeClaim:
          claimName: ml-models-pvc
      nodeSelector:
        accelerator: nvidia-tesla-v100
      tolerations:
      - key: "nvidia.com/gpu"
        operator: "Equal"
        value: "true"
        effect: "NoSchedule"
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ml-inference-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ml-inference
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Pods
    pods:
      metric:
        name: inference_requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
""",
                "test_cases": [
                    {"input": "kubectl apply", "expected": "Deployment created, HPA active"},
                ]
            },
            {
                "type": "terminal",
                "title": "Debugging pod с GPU",
                "description": "Проверьте что pod видит GPU и может использовать CUDA.",
                "command": "kubectl exec -it ml-inference-xxx -- nvidia-smi",
                "expected_output": "NVIDIA GPU information displayed"
            }
        ]
    },

    # ===== LangChain =====
    "LangChain": {
        "title": "LangChain для production LLM apps",
        "icon": "🦜",
        "level": "intermediate",
        "theory": """
**LangChain** — фреймворк для построения LLM-приложений.

**Ключевые компоненты:**
- Chains — последовательность LLM вызовов
- Agents — автономные системы с tool use
- Memory — сохранение контекста между вызовами
- Retrievers — поиск релевантной информации (RAG)
- Callbacks — логирование и мониторинг

**Production patterns:**
- Structured output (Pydantic schemas)
- Caching для снижения costs
- Streaming для real-time ответов
- Error handling и retry logic
- Observability (LangSmith, LangFuse)
""",
        "exercises": [
            {
                "type": "quiz",
                "question": "Какой компонент LangChain используется для RAG (Retrieval Augmented Generation)?",
                "options": [
                    "Chain",
                    "VectorStore + Retriever",
                    "Agent",
                    "Memory"
                ],
                "correct": 1,
                "explanation": "VectorStore хранит эмбеддинги документов, Retriever находит релевантные chunks для контекста LLM."
            },
            {
                "type": "code",
                "title": "Реальная задача: RAG система для поиска вакансий",
                "description": "Создайте RAG pipeline для семантического поиска вакансий по описанию навыков.",
                "starter_code": """from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI

# Вакансии из нашей базы
vacancies = [
    {
        "id": 1,
        "title": "Senior ML Engineer",
        "description": "PyTorch, Computer Vision, 5+ years, CUDA optimization",
        "skills": ["Python", "PyTorch", "OpenCV", "CUDA"]
    },
    # TODO: добавьте еще вакансии
]

# TODO: создайте embeddings и vectorstore
embeddings = OpenAIEmbeddings()
texts = [f"{v['title']}: {v['description']}" for v in vacancies]

# TODO: создайте retriever и QA chain

# TODO: протестируйте запрос
query = "Найди вакансии для ML инженера с опытом в PyTorch"
""",
                "solution": """from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI
from langchain.docstore.document import Document

vacancies = [
    {
        "id": 1,
        "title": "Senior ML Engineer",
        "description": "PyTorch, Computer Vision, 5+ years, CUDA optimization",
        "skills": ["Python", "PyTorch", "OpenCV", "CUDA"]
    },
    {
        "id": 2,
        "title": "NLP Engineer",
        "description": "LLM fine-tuning, HuggingFace, RAG systems, 3+ years",
        "skills": ["Python", "Transformers", "LangChain", "FAISS"]
    },
    {
        "id": 3,
        "title": "MLOps Engineer",
        "description": "Kubernetes, Docker, Airflow, ML infrastructure, 4+ years",
        "skills": ["Python", "Kubernetes", "Docker", "Terraform"]
    },
]

# Создаём документы для векторного хранилища
documents = [
    Document(
        page_content=f"{v['title']}: {v['description']}. Skills: {', '.join(v['skills'])}",
        metadata={"id": v["id"], "title": v["title"]}
    )
    for v in vacancies
]

# Embeddings и vectorstore
embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(documents, embeddings)

# Retriever с параметрами поиска
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 3}
)

# QA chain с structured output
llm = OpenAI(temperature=0)
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True
)

# Запрос
query = "Найди вакансии для ML инженера с опытом в PyTorch"
result = qa_chain({"query": query})

print("Ответ:", result["result"])
print("Релевантные вакансии:")
for doc in result["source_documents"]:
    print(f"- {doc.metadata['title']}")
""",
                "test_cases": [
                    {"input": "PyTorch query", "expected": "Returns Senior ML Engineer vacancy"},
                ]
            }
        ]
    },

    # ===== SQL =====
    "SQL": {
        "title": "SQL для ML/AI аналитики",
        "icon": "🗄️",
        "level": "intermediate",
        "theory": """
**SQL** — обязательный навык для работы с данными в ML.

**Продвинутые концепции:**
- Window functions (ROW_NUMBER, LAG, LEAD)
- CTEs (Common Table Expressions) для читаемости
- Recursive queries для иерархий
- JSON operations (PostgreSQL jsonb)
- Query optimization (indexes, EXPLAIN ANALYZE)

**ML use cases:**
- Feature engineering через SQL
- Aggregations для статистики датасетов
- Joins для обогащения данных
- Temporal queries для time-series
""",
        "exercises": [
            {
                "type": "quiz",
                "question": "Какая window function используется для нумерации строк внутри партиции?",
                "options": [
                    "RANK()",
                    "ROW_NUMBER()",
                    "DENSE_RANK()",
                    "NTILE()"
                ],
                "correct": 1,
                "explanation": "ROW_NUMBER() даёт уникальный номер каждой строке внутри PARTITION BY, без пропусков при равных значениях."
            },
            {
                "type": "code",
                "title": "Реальная задача: топ навыков по зарплатам",
                "description": "Напишите SQL запрос для анализа: какие навыки дают наибольший рост зарплаты.",
                "starter_code": """-- Таблицы: vacancies, vacancy_skills, skills
-- vacancies: id, title, salary_from, salary_to
-- vacancy_skills: vacancy_id, skill_id
-- skills: id, name

-- TODO: напишите запрос который возвращает:
-- 1. Название навыка
-- 2. Среднюю зарплату для вакансий с этим навыком
-- 3. Количество вакансий
-- 4. Ранг навыка по средней зарплате
-- Отсортируйте по средней зарплате (убывание)

SELECT 
    -- TODO
FROM ...
""",
                "solution": """WITH skill_salaries AS (
    SELECT 
        s.name AS skill_name,
        AVG((v.salary_from + v.salary_to) / 2) AS avg_salary,
        COUNT(DISTINCT v.id) AS vacancy_count,
        STDDEV((v.salary_from + v.salary_to) / 2) AS salary_stddev
    FROM skills s
    JOIN vacancy_skills vs ON s.id = vs.skill_id
    JOIN vacancies v ON vs.vacancy_id = v.id
    WHERE v.salary_from IS NOT NULL 
      AND v.salary_to IS NOT NULL
    GROUP BY s.name
    HAVING COUNT(DISTINCT v.id) >= 5  -- Минимум 5 вакансий для статистики
)
SELECT 
    skill_name,
    ROUND(avg_salary, 0) AS avg_salary_rub,
    vacancy_count,
    ROUND(salary_stddev, 0) AS salary_stddev,
    ROW_NUMBER() OVER (ORDER BY avg_salary DESC) AS salary_rank,
    ROUND(avg_salary / LAG(avg_salary) OVER (ORDER BY avg_salary DESC) * 100 - 100, 1) AS pct_below_next
FROM skill_salaries
ORDER BY avg_salary DESC
LIMIT 20;

-- Результат покажет, например:
-- CUDA: 450K avg, 12 вакансий, rank 1
-- PyTorch: 380K avg, 45 вакансий, rank 2, -15.6% от CUDA
-- Python: 280K avg, 120 вакансий, rank 3, -26.3% от PyTorch
""",
                "test_cases": [
                    {"input": "Query execution", "expected": "Top 20 skills by salary with ranks"},
                ]
            },
            {
                "type": "terminal",
                "title": "Query optimization с EXPLAIN",
                "description": "Оптимизируйте медленный запрос используя EXPLAIN ANALYZE.",
                "command": "psql -d skills_db -c 'EXPLAIN ANALYZE SELECT ...'",
                "expected_output": "Query plan with execution time and index usage"
            }
        ]
    },
}
