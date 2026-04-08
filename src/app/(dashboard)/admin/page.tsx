import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import AddBatchForm from "@/components/forms/add-batch-form"
import AddMentorForm from "@/components/forms/add-mentor-form"

const page = () => {
  return (
    <DashboardPageWrapper pageTitle="Admin">
      <div>
        <div className="space-y-5">
          <AddBatchForm />
          <AddMentorForm />
        </div>
      </div>
    </DashboardPageWrapper>
  )
}

export default page
