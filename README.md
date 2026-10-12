# CineScope — Movie Explorer

CineScope is a modern, responsive movie discovery application built with React, TypeScript, and Tailwind CSS. It helps users discover trending movies, explore popular titles, search for movies, view detailed movie information, and maintain a personal watchlist.

The application uses The Movie Database (TMDB) API to retrieve movie information and deliver a dynamic movie browsing experience through a clean, cinematic interface.

**Live Demo:** Add your deployed URL here

**GitHub Repository:** [CineScope-Movie-Explorer](https://github.com/mxhitsharmaa/CineScope-Movie-Explorer)

---

## Table of Contents

- Overview
- Features
- Technology Stack
- Application Pages
- Project Structure
- Prerequisites
- Installation and Setup
- Environment Variables
- Running the Application
- API Integration
- Routing
- Watchlist Management
- Responsive Design
- Performance and Accessibility
- Available Scripts
- Future Improvements
- Troubleshooting
- Contributing
- License
- Author

---

## Overview

CineScope is designed to provide a smooth and engaging experience for discovering movies across different genres and categories.

The application focuses on modern frontend development practices, reusable React components, type-safe data handling, responsive layouts, efficient API requests, and maintainable project architecture.

Users can browse movie collections, search for specific titles, explore movie details, and save movies to their personal watchlist.

The interface follows a cinematic design approach with a dark theme, visually rich movie posters, intuitive navigation, and responsive layouts for desktop, tablet, and mobile devices.

## Features

### Movie Discovery

- Browse trending movies and popular titles.
- Explore top-rated movies.
- Display movie posters, titles, release dates, and ratings.
- Discover movies by genre.
- View movie collections through reusable card components.

### Search and Filtering

- Search for movies by title.
- Implement debounced search to reduce unnecessary API requests.
- Filter movies by genre.
- Sort and browse movie results.
- Support infinite scrolling or paginated results.
- Display appropriate loading, empty, and error states.

### Movie Details

- View detailed movie information.
- Display movie overview and release date.
- Show genres, ratings, and runtime when available.
- Display movie backdrops and posters.
- Explore cast and related movie information when supported by the API.
- Provide access to available trailers when implemented.

### Personal Watchlist

- Add movies to a personal watchlist.
- Remove movies from the watchlist.
- Save watchlist data using browser local storage.
- Restore saved movies after refreshing the page.
- Display an informative empty state when no movies have been saved.

### User Interface

- Modern, cinematic dark-themed interface.
- Responsive layout for desktop, tablet, and mobile devices.
- Reusable and maintainable React components.
- Smooth hover effects and subtle transitions.
- Consistent typography, spacing, and visual hierarchy.
- Accessible navigation and interactive controls.
- Loading indicators and user-friendly error messages.

### Navigation

- Client-side routing with React Router.
- Dedicated pages for home, search, movie details, and watchlist.
- Dynamic movie detail routes using movie IDs.
- A fallback page for unknown routes.
- Browser navigation support.

## Technology Stack

| Technology | Purpose |
| --- | --- |
| React | Building reusable and interactive user interfaces |
| TypeScript | Type safety and maintainable application code |
| Tailwind CSS | Responsive styling and UI development |
| Vite | Development server and production build tooling |
| React Router | Client-side routing and page navigation |
| TMDB API | Movie data, posters, ratings, and related information |
| Lucide React | Consistent interface icons |
| Browser Local Storage | Persistent client-side watchlist |
| Git and GitHub | Version control and source code hosting |

## Application Pages

### 1. Home Page

The home page serves as the primary discovery screen.

It can include:

- Featured movie section.
- Trending movies.
- Popular movies.
- Top-rated titles.
- Genre-based collections.
- Movie cards with essential information.

### 2. Search Page

The search page allows users to find movies using a search query.

It can include:

- Search input with debouncing.
- Search results grid.
- Genre filters and sorting options.
- Pagination or infinite scrolling.
- Loading and no-results states.

### 3. Movie Details Page

Each movie has a dedicated details page accessible through a dynamic route.

It can include:

- Movie poster and backdrop.
- Title and overview.
- Release date and rating.
- Runtime and genres.
- Cast and crew information.
- Trailer access when available.
- Add-to-watchlist functionality.

### 4. Watchlist Page

The watchlist page displays movies saved by the user.

It can include:

- Saved movie cards.
- Remove-from-watchlist functionality.
- Persistent data using local storage.
- Navigation to movie details.
- An empty state when the watchlist contains no movies.

### 5. Not Found Page

A fallback page handles invalid or unknown application routes and provides a way to return to the home page.

## Project Structure

The following structure represents the intended application architecture. Add or adjust files as the implementation evolves.

```text
CineScope-Movie-Explorer/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── MovieCard.tsx
│   │   ├── MovieGrid.tsx
│   │   ├── SearchBar.tsx
│   │   ├── GenreFilter.tsx
│   │   └── LoadingState.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Search.tsx
│   │   ├── MovieDetails.tsx
│   │   ├── Watchlist.tsx
│   │   └── NotFound.tsx
│   ├── services/
│   │   └── tmdb.ts
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   └── useWatchlist.ts
│   ├── types/
│   │   └── movie.ts
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.local
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Prerequisites

Before running CineScope locally, make sure you have the following installed:

- Node.js (a supported LTS version).
- npm, which is included with Node.js.
- Git.
- A TMDB account and API credentials for accessing movie data.
- A code editor such as Visual Studio Code.

Verify your installation:

```bash
node --version
npm --version
git --version
```

## Installation and Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/mxhitsharmaa/CineScope-Movie-Explorer.git
```

### Step 2: Navigate to the project directory

```bash
cd CineScope-Movie-Explorer
```

### Step 3: Install dependencies

```bash
npm install
```

### Step 4: Configure environment variables

Create a `.env.local` file in the project root and add your TMDB API Read Access Token.

```env
VITE_TMDB_ACCESS_TOKEN=your_tmdb_read_access_token
```

Replace the placeholder with your actual token.

Do not commit `.env.local` to GitHub.

### Step 5: Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

The development server supports hot module replacement, allowing changes to appear in the browser as you edit the application.

## Environment Variables

| Variable | Description |
| --- | --- |
| `VITE_TMDB_ACCESS_TOKEN` | TMDB API Read Access Token used by the frontend |

Environment variables prefixed with `VITE_` are exposed to client-side code by Vite. Therefore, the token must not be treated as a private secret. For stronger credential protection, route requests through a backend service that keeps private credentials server-side.

Make sure `.env.local` is included in `.gitignore`.

Example:

```gitignore
node_modules/
dist/
.env
.env.*
!.env.example
```

If you provide an `.env.example` file, include only placeholder values, never real credentials.

After changing environment variables, restart the development server.

## API Integration

CineScope uses The Movie Database (TMDB) API to retrieve movie information.

Official resources:

- TMDB website: https://www.themoviedb.org/
- TMDB API documentation: https://developer.themoviedb.org/docs
- TMDB API reference: https://developer.themoviedb.org/reference/intro/getting-started

### Setting Up TMDB

1. Create an account on TMDB.
2. Open your account settings.
3. Navigate to the API section.
4. Request API access if required.
5. Obtain your API Read Access Token.
6. Add the token to `.env.local`.
7. Restart the Vite development server.

### API Service

Centralize API requests in `src/services/tmdb.ts` rather than repeating fetch logic throughout the application.

The service can handle:

- Trending movie requests.
- Popular movie requests.
- Top-rated movie requests.
- Movie search.
- Movie details.
- Genre lists.
- Cast and credits.
- Videos and trailers.
- Pagination and API errors.

Use TypeScript interfaces to define movie data structures and handle optional API fields safely.

The application should handle failed requests, invalid credentials, unavailable results, and loading states gracefully.

## Routing

React Router provides client-side navigation between application pages.

Suggested route configuration:

| Route | Page |
| --- | --- |
| `/` | Home page |
| `/search` | Search page |
| `/movie/:id` | Movie details page |
| `/watchlist` | Personal watchlist |
| `*` | Not found page |

Dynamic movie routes should use the movie ID provided by TMDB.

For example:

```text
/movie/550
```

The example ID represents a TMDB movie record; the application should fetch its actual details from the API.

## Watchlist Management

The watchlist can be implemented with React state and browser local storage.

Recommended behavior:

1. Load saved movie IDs or movie records when the application initializes.
2. Add a movie when the user selects the watchlist control.
3. Prevent duplicate entries.
4. Remove movies when requested.
5. Persist changes to local storage.
6. Keep watchlist controls synchronized across movie cards and detail pages.
7. Handle unavailable or malformed saved data safely.

Local storage provides persistence within the same browser, but it does not synchronize data across devices or provide account-based cloud storage.

## Responsive Design

CineScope is intended to work across different screen sizes.

The responsive interface should provide:

- Flexible movie grids.
- Mobile-friendly navigation.
- Readable typography.
- Properly sized movie posters.
- Touch-friendly controls.
- Responsive search and filter layouts.
- Optimized spacing on smaller screens.
- Appropriate image sizing for different devices.

Tailwind CSS utility classes can be used to implement responsive layouts with mobile-first breakpoints.

## Performance and Accessibility

The application should follow practical frontend performance and accessibility guidelines.

### Performance

- Debounce search input.
- Avoid unnecessary API requests.
- Use reusable components.
- Load appropriately sized movie images.
- Lazy-load images where suitable.
- Provide stable loading states.
- Clean up event listeners and asynchronous effects.
- Use pagination or infinite scrolling efficiently.
- Split routes into separate bundles if the application grows.
- Check production bundle size before deployment.

### Accessibility

- Use semantic HTML elements.
- Provide meaningful alternative text for movie posters.
- Label search fields and interactive controls.
- Ensure keyboard navigation works.
- Maintain sufficient text contrast.
- Provide visible focus indicators.
- Use descriptive page titles.
- Respect reduced-motion preferences where appropriate.

## Available Scripts

The standard Vite React TypeScript project provides the following scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create an optimized production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint if the script is configured |

Check `package.json` for the scripts actually available in your repository.

Build the application before deployment:

```bash
npm run build
```

The generated production files are placed in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

## Deployment

CineScope can be deployed to frontend hosting platforms that support Vite applications, such as Vercel, Netlify, or GitHub Pages.

General deployment steps:

1. Push the project to GitHub.
2. Import the repository into your chosen hosting platform.
3. Set the build command to `npm run build`.
4. Set the output directory to `dist`.
5. Configure required environment variables.
6. Deploy the application.
7. Verify that all routes, API requests, images, and watchlist functionality work correctly.

For single-page application routing, configure the hosting platform to serve `index.html` for application routes when required.

Remember that frontend environment variables are visible to visitors. Do not store private credentials in client-side variables.

## Future Improvements

Potential enhancements include:

- Advanced filtering by release year, rating, and genre.
- Dedicated genre pages.
- Movie recommendations.
- Related movies and collections.
- Trailer previews.
- Improved sorting and discovery options.
- Skeleton loading placeholders.
- Better offline and network-error handling.
- Unit and component tests.
- End-to-end testing.
- Optional user authentication and cloud-synced watchlists.
- Backend integration for protected API credentials.
- Internationalization and additional language support.
- Search engine optimization and social sharing metadata.

These improvements can be introduced incrementally as the application develops.

## Troubleshooting

### Application does not start

Install dependencies and restart the development server:

```bash
npm install
npm run dev
```

Confirm that your Node.js version is compatible with the installed Vite version.

### TMDB API requests fail

Check the following:

- The token is valid.
- The environment variable name matches the code.
- `.env.local` is located in the project root.
- The development server was restarted after changing environment variables.
- The API request URL and endpoint are correct.
- The API response and browser console do not indicate authorization or network errors.

### Movie posters are missing

Verify that the application constructs valid TMDB image URLs, uses supported image sizes, and handles missing poster paths.

### Watchlist data does not persist

Confirm that local storage is enabled in the browser and that the application updates the stored value when movies are added or removed.

### Movie detail routes return a 404 after deployment

Configure the hosting provider to rewrite application routes to `index.html` where necessary.

## Contributing

Contributions, bug reports, and suggestions are welcome.

To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Commit your work with a clear message.
5. Push the branch to your fork.
6. Open a pull request describing the changes.

Please keep components reusable, maintain TypeScript type safety, and follow the existing project conventions.

## License

A license has not yet been specified for this project.

If you intend to distribute the source code for reuse, add an appropriate license file and update this section.

## Author

**Mohit Sharma**

Frontend Developer

- GitHub: https://github.com/mxhitsharmaa
- Portfolio: https://mohitttt.site.je

CineScope is a portfolio project focused on modern frontend development, responsive UI design, API integration, and practical React and TypeScript application architecture.
