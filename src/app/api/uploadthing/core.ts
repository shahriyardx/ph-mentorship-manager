import { auth } from "@/lib/auth"
import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"

const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 10,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({
        headers: req.headers,
      })
      if (!session) throw new UploadThingError("Unauthorized")
      return session
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.user.id)
      console.log("file url", file.ufsUrl)

      return { uploadedBy: metadata.user.id }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
