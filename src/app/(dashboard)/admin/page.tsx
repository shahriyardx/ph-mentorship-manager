import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import AddBatchForm from "@/components/forms/add-batch-form"

const page = () => {
  return (
    <DashboardPageWrapper pageTitle="Admin Dashboard">
      <div className="space-y-5">
        <AddBatchForm />
      </div>
    </DashboardPageWrapper>
  )
}

export default page
