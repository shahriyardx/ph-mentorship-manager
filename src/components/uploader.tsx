"use client"

import { useState } from "react"
import { Input } from "./ui/input"
import { useUploadThing } from "@/lib/uploadthing"
import { Button } from "./ui/button"
import { useDropzone } from "@uploadthing/react"

const Uploader = () => {
  const [files, setFiles] = useState<File[]>([])
  const [progress, setProgress] = useState(0)

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      console.log(res)
    },
    onUploadError: (error) => {
      console.log(error.message)
    },
    uploadProgressGranularity: "fine",
    onUploadProgress: (progress) => {
      setProgress((_) => progress)
    },
  })

  const { getInputProps, getRootProps } = useDropzone({
    onDrop: (files) => {
      console.log(files)
      setFiles(files)
    },
  })

  return (
    <div>
      <div {...getRootProps()} className="p-5 bg-zinc-500 rounded-md">
        <Input type="file" accept="image/*" multiple {...getInputProps()} />
        <p>Drop Files Here</p>
      </div>
      <Button type="button" onClick={() => startUpload(files)} className="mt-3">
        Upload {isUploading && <span>{progress}</span>}
      </Button>
    </div>
  )
}

export default Uploader
