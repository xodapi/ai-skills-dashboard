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

    # ===== MLflow =====
    "MLflow": {
        "title": "MLflow для ML experiment tracking",
        "icon": "📊",
        "level": "intermediate",
        "theory": """
**MLflow** — платформа для управления ML lifecycle: эксперименты, модели, deployment.

**Ключевые компоненты:**
- Tracking — логирование параметров, метрик, артефактов
- Projects — воспроизводимые эксперименты
- Models — packaging и deployment моделей
- Registry — централизованное хранилище моделей

**Production patterns:**
- Autologging для PyTorch/TensorFlow/scikit-learn
- Model versioning и stage transitions (Staging→Production)
- Model signature для валидации input/output
- Custom metrics и artifacts (confusion matrices, plots)
""",
        "exercises": [
            {
                "type": "quiz",
                "question": "Какой MLflow компонент используется для сохранения и загрузки обученных моделей?",
                "options": [
                    "mlflow.tracking",
                    "mlflow.models",
                    "mlflow.projects",
                    "mlflow.registry"
                ],
                "correct": 1,
                "explanation": "mlflow.models предоставляет API для сохранения моделей в универсальном формате с метаданными."
            },
            {
                "type": "code",
                "title": "Реальная задача: tracking эксперимента с PyTorch",
                "description": "Логируйте обучение PyTorch модели с метриками, параметрами и артефактами.",
                "starter_code": """import mlflow
import mlflow.pytorch
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

# Простая модель для классификации
class SimpleClassifier(nn.Module):
    def __init__(self, input_dim, hidden_dim, num_classes):
        super().__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, num_classes)
    
    def forward(self, x):
        return self.fc2(self.relu(self.fc1(x)))

# TODO: настройте MLflow tracking
# mlflow.set_experiment("vacancy_classifier")

# TODO: логируйте параметры (learning_rate, batch_size, epochs)
params = {
    "learning_rate": 0.001,
    "batch_size": 32,
    "hidden_dim": 128,
    "epochs": 10
}

model = SimpleClassifier(input_dim=100, hidden_dim=params["hidden_dim"], num_classes=5)
optimizer = torch.optim.Adam(model.parameters(), lr=params["learning_rate"])

# TODO: в цикле обучения логируйте метрики каждую эпоху

# TODO: сохраните модель с signature
""",
                "solution": """import mlflow
import mlflow.pytorch
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from mlflow.models.signature import infer_signature
import numpy as np

class SimpleClassifier(nn.Module):
    def __init__(self, input_dim, hidden_dim, num_classes):
        super().__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, num_classes)
    
    def forward(self, x):
        return self.fc2(self.relu(self.fc1(x)))

# Настройка MLflow
mlflow.set_tracking_uri("http://mlflow-server:5000")
mlflow.set_experiment("vacancy_classifier")

# Параметры эксперимента
params = {
    "learning_rate": 0.001,
    "batch_size": 32,
    "hidden_dim": 128,
    "epochs": 10,
    "optimizer": "adam"
}

# Начинаем run
with mlflow.start_run(run_name="baseline_v1"):
    # Логируем параметры
    mlflow.log_params(params)
    
    # Создаём модель
    model = SimpleClassifier(
        input_dim=100, 
        hidden_dim=params["hidden_dim"], 
        num_classes=5
    )
    optimizer = torch.optim.Adam(model.parameters(), lr=params["learning_rate"])
    criterion = nn.CrossEntropyLoss()
    
    # Включаем autologging для PyTorch
    mlflow.pytorch.autolog()
    
    # Цикл обучения
    for epoch in range(params["epochs"]):
        model.train()
        epoch_loss = 0
        epoch_acc = 0
        
        # Тренировочный цикл (упрощённо)
        # for batch in train_loader: ...
        
        # Логируем метрики
        mlflow.log_metrics({
            "train_loss": epoch_loss,
            "train_accuracy": epoch_acc,
        }, step=epoch)
    
    # Сохраняем модель с signature
    dummy_input = torch.randn(1, 100)
    signature = infer_signature(
        dummy_input.numpy(), 
        model(dummy_input).detach().numpy()
    )
    
    mlflow.pytorch.log_model(
        model, 
        "model",
        signature=signature,
        registered_model_name="vacancy_classifier"
    )
    
    # Логируем артефакты (confusion matrix, plots)
    # mlflow.log_artifact("confusion_matrix.png")
    
    print(f"Run ID: {mlflow.active_run().info.run_id}")
""",
                "test_cases": [
                    {"input": "Training run", "expected": "Metrics logged, model saved to MLflow"},
                ]
            },
            {
                "type": "terminal",
                "title": "Загрузка модели из Registry",
                "description": "Загрузите production версию модели из MLflow Registry.",
                "command": "mlflow models serve -m 'models:/vacancy_classifier/Production' -p 5001",
                "expected_output": "Model serving on port 5001"
            }
        ]
    },

    # ===== scikit-learn =====
    "scikit-learn": {
        "title": "scikit-learn для классического ML",
        "icon": "🔬",
        "level": "intermediate",
        "theory": """
**scikit-learn** — стандарт для классического машинного обучения.

**Production best practices:**
- Pipeline для объединения preprocessing + model
- ColumnTransformer для разных трансформаций
- GridSearchCV / RandomizedSearchCV для tuning
- cross_validate для честной оценки
- joblib для сериализации моделей

**Типичные задачи:**
- Feature engineering (StandardScaler, OneHotEncoder)
- Model selection (cross-validation, metrics)
- Ensemble methods (RandomForest, GradientBoosting)
- Dimensionality reduction (PCA, t-SNE)
""",
        "exercises": [
            {
                "type": "quiz",
                "question": "Какой компонент scikit-learn позволяет применять разные трансформации к разным колонкам?",
                "options": [
                    "Pipeline",
                    "ColumnTransformer",
                    "FeatureUnion",
                    "StandardScaler"
                ],
                "correct": 1,
                "explanation": "ColumnTransformer позволяет применять разные preprocessing шаги к числовым и категориальным признакам."
            },
            {
                "type": "code",
                "title": "Реальная задача: предсказание зарплаты по навыкам",
                "description": "Создайте Pipeline для предсказания зарплаты на основе навыков и опыта.",
                "starter_code": """from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score
import pandas as pd

# Датасет: вакансии с навыками
data = pd.DataFrame({
    'experience_years': [1, 3, 5, 2, 7, 4, 6, 3, 8, 5],
    'employment_type': ['full', 'full', 'remote', 'full', 'remote', 'full', 'remote', 'full', 'remote', 'full'],
    'has_python': [1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
    'has_pytorch': [0, 1, 1, 0, 1, 0, 1, 0, 1, 0],
    'has_docker': [0, 0, 1, 1, 1, 1, 1, 0, 1, 1],
    'salary': [80, 150, 280, 120, 400, 180, 350, 140, 500, 200]  # в тыс. руб.
})

X = data.drop('salary', axis=1)
y = data['salary']

# TODO: создайте ColumnTransformer
# - числовые признаки (experience_years) → StandardScaler
# - категориальные (employment_type) → OneHotEncoder
# - остальные (навыки) → passthrough

# TODO: создайте Pipeline с preprocessing + RandomForestRegressor

# TODO: оцените модель через cross-validation (MAE, R²)
""",
                "solution": """from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score, cross_validate
import pandas as pd
import numpy as np

data = pd.DataFrame({
    'experience_years': [1, 3, 5, 2, 7, 4, 6, 3, 8, 5],
    'employment_type': ['full', 'full', 'remote', 'full', 'remote', 'full', 'remote', 'full', 'remote', 'full'],
    'has_python': [1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
    'has_pytorch': [0, 1, 1, 0, 1, 0, 1, 0, 1, 0],
    'has_docker': [0, 0, 1, 1, 1, 1, 1, 0, 1, 1],
    'salary': [80, 150, 280, 120, 400, 180, 350, 140, 500, 200]
})

X = data.drop('salary', axis=1)
y = data['salary']

# Определяем типы признаков
numeric_features = ['experience_years']
categorical_features = ['employment_type']
skill_features = ['has_python', 'has_pytorch', 'has_docker']

# ColumnTransformer для разных preprocessing
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(drop='first', sparse_output=False), categorical_features),
        ('skills', 'passthrough', skill_features)
    ]
)

# Pipeline: preprocessing + model
pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('model', RandomForestRegressor(
        n_estimators=100,
        max_depth=5,
        random_state=42
    ))
])

# Cross-validation с несколькими метриками
scoring = ['neg_mean_absolute_error', 'r2']
cv_results = cross_validate(
    pipeline, X, y, 
    cv=3,  # 3-fold CV (мало данных)
    scoring=scoring,
    return_train_score=True
)

print("Cross-validation results:")
print(f"MAE: {-cv_results['test_neg_mean_absolute_error'].mean():.1f}K ± {cv_results['test_neg_mean_absolute_error'].std():.1f}K")
print(f"R²: {cv_results['test_r2'].mean():.3f} ± {cv_results['test_r2'].std():.3f}")

# Обучаем финальную модель
pipeline.fit(X, y)

# Feature importance
feature_names = (
    numeric_features + 
    list(pipeline.named_steps['preprocessor']
         .named_transformers_['cat']
         .get_feature_names_out(categorical_features)) +
    skill_features
)
importances = pipeline.named_steps['model'].feature_importances_

print("\\nTop features:")
for name, imp in sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)[:5]:
    print(f"  {name}: {imp:.3f}")
""",
                "test_cases": [
                    {"input": "Training data", "expected": "Pipeline trained, CV scores printed"},
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

    # ===== Computer Vision =====
    "Computer Vision": {
        "title": "Computer Vision для production",
        "icon": "👁️",
        "level": "advanced",
        "theory": """
**Computer Vision** — обработка и анализ изображений с помощью ML.

**Ключевые задачи:**
- Image classification (ResNet, EfficientNet, ViT)
- Object detection (YOLO, Faster R-CNN, DETR)
- Semantic segmentation (U-Net, DeepLab)
- Image generation (Stable Diffusion, DALL-E)

**Production patterns:**
- Data augmentation (albumentations, torchvision transforms)
- Transfer learning и fine-tuning
- Model optimization (quantization, pruning, distillation)
- Inference optimization (ONNX, TensorRT, OpenVINO)
- Preprocessing pipelines (resize, normalize, crop)

**Типичные требования в вакансиях:**
- Опыт с OpenCV, PIL, albumentations
- Fine-tuning SOTA моделей (CLIP, SAM, DINO)
- Deployment на edge devices (Raspberry Pi, Jetson)
- Real-time inference (30+ FPS)
""",
        "exercises": [
            {
                "type": "quiz",
                "question": "Какая библиотека даёт наиболее производительные augmentations для CV?",
                "options": [
                    "torchvision.transforms",
                    "imgaug",
                    "albumentations",
                    "PIL.ImageEnhance"
                ],
                "correct": 2,
                "explanation": "albumentations оптимизирована для скорости, поддерживает batched operations и работает быстрее аналогов."
            },
            {
                "type": "code",
                "title": "Реальная задача: fine-tuning ResNet для классификации скриншотов вакансий",
                "description": "Fine-tune предобученный ResNet для классификации скриншотов (IT/Finance/Healthcare/Retail).",
                "starter_code": """import torch
import torch.nn as nn
from torchvision import models, transforms
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import albumentations as A
from albumentations.pytorch import ToTensorV2

class VacancyScreenshotDataset(Dataset):
    def __init__(self, image_paths, labels, transform=None):
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform
    
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        # TODO: загрузите изображение, примените transforms
        pass

# TODO: создайте augmentation pipeline с albumentations
train_transform = A.Compose([
    # TODO: resize, rotate, normalize
])

# TODO: загрузите предобученный ResNet18
model = models.resnet18(pretrained=True)

# TODO: заморозьте backbone, замените последний слой для 4 классов

# TODO: обучите модель с transfer learning
""",
                "solution": """import torch
import torch.nn as nn
from torchvision import models
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import albumentations as A
from albumentations.pytorch import ToTensorV2
import numpy as np

class VacancyScreenshotDataset(Dataset):
    def __init__(self, image_paths, labels, transform=None):
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform
    
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        image = Image.open(self.image_paths[idx]).convert('RGB')
        image = np.array(image)
        
        if self.transform:
            augmented = self.transform(image=image)
            image = augmented['image']
        
        return image, self.labels[idx]

# Augmentation pipeline
train_transform = A.Compose([
    A.Resize(224, 224),
    A.HorizontalFlip(p=0.5),
    A.RandomBrightnessContrast(p=0.3),
    A.ShiftScaleRotate(shift_limit=0.05, scale_limit=0.05, rotate_limit=15, p=0.5),
    A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ToTensorV2()
])

val_transform = A.Compose([
    A.Resize(224, 224),
    A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ToTensorV2()
])

# Загрузка предобученной модели
model = models.resnet18(weights='IMAGENET1K_V1')

# Заморозка backbone (feature extractor)
for param in model.parameters():
    param.requires_grad = False

# Замена последнего слоя для 4 классов
num_classes = 4
model.fc = nn.Linear(model.fc.in_features, num_classes)

# Optimizer только для последнего слоя
optimizer = torch.optim.Adam(model.fc.parameters(), lr=0.001)

# Loss и training loop
criterion = nn.CrossEntropyLoss()
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = model.to(device)

def train_epoch(model, dataloader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    for images, labels in dataloader:
        images, labels = images.to(device), labels.to(device)
        
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()
    
    return running_loss / len(dataloader), 100. * correct / total

# После нескольких эпох можно разморозить backbone и fine-tune с меньшим lr
# for param in model.parameters():
#     param.requires_grad = True
# optimizer = torch.optim.Adam(model.parameters(), lr=0.0001)

print("Model ready for training")
print(f"Total parameters: {sum(p.numel() for p in model.parameters())}")
print(f"Trainable parameters: {sum(p.numel() for p in model.parameters() if p.requires_grad)}")
""",
                "test_cases": [
                    {"input": "Screenshot dataset", "expected": "Model trains, accuracy improves"},
                ]
            },
            {
                "type": "terminal",
                "title": "Экспорт модели в ONNX для production",
                "description": "Экспортируйте обученную ResNet в ONNX и проверьте inference speed.",
                "command": "python export_onnx.py && onnxruntime_perf_test model.onnx",
                "expected_output": "ONNX model exported, inference < 10ms per image"
            }
        ]
    },

    # ===== Transformers =====
    "Transformers": {
        "title": "Transformers (HuggingFace) для NLP/CV",
        "icon": "🤗",
        "level": "advanced",
        "theory": """
**Transformers** — библиотека HuggingFace для работы с transformer моделями.

**Поддерживаемые задачи:**
- NLP: BERT, GPT, T5, LLaMA (text classification, NER, QA, generation)
- Vision: ViT, CLIP, SAM (image classification, object detection)
- Multimodal: CLIP, Flamingo (image+text)
- Audio: Whisper, Wav2Vec2 (ASR, audio classification)

**Production patterns:**
- Pipeline API для быстрого inference
- Trainer API для fine-tuning
- Accelerate для distributed training
- PEFT (LoRA, QLoRA) для efficient fine-tuning
- Quantization (bitsandbytes, GPTQ)

**Требования в вакансиях:**
- Fine-tuning BERT/GPT на custom данных
- Prompt engineering для LLMs
- RAG системы с embeddings
- Inference optimization (batching, caching)
""",
        "exercises": [
            {
                "type": "quiz",
                "question": "Какая техника позволяет fine-tune LLM с минимальным использованием памяти?",
                "options": [
                    "Full fine-tuning",
                    "LoRA (Low-Rank Adaptation)",
                    "Gradient accumulation",
                    "Mixed precision training"
                ],
                "correct": 1,
                "explanation": "LoRA замораживает основные веса и обучает только low-rank адаптеры, экономя до 90% памяти."
            },
            {
                "type": "code",
                "title": "Реальная задача: NER для извлечения навыков из вакансий",
                "description": "Fine-tune BERT для Named Entity Recognition (NER) - извлечение названий навыков из текста вакансий.",
                "starter_code": """from transformers import (
    AutoTokenizer, 
    AutoModelForTokenClassification,
    TrainingArguments,
    Trainer,
    DataCollatorForTokenClassification
)
from datasets import Dataset
import torch

# Датасет: тексты вакансий с размеченными навыками
# Format: BIO tagging (B-SKILL, I-SKILL, O)
train_data = [
    {
        "tokens": ["Требуется", "опыт", "с", "Python", "и", "PyTorch"],
        "ner_tags": [0, 0, 0, 1, 0, 1]  # 0=O, 1=B-SKILL, 2=I-SKILL
    },
    # TODO: добавьте больше примеров
]

# TODO: создайте Dataset и токенизируйте

tokenizer = AutoTokenizer.from_pretrained("bert-base-multilingual-cased")
model = AutoModelForTokenClassification.from_pretrained(
    "bert-base-multilingual-cased",
    num_labels=3  # O, B-SKILL, I-SKILL
)

# TODO: настройте TrainingArguments и Trainer

# TODO: обучите модель и протестируйте на новом тексте
""",
                "solution": """from transformers import (
    AutoTokenizer, 
    AutoModelForTokenClassification,
    TrainingArguments,
    Trainer,
    DataCollatorForTokenClassification
)
from datasets import Dataset
import torch
import numpy as np

# Расширенный датасет
train_data = [
    {
        "tokens": ["Требуется", "опыт", "с", "Python", "и", "PyTorch"],
        "ner_tags": [0, 0, 0, 1, 0, 1]
    },
    {
        "tokens": ["Знание", "Docker", ",", "Kubernetes", "обязательно"],
        "ner_tags": [0, 1, 0, 1, 0]
    },
    {
        "tokens": ["ML", "Engineer", "со", "знанием", "TensorFlow"],
        "ner_tags": [1, 0, 0, 0, 1]
    },
]

label_names = ["O", "B-SKILL", "I-SKILL"]
id2label = {i: label for i, label in enumerate(label_names)}
label2id = {label: i for i, label in enumerate(label_names)}

# Tokenization с выравниванием labels
tokenizer = AutoTokenizer.from_pretrained("bert-base-multilingual-cased")

def tokenize_and_align_labels(examples):
    tokenized_inputs = tokenizer(
        examples["tokens"],
        truncation=True,
        is_split_into_words=True,
        padding=False
    )
    
    labels = []
    for i, label in enumerate(examples["ner_tags"]):
        word_ids = tokenized_inputs.word_ids(batch_index=i)
        label_ids = []
        previous_word_idx = None
        
        for word_idx in word_ids:
            if word_idx is None:
                label_ids.append(-100)  # Special tokens
            elif word_idx != previous_word_idx:
                label_ids.append(label[word_idx])
            else:
                label_ids.append(-100)  # Subword tokens
            previous_word_idx = word_idx
        
        labels.append(label_ids)
    
    tokenized_inputs["labels"] = labels
    return tokenized_inputs

# Создаём Dataset
dataset = Dataset.from_dict({
    "tokens": [ex["tokens"] for ex in train_data],
    "ner_tags": [ex["ner_tags"] for ex in train_data]
})
tokenized_dataset = dataset.map(
    tokenize_and_align_labels,
    batched=True,
    remove_columns=dataset.column_names
)

# Модель
model = AutoModelForTokenClassification.from_pretrained(
    "bert-base-multilingual-cased",
    num_labels=len(label_names),
    id2label=id2label,
    label2id=label2id
)

# Training arguments
training_args = TrainingArguments(
    output_dir="./ner_model",
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    num_train_epochs=3,
    weight_decay=0.01,
    logging_steps=10,
    save_strategy="epoch"
)

# Data collator для padding
data_collator = DataCollatorForTokenClassification(tokenizer)

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
    data_collator=data_collator,
    tokenizer=tokenizer
)

# Обучение
trainer.train()

# Inference на новом тексте
def extract_skills(text):
    inputs = tokenizer(text.split(), is_split_into_words=True, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    
    predictions = torch.argmax(outputs.logits, dim=2)
    predicted_labels = [id2label[p.item()] for p in predictions[0]]
    
    skills = []
    for token, label in zip(text.split(), predicted_labels[1:-1]):  # Skip [CLS] and [SEP]
        if label.startswith("B-"):
            skills.append(token)
    
    return skills

test_text = "Ищем ML Engineer с опытом в PyTorch и Docker"
print(f"Extracted skills: {extract_skills(test_text)}")
""",
                "test_cases": [
                    {"input": "Vacancy text", "expected": "Skills extracted: PyTorch, Docker"},
                ]
            },
            {
                "type": "terminal",
                "title": "Inference с batching для высокой пропускной способности",
                "description": "Используйте pipeline с batching для обработки 1000+ вакансий.",
                "command": "python batch_inference.py --batch-size 32 --num-workers 4",
                "expected_output": "Processed 1000 vacancies in < 30 seconds"
            }
        ]
    },

    # ===== scikit-learn =====
    "scikit-learn": {
        "title": "scikit-learn для ML инженера",
        "icon": "📊",
        "level": "intermediate",
        "theory": """
**scikit-learn** — классическая библиотека для машинного обучения.

**Ключевые компоненты:**
- Pipeline для композиции трансформеров и моделей
- ColumnTransformer для работы с гетерогенными данными
- GridSearchCV и RandomizedSearchCV для hyperparameter tuning
- Cross-validation для оценки обобщающей способности
- Feature importance и SHAP для интерпретируемости

**Реальные требования из вакансий:**
- Предсказание зарплат ML инженеров на основе навыков
- Clustering кандидатов по профилям компетенций
- Feature engineering из текстовых описаний вакансий
- Anomaly detection для выявления нерыночных предложений
""",
        "exercises": [
            {
                "type": "quiz",
                "question": "Какой estimator используется для кодирования категориальных фич в Pipeline?",
                "options": [
                    "LabelEncoder",
                    "OneHotEncoder",
                    "OrdinalEncoder",
                    "TargetEncoder"
                ],
                "correct": 1,
                "explanation": "OneHotEncoder создаёт binary колонки и интегрируется в Pipeline через ColumnTransformer."
            },
            {
                "type": "code",
                "title": "Pipeline для предсказания зарплаты",
                "description": "Создайте Pipeline с preprocessing и Random Forest для предсказания зарплат на основе навыков.",
                "template": """from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
import pandas as pd

# Данные: skills (список), experience_years (int), location (str), salary (target)
df = pd.DataFrame({
    'skills': [['Python', 'SQL'], ['PyTorch', 'Docker'], ['Kubernetes', 'Terraform']],
    'experience_years': [2, 5, 7],
    'location': ['Moscow', 'Remote', 'SPb'],
    'salary': [150000, 280000, 350000]
})

# TODO: Создайте ColumnTransformer для:
# 1. MultiLabelBinarizer для skills (custom transformer)
# 2. StandardScaler для experience_years
# 3. OneHotEncoder для location

# TODO: Создайте Pipeline с preprocessor и RandomForestRegressor

# TODO: Обучите модель и выведите feature importances
""",
                "solution": """from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder, FunctionTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import MultiLabelBinarizer
import pandas as pd
import numpy as np

class SkillsTransformer(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.mlb = MultiLabelBinarizer()
    def fit(self, X, y=None):
        self.mlb.fit(X)
        return self
    def transform(self, X):
        return self.mlb.transform(X)

df = pd.DataFrame({
    'skills': [['Python', 'SQL'], ['PyTorch', 'Docker'], ['Kubernetes', 'Terraform']],
    'experience_years': [2, 5, 7],
    'location': ['Moscow', 'Remote', 'SPb'],
    'salary': [150000, 280000, 350000]
})

preprocessor = ColumnTransformer([
    ('skills', SkillsTransformer(), 'skills'),
    ('experience', StandardScaler(), ['experience_years']),
    ('location', OneHotEncoder(handle_unknown='ignore'), ['location'])
])

pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
])

X = df[['skills', 'experience_years', 'location']]
y = df['salary']

pipeline.fit(X, y)

# Feature importances
feature_names = (
    list(pipeline.named_steps['preprocessor'].named_transformers_['skills'].mlb.classes_) +
    ['experience_years'] +
    list(pipeline.named_steps['preprocessor'].named_transformers_['location'].get_feature_names_out())
)
importances = pipeline.named_steps['regressor'].feature_importances_
for name, imp in sorted(zip(feature_names, importances), key=lambda x: -x[1])[:5]:
    print(f'{name}: {imp:.3f}')
"""
            },
            {
                "type": "terminal",
                "title": "Cross-validation с разными метриками",
                "description": "Оцените модель с помощью cross_val_score на MAE, RMSE и R².",
                "command": "python cv_evaluate.py --cv 5 --metrics mae rmse r2",
                "expected_output": "MAE: 15000, RMSE: 22000, R²: 0.85"
            }
        ]
    },

    # ===== Pandas =====
    "Pandas": {
        "title": "Pandas для анализа вакансий",
        "icon": "🐼",
        "level": "beginner",
        "theory": """
**Pandas** — библиотека для анализа табличных данных.

**Ключевые операции:**
- read_csv/read_json для загрузки данных
- groupby + agg для агрегации по группам
- merge/join для объединения датафреймов
- pivot_table для сводных таблиц
- rolling/expanding для временных рядов

**Реальные требования из вакансий:**
- EDA датасета вакансий: распределение зарплат, топ навыков
- Парсинг JSON-полей (skills, requirements) в структурированные колонки
- Заполнение пропусков в зарплатах (медиана по навыкам + опыту)
- Time series анализ: тренды спроса на навыки по месяцам
""",
        "exercises": [
            {
                "type": "quiz",
                "question": "Какой метод используется для группировки и агрегации нескольких колонок одновременно?",
                "options": [
                    "df.groupby().sum()",
                    "df.groupby().agg({'col1': 'mean', 'col2': 'sum'})",
                    "df.pivot_table()",
                    "df.aggregate()"
                ],
                "correct": 1,
                "explanation": "agg() принимает словарь с указанием разных функций для каждой колонки."
            },
            {
                "type": "code",
                "title": "EDA датасета вакансий",
                "description": "Загрузите CSV с вакансиями, найдите топ-5 навыков и медианную зарплату по опыту.",
                "template": """import pandas as pd
import json

# vacancies.csv: id, title, skills (JSON array), experience_years, salary
df = pd.read_csv('vacancies.csv')

# TODO: Распарсите колонку skills из JSON в списки
# df['skills'] = ...

# TODO: Explode skills в отдельные строки и найдите топ-5 навыков
# top_skills = ...

# TODO: Вычислите медианную зарплату по experience_years
# median_by_exp = ...

print("Top 5 skills:", top_skills)
print("Median salary by experience:", median_by_exp)
""",
                "solution": """import pandas as pd
import json

df = pd.read_csv('vacancies.csv')

# Parse skills from JSON
df['skills'] = df['skills'].apply(json.loads)

# Explode and count
skills_exploded = df.explode('skills')
top_skills = skills_exploded['skills'].value_counts().head(5)

# Median salary by experience
median_by_exp = df.groupby('experience_years')['salary'].median()

print("Top 5 skills:")
print(top_skills)
print("\\nMedian salary by experience:")
print(median_by_exp)
"""
            },
            {
                "type": "terminal",
                "title": "Pivot table для анализа зарплат по навыкам",
                "description": "Создайте сводную таблицу: rows=experience_years, columns=top_skill, values=mean(salary).",
                "command": "python pivot_analysis.py --top-skills 10",
                "expected_output": "Pivot table saved to salary_by_skill_exp.csv"
            }
        ]
    },

    # ===== FastAPI =====
    "FastAPI": {
        "title": "FastAPI для ML API",
        "icon": "⚡",
        "level": "intermediate",
        "theory": """
**FastAPI** — современный фреймворк для создания высокопроизводительных API.

**Ключевые возможности:**
- Автоматическая валидация через Pydantic models
- Async/await для неблокирующих операций
- Dependency Injection для управления зависимостями
- Background tasks для долгих операций
- Автогенерация OpenAPI документации

**Реальные требования из вакансий:**
- ML Inference API с батчингом запросов
- Rate limiting через Redis
- JWT аутентификация для приватных эндпоинтов
- Health checks и метрики Prometheus
- WebSocket для real-time уведомлений
""",
        "exercises": [
            {
                "type": "quiz",
                "question": "Какой декоратор используется для dependency injection в FastAPI?",
                "options": [
                    "@app.inject()",
                    "Depends()",
                    "@di.autowire",
                    "inject_dependency()"
                ],
                "correct": 1,
                "explanation": "Depends() — встроенная функция FastAPI для внедрения зависимостей в параметры функций."
            },
            {
                "type": "code",
                "title": "ML Inference API с Pydantic validation",
                "description": "Создайте POST /predict эндпоинт, который принимает список навыков и возвращает предсказанную зарплату.",
                "template": """from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator
from typing import List
import pickle

app = FastAPI(title="Salary Prediction API")

# TODO: Загрузите обученную модель при старте приложения
# (используйте lifespan events или глобальную переменную)

class PredictionRequest(BaseModel):
    skills: List[str] = Field(..., min_length=1, max_length=20)
    experience_years: int = Field(..., ge=0, le=50)
    location: str
    
    # TODO: Добавьте validator для skills — все навыки должны быть непустыми строками

class PredictionResponse(BaseModel):
    predicted_salary: float
    confidence: float

@app.post("/predict", response_model=PredictionResponse)
async def predict_salary(request: PredictionRequest):
    # TODO: Валидируйте входные данные
    # TODO: Сделайте предсказание через модель
    # TODO: Верните результат
    pass
""",
                "solution": """from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator
from typing import List
from contextlib import asynccontextmanager
import pickle
import numpy as np

ml_model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global ml_model
    # Load model on startup
    with open('salary_model.pkl', 'rb') as f:
        ml_model = pickle.load(f)
    yield
    # Cleanup on shutdown
    ml_model = None

app = FastAPI(title="Salary Prediction API", lifespan=lifespan)

class PredictionRequest(BaseModel):
    skills: List[str] = Field(..., min_length=1, max_length=20)
    experience_years: int = Field(..., ge=0, le=50)
    location: str
    
    @field_validator('skills')
    @classmethod
    def validate_skills(cls, v):
        if any(not s.strip() for s in v):
            raise ValueError('All skills must be non-empty strings')
        return [s.strip() for s in v]

class PredictionResponse(BaseModel):
    predicted_salary: float
    confidence: float

@app.post("/predict", response_model=PredictionResponse)
async def predict_salary(request: PredictionRequest):
    if ml_model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Prepare features
    X = {
        'skills': [request.skills],
        'experience_years': [request.experience_years],
        'location': [request.location]
    }
    
    # Predict
    prediction = ml_model.predict(pd.DataFrame(X))[0]
    
    # Calculate confidence (simplified: use model's estimators std)
    if hasattr(ml_model.named_steps['regressor'], 'estimators_'):
        predictions = [est.predict(ml_model.named_steps['preprocessor'].transform(pd.DataFrame(X)))[0] 
                      for est in ml_model.named_steps['regressor'].estimators_]
        confidence = 1.0 - (np.std(predictions) / prediction) if prediction > 0 else 0.5
    else:
        confidence = 0.75
    
    return PredictionResponse(
        predicted_salary=float(prediction),
        confidence=float(confidence)
    )
"""
            },
            {
                "type": "terminal",
                "title": "Load testing с locust",
                "description": "Запустите нагрузочное тестирование: 100 пользователей, 1000 запросов.",
                "command": "locust -f locustfile.py --headless -u 100 -r 10 -t 60s --host http://localhost:8000",
                "expected_output": "RPS > 500, p95 latency < 100ms"
            }
        ]
    },

    # ===== OpenCV =====
    "OpenCV": {
        "title": "OpenCV для Computer Vision",
        "icon": "👁️",
        "level": "intermediate",
        "theory": """
**OpenCV** — библиотека для компьютерного зрения и обработки изображений.

**Ключевые задачи:**
- Object detection (YOLO, Haar cascades, HOG)
- Face recognition и landmark detection
- Image preprocessing: resize, normalize, augmentation
- Video processing: frame extraction, tracking
- OCR интеграция (Tesseract)

**Реальные требования из вакансий:**
- Детектор документов на фото (паспорт, ИНН, СНИЛС)
- Face verification для биометрической авторизации
- QR/barcode scanner в реальном времени
- Детектор эмоций по видеопотоку с веб-камеры
""",
        "exercises": [
            {
                "type": "quiz",
                "question": "Какой формат использует OpenCV для представления изображений?",
                "options": [
                    "RGB numpy array",
                    "BGR numpy array",
                    "PIL Image",
                    "Tensor"
                ],
                "correct": 1,
                "explanation": "OpenCV использует BGR (Blue-Green-Red) порядок каналов вместо стандартного RGB."
            },
            {
                "type": "code",
                "title": "Детектор лиц с Haar Cascade",
                "description": "Реализуйте детектор лиц на изображении с рисованием bounding boxes.",
                "template": """import cv2
import numpy as np

def detect_faces(image_path: str) -> np.ndarray:
    # TODO: Загрузите изображение через cv2.imread()
    
    # TODO: Конвертируйте в grayscale
    
    # TODO: Загрузите Haar Cascade classifier для лиц
    # face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    # TODO: Детектируйте лица
    # faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
    
    # TODO: Нарисуйте прямоугольники вокруг лиц
    
    return image

# Test
result = detect_faces('group_photo.jpg')
cv2.imwrite('detected_faces.jpg', result)
print(f"Detected {len(faces)} faces")
""",
                "solution": """import cv2
import numpy as np

def detect_faces(image_path: str) -> np.ndarray:
    # Load image
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not load image: {image_path}")
    
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Load Haar Cascade
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )
    
    # Detect faces
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30)
    )
    
    # Draw rectangles
    for (x, y, w, h) in faces:
        cv2.rectangle(image, (x, y), (x+w, y+h), (0, 255, 0), 2)
    
    print(f"Detected {len(faces)} faces")
    return image

# Test
result = detect_faces('group_photo.jpg')
cv2.imwrite('detected_faces.jpg', result)
"""
            },
            {
                "type": "terminal",
                "title": "Real-time face detection с веб-камеры",
                "description": "Запустите детектор лиц в реальном времени с отображением FPS.",
                "command": "python realtime_face_detector.py --camera 0 --show-fps",
                "expected_output": "Window opens with face detection at 30+ FPS"
            }
        ]
    },

    # ===== Airflow =====
    "Airflow": {
        "title": "Apache Airflow для ML пайплайнов",
        "icon": "🌊",
        "level": "advanced",
        "theory": """
**Apache Airflow** — платформа для оркестрации data/ML пайплайнов.

**Ключевые концепции:**
- DAG (Directed Acyclic Graph) — граф задач с зависимостями
- Operators: PythonOperator, BashOperator, DockerOperator
- Sensors для ожидания внешних событий
- XCom для передачи данных между задачами
- Dynamic DAG generation

**Реальные требования из вакансий:**
- ETL пайплайн: загрузка вакансий с HH.ru → парсинг → сохранение в DWH
- ML training pipeline: data validation → preprocessing → training → evaluation → deployment
- Мониторинг пайплайнов через Slack/Telegram алерты
- Backfill для исторических данных
""",
        "exercises": [
            {
                "type": "quiz",
                "question": "Какой параметр DAG определяет расписание запуска?",
                "options": [
                    "cron_schedule",
                    "schedule_interval",
                    "trigger_rule",
                    "execution_date"
                ],
                "correct": 1,
                "explanation": "schedule_interval принимает cron-выражение или timedelta для определения периодичности."
            },
            {
                "type": "code",
                "title": "ML Training DAG с зависимостями",
                "description": "Создайте DAG для обучения модели: validate_data → preprocess → train → evaluate → deploy.",
                "template": """from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'ml-team',
    'depends_on_past': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
}

def validate_data(**context):
    # TODO: Проверьте наличие новых данных и их качество
    pass

def preprocess(**context):
    # TODO: Feature engineering, splitting
    pass

def train_model(**context):
    # TODO: Обучите модель, сохраните метрики в XCom
    pass

def evaluate_model(**context):
    # TODO: Получите метрики из XCom, проверьте пороги
    pass

def deploy_model(**context):
    # TODO: Если метрики прошли порог — деплой в prod
    pass

# TODO: Создайте DAG с расписанием (каждую ночь в 02:00)
# TODO: Добавьте задачи с правильными зависимостями
""",
                "solution": """from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.exceptions import AirflowSkipException
from datetime import datetime, timedelta
import json

default_args = {
    'owner': 'ml-team',
    'depends_on_past': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
    'start_date': datetime(2024, 1, 1),
}

def validate_data(**context):
    # Check data quality
    data_path = '/data/new_vacancies.csv'
    import pandas as pd
    df = pd.read_csv(data_path)
    
    if len(df) < 100:
        raise ValueError("Not enough data for training")
    
    if df['salary'].isnull().sum() > 0.3 * len(df):
        raise ValueError("Too many missing salaries")
    
    context['ti'].xcom_push(key='data_path', value=data_path)
    context['ti'].xcom_push(key='data_size', value=len(df))

def preprocess(**context):
    data_path = context['ti'].xcom_pull(key='data_path')
    # Feature engineering
    # Save processed data
    context['ti'].xcom_push(key='processed_path', value='/data/processed.parquet')

def train_model(**context):
    processed_path = context['ti'].xcom_pull(key='processed_path')
    # Train model
    metrics = {'rmse': 25000, 'r2': 0.87, 'mae': 18000}
    context['ti'].xcom_push(key='metrics', value=json.dumps(metrics))
    context['ti'].xcom_push(key='model_path', value='/models/rf_20240101.pkl')

def evaluate_model(**context):
    metrics = json.loads(context['ti'].xcom_pull(key='metrics'))
    
    # Check thresholds
    if metrics['r2'] < 0.80:
        raise ValueError(f"Model R² too low: {metrics['r2']}")
    
    if metrics['rmse'] > 30000:
        raise ValueError(f"RMSE too high: {metrics['rmse']}")
    
    print(f"Model passed evaluation: {metrics}")

def deploy_model(**context):
    model_path = context['ti'].xcom_pull(key='model_path')
    # Copy to production
    import shutil
    shutil.copy(model_path, '/prod/models/current.pkl')
    print(f"Deployed model: {model_path}")

with DAG(
    'ml_training_pipeline',
    default_args=default_args,
    schedule_interval='0 2 * * *',  # Daily at 02:00
    catchup=False,
    tags=['ml', 'training'],
) as dag:
    
    validate = PythonOperator(
        task_id='validate_data',
        python_callable=validate_data,
    )
    
    preprocess_task = PythonOperator(
        task_id='preprocess',
        python_callable=preprocess,
    )
    
    train = PythonOperator(
        task_id='train_model',
        python_callable=train_model,
    )
    
    evaluate = PythonOperator(
        task_id='evaluate_model',
        python_callable=evaluate_model,
    )
    
    deploy = PythonOperator(
        task_id='deploy_model',
        python_callable=deploy_model,
    )
    
    # Define dependencies
    validate >> preprocess_task >> train >> evaluate >> deploy
"""
            },
            {
                "type": "terminal",
                "title": "Запуск и мониторинг DAG",
                "description": "Запустите DAG и проверьте статус всех задач.",
                "command": "airflow dags trigger ml_training_pipeline && airflow dags list-runs -d ml_training_pipeline --state success",
                "expected_output": "All tasks succeeded in < 10 minutes"
            }
        ]
    },

    # ===== Terraform =====
    "Terraform": {
        "title": "Terraform для ML инфраструктуры",
        "icon": "🏗️",
        "level": "advanced",
        "theory": """
**Terraform** — Infrastructure as Code для автоматизации инфраструктуры.

**Ключевые концепции:**
- Resources и Data sources
- Variables и outputs для параметризации
- Modules для переиспользования
- State management (local/remote backend)
- Workspaces для разных окружений

**Реальные требования из вакансий:**
- Kubernetes кластер для ML сервисов (EKS/GKE/AKS)
- S3 buckets + IAM roles для data lake
- GPU instances для обучения моделей
- VPC с приватными/публичными подсетями
- Monitoring stack (Prometheus + Grafana)
""",
        "exercises": [
            {
                "type": "quiz",
                "question": "Какая команда применяет изменения в инфраструктуре?",
                "options": [
                    "terraform plan",
                    "terraform apply",
                    "terraform deploy",
                    "terraform provision"
                ],
                "correct": 1,
                "explanation": "terraform apply создаёт/изменяет ресурсы согласно конфигурации после подтверждения."
            },
            {
                "type": "code",
                "title": "S3 bucket для ML артефактов",
                "description": "Создайте S3 bucket с versioning и lifecycle policy для старых моделей.",
                "template": """# main.tf

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "eu-central-1"
}

variable "bucket_name" {
  description = "Name for ML artifacts bucket"
}

# TODO: Создайте S3 bucket с:
# - versioning enabled
# - lifecycle rule: delete versions older than 90 days
# - server-side encryption (AES256)
# - block public access

# TODO: Создайте IAM policy для чтения/записи в этот bucket

# TODO: Output bucket ARN
""",
                "solution": """# main.tf

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "eu-central-1"
}

variable "bucket_name" {
  description = "Name for ML artifacts bucket"
}

resource "aws_s3_bucket" "ml_artifacts" {
  bucket = var.bucket_name
  
  tags = {
    Name        = "ML Artifacts"
    Environment = terraform.workspace
  }
}

resource "aws_s3_bucket_versioning" "ml_artifacts" {
  bucket = aws_s3_bucket.ml_artifacts.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "ml_artifacts" {
  bucket = aws_s3_bucket.ml_artifacts.id
  
  rule {
    id     = "delete-old-versions"
    status = "Enabled"
    
    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "ml_artifacts" {
  bucket = aws_s3_bucket.ml_artifacts.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "ml_artifacts" {
  bucket = aws_s3_bucket.ml_artifacts.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_iam_policy" "ml_artifacts_access" {
  name        = "ml-artifacts-access"
  description = "Access to ML artifacts bucket"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.ml_artifacts.arn,
          "\${aws_s3_bucket.ml_artifacts.arn}/*"
        ]
      }
    ]
  })
}

output "bucket_arn" {
  value       = aws_s3_bucket.ml_artifacts.arn
  description = "ARN of the ML artifacts bucket"
}

output "bucket_name" {
  value       = aws_s3_bucket.ml_artifacts.id
  description = "Name of the ML artifacts bucket"
}
"""
            },
            {
                "type": "terminal",
                "title": "Plan и apply инфраструктуры",
                "description": "Проверьте план изменений и примените конфигурацию.",
                "command": "terraform init && terraform plan -var='bucket_name=ml-artifacts-prod' && terraform apply -auto-approve",
                "expected_output": "Apply complete! Resources: 5 added, 0 changed, 0 destroyed"
            }
        ]
    },

    # ===== AI-Native Engineering =====
    "AI Native": {
        "title": "AI-Native Engineering",
        "icon": "🤖",
        "level": "advanced",
        "theory": """
**AI-native engineering** — это управление качеством, архитектурой и результатом,
когда AI-агенты выполняют значительную часть реализации.

**Ключевые навыки:**
- проверять AI-generated code, особенно границы безопасности и доверия;
- декомпозировать работу между агентами и принимать результаты;
- удерживать архитектуру простой и соответствующей требованиям;
- расследовать инциденты в кодовой базе, созданной с помощью AI;
- превращать запрос продукта в ограниченный, проверяемый MVP-план.

AI не заменяет инженерное суждение: итоговая ответственность за безопасность,
стоимость, эксплуатацию и пользовательский результат остаётся у человека.
""",
        "exercises": [
            {
                "type": "code",
                "title": "AI Code Review: OAuth Security",
                "description": "AI-агент сгенерировал callback для OAuth. Проведите ревью: найдите минимум пять проблем и предложите безопасные исправления. Не доверяйте коду только потому, что он выглядит завершённым.",
                "starter_code": """# AI-generated draft — review before production
@app.get("/auth/callback")
async def callback(code: str, state: str | None = None):
    access_token = await exchange_code(code)
    user = await github.get_user(access_token)
    db_user = await db.get_or_create(email=user["email"])
    token = jwt.encode({"sub": db_user.id}, SECRET_KEY, algorithm="HS256")
    response = RedirectResponse(f"https://app.example.com/profile?token={token}")
    response.set_cookie("session", access_token)
    return response
""",
                "solution": """Review checklist:
1. Validate state against a server-generated, short-lived value.
2. Never put an access or JWT token in a URL.
3. Do not store the provider access token in a client-readable cookie.
4. Use an HttpOnly, Secure, SameSite cookie for the session.
5. Validate the OAuth response and identity before creating a user.
6. Use an explicit JWT algorithm allow-list and expiry.
7. Avoid account linking by unverified or ambiguous email alone.""",
                "test_cases": [
                    {"input": "security review", "expected": "At least five concrete findings with remediations"},
                ],
                "ai_native": True,
                "badge": "Security Hawk",
                "xp": 50,
            },
            {
                "type": "quiz",
                "title": "Orchestrate 3 agents",
                "question": "Какой порядок лучше всего снижает риск при работе трёх AI-агентов над MVP?",
                "options": [
                    "Параллельно попросить всех агентов сразу написать весь продукт и выбрать самый длинный результат",
                    "Сначала зафиксировать контракт и критерии приёмки, затем распределить задачи, после чего провести интеграцию и независимую проверку",
                    "Передать одного агента другому без общего контекста и принять последний ответ",
                    "Запретить тестирование, чтобы не замедлять AI-разработку"
                ],
                "correct": 1,
                "explanation": "Контракт, границы ответственности и независимая проверка превращают набор агентов в управляемый процесс, а не в конкуренцию за самый большой diff.",
                "ai_native": True,
                "badge": "Agent Whisperer",
                "xp": 50,
            },
            {
                "type": "terminal",
                "title": "Production Incident: AI-generated latency",
                "description": "После релиза endpoint стал отвечать 5 секунд. Составьте последовательность диагностики, найдите вероятное N+1 и определите безопасный rollback или hotfix.",
                "command": "curl -w 'time_total=%{time_total}\\n' -sS https://api.example.com/recommendations && docker compose logs --since=10m api",
                "expected_output": "Гипотеза → измерение → минимальное исправление → проверка latency/error rate → postmortem",
                "time_limit_seconds": 900,
                "ai_native": True,
                "badge": "5-Minute Hero",
                "xp": 50,
            },
            {
                "type": "code",
                "title": "Architecture Review: 15 microservices",
                "description": "AI предложил 15 микросервисов для MVP из двух команд и одной базы данных. Перепишите план так, чтобы сохранить требования и уменьшить операционную сложность.",
                "starter_code": """# AI proposal
services = [
    "auth", "profiles", "skills", "recommendations", "search",
    "notifications", "billing", "audit", "analytics", "exports",
    "scheduler", "gateway", "feature_flags", "moderation", "email"
]
# Requirements: launch in 2 weeks, 2 engineers, one PostgreSQL instance.
# Task: propose a smaller deployable architecture and explain trade-offs.
""",
                "solution": """A reasonable MVP:
- one modular FastAPI service with clear internal boundaries;
- one worker process for async jobs;
- PostgreSQL and Redis only where justified;
- external provider for email/identity if available;
- explicit seams for extracting a service after scale or ownership requires it.

Measure operational load and domain boundaries before splitting services.""",
                "ai_native": True,
                "badge": "System Designer",
                "xp": 50,
            },
            {
                "type": "quiz",
                "title": "Scope MVP with AI leverage",
                "question": "Что должно быть зафиксировано до того, как AI-агенты начнут реализацию MVP?",
                "options": [
                    "Только список библиотек и желаемый объём сгенерированного кода",
                    "Пользовательская проблема, критерии успеха, ограничения, риски, границы MVP и способ проверки результата",
                    "Максимально широкий backlog без приоритета, чтобы агенты выбрали сами",
                    "Только визуальный макет без API-контрактов и критериев приёмки"
                ],
                "correct": 1,
                "explanation": "AI ускоряет реализацию, но не заменяет продуктовые решения. Границы и критерии позволяют оценить ценность и не разогнать scope.",
                "ai_native": True,
                "badge": "Product Thinker",
                "xp": 50,
            },
        ],
    },
}
