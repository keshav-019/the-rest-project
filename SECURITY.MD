## 🔒 Security Rules (Mandatory)

The following rules must be followed for all contributions:

### 🚫 1. No Secrets in Code

* Never commit:

  * `.env` files
  * API keys, tokens, credentials
* Use `.env.example` instead
* All secrets must be injected via environment variables

---

### 📦 2. Dependency Hygiene

* Run `npm install` only from trusted sources
* Always check:

  * `npm audit`
* High/critical vulnerabilities must be fixed before merge

---

### 🐳 3. Docker Security Rules

* Containers must NOT run as root
* Use minimal base images (`node:alpine`)
* Remove unnecessary packages
* Scan images before pushing

---

### 🔐 4. Authentication & Authorization

* Passwords must be hashed (`bcrypt` or `argon2`)
* JWT secrets must be strong and never hardcoded
* Implement role-based access control where applicable

---

### 🧪 5. Input Validation

* All external inputs must be validated
* Use validation libraries (e.g., Joi, Zod)
* Prevent:

  * SQL Injection
  * XSS
  * Command Injection

---

### 📡 6. API Protection

* Rate limiting is required
* Enable CORS with strict origins
* Use HTTPS in production
* Validate all request payloads

---

### 🔍 7. Logging & Monitoring

* Do NOT log sensitive data
* Log authentication failures and suspicious activity

---

### 🔁 8. Code Review Requirement

* No direct commits to `main`
* Minimum 1 approval required before merge
* Security-sensitive changes require stricter review

---

### ⚙️ 9. CI Security Checks (Mandatory)

All PRs must pass:

* Dependency audit
* Linting
* Security scans

---

### ❌ 10. Build Failure Policy

If security checks fail:

* PR must NOT be merged
* Issues must be resolved first
