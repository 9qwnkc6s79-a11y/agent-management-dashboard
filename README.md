# Agent Management Dashboard

A professional, enterprise-grade dashboard for managing AI agent ecosystems with real-time monitoring, cost analytics, and advanced deployment capabilities.

## Features

### 🎛️ **Agent Fleet Management**
- Real-time agent status monitoring
- Live token usage and cost tracking
- Performance analytics and optimization recommendations
- Agent health scoring and efficiency metrics

### 💰 **Cost Control & Analytics**
- Budget monitoring and alerts
- Model optimization recommendations
- Daily/weekly/monthly cost projections
- Token burn rate tracking

### 🚀 **Agent Templates & Deployment**
- Pre-built agent templates for common use cases
- One-click agent deployment
- Agent cloning and configuration replication
- Quick deploy buttons for rapid scaling

### ⚙️ **Model Management**
- One-click model switching (Opus ↔ Sonnet ↔ Haiku)
- Cost impact calculator
- Performance-based model recommendations
- Real-time optimization suggestions

### 📊 **Professional UI/UX**
- Modern, responsive design
- Enterprise-grade aesthetics
- Clean, professional interface
- Mobile-friendly layout

## Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript
- **Backend**: Python with OpenClaw API integration
- **Styling**: Modern CSS with custom design system
- **Data**: Real-time integration with OpenClaw sessions and cron APIs

## Quick Start

1. Clone the repository
2. Start the Python server:
   ```bash
   python3 load-data.py --server
   ```
3. Open `http://localhost:8001` in your browser

## Architecture

### Frontend Components
- `dashboard.html` - Main dashboard interface
- `cron-manager.html` - Schedule management interface
- `assets/css/modern.css` - Professional design system
- `assets/js/dashboard.js` - Core dashboard functionality
- `model-manager.js` - Advanced features (templates, cost alerts, model management)

### Backend Integration
- `load-data.py` - Python server with OpenClaw API integration
- Real-time data fetching from OpenClaw sessions and cron APIs
- Live cost calculations and performance metrics

## Features Overview

### Agent Cards
Each agent displays:
- Current status (Active/Idle/Offline)
- Token usage and daily cost
- Model type and efficiency rating
- Last activity timestamp
- Action buttons (Task, Message, Details, Clone)
- Model switching dropdown with cost impact

### Cost Analytics
- Real-time budget tracking
- Top token consumers leaderboard
- Optimization recommendations
- Cost per 1K tokens analysis
- Efficiency scoring per agent

### Template Marketplace
Pre-configured agents for:
- Health Coach - Fitness tracking and wellness guidance
- Business Analyst - Data analysis and reporting
- Customer Support - Professional customer service
- Content Creator - Marketing and content production
- Developer Assistant - Technical support and coding
- Project Manager - Team coordination and planning

## Professional Design

The dashboard features enterprise-grade design with:
- Clean, modern aesthetics suitable for business presentations
- Professional color palette and typography
- Responsive layout for desktop, tablet, and mobile
- Intuitive navigation and user experience
- Sophisticated data visualization components

## License

Private project for Daniel Keene / Boundaries Coffee operations.