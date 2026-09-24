import shutil
import os

src = r"C:\Users\Usuario Libre\AppData\Local\Temp\marco_legal_embeddings_vertex.json"
dst = os.path.join(os.path.dirname(__file__), "..", "data", "marco_legal_embeddings_vertex.json")
dst = os.path.abspath(dst)
os.makedirs(os.path.dirname(dst), exist_ok=True)

if os.path.exists(src):
    shutil.copyfile(src, dst)
    print(f"Copied successfully to {dst}, size: {os.path.getsize(dst)}")
else:
    print(f"Source not found: {src}")
