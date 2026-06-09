import os
import sys
sys.path.append(os.getcwd())
from memory.vector_db import VectorMemory

vm = VectorMemory()
count = vm.collection.count()
print(f"Total entries: {count}")
results = vm.collection.get()
for id_, meta in zip(results['ids'], results['metadatas']):
    print(f"ID: {id_}, Status: {meta.get('status')}")
