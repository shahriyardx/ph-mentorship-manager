"use client"

const ConditionalRender = ({
  condition,
  children,
}: {
  condition: boolean
  children: React.ReactNode
}) => {
  if (!condition) return null
  return children
}

export default ConditionalRender
