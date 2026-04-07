import type { PrismaClient } from "@/generated/prisma/client"
import { getAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { initTRPC, TRPCError } from "@trpc/server"
import type { Session, User } from "better-auth"
import SuperJSON from "superjson"

export type TRPCContext = {
  session: {
    user: User
    session: Session
  } | null
  prisma: PrismaClient
}

export const createTRPCContext = async ({
  req,
}: {
  req: Request
}): Promise<TRPCContext> => {
  const authSession = await getAuth().api.getSession({
    headers: req.headers,
  })

  return {
    session: authSession,
    prisma: prisma,
  }
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: SuperJSON,
})

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authenticated",
    })
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      prisma: prisma,
    },
  })
})

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthenticated)
export const adminProcedure = t.procedure.use(isAuthenticated)
