from flask import Blueprint, request, jsonify
from scraper_service import get_command_explanation

terminal_bp = Blueprint("terminal_bp", __name__)

@terminal_bp.route("/api/terminal/explain", methods=["POST"])
def explain_command():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        command = data.get("command", "").strip()
        if not command:
            return jsonify({"error": "No command provided"}), 400

        explanation = get_command_explanation(command)
        return jsonify({
            "command": command,
            "explanation": explanation,
            "status": "success"
        })
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500