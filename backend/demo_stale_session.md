# Stale Session Auto-Close Feature

## Overview

The activity API now automatically closes "stale" sessions that haven't been updated in more than 5 minutes.

## How It Works

When you try to start a new typing session:

1. **If there's no active session**: A new session is created normally
2. **If there's an active session less than 5 minutes old**: Returns error 400
3. **If there's an active session more than 5 minutes old**: 
   - Automatically closes the stale session (sets `ended_at = updated_at`)
   - Creates the new session
   - Returns both the closed and new session info

## Example

### Scenario: User forgot to end their session

```bash
# User starts a session at 10:00 AM
curl -X POST http://localhost:5000/api/activity/start \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"language_tag": "python", "source": "vscode"}'

# ... User forgets to end the session ...

# 6 minutes later at 10:06 AM, user tries to start a new session
curl -X POST http://localhost:5000/api/activity/start \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"language_tag": "javascript", "source": "web"}'
```

### Response (Success - Auto-closed)

```json
{
  "success": true,
  "message": "Stale session auto-closed and new session started",
  "session": {
    "typing_id": 9,
    "language_tag": "javascript",
    "source": "web",
    "started_at": "2025-10-05T10:06:00Z",
    "ended_at": null,
    ...
  },
  "auto_closed_session": {
    "typing_id": 8,
    "language_tag": "python",
    "source": "vscode",
    "started_at": "2025-10-05T10:00:00Z",
    "ended_at": "2025-10-05T10:00:00Z",
    "duration_seconds": 0,
    ...
  }
}
```

## Configuration

The timeout is currently set to **5 minutes (300 seconds)**.

To change this, modify the constant in `activity.py`:

```python
# At the top of activity.py
MAX_SESSION_TIMEOUT_MINUTES = 5  # Change this value
```

## Benefits

1. **No stuck sessions**: Users don't get blocked by forgotten sessions
2. **Automatic cleanup**: Old sessions are automatically closed
3. **Better UX**: Users don't have to manually end stale sessions
4. **Data integrity**: Sessions are properly closed at their last update time

## Test Results

✅ Correctly blocks new sessions when active session is < 5 minutes old
✅ Automatically closes sessions when active session is > 5 minutes old  
✅ Creates new session after auto-closing stale session
✅ Returns info about both sessions in response
