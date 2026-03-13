import { createTRPCRouter, publicProcedure } from "../init"

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure.query(() => {
    return { message: "TRPC is working" }
  }),
})
