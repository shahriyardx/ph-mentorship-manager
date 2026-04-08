import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import AddBatchForm from "@/components/forms/add-batch-form"
import AddMentorForm from "@/components/forms/add-mentor-form"

const page = () => {
  return (
    <DashboardPageWrapper pageTitle="Admin Dashboard">
      <div className="space-y-5">
        <AddBatchForm />
        <AddMentorForm />
      </div>
    </DashboardPageWrapper>
  )
}

export default page
