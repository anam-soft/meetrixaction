"use client"

import { useCallback, useState } from "react"
import { Upload, FileAudio, X, AlertCircle, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface UploadMeetingProps {
  onUploadComplete: (meetingId: string) => void
  canUpload: boolean
  onUpgradeClick: () => void
}

export default function UploadMeeting({
  onUploadComplete,
  canUpload,
  onUpgradeClick,
}: UploadMeetingProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
  const SUPPORTED_FORMATS = [
    "audio/mpeg",
    "audio/wav",
    "audio/mp3",
    "audio/m4a",
    "audio/x-m4a",
    "video/mp4",
    "video/quicktime",
  ]

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
    }

    if (!SUPPORTED_FORMATS.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|mp4|mov)$/i)) {
      return "Unsupported format. Please upload MP3, WAV, M4A, MP4, or MOV files"
    }

    return null
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)

    const file = e.dataTransfer.files[0]
    if (file) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
      setSelectedFile(file)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = e.target.files?.[0]
    if (file) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !canUpload) return

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("title", selectedFile.name.replace(/\.[^/.]+$/, ""))

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const res = await fetch("/api/meetings", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Upload failed")
      }

      const data = await res.json()

      // Start processing
      await fetch(`/api/meetings/${data.meeting.id}/process`, {
        method: "POST",
      })

      // Reset and notify
      setTimeout(() => {
        setSelectedFile(null)
        setUploadProgress(0)
        onUploadComplete(data.meeting.id)
      }, 500)
    } catch (error: any) {
      setError(error.message || "Upload failed. Please try again.")
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  if (!canUpload) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-xl font-bold mb-2">Upload Limit Reached</h3>
        <p className="text-muted-foreground mb-6">
          You've reached your monthly limit. Upgrade to Pro for unlimited meetings.
        </p>
        <button
          onClick={onUpgradeClick}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow"
        >
          Upgrade to Pro
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Drag & Drop Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all
          ${isDragging
            ? "border-purple-500 bg-purple-500/10"
            : "border-white/20 hover:border-white/40"
          }
          ${selectedFile ? "bg-white/5" : ""}
        `}
      >
        <input
          type="file"
          id="file-upload"
          accept="audio/*,video/mp4,video/quicktime"
          onChange={handleFileSelect}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {!selectedFile ? (
            <motion.div
              key="upload-prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Upload Your Meeting</h3>
              <p className="text-muted-foreground mb-6">
                Drag and drop your file here, or click to browse
              </p>
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow cursor-pointer"
              >
                Choose File
              </label>
              <p className="text-xs text-muted-foreground mt-4">
                Supported: MP3, WAV, M4A, MP4, MOV (max 100MB)
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="file-preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative"
            >
              <button
                onClick={() => setSelectedFile(null)}
                className="absolute top-0 right-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 p-6 rounded-xl bg-purple-500/10 border border-purple-500/30">
                <div className="p-4 rounded-xl bg-purple-500/20">
                  <FileAudio className="w-8 h-8 text-purple-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-lg">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Uploading...</span>
              <span className="font-semibold">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Button */}
      {selectedFile && !uploading && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleUpload}
          disabled={uploading}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Upload & Process Meeting
        </motion.button>
      )}
    </div>
  )
}
