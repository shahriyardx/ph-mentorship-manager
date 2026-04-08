import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import SettingsForm from "@/components/forms/settings-form"

const page = () => {
  return (
    <DashboardPageWrapper pageTitle="Settings">
      <SettingsForm />
    </DashboardPageWrapper>
  )
}

export default page
