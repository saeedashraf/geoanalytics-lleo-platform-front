# 🛰️ GeoAnalytics Platform

A modern, minimalist frontend for advanced multi index analysis using satellite imagery. Built with Next.js, TypeScript, and Tailwind CSS.

![GeoAnalytics Platform](https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1200&h=400&fit=crop)

## ✨ Features

### 🎨 **Modern Design**
- **Clean, minimalist interface** with professional styling
- **Glass morphism effects** and smooth animations
- **Responsive design** that works on all devices
- **Dark/light mode support** (coming soon)

### 🗺️ **Interactive Map Selection**
- **Global Leaflet map** with drawing tools
- **Rectangle drawing** to select analysis areas
- **Automatic coordinate extraction** and area calculation
- **Real-time area preview** with metadata display

### 📊 **Rich Gallery System**
- **4 maps per row** gallery layout as requested
- **Advanced filtering** by tags, location, and date
- **Multiple view modes** (grid/list)
- **Search functionality** across all analysis content

### 🏢 **Four-Tab Navigation**
1. **Create Analysis** - Interactive form with map selection
2. **Recently Published** - Latest community analyses
3. **Community Research** - Public scientific repository
4. **Enterprise Repository** - Private company analyses

### 🔧 **Technical Excellence**
- **Full TypeScript** implementation
- **Component-based architecture** with reusable UI elements
- **Modern React patterns** (hooks, context, etc.)
- **Performance optimized** with lazy loading and caching

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm/yarn
- **Backend API** running (your FastAPI service)

### Installation

1. **Clone and install dependencies:**
```bash
# Clone the repository
git clone <your-repo-url>
cd geoanalytics-platform

# Install dependencies
npm install
# or
yarn install
```

2. **Set up environment variables:**
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit the environment variables
# Set NEXT_PUBLIC_API_URL to your backend URL (default: http://localhost:8000)
```

3. **Start the development server:**
```bash
npm run dev
# or
yarn dev
```

4. **Open your browser:**
```
http://localhost:3000
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with these variables:

```bash
# Required: Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Application metadata
NEXT_PUBLIC_APP_NAME=GeoAnalytics Platform
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Backend Integration

The frontend is designed to work with your FastAPI backend. Make sure your backend is running on the configured URL (default: `http://localhost:8000`).

**API Endpoints Expected:**
- `GET /health` - Health check
- `GET /` - API information
- `POST /analyze` - Submit analysis with form data

## 📁 Project Structure

```
geoanalytics-platform/
├── src/
│   ├── app/                    # Next.js 13+ app directory
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main page component
│   │
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   │
│   │   ├── layout/             # Layout components
│   │   │   └── Header.tsx
│   │   │
│   │   ├── map/                # Map components
│   │   │   └── InteractiveMap.tsx
│   │   │
│   │   ├── analysis/           # Analysis components
│   │   │   └── AnalysisForm.tsx
│   │   │
│   │   ├── gallery/            # Gallery components
│   │   │   ├── AnalysisCard.tsx
│   │   │   └── AnalysisGallery.tsx
│   │   │
│   │   └── modal/              # Modal components
│   │       └── AnalysisModal.tsx
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── analysis.ts
│   │   └── ui.ts
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useLocalStorage.ts
│   │   └── useToast.ts
│   │
│   └── utils/                  # Utility functions
│       ├── api.ts              # API client functions
│       ├── cn.ts               # Class name utility
│       └── sample-data.ts      # Sample data for demo
│
├── public/                     # Static assets
│   ├── favicon.ico
│   └── leaflet/                # Leaflet icons
│
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── next.config.js              # Next.js configuration
```

## 🎯 Usage Guide

### Creating an Analysis

1. **Navigate to "Create Analysis" tab**
2. **Enter your research query** in natural language:
   - Example: "What is the vegetation change from 2015 to 2024 in Zurich?"
3. **Optional: Select area on map**
   - Use the rectangle tool to draw your area of interest
   - Coordinates will be automatically added to your query
4. **Upload your Google Cloud credentials JSON file**
5. **Configure options** (download data, etc.)
6. **Submit analysis** and wait for results

### Browsing Analyses

- **Recently Published**: Latest analyses from all users
- **Community Research**: Public scientific repository
- **Enterprise Repository**: Private company analyses

### Interactive Features

- **Search**: Find analyses by title, description, location, author, or tags
- **Filter**: Use tags to narrow down results
- **Sort**: By date, popularity, or alphabetically
- **View Modes**: Grid (4 per row) or list view

### Analysis Details

Click any analysis card to view:
- **Full metadata** (coordinates, time period, author)
- **Research query** and methodology
- **Available files** and download options
- **Tags and categories**
- **Usage statistics** (views, likes, shares)

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Development Workflow

1. **Component Development**: Create reusable components in `src/components/`
2. **Type Safety**: Add types to `src/types/`
3. **API Integration**: Update `src/utils/api.ts` for new endpoints
4. **Styling**: Use Tailwind CSS utility classes
5. **State Management**: Use React hooks and context

### Adding New Features

1. **Create component** in appropriate directory
2. **Add TypeScript types** if needed
3. **Update API client** if backend integration required
4. **Add to main page** or relevant parent component
5. **Test thoroughly** across different screen sizes

## 🎨 Design System

### Colors

- **Primary**: Gray scale for text and backgrounds
- **Accent**: Orange/amber for highlights and CTAs
- **Success**: Green for positive actions
- **Warning**: Yellow for cautions
- **Error**: Red for errors and destructive actions

### Typography

- **Font Family**: Inter (clean, modern)
- **Headings**: Bold weights (600-700)
- **Body**: Regular weight (400)
- **Code**: JetBrains Mono

### Components

- **Cards**: Glass morphism with subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Clean inputs with focus states
- **Maps**: Professional styling with custom controls

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on every push

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- **Netlify**
- **AWS Amplify**
- **Google Cloud Run**
- **Docker containers**

### Environment Variables for Production

```bash
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NODE_ENV=production
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add some amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline comments
- **Issues**: Create an issue on GitHub
- **API Documentation**: Check your backend API docs

## 🎯 Roadmap

- [ ] **Real-time analysis progress** tracking
- [ ] **User authentication** and profiles
- [ ] **Collaborative features** (comments, reviews)
- [ ] **Advanced visualization** tools
- [ ] **Mobile app** development
- [ ] **Offline mode** support

---

**Built with ❤️ for the geospatial research community**