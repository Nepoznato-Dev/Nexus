import os


class Settings:
    HOST = os.getenv("ALLOY_PY_HOST", "127.0.0.1")
    PORT = int(os.getenv("ALLOY_PY_PORT", "5001"))
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
    OLLAMA_MODEL_TURBO = os.getenv("OLLAMA_MODEL_TURBO", "llama3.2:3b")
    OLLAMA_MODEL_LITE = os.getenv("OLLAMA_MODEL_LITE", "qwen2.5:7b")
    OLLAMA_MODEL_PLUS = os.getenv("OLLAMA_MODEL_PLUS", "qwen2.5:14b")
    OLLAMA_MODEL_PRO = os.getenv("OLLAMA_MODEL_PRO", "qwen2.5:32b")


settings = Settings()
