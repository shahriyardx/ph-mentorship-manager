"use client"

import { Button } from "@/components/ui/button"

export const ReloadButton = () => {
  return <Button onClick={() => window.location.reload()}>Reload</Button>
}
