import type { PrismaClient } from "@/generated/prisma/client"
import { getAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { initTRPC, TRPCError } from "@trpc/server"
import type { Session, User } from "better-auth"
import SuperJSON from "superjson"

export type TRPCContext = {
  session: {
    user: User & { role: "admin" | "user" | "mentor" }
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

const isRole = (role: ("admin" | "mentor" | "user" | "superadmin")[]) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authenticated",
      })
    }
    if (!role.includes(ctx.session.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not authorized to access this resource",
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
export const adminProcedure = t.procedure.use(isRole(["admin", "superadmin"]))
export const adminOrMentorProcedure = t.procedure.use(
  isRole(["admin", "mentor", "superadmin"]),
)
