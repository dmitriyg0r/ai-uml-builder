# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of AI UML Builder seriously. If you have discovered a security vulnerability, please report it to us privately.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Email**: Send details to dmitriyg0r@yandex.ru
2. **GitHub Security Advisory**: Use the [Security tab](../../security/advisories/new) to create a private security advisory

### What to Include

Please include the following information in your report:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
- **Communication**: We will keep you informed about the progress of fixing the vulnerability
- **Credit**: We will credit you for the discovery in our security advisory (unless you prefer to remain anonymous)
- **Fix Timeline**: We aim to release a fix within 30 days for critical vulnerabilities

## Security Best Practices

When using AI UML Builder:

### API Keys

- Never commit API keys to version control
- Store API keys in `.env.local` file (already in `.gitignore`)
- Use environment variables for sensitive data
- Rotate API keys regularly

### Supabase Authentication

- Use Row Level Security (RLS) policies in Supabase
- Never expose service role keys in the client
- Only use anon/public keys in the frontend
- Enable email verification for user accounts

### Electron Security

- Keep Electron and dependencies up to date
- The app uses `contextIsolation: true` and `nodeIntegration: false`
- Never disable security features without careful consideration

### Dependencies

- Regularly update npm packages
- Review security advisories for dependencies
- Use `npm audit` to check for known vulnerabilities

## Known Security Limitations

### Local Data Storage

- User data (diagrams, chat history) is stored locally in:
  - **Guest mode**: Browser localStorage
  - **Authenticated mode**: Supabase database
- Ensure your device is properly secured with encryption and strong passwords

### API Key Storage

- API keys are stored in `.env.local` and environment variables
- On macOS/Linux, ensure proper file permissions: `chmod 600 .env.local`
- Do not share your `.env.local` file

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed. Updates will be announced through:

- GitHub Security Advisories
- GitHub Releases
- Project README

## Questions?

If you have questions about this security policy, please create a [Discussion](../../discussions) or contact us via email.

Thank you for helping keep AI UML Builder and its users safe!
