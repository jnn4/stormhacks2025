from flask import jsonify, request, Blueprint
from auth_utils import token_required
from models import db, User, TypingSession
from datetime import datetime, timezone, timedelta
from sqlalchemy import func, case, cast, Date

activity_bp = Blueprint("activity", __name__)


@activity_bp.route('/api/activity/start', methods=['POST'])
@token_required
def start_typing_session(current_user):
    """
    Start a new typing session for the authenticated user
    
    Request body:
    {
        "language_tag": "python",  # optional
        "source": "vscode",        # optional, defaults to 'web'
        "device_id": "uuid"  # optional, for safe retries
    }
    """
    try:
        data = request.get_json() or {}
        
        # Get the user from database by GitHub ID
        user = User.query.filter_by(github_id=current_user['id']).first()
        
        if not user:
            return jsonify({
                'error': 'User not found',
                'message': 'Please authenticate first'
            }), 404
        
        device_id = data.get('device_id') or None
        # Check if user has an active session (ended_at is NULL)
        active_session = TypingSession.query.filter_by(
            uid=user.uid,
            ended_at=None,
            device_id=device_id
        ).first()
        
        if active_session:
            # Check if the active session is stale (updated_at is more than 5 minutes old)
            current_time = datetime.now(timezone.utc)
            time_since_update = current_time - active_session.updated_at
            if time_since_update.total_seconds() > 300:  # 5 minutes = 300 seconds
                # Auto-close the stale session: set ended_at to updated_at
                active_session.ended_at = active_session.updated_at
                db.session.commit()
                
                auto_closed_session = active_session.to_dict()
                print(f"Auto-closed stale session {active_session.typing_id} (inactive for {time_since_update.total_seconds():.0f} seconds)")
            else:
                active_session.updated_at = datetime.now(timezone.utc)
                db.session.commit()
                #return the active session
                return jsonify({
                    'success': True,
                    'message': 'Session is still active and recent',
                    'session': active_session.to_dict()
                }), 200
        else:
            auto_closed_session = None
        
        # Create new typing session
        new_session = TypingSession(
            uid=user.uid,
            started_at=datetime.utcnow(),
            language_tag=data.get('language_tag'),
            source=data.get('source', 'web'),
            device_id=device_id
        )
        
        db.session.add(new_session)
        db.session.commit()
        
        response_data = {
            'success': True,
            'message': 'Typing session started',
            'session': new_session.to_dict()
        }
        
        # Include info about auto-closed session if applicable
        if auto_closed_session:
            response_data['auto_closed_session'] = auto_closed_session
            response_data['message'] = 'Stale session auto-closed and new session started'
        
        return jsonify(response_data), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to start session',
            'message': str(e)
        }), 500


@activity_bp.route('/api/activity/end', methods=['POST'])
@token_required
def end_typing_session(current_user):
    """
    End the current active typing session
    
    Request body:
    {
        "typing_id": 123,           # optional, specific session to end
        "device_id": "uuid"   # optional, for safe retries
    }
    """
    try:
        # Handle empty POST body gracefully
        try:
            data = request.get_json(silent=True) or {}
        except:
            data = {}
        
        # Get the user from database by GitHub ID
        user = User.query.filter_by(github_id=current_user['id']).first()
        
        if not user:
            return jsonify({
                'error': 'User not found',
                'message': 'Please authenticate first'
            }), 404
        
        # Check for idempotency - if session with this key is already ended
        device_id = data.get('device_id')
        if device_id:
            existing_session = TypingSession.query.filter_by(
                device_id=device_id
            ).first()
            
            if existing_session and existing_session.ended_at is not None:
                return jsonify({
                    'success': True,
                    'message': 'Session already ended',
                    'session': existing_session.to_dict()
                }), 200
        
        # Find the session to end
        typing_id = data.get('typing_id')
        
        if typing_id:
            # End specific session
            session = TypingSession.query.filter_by(
                typing_id=typing_id,
                uid=user.uid
            ).first()
        else:
            # End the most recent active session
            session = TypingSession.query.filter_by(
                uid=user.uid,
                ended_at=None
            ).order_by(TypingSession.started_at.desc()).first()
        
        if not session:
            return jsonify({
                'error': 'No active session found',
                'message': 'No session to end'
            }), 404
        
        if session.ended_at is not None:
            return jsonify({
                'error': 'Session already ended',
                'message': 'This session has already been completed',
                'session': session.to_dict()
            }), 400
        
        # End the session
        session.ended_at = datetime.utcnow()
        session.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Typing session ended',
            'session': session.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to end session',
            'message': str(e)
        }), 500


@activity_bp.route('/api/activity/sessions', methods=['GET'])
@token_required
def get_typing_sessions(current_user):
    """
    Get typing sessions for the authenticated user
    
    Query parameters:
    - limit: number of sessions to return (default: 50)
    - offset: pagination offset (default: 0)
    - active_only: only return active sessions (default: false)
    """
    try:
        # Get the user from database by GitHub ID
        user = User.query.filter_by(github_id=current_user['id']).first()
        
        if not user:
            return jsonify({
                'error': 'User not found',
                'message': 'Please authenticate first'
            }), 404
        
        # Get query parameters
        limit = min(int(request.args.get('limit', 50)), 100)
        offset = int(request.args.get('offset', 0))
        active_only = request.args.get('active_only', 'false').lower() == 'true'
        
        # Build query
        query = TypingSession.query.filter_by(uid=user.uid)
        
        if active_only:
            query = query.filter_by(ended_at=None)
        
        # Get total count
        total = query.count()
        
        # Get sessions with pagination
        sessions = query.order_by(
            TypingSession.started_at.desc()
        ).limit(limit).offset(offset).all()
        
        return jsonify({
            'success': True,
            'sessions': [session.to_dict() for session in sessions],
            'pagination': {
                'total': total,
                'limit': limit,
                'offset': offset
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch sessions',
            'message': str(e)
        }), 500


@activity_bp.route('/api/activity/stats', methods=['GET'])
@token_required
def get_activity_stats(current_user):
    """
    Get activity statistics for the authenticated user
    
    Returns:
    - Overall daily session over past month - list the date
    - Total time spent typing for each language
    - Total time spent for each source
    """
    try:
        # Get the user from database by GitHub ID
        user = User.query.filter_by(github_id=current_user['id']).first()
        
        if not user:
            return jsonify({
                'error': 'User not found',
                'message': 'Please authenticate first'
            }), 404
        
        # Get all sessions in the past month, group by date, language, and source
        now = datetime.now(timezone.utc)
        month_ago = now - timedelta(days=30)

        # Query sessions in the past month for this user
        sessions_query = (
            db.session.query(
                cast(TypingSession.started_at, Date).label('date'),
                TypingSession.language_tag,
                TypingSession.source,
                func.sum(
                    case(
                        (TypingSession.ended_at != None, func.extract('epoch', TypingSession.ended_at) - func.extract('epoch', TypingSession.started_at)),
                        else_=func.extract('epoch', func.now()) - func.extract('epoch', TypingSession.started_at)
                    )
                ).label('total_seconds'),
                func.count().label('session_count')
            )
            .filter(
                TypingSession.uid == user.uid,
                TypingSession.started_at >= month_ago
            )
            .group_by(
                cast(TypingSession.started_at, Date),
                TypingSession.language_tag,
                TypingSession.source
            )
            .order_by(
                cast(TypingSession.started_at, Date).desc()
            )
        )

        # Fetch grouped stats
        grouped_stats = sessions_query.all()

        # Prepare stats for output - structure by date with totals and breakdowns
        stats_by_date = {}
        for row in grouped_stats:
            date_str = row.date.isoformat()
            minutes = round(row.total_seconds / 60, 2) if row.total_seconds else 0
            
            # Initialize date entry if it doesn't exist
            if date_str not in stats_by_date:
                stats_by_date[date_str] = {
                    'total_time_minutes': 0,
                    'by_language': {},
                    'by_source': {},
                    'session_count': 0
                }
            
            # Add to total time for the date
            stats_by_date[date_str]['total_time_minutes'] += minutes
            stats_by_date[date_str]['session_count'] += row.session_count
            
            # Add to language breakdown
            lang = row.language_tag or 'unknown'
            if lang not in stats_by_date[date_str]['by_language']:
                stats_by_date[date_str]['by_language'][lang] = 0
            stats_by_date[date_str]['by_language'][lang] += minutes
            
            # Add to source breakdown
            source = row.source or 'unknown'
            if source not in stats_by_date[date_str]['by_source']:
                stats_by_date[date_str]['by_source'][source] = 0
            stats_by_date[date_str]['by_source'][source] += minutes
        
        # Round totals to 2 decimal places
        for date_str in stats_by_date:
            stats_by_date[date_str]['total_time_minutes'] = round(
                stats_by_date[date_str]['total_time_minutes'], 2
            )
            # Round language times
            for lang in stats_by_date[date_str]['by_language']:
                stats_by_date[date_str]['by_language'][lang] = round(
                    stats_by_date[date_str]['by_language'][lang], 2
                )
            # Round source times
            for source in stats_by_date[date_str]['by_source']:
                stats_by_date[date_str]['by_source'][source] = round(
                    stats_by_date[date_str]['by_source'][source], 2
                )
        
        return jsonify({
            'success': True,
            'stats': {
                'by_date': stats_by_date    
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to calculate statistics',
            'message': str(e)
        }), 500


@activity_bp.route('/api/activity/session/<int:typing_id>', methods=['GET'])
@token_required
def get_typing_session(current_user, typing_id):
    """
    Get a specific typing session by ID
    """
    try:
        # Get the user from database by GitHub ID
        user = User.query.filter_by(github_id=current_user['id']).first()
        
        if not user:
            return jsonify({
                'error': 'User not found',
                'message': 'Please authenticate first'
            }), 404
        
        # Get the session
        session = TypingSession.query.filter_by(
            typing_id=typing_id,
            uid=user.uid
        ).first()
        
        if not session:
            return jsonify({
                'error': 'Session not found',
                'message': 'No session found with this ID'
            }), 404
        
        return jsonify({
            'success': True,
            'session': session.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch session',
            'message': str(e)
        }), 500

