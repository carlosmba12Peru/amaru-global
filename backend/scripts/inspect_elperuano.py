import re

p = r"C:\Users\Usuario Libre\.gemini\antigravity-ide\brain\e976fe10-332a-4d45-8396-8b4111f8080e\.system_generated\steps\1320\content.md"
with open(p, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

print(f"Total length: {len(text)} chars")

# Check for script tags or API endpoints
scripts = re.findall(r'<script[^>]*src=[\'"]([^\'"]+)[\'"]', text)
print("\nScripts src:")
for s in scripts:
    print(" -", s)

# Check for text mentioning normas
normas_mentions = re.findall(r'([^.\n]{0,50}(?:norma|decreto|emergencia|vigente|caduc|ley)[^.\n]{0,80})', text, re.IGNORECASE)
print(f"\nMentions of norms/emergency ({len(normas_mentions)}):")
for m in normas_mentions[:10]:
    print(" *", m.strip())
