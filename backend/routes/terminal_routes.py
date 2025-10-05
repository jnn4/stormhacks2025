from flask import Blueprint, request, jsonify
from services.scraper_service import get_command_explanation

terminal_bp = Blueprint("terminal_bp", __name__)

@terminal_bp.route("/api/terminal/explain", methods=["POST"])
def explain_command():
    data = request.get_json()
    command = data.get("command", "").strip()

    if not command:
        return jsonify({"error": "No command provided"}), 400

    explanation = get_command_explanation(command)
    return jsonify({"command": command, "explanation": explanation})
