# StormHacks 2025 Backend

Flask + PostgreSQL backend application with Docker support.

## Prerequisites

- Python 3.8+
- Docker and Docker Compose
- pip (Python package installer)
## Setup Instructions

### 1. Create a Virtual Environment (Recommended)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Up Environment Variables

Copy the example environment file and update if needed:

```bash
cp .env.example .env
```

Default configuration:
- Database: `stormhacks_db`
- User: `postgres`
- Password: `postgres`
- Host: `localhost`
- Port: `5432`

### 4. Start PostgreSQL with Docker

```bash
docker compose up -d
```

This will start a PostgreSQL container in the background.

To check if PostgreSQL is running:
```bash
docker compose ps
```

To view PostgreSQL logs:
```bash
docker compose logs -f postgres
```

### 5. Create Database Tables

```bash
python create_tables.py
```

This will create all the tables defined in `models.py`.

### 6. Populate Sample Data (Optional)

```bash
python populate_data.py
```

This will populate the database with sample users and posts.

### 7. Run the Flask Application

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check
- `GET /api/users` - Get all users
- `GET /api/posts` - Get all posts

## Database Management Scripts

### Create Tables

Creates all database tables defined in `models.py`:

```bash
python create_tables.py
```

### Drop Tables

Drops all database tables (with confirmation):

```bash
python drop_tables.py
```

**⚠️ WARNING:** This will delete all data in the database!

### Populate Data

Populates the database with sample data:

```bash
python populate_data.py
```

If data already exists, you'll be prompted to clear and repopulate.

## Database Models

### User Model

- `id` - Primary key
- `username` - Unique username
- `email` - Unique email address
- `created_at` - Timestamp when user was created

### Post Model

- `id` - Primary key
- `title` - Post title
- `content` - Post content
- `created_at` - Timestamp when post was created
- `user_id` - Foreign key to User

## Docker Commands

### Start PostgreSQL

```bash
docker compose up -d
```

### Stop PostgreSQL

```bash
docker compose down
```

### Stop and Remove Data

```bash
docker compose down -v
```

### Connect to PostgreSQL via psql

```bash
docker exec -it stormhacks_postgres psql -U postgres -d stormhacks_db
```

Useful psql commands:
- `\dt` - List all tables
- `\d+ table_name` - Describe a table
- `\q` - Quit psql

## Development Workflow

1. Start PostgreSQL: `docker compose up -d`
2. Activate virtual environment: `source venv/bin/activate`
3. Create tables: `python create_tables.py` (first time only)
4. Populate data: `python populate_data.py` (optional)
5. Run application: `python app.py`
6. Make changes and test
7. Stop PostgreSQL when done: `docker compose down`

## Troubleshooting

### Port 5432 already in use

If you have PostgreSQL already running locally:
- Stop the local PostgreSQL service, or
- Change the port in `docker compose.yml` and `.env`

### Cannot connect to database

1. Ensure PostgreSQL container is running: `docker compose ps`
2. Check the logs: `docker compose logs postgres`
3. Verify environment variables in `.env` match `docker compose.yml`

### Permission errors with Docker

You may need to run Docker commands with `sudo` or add your user to the docker group.

## Next Steps

- Add more models to `models.py`
- Implement POST, PUT, DELETE endpoints in `app.py`
- Add authentication and authorization
- Add data validation
- Add unit tests
- Set up migrations with Flask-Migrate

## License

MIT

