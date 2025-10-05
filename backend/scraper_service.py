import subprocess
import re

def get_command_explanation(command: str) -> str:
    """
    Returns a formatted explanation of a shell command using its man page.
    """
    if not command:
        return "No command provided."

    try:
        result = subprocess.run(
            ["man", command],
            capture_output=True,
            text=True,
            timeout=5
        )

        if result.returncode != 0 or not result.stdout:
            return f"No manual entry found for '{command}'."

        # Extract the most relevant sections
        content = result.stdout
        
        # Remove formatting characters
        content = re.sub(r'\x1b\[[0-9;]*[a-zA-Z]', '', content)
        content = re.sub(r'\x08', '', content)
        
        # Extract name and description
        name_match = re.search(r'NAME\n\s+(\S+.*?)\n\n', content, re.DOTALL)
        desc_match = re.search(r'DESCRIPTION\n\s+(.*?)\n\n', content, re.DOTALL)
        
        name_section = name_match.group(1) if name_match else ""
        desc_section = desc_match.group(1) if desc_match else ""

        # Format the response
        formatted_response = f"""
🧩 Overview:
{name_section.strip()}

💻 Description:
{desc_section.strip()[:300]}...

💡 Tip:
Try '{command} --help' for quick usage information.
"""
        
        return formatted_response.strip()

    except subprocess.TimeoutExpired:
        return "⚠️ Man page lookup timed out."
    except Exception as e:
        return f"⚠️ Error accessing man page: {e}"