#!/usr/bin/env python
"""Test script to verify new training modules."""
import sys
sys.path.insert(0, 'backend')

from app.training_exercises import TRAINING_MODULES

print(f"Total modules: {len(TRAINING_MODULES)}\n")

new_modules = ['MLflow', 'scikit-learn', 'Computer Vision', 'Transformers']

for module_name in new_modules:
    if module_name in TRAINING_MODULES:
        module = TRAINING_MODULES[module_name]
        print(f"✓ {module_name}:")
        print(f"  Title: {module['title']}")
        print(f"  Icon: {module['icon']}")
        print(f"  Level: {module['level']}")
        print(f"  Exercises: {len(module['exercises'])}")
        
        # Check each exercise type
        ex_types = [ex['type'] for ex in module['exercises']]
        print(f"  Types: {', '.join(ex_types)}")
        print()
    else:
        print(f"✗ {module_name}: NOT FOUND\n")

print("\nAll modules:")
for name in TRAINING_MODULES.keys():
    print(f"  - {name}")
