import Header from "@/components/header"
import { Separator } from "@/components/ui/separator"

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div className="max-w-6xl mx-auto p-5">
        <Header />
        <Separator className="my-5" />

        {children}
      </div>
    </div>
  )
}

export default PublicLayout
