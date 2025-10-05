# Configuration Guide

## 📋 Overview

All application configuration is centralized in **`config.py`** - this is the **single source of truth**.

## 🎯 Configuration Flow

```
.env file
   ↓
config.py (reads from .env)
   ↓
app.py (loads from config.py)
   ↓
Application uses config
```

## 📁 File Structure

### `config.py` - **All Configuration Lives Here**

```python
class Config:
    # Flask Settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-value')
    
    # Database Settings
    POSTGRES_USER = os.getenv('POSTGRES_USER', 'postgres')
    # ... all other settings
    
    # GitHub OAuth Settings
    GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID')
    # ... etc
```

**✅ DO:** Add all new configuration here
**❌ DON'T:** Add configuration directly in `app.py`

### `app.py` - Application Setup

```python
def create_app(config_name='default'):
    app = Flask(__name__)
    
    # Load ALL config from config.py
    app.config.from_object(config[config_name])
    
    # ... rest of app setup
```

### `.env` - Environment Variables

```bash
# Set your actual values here
SECRET_KEY=your-secret-key
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
# ... etc
```

## 🔧 How to Add New Configuration

### 1. Add to `.env.example` (for documentation)

```bash
# My New Feature Configuration
MY_NEW_SETTING=default-value
```

### 2. Add to `config.py` (single source of truth)

```python
class Config:
    # ... existing config ...
    
    # My New Feature Configuration
    MY_NEW_SETTING = os.getenv('MY_NEW_SETTING', 'default-value')
```

### 3. Use in your code

```python
# In any Flask route or blueprint
from flask import current_app

@app.route('/my-route')
def my_route():
    my_setting = current_app.config['MY_NEW_SETTING']
    # ... use the setting
```

## 📝 Current Configuration Sections

### Flask Configuration
- `SECRET_KEY` - Flask secret key for sessions
- `DEBUG` - Debug mode (auto-set by environment)

### Database Configuration
- `POSTGRES_USER` - Database username
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DB` - Database name
- `POSTGRES_HOST` - Database host
- `POSTGRES_PORT` - Database port
- `SQLALCHEMY_DATABASE_URI` - Full database connection string
- `SQLALCHEMY_TRACK_MODIFICATIONS` - SQLAlchemy setting

### GitHub OAuth Configuration
- `GITHUB_CLIENT_ID` - GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth app secret
- `GITHUB_REDIRECT_URI` - OAuth callback URL

### JWT Configuration
- `JWT_SECRET_KEY` - Secret for signing JWT tokens
- `JWT_ALGORITHM` - JWT signing algorithm (HS256)
- `JWT_EXPIRATION_HOURS` - Token expiration time

## 🎨 Configuration Environments

### Development
```python
class DevelopmentConfig(Config):
    DEBUG = True
```

### Production
```python
class ProductionConfig(Config):
    DEBUG = False
```

### Usage
```python
# Default (development)
app = create_app()

# Explicit environment
app = create_app('production')
```

## ✅ Benefits of This Structure

1. **Single Source of Truth** - All config in one place
2. **Easy to Test** - Can create test configs easily
3. **Environment Specific** - Different configs for dev/prod
4. **Clear Defaults** - Fallback values are obvious
5. **Type Safe** - All values defined in one place
6. **Easy to Document** - All settings visible in one file

## 🚫 Common Mistakes to Avoid

### ❌ DON'T: Set config directly in app.py
```python
# BAD - Don't do this!
app.config['MY_SETTING'] = os.getenv('MY_SETTING')
```

### ✅ DO: Add to config.py
```python
# GOOD - Do this instead!
# In config.py
class Config:
    MY_SETTING = os.getenv('MY_SETTING', 'default')
```

### ❌ DON'T: Import os.getenv everywhere
```python
# BAD - Don't do this!
import os
my_value = os.getenv('MY_SETTING')
```

### ✅ DO: Use Flask config
```python
# GOOD - Do this instead!
from flask import current_app
my_value = current_app.config['MY_SETTING']
```

## 🔍 Accessing Configuration

### In Routes
```python
@app.route('/example')
def example():
    value = current_app.config['MY_SETTING']
    return jsonify({'value': value})
```

### In Blueprints
```python
from flask import current_app

@blueprint.route('/example')
def example():
    value = current_app.config['MY_SETTING']
    return jsonify({'value': value})
```

### In Utility Functions
```python
from flask import current_app

def my_utility_function():
    # Access config through current_app
    setting = current_app.config['MY_SETTING']
    # ... use it
```

## 🧪 Testing Configuration

```python
import pytest
from config import DevelopmentConfig, ProductionConfig

def test_development_config():
    assert DevelopmentConfig.DEBUG is True

def test_production_config():
    assert ProductionConfig.DEBUG is False
```

## 📚 Summary

- **All config → `config.py`**
- **Load config → `app.config.from_object()`**
- **Use config → `current_app.config['KEY']`**
- **Environment variables → `.env` file**

Simple, clean, and maintainable! 🎉


