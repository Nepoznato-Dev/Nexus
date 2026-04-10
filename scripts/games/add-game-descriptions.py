#!/usr/bin/env python3
"""
Compatibility wrapper while root script is being phased out.
"""

from pathlib import Path
import runpy

repo_root = Path(__file__).resolve().parents[2]
runpy.run_path(str(repo_root / 'add-game-descriptions.py'), run_name='__main__')
