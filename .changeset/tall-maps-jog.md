---
"@solace-labs/ep-async-api-importer": minor
---

enhanced logging of call parameters


**New Features:**

- **logging**
  - log of version, command line options, environment, and resulting config at startup
  - level=info
- **environment variable: `CLI_VALIDATE_API_BEST_PRACTICES`**
  - flag to run 'best practices' validation on APIs
  - options: true/false
  - default: true


**Enhancements:**

- **error handling**
  - added details (name, message, stack) of caught errors to log & output
