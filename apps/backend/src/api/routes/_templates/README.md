# Route Templates

These route files are **not registered** in `main.py`. They are reference implementations
that require a real database backend before use.

| File             | Depends On                                             | Status                             |
| ---------------- | ------------------------------------------------------ | ---------------------------------- |
| `analytics.py`   | PostgreSQL metrics store                               | Template only — returns empty data |
| `contractors.py` | PostgreSQL `contractors` + `availability_slots` tables | Template only — returns 503        |

## To activate when forking

1. Review `scripts/init-db.sql` — both tables already exist in the schema.
2. Implement the SQLAlchemy queries in each route (replace `_raise_unavailable()` calls).
3. Import and register the router in `src/api/main.py`.
4. Write tests in `tests/api/test_contractors.py` and `tests/api/test_analytics.py`.
