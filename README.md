## Features

**Copilot**: Chat with AI to analyze stocks, read earnings call summaries, compare companies, and track financial metrics.


**Portfolio Dashboard**: Add your stock holdings and get a clear view of your portfolio's health.

**Portfolio Chat**: Ask questions about your portfolio to understand your investments better.

## Copilot Request Lifecycle

![Copilot Request lifecycle](https://res.cloudinary.com/dlp6wui7r/image/upload/v1740342916/ecom/request-lifecycle_1_xil8ws.png)

## Tech Stack

- React/Next.js
- Tailwind CSS
- OpenAI API
- FMP API
- Finnhub API

## Run Locally

1. Clone the repo

```bash
git clone https://github.com/harshturna/portfolio-health-analyzer.git
cd portfolio-health-analyzer
npm install
```

2. Create `.env` file with API keys:

- OPENAI_API_KEY=your_key
- FMP_API_KEY=your_key
- FINNHUB_API_KEY=your_key // Only required for Portfolio features (can be omitted for Copilot)

3.  Run development server:

```bash
npm run dev
```

## Possible impovements/extensions for future
- Steaming responses to reduce waiting period
- Chats history saving
- Specialized data visualization components for chat
