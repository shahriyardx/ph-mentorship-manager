import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import SettingsForm from "@/components/forms/settings-form"

const page = () => {
  return (
    <DashboardPageWrapper pageTitle="Settings">
      <div>
        <h1 className="text-2xl font-bold mb-3">Settings</h1>
        <SettingsForm />
      </div>
    </DashboardPageWrapper>
  )
}

export default page
