# fizicamd-backend (Modular Monolith)

## Requirements
- Java 21
- PostgreSQL
- Gradle (or generated wrapper)

## Setup DB (example)
```sql
CREATE DATABASE fizicamd;
CREATE USER fizicamd WITH PASSWORD 'fizicamd';
GRANT ALL PRIVILEGES ON DATABASE fizicamd TO fizicamd;
