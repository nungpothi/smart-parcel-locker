import { Outlet } from 'react-router-dom'

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-base font-body text-lg leading-relaxed text-text">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-10 sm:px-10">
        <main className="flex flex-1 flex-col gap-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default PublicLayout
