# Money Logix Compass Backend

## Project Background

This repository is my maintained copy of the backend originally developed for the MoneyLogix Placement Drive. It is the version I use for deployment and ongoing development.

### Original Contributors

The complete Git history has been preserved to retain authorship of the original contributors.

- **Sarthak** — UI/UX Design & Landing Page Development
- **Piyush Singh** — Backend Foundation
- **Saranya Shukla** — AI Integration
- **Aanshik Sharma** — Full Stack Development

### My Contributions

#### Frontend

- Built the authenticated application interface and integrated it with the backend APIs.

#### Backend

- Identified and resolved a limitation in the original session-based persistence model by redesigning it to support authenticated, user-specific conversations.
- Refactored the relationships between the `User`, `ConversationLog`, `Profile`, and `Plan` models to support persistent conversation state and chat history.
- Updated the AI response pipeline to support Markdown-formatted responses by refining the system prompts and response handling.

#### Deployment & Maintenance

- Deployed and actively maintain this version of the backend.
