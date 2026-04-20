import { useParams as up } from "next/navigation"

export const useParams = <T extends Record<string, string>>() => {
  const params = up()
  return params as T
}
