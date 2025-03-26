# ResuMate - AI-Powered Resume Optimization

A modern web application built with Next.js that helps users optimize their resumes for specific job descriptions using Open AI.

## Features

- 📄 PDF Resume Upload
- 📝 Job Description Analysis
- 🤖 AI-Powered Resume Optimization
- ⚡ Real-time Processing Status Updates
- 📊 Resume Match Statistics
- 📱 Responsive Design

## Tech Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS with Flowbite components
- **Real-time Updates**: WebSocket API
- **File Handling**: AWS S3 Integration
- **UI Components**:
  - Typewriter Effect
  - Statistics Display
  - Animated Loading States
  - Dismissable Alerts
  - File Upload Interface

## Color Palette

- Cream: `#F9FCED`
- Green: `#6AA98C`
- Light Green: `#B3D8A8`

## Getting Started

1. Clone the repository

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
NEXT_PUBLIC_WEBSOCKET_URL=your_websocket_url
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.