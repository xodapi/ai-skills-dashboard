"""
Skill extraction from vacancy text using NLP and pattern matching.
"""
import re
from typing import List, Set, Dict
from collections import Counter


class SkillExtractor:
    """Extract skills from vacancy descriptions."""
    
    # Comprehensive AI/ML skills dictionary
    SKILL_PATTERNS = {
        # Programming Languages
        "Python": r"\b(python|питон)\b",
        "R": r"\b(R|язык R)\b",
        "Julia": r"\b(julia|джулия)\b",
        "Java": r"\b(java)\b",
        "C++": r"\b(c\+\+|cpp)\b",
        "Scala": r"\b(scala|скала)\b",
        "SQL": r"\b(sql|т-sql|pl\/sql)\b",
        
        # ML Frameworks
        "TensorFlow": r"\b(tensorflow|тензорфлоу)\b",
        "PyTorch": r"\b(pytorch|пайторч)\b",
        "Keras": r"\b(keras|керас)\b",
        "scikit-learn": r"\b(scikit-learn|sklearn)\b",
        "XGBoost": r"\b(xgboost|градиентный бустинг)\b",
        "LightGBM": r"\b(lightgbm)\b",
        "CatBoost": r"\b(catboost)\b",
        
        # Deep Learning
        "Deep Learning": r"\b(deep learning|глубокое обучение|dl)\b",
        "Neural Networks": r"\b(neural networks?|нейронные? сети?|nn)\b",
        "CNN": r"\b(cnn|convolutional neural network|сверточные? сети?)\b",
        "RNN": r"\b(rnn|recurrent neural network|рекуррентные? сети?)\b",
        "LSTM": r"\b(lstm|long short[- ]term memory)\b",
        "Transformer": r"\b(transformer|трансформер)\b",
        "BERT": r"\b(bert)\b",
        "GPT": r"\b(gpt|generative pre[- ]trained transformer)\b",
        
        # Computer Vision
        "Computer Vision": r"\b(computer vision|компьютерное зрение|cv)\b",
        "OpenCV": r"\b(opencv)\b",
        "Image Processing": r"\b(image processing|обработка изображений)\b",
        "Object Detection": r"\b(object detection|детекция объектов|yolo)\b",
        "Segmentation": r"\b(segmentation|сегментация)\b",
        
        # NLP
        "NLP": r"\b(nlp|natural language processing|обработка естественного языка)\b",
        "LLM": r"\b(llm|large language model|большие? языковые? модели?)\b",
        "RAG": r"\b(rag|retrieval[- ]augmented generation)\b",
        "Embeddings": r"\b(embeddings?|эмбеддинги?)\b",
        "Tokenization": r"\b(tokenization|токенизация)\b",
        "spaCy": r"\b(spacy)\b",
        "NLTK": r"\b(nltk)\b",
        "Hugging Face": r"\b(hugging ?face|transformers)\b",
        
        # Data Science
        "Machine Learning": r"\b(machine learning|ml|машинное обучение)\b",
        "Data Science": r"\b(data science|наука о данных|ds)\b",
        "Statistics": r"\b(statistics|статистика)\b",
        "Probability": r"\b(probability|вероятность)\b",
        "Linear Algebra": r"\b(linear algebra|линейная алгебра)\b",
        "Optimization": r"\b(optimization|оптимизация)\b",
        
        # Data Processing
        "Pandas": r"\b(pandas)\b",
        "NumPy": r"\b(numpy)\b",
        "SciPy": r"\b(scipy)\b",
        "Dask": r"\b(dask)\b",
        "Spark": r"\b(spark|apache spark|pyspark)\b",
        "Hadoop": r"\b(hadoop)\b",
        
        # Databases
        "PostgreSQL": r"\b(postgres|postgresql)\b",
        "MySQL": r"\b(mysql)\b",
        "MongoDB": r"\b(mongodb|монго)\b",
        "Redis": r"\b(redis)\b",
        "Elasticsearch": r"\b(elasticsearch|эластик)\b",
        "ClickHouse": r"\b(clickhouse|кликхаус)\b",
        "Vector DB": r"\b(vector database|chromadb|pinecone|milvus|weaviate)\b",
        
        # MLOps
        "MLOps": r"\b(mlops|ml ops)\b",
        "Docker": r"\b(docker|докер)\b",
        "Kubernetes": r"\b(kubernetes|k8s|кубернетес)\b",
        "MLflow": r"\b(mlflow)\b",
        "Kubeflow": r"\b(kubeflow)\b",
        "Airflow": r"\b(airflow)\b",
        "CI/CD": r"\b(ci\/cd|cicd|continuous integration)\b",
        
        # Cloud
        "AWS": r"\b(aws|amazon web services)\b",
        "GCP": r"\b(gcp|google cloud)\b",
        "Azure": r"\b(azure|microsoft azure)\b",
        "Yandex Cloud": r"\b(yandex cloud|яндекс облако)\b",
        
        # Visualization
        "Matplotlib": r"\b(matplotlib)\b",
        "Seaborn": r"\b(seaborn)\b",
        "Plotly": r"\b(plotly)\b",
        "Tableau": r"\b(tableau)\b",
        "Power BI": r"\b(power ?bi|powerbi)\b",
        
        # Version Control
        "Git": r"\b(git|гит)\b",
        "GitHub": r"\b(github|гитхаб)\b",
        "GitLab": r"\b(gitlab)\b",
        
        # Specialized
        "Reinforcement Learning": r"\b(reinforcement learning|обучение с подкреплением|rl)\b",
        "Time Series": r"\b(time series|временные ряды)\b",
        "Recommendation Systems": r"\b(recommendation systems?|рекомендательные? системы?)\b",
        "A/B Testing": r"\b(a\/b testing|аб[- ]тестирование)\b",
        "Feature Engineering": r"\b(feature engineering|разработка признаков)\b",
        "Model Deployment": r"\b(model deployment|развертывание моделей)\b",
        "AutoML": r"\b(automl|автоматическое машинное обучение)\b",
    }
    
    def __init__(self):
        # Compile regex patterns for performance
        self.compiled_patterns = {
            skill: re.compile(pattern, re.IGNORECASE)
            for skill, pattern in self.SKILL_PATTERNS.items()
        }
    
    def extract_skills(self, text: str) -> List[str]:
        """
        Extract skills from text.
        
        Args:
            text: Vacancy description or requirements text
            
        Returns:
            List of detected skill names
        """
        if not text:
            return []
        
        detected_skills = []
        text_lower = text.lower()
        
        for skill, pattern in self.compiled_patterns.items():
            if pattern.search(text_lower):
                detected_skills.append(skill)
        
        return detected_skills
    
    def extract_skills_with_frequency(
        self, 
        text: str
    ) -> Dict[str, int]:
        """
        Extract skills and count their frequency.
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary with skill names and occurrence counts
        """
        if not text:
            return {}
        
        text_lower = text.lower()
        skill_counts = {}
        
        for skill, pattern in self.compiled_patterns.items():
            matches = pattern.findall(text_lower)
            if matches:
                skill_counts[skill] = len(matches)
        
        return skill_counts
    
    def normalize_skill_name(self, skill: str) -> str:
        """
        Normalize skill name to canonical form.
        
        Args:
            skill: Raw skill name
            
        Returns:
            Normalized skill name
        """
        # Remove special characters and normalize spacing
        normalized = re.sub(r'[^\w\s\+\#\.]', '', skill)
        normalized = ' '.join(normalized.split())
        
        # Capitalize properly
        if normalized.lower() in ['sql', 'nlp', 'cnn', 'rnn', 'lstm', 'bert', 'gpt', 'mlops', 'aws', 'gcp']:
            return normalized.upper()
        
        return normalized.title()
    
    def get_skill_category(self, skill: str) -> str:
        """
        Get category for a skill.
        
        Args:
            skill: Skill name
            
        Returns:
            Category name
        """
        categories = {
            "Programming": ["Python", "R", "Julia", "Java", "C++", "Scala", "SQL"],
            "ML Frameworks": ["TensorFlow", "PyTorch", "Keras", "scikit-learn", "XGBoost", "LightGBM", "CatBoost"],
            "Deep Learning": ["Deep Learning", "Neural Networks", "CNN", "RNN", "LSTM", "Transformer", "BERT", "GPT"],
            "Computer Vision": ["Computer Vision", "OpenCV", "Image Processing", "Object Detection", "Segmentation"],
            "NLP": ["NLP", "LLM", "RAG", "Embeddings", "Tokenization", "spaCy", "NLTK", "Hugging Face"],
            "Data Science": ["Machine Learning", "Data Science", "Statistics", "Probability", "Linear Algebra", "Optimization"],
            "Data Processing": ["Pandas", "NumPy", "SciPy", "Dask", "Spark", "Hadoop"],
            "Databases": ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "ClickHouse", "Vector DB"],
            "MLOps": ["MLOps", "Docker", "Kubernetes", "MLflow", "Kubeflow", "Airflow", "CI/CD"],
            "Cloud": ["AWS", "GCP", "Azure", "Yandex Cloud"],
            "Visualization": ["Matplotlib", "Seaborn", "Plotly", "Tableau", "Power BI"],
            "Version Control": ["Git", "GitHub", "GitLab"],
            "Specialized": ["Reinforcement Learning", "Time Series", "Recommendation Systems", "A/B Testing", "Feature Engineering", "Model Deployment", "AutoML"],
        }
        
        for category, skills in categories.items():
            if skill in skills:
                return category
        
        return "Other"


# Test
if __name__ == "__main__":
    extractor = SkillExtractor()
    
    test_text = """
    Требования: опыт работы с Python, TensorFlow, PyTorch.
    Знание машинного обучения, deep learning, NLP.
    Опыт работы с Docker, Kubernetes, AWS.
    Знание SQL, PostgreSQL, MongoDB.
    """
    
    skills = extractor.extract_skills(test_text)
    print(f"Detected skills: {skills}")
    
    for skill in skills:
        category = extractor.get_skill_category(skill)
        print(f"  {skill} -> {category}")
