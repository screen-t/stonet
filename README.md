# SM1 (B2B) - Professional Networking Platform

A modern B2B professional networking platform built for entrepreneurs, innovators, and business leaders to connect, collaborate, and grow.

## Tech Stack

### Frontend
- **React 18.3** with TypeScript
- **Vite 5.4** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **TanStack Query** - Server state management
- **React Router v6** - Client-side routing
- **Framer Motion** - Smooth animations
- **React Hook Form + Zod** - Form validation
- **date-fns** - Date utilities
- **Lucide React** - Icon system

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Database
- **Row Level Security** - Data protection

## Project Structure

```
b2b-network/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── feed/      # Feed-related components
│   │   │   ├── layout/    # Layout components (Navbar, Sidebar)
│   │   │   ├── profile/   # Profile components
│   │   │   └── ui/        # shadcn/ui components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── pages/         # Page components
│   ├── package.json
│   └── vite.config.ts
├── supabase/              # Supabase configuration
│   ├── config.toml
│   └── migrations/        # Database migrations
└── README.md
```

## Key Features

### Authentication & Security
- Multiple login methods (Email, Phone, Google, GitHub, LinkedIn)
- Two-factor authentication ready
- Privacy settings with granular controls
- Login activity tracking
- Session management

### Profile Management
- Comprehensive profile editing (4-tab interface)
- Account type switching (Professional/Business)
- Work history and education tracking
- Professional pronouns support
- Location and contact information
- Profile visibility controls

### Social Feed
- **For You** and **Following** feed tabs
- Rich post creation with:
  - Image and video uploads
  - Poll creation (2-4 options)
  - Text formatting (bold, italic, links)
  - Hashtags and mentions
  - Emoji and GIF support
  - Scheduled posts
  - Draft saving
- Post interactions (Like, Comment, Repost, Share, Bookmark)

### Messaging
- Direct messaging system
- Read/unread status indicators
- Real-time messaging ready

### Onboarding
- Simplified 2-step onboarding flow
- Flexible profile setup
- Skip options for optional fields

## Setup Instructions

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, pnpm, or bun
- Supabase account (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd b2b-network
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the `frontend` directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run database migrations**
   ```bash
   cd ../supabase
   # Set up Supabase CLI and run migrations
   supabase db push
   ```

5. **Start the development server**
   ```bash
   cd ../frontend
   npm run dev
   ```

   The app will be available at `http://localhost:8080`

## Development

### Available Scripts (Frontend)

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Code Style
- TypeScript strict mode disabled for rapid development
- ESLint configured for code quality
- Tailwind CSS for consistent styling
- Component-based architecture

## Database Schema

Current tables:
- `users` - User profiles and authentication
- `posts` - User posts and content
- `connections` - User connections/relationships
- Additional tables for skills, work experience, messages, etc.

See `supabase/migrations/` for complete schema.

## Environment Variables

### Frontend (.env.local)
```env
VITE_SUPABASE_URL=         # Your Supabase project URL
VITE_SUPABASE_ANON_KEY=    # Your Supabase anonymous key
```

## Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## Roadmap

### In Progress
- [ ] Backend integration for all features
- [ ] Real-time messaging
- [ ] Search functionality
- [ ] Notifications system

### Planned Features
- [ ] Video calling
- [ ] Company pages
- [ ] Events and webinars
- [ ] Job board
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

## License

This project is proprietary and confidential.

## Support

For support, email or open an issue in the repository.

---

Built by Screen-t
