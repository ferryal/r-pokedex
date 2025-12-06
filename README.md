# 🎮 React Vite Pokédex

A modern, high-performance Pokédex application built with React 18, Vite, and TanStack Query. Browse, search, and explore detailed information about all Pokémon with a beautiful and responsive UI.

## ✨ Features

- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🔍 **Search & Filter** - Search by name and filter by generation
- ♾️ **Infinite Scroll** - Smooth infinite scrolling with loading skeletons
- 🎨 **Dynamic Theming** - Cards styled based on Pokémon type colors
- 📊 **Detailed Stats** - View comprehensive Pokémon information including:
  - Biography and species data
  - Base stats with visual bars
  - Evolution chains with interactive cards
- ⚡ **Fast & Modern** - Built with Vite for lightning-fast HMR
- 🔄 **Smart Caching** - TanStack Query for efficient data fetching and caching

## 🛠️ Tech Stack

### Core

- **[React 18](https://react.dev/)** - UI library with modern features
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety and better DX
- **[Vite](https://vitejs.dev/)** - Next generation frontend tooling

### State Management & Data Fetching

- **[TanStack Query](https://tanstack.com/query)** - Powerful data synchronization
- **[Redux Toolkit](https://redux-toolkit.js.org/)** - State management for cached data

### Styling

- **[Tailwind CSS 3](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React Spring](https://www.react-spring.dev/)** - Smooth animations

### Routing

- **[React Router v6](https://reactrouter.com/)** - Client-side routing

### API

- **[PokéAPI](https://pokeapi.co/)** - RESTful Pokémon API

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd r-pokedex
```

2. **Install dependencies**

```bash
npm install
```

3. **Start development server**

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 📁 Project Structure

```
src/
├── api/                    # API layer
│   ├── axios.ts           # Axios instance and request handler
│   └── fromApi.ts         # API endpoints
├── components/            # React components
│   ├── PokemonCard.tsx   # Pokemon card with type colors
│   ├── PokemonDetails*   # Detail page components
│   ├── Modal.tsx         # Reusable modal
│   ├── Navbar.tsx        # Navigation bar
│   └── ...
├── features/             # Redux slices (cached data)
│   ├── cachedPokemonsSlice.ts  # Search/filter logic
│   ├── pokemonSlice.ts         # Pokemon data
│   ├── speciesSlice.ts         # Species data
│   └── evolutionChainSlice.ts  # Evolution data
├── hooks/                # Custom React hooks
│   ├── usePokemonQueries.ts   # TanStack Query hooks
│   ├── useResize.ts           # Window resize hook
│   └── useScrollDirection.ts  # Scroll detection
├── lib/                  # Library configurations
│   └── queryClient.ts    # TanStack Query config
├── pages/                # Page components
│   ├── PokemonsPage.tsx       # Home page with list
│   └── PokemonDetailsPage.tsx # Pokemon detail page
├── utils/                # Utility functions
│   ├── capitalize.ts     # String capitalization
│   ├── leftPad.ts       # Number padding
│   ├── romanize.ts      # Roman numeral conversion
│   └── ...
├── App.tsx              # Root component
├── Routes.tsx           # Route definitions
└── globals.ts           # Global constants & types
```

## 🔄 Data Fetching Flow

### Architecture Overview

The application uses a **hybrid approach** combining Redux Toolkit and TanStack Query:

```
┌─────────────────────────────────────────────────────────┐
│                     Application                          │
├─────────────────────────────────────────────────────────┤
│  Redux (Cached Data)          TanStack Query (API)      │
│  ├─ Search/Filter             ├─ Pokemon Details        │
│  ├─ Generation Filter         ├─ Species Info           │
│  └─ Cached Pokemon List       └─ Evolution Chains       │
└─────────────────────────────────────────────────────────┘
```

### 1. Initial Load - Cached Pokemon List (Redux)

**File:** `src/features/cachedPokemonsSlice.ts`

```typescript
App Load → getCachedPokemons() → Fetch 809 Pokemon
                                 ↓
                          Store in Redux Cache
                                 ↓
                          Available for Search/Filter
```

**Flow:**

1. App loads → Dispatch `getCachedPokemons()`
2. Fetches all Pokemon names and URLs (Generation 1-7)
3. Stores in Redux for instant search/filter operations
4. Shows splash screen until loaded

### 2. Home Page - Paginated List (TanStack Query)

**File:** `src/pages/PokemonsPage.tsx`

```typescript
Home Page Load
    ↓
usePokemonList(809) → Get all Pokemon URLs
    ↓
Calculate IDs to fetch based on page (0-6, 7-12, etc.)
    ↓
usePokemons([ids]) → Parallel fetch Pokemon data
    ↓
Display cards + Show skeletons for loading items
    ↓
Scroll/Click Load More → Fetch next batch
```

**Key Features:**

- **Parallel Fetching:** Uses `useQueries` to fetch multiple Pokemon simultaneously
- **Smart Pagination:** Calculates which Pokemon to fetch based on scroll position
- **Loading States:** Shows skeleton cards for items being fetched
- **Automatic Caching:** Previously loaded Pokemon are cached

### 3. Detail Page - Single Pokemon (TanStack Query)

**File:** `src/pages/PokemonDetailsPage.tsx`

```typescript
Click Pokemon Card → Navigate to /pokemons/:id
    ↓
┌─────────────────────────────────────────────────────┐
│  Parallel Queries (All fetch simultaneously)        │
├─────────────────────────────────────────────────────┤
│  usePokemon(id)           → Pokemon data            │
│  useSpecies(id)           → Species data            │
│  useEvolutionChain(id)    → Evolution chain         │
└─────────────────────────────────────────────────────┘
    ↓
All data loaded → Display Pokemon details
    ↓
Evolution Chain → usePokemons([evolution_ids])
                → Fetch all evolution Pokemon
```

**Flow:**

1. Navigate to detail page with Pokemon ID
2. **Three parallel queries** fetch simultaneously:
   - Pokemon data (stats, types, abilities)
   - Species data (description, gender ratio, etc.)
   - Evolution chain (evolution tree)
3. Extract evolution Pokemon IDs
4. **Parallel fetch** all evolution Pokemon
5. Display everything with loading states

### 4. TanStack Query Configuration

**File:** `src/lib/queryClient.ts`

```typescript
{
  staleTime: 5 minutes,      // Data fresh for 5 min
  gcTime: 10 minutes,        // Cache persists 10 min
  retry: 1,                  // Retry failed requests once
  refetchOnWindowFocus: false // Don't refetch on focus
}
```

### 5. Custom Query Hooks

**File:** `src/hooks/usePokemonQueries.ts`

Available hooks:

```typescript
usePokemonList(limit)          // Get all Pokemon URLs
usePokemon(id)                 // Get single Pokemon
usePokemons(ids[])             // Get multiple Pokemon in parallel
useSpecies(id)                 // Get species data
useEvolutionChain(chainId)     // Get evolution chain
```

### Data Flow Diagram

```
┌──────────────┐
│   PokéAPI    │
└──────┬───────┘
       │
       ├─────────────────────────────────────┐
       │                                     │
       v                                     v
┌──────────────┐                    ┌──────────────┐
│   Axios      │                    │  TanStack    │
│  (Network)   │                    │   Query      │
└──────┬───────┘                    │  (Cache)     │
       │                             └──────┬───────┘
       │                                    │
       v                                    v
┌──────────────┐                    ┌──────────────┐
│ camelCase    │                    │   React      │
│ Transform    │                    │ Components   │
└──────┬───────┘                    └──────────────┘
       │
       └────────────────────────────────────┘
```

## 🎨 Key Features Explained

### Infinite Scroll

- Uses `react-waypoint` to detect scroll position
- Automatically loads 6 more Pokemon when reaching bottom
- Shows skeleton cards during loading
- Load More button as alternative

### Search & Filter

- Real-time search by Pokemon name
- Filter by generation (I-VII)
- Uses fuzzy matching for better results
- Instant results from cached data

### Type-Based Theming

- Cards automatically themed by Pokemon type
- 18 unique color schemes (Fire, Water, Grass, etc.)
- Gradient backgrounds for visual appeal

### Progressive Image Loading

- Shows placeholder image first
- Loads high-quality image in background
- Smooth transition when loaded

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration with React and SVGR plugins
- `tailwind.config.js` - Tailwind CSS customization
- `tsconfig.json` - TypeScript compiler options
- `postcss.config.js` - PostCSS plugins

## 📝 Environment Variables

No environment variables required! The app uses the public PokéAPI.

## 🚢 Building for Production

```bash
npm run build
```

Output will be in the `build/` directory.

Preview the production build:

```bash
npm run preview
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [PokéAPI](https://pokeapi.co/) for the comprehensive Pokémon data
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [TanStack Query](https://tanstack.com/query) for the excellent data fetching library

---

**Built with ❤️ and ⚡ Vite**
