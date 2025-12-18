import { Outlet } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-base font-body text-text">
      <PageContainer
        as="div"
        width="wide"
        paddingX="roomy"
        paddingY="cozy"
        className="flex min-h-screen flex-col"
      >
        <PageHeader
          variant="admin"
          eyebrow="Admin Console"
          title="Setup Workspace"
          className="mb-6 border-b border-border/70 pb-6"
          align="left"
        />
        <main className="flex flex-1 flex-col gap-6">
          <Outlet />
        </main>
      </PageContainer>
    </div>
  )
}

export default AdminLayout
