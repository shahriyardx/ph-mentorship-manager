import AddBatchForm from "@/components/forms/add-batch-form"
import AddMentorForm from "@/components/forms/add-mentor-form"

const page = () => {
  return (
    <div>
      <div className="space-y-5">
        <AddBatchForm />
        <AddMentorForm />
      </div>
    </div>
  )
}

export default page
