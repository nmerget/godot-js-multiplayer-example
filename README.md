# GodotJS Multiplayer Example

A real-time multiplayer game built with Godot Engine using TypeScript via [GodotJS](https://github.com/godotjs/GodotJS), featuring a Hono backend for WebSocket communication and shared TypeScript types between client and server.

🎮 **Live Demo**: [godotjs-multiplayer-example.nicolasmerget.de](https://godotjs-multiplayer-example.nicolasmerget.de/)

## Architecture

This project consists of four main workspaces:

- **`backend/`** - Hono server handling WebSocket connections and serving the built game
- **`game/`** - Godot game client written in TypeScript using GodotJS
- **`shared/`** - Shared TypeScript types used by both backend and game
- **`godot/`** - Godot editor setup and export templates for web builds

## Prerequisites

- Node.js 22+
- pnpm (automatically managed via packageManager field)

## Installation

Install all dependencies and download Godot Engine:

```shell
pnpm install
```

This will:
- Install npm dependencies for all workspaces
- Download Godot Engine editor and web export templates
- Set up the development environment

## Development

Start the development environment:

```shell
pnpm run dev
```

This runs all workspaces in parallel:
- Opens Godot editor for game development
- Starts the backend server with hot reload
- Watches TypeScript files for changes

### Individual Workspace Commands

```shell
# Backend only
cd backend && pnpm dev

# Game TypeScript compilation only
cd game && pnpm dev

# Godot editor only
cd godot && pnpm dev
```

## Building

Build the entire project:

```shell
pnpm build
```

This will:
1. Build the backend TypeScript to JavaScript
2. Compile game TypeScript and export Godot project for web
3. Prepare Godot export templates

## Production

Start the production server:

```shell
pnpm start
```

## Project Structure

```
├── backend/           # Hono server with WebSocket support
│   ├── src/
│   │   ├── index.ts   # Main server entry point
│   │   └── types.d.ts # Backend-specific types
│   └── dist/          # Built JavaScript output
├── game/              # Godot game project
│   ├── src/           # TypeScript game logic
│   ├── scenes/        # Godot scene files
│   └── build-scripts/ # Post-build processing
├── shared/            # Shared TypeScript types
│   └── src/index.ts   # Common types and interfaces
├── godot/             # Godot engine and templates
│   ├── editor/        # Godot editor executable
│   ├── templates/     # Web export templates
│   └── scripts/       # Build and setup scripts
└── .github/workflows/ # CI/CD configuration
```

## Technology Stack

- **Game Engine**: [Godot Engine](https://godotengine.org/) with [GodotJS](https://github.com/godotjs/GodotJS)
- **Backend**: [Hono](https://hono.dev/) with WebSocket support
- **Language**: TypeScript (shared between client and server)
- **Package Manager**: pnpm with workspace support
- **CI/CD**: GitHub Actions
- **Hosting**: [Dokploy](https://github.com/dokploy/dokploy) on [Hetzner](https://www.hetzner.com/) via [Railpack](https://github.com/railwayapp/railpack)

## Development Workflow

1. **Game Development**: Use the Godot editor to create scenes and attach TypeScript scripts
2. **Backend Development**: Modify the Hono server in `backend/src/`
3. **Shared Types**: Update common interfaces in `shared/src/`
4. **Testing**: The dev command runs everything in parallel for immediate feedback
5. **Building**: Use `pnpm build` to create production-ready builds

## Deployment

The project uses GitHub Actions for CI/CD:

1. **Build**: Automatically builds on push to main branch
2. **Artifacts**: Backend dist folder is uploaded as build artifact
3. **Deploy**: Hosted via Dokploy on Hetzner infrastructure

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `pnpm dev`
5. Build with `pnpm build`
6. Submit a pull request

## License

MIT License - see LICENSE file for details