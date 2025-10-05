# scraper_service.py
import platform
import subprocess
import shutil
import requests
import shlex
import requests
from bs4 import BeautifulSoup

# Optional: a tiny helper to sanitize incoming command names
def _sanitize_command_name(cmd: str) -> str:
    # only allow simple command names (no pipes, args, etc.)
    # if users include args, just take the first token as command name for man lookup
    if not cmd:
        return ""
    return shlex.split(cmd)[0]

def _try_local_man(cmd: str, timeout=6):
    try:
        proc = subprocess.run(
            ["man", "-P", "cat", cmd],
            capture_output=True,
            text=True,
            check=True,
            timeout=timeout
        )
        return proc.stdout
    except Exception:
        return None


def _try_wsl_man(cmd: str, timeout=6):
    try:
        proc = subprocess.run(
            ["man", "-P", "cat", cmd],
            capture_output=True,
            text=True,
            check=True,
            timeout=timeout
        )
        return proc.stdout
    except Exception:
        return None

def _try_bash_man(cmd: str, timeout=6):
    try:
        proc = subprocess.run(
            ["man", "-P", "cat", cmd],
            capture_output=True,
            text=True,
            check=True,
            timeout=timeout
        )
        return proc.stdout
    except Exception:
        return None



def get_online_man_page(cmd: str):
    try:
        url = f"https://man7.org/linux/man-pages/man1/{cmd}.1.html"
        r = requests.get(url, timeout=6)
        r.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(r.text, "html.parser")
        
        # Get all text in <pre> blocks (where man pages are usually)
        pre_blocks = soup.find_all("pre")
        if pre_blocks:
            text = "\n\n".join(block.get_text() for block in pre_blocks)
            return text.strip()
        else:
            return f"No online man page found for '{cmd}'."
        
    except Exception as e:
        return f"Failed to fetch online man page for '{cmd}': {str(e)}"



def get_command_explanation(cmd: str):
    # Try local WSL/bash man
    explanation = _try_local_man(cmd) or _try_wsl_man(cmd) or _try_bash_man(cmd)
    
    if explanation:
        return explanation

    # Fallback to --help on Windows
    try:
        proc = subprocess.run(
            [cmd, "--help"],
            capture_output=True,
            text=True,
            check=True,
            timeout=6
        )
        return proc.stdout
    except Exception:
        pass

    # Final fallback: online
    return get_online_man_page(cmd)

    # 4) Final Windows-native fallback dictionary (brief)
    WINDOWS_EXPLANATIONS = {
        "ls": "ls - list directory contents. On Windows use 'dir' or use WSL/Git Bash for unix-like 'ls'.",
        "cd": "cd - change directory (works similarly on Windows and Unix shells).",
        "mkdir": "mkdir - create directory. On PowerShell you can also use New-Item -ItemType Directory.",
        "rm": "rm - remove file(s) (on Windows use 'del' for files, 'rmdir' for directories).",
        "pwd": "pwd - print working directory (PowerShell equivalent: Get-Location).",
        "touch": "touch - create an empty file or update timestamp. On Windows use 'type nul > filename' or use WSL.",
        "cat": "cat - concatenate and print files. On Windows PowerShell, use Get-Content.",
        "grep": "grep - search text using patterns. On Windows, use 'findstr' or use WSL.",
    }
    if system == "Windows":
        return WINDOWS_EXPLANATIONS.get(cmd, f"No man page found for '{cmd}' locally. Install WSL or Git Bash to access Unix man pages, or check online (e.g., man7.org).")
    else:
        return f"No man page found for '{cmd}'."
