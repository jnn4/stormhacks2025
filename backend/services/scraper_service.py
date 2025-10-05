import subprocess

def get_command_explanation(command: str) -> str:
    """
    Returns a simplified explanation of a shell command using its man page.
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

        # Take only the first ~100 lines for readability
        lines = result.stdout.strip().split("\n")[:100]

        # Filter out formatting escape sequences
        clean_lines = []
        for line in lines:
            line = line.replace("\x08", "")  # remove backspace chars used for bold/underline
            clean_lines.append(line)

        return "\n".join(clean_lines) + "\n\n[...output truncated...]"

    except subprocess.TimeoutExpired:
        return "Man page lookup timed out."
    except Exception as e:
        return f"Error accessing man page: {e}"
