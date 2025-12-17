import { Outlet } from 'react-router-dom'

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-base font-body text-text">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10">
        <header className="mb-6 flex flex-col gap-2 border-b border-border/70 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-subtle">
            Admin Console
          </p>
          <p className="font-display text-2xl text-text">Setup Workspace</p>
        </header>
        <main className="flex flex-1 flex-col gap-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
