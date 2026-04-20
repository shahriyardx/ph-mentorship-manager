import AddBatchForm from "@/components/forms/add-batch-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export const CreateBatchDialog = () => {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Create Batch</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Batch</DialogTitle>
        </DialogHeader>
        <AddBatchForm />
        <DialogFooter>
          <Button type="submit" form="add-batch-form">
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
