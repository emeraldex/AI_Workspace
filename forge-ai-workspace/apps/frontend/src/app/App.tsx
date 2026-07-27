// File: apps/frontend/src/app/App.tsx
// Purpose: Root application component. Providers, routing, and layout mount here
//          as frontend features are implemented in later phases.

export function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Forge AI Workspace</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Frontend scaffold is running. UI implementation begins in the next phase.
        </p>
      </div>
    </div>
  )
}
