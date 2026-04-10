# Nexus - Student Hub

## Overview

Nexus is a privacy-first, local-only student hub built with React. The application intentionally displays a fake 404 error screen to protect user privacy - press the "C" key to dismiss the screen and access the actual application.

## Tech Stack

- **Frontend**: React 18 with Create React App
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Project Structure

- `src/` - Main source code
  - `Components/` - Reusable React components
  - `PagesDisplay/` - Page components (Landing, Dashboard, Settings, etc.)
  - `hooks/` - Custom React hooks
  - `utils/` - Utility functions
- `public/` - Static assets
- `docs/` - Documentation files

## Running the App

The app runs on port 5000 with the development server:

```bash
npm run dev
```

## Privacy Feature

The app displays a fake 404 error screen when accessed directly. Press "C" to bypass and access the real application.

## Deployment

Configured for Replit autoscale deployment using `npx serve` to serve the production build.
