# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 2.x (latest) | ✅ |
| 1.x | ❌ |

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

Report security issues by email: **youssef.el.jaoujat@gmail.com**

Include as much detail as possible:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You can expect an acknowledgement within **48 hours** and a resolution timeline within **7 days** for confirmed vulnerabilities.

## Security Best Practices for Users

- **Never commit `.env`** — the `.gitignore` excludes it by default; keep it that way
- Use a **dedicated HAC user** with the minimum required permissions (scripting console only)
- Set `HAC_IGNORE_SSL=false` in production — only enable `true` for local/dev instances
- Rotate `HAC_PASSWORD` regularly
- In CI/CD pipelines, use secrets managers (GitHub Actions Secrets, Vault…) rather than plain env files
