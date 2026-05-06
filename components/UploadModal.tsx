"use client";

import { useState, useRef, useCallback } from "react";
import { X, Upload, FileText, Loader2, CheckCircle2, Sparkles, ArrowLeft } from "lucide-react";

type UploadStep = "choose" | "upload-file" | "paste-transcript" | "processing" | "complete";

interface ProcessingStep {
  label: string;
  status: "pending" | "active" | "complete";
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (meetingId: string) => void;
  isPro: boolean;
}

export default function UploadModal({ isOpen, onClose, onComplete, isPro }: UploadModalProps) {
  const [step, setStep] = useState<UploadStep>("choose");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [taskCount, setTaskCount] = useState(0);
  const [meetingId, setMeetingId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { label: "Uploading file...", status: "pending" },
    { label: "Transcribing audio...", status: "pending" },
    { label: "Analyzing content...", status: "pending" },
    { label: "Extracting action items...", status: "pending" },
    { label: "Saving meeting...", status: "pending" },
  ]);

  const maxFileSize = isPro ? Infinity : 200 * 1024 * 1024; // 200MB for free
  const acceptedFileTypes = [
    "audio/mpeg",
    "audio/wav",
    "audio/m4a",
    "audio/x-m4a",
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
  ];
  const acceptedExtensions = [".mp3", ".wav", ".m4a", ".mp4", ".mov", ".avi", ".webm"];

  const resetModal = () => {
    setStep("choose");
    setSelectedFile(null);
    setTranscript("");
    setMeetingTitle("");
    setError("");
    setTaskCount(0);
    setMeetingId("");
    setProcessingSteps([
      { label: "Uploading file...", status: "pending" },
      { label: "Transcribing audio...", status: "pending" },
      { label: "Analyzing content...", status: "pending" },
      { label: "Extracting action items...", status: "pending" },
      { label: "Saving meeting...", status: "pending" },
    ]);
  };

  const handleClose = () => {
    if (step !== "processing") {
      resetModal();
      onClose();
    }
  };

  const updateProcessingStep = (index: number, status: "active" | "complete") => {
    setProcessingSteps((prev) =>
      prev.map((step, i) => {
        if (i === index) return { ...step, status };
        if (i < index) return { ...step, status: "complete" };
        return step;
      })
    );
  };

  const handleFileSelect = (file: File) => {
    setError("");
    
    const isValidType = acceptedFileTypes.includes(file.type) || 
      acceptedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      setError("Invalid file type. Please upload an audio or video file.");
      return;
    }

    if (file.size > maxFileSize) {
      setError(`File size exceeds ${isPro ? "limit" : "200MB limit"}. ${!isPro ? "Upgrade to Pro for unlimited file size." : ""}`);
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [isPro]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const processFileUpload = async () => {
    if (!selectedFile) return;

    setStep("processing");
    setError("");

    try {
      updateProcessingStep(0, "active");
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (meetingTitle) formData.append("title", meetingTitle);

      await new Promise(resolve => setTimeout(resolve, 800));
      updateProcessingStep(0, "complete");

      updateProcessingStep(1, "active");
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateProcessingStep(1, "complete");

      updateProcessingStep(2, "active");
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateProcessingStep(2, "complete");

      updateProcessingStep(3, "active");
      const response = await fetch("/api/meetings", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process meeting");
      }

      const data = await response.json();
      updateProcessingStep(3, "complete");

      updateProcessingStep(4, "active");
      await new Promise(resolve => setTimeout(resolve, 500));
      updateProcessingStep(4, "complete");

      setTaskCount(data.taskCount || 0);
      setMeetingId(data.meetingId);
      setStep("complete");
    } catch (err: any) {
      setError(err.message || "Failed to process meeting");
      setStep("upload-file");
    }
  };

  const processTranscript = async () => {
    if (!transcript.trim()) {
      setError("Please enter a transcript");
      return;
    }

    setStep("processing");
    setError("");

    setProcessingSteps([
      { label: "Uploading transcript...", status: "pending" },
      { label: "Analyzing content...", status: "pending" },
      { label: "Extracting action items...", status: "pending" },
      { label: "Saving meeting...", status: "pending" },
    ]);

    try {
      updateProcessingStep(0, "active");
      await new Promise(resolve => setTimeout(resolve, 500));
      updateProcessingStep(0, "complete");

      updateProcessingStep(1, "active");
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateProcessingStep(1, "complete");

      updateProcessingStep(2, "active");
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: transcript.trim(),
          title: meetingTitle.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process meeting");
      }

      const data = await response.json();
      updateProcessingStep(2, "complete");

      updateProcessingStep(3, "active");
      await new Promise(resolve => setTimeout(resolve, 500));
      updateProcessingStep(3, "complete");

      setTaskCount(data.taskCount || 0);
      setMeetingId(data.meetingId);
      setStep("complete");
    } catch (err: any) {
      setError(err.message || "Failed to process meeting");
      setStep("paste-transcript");
    }
  };

  const handleViewMeeting = () => {
    onComplete(meetingId);
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20 border border-white/10 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-purple-600/10 border-b border-white/10 p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 animate-pulse" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step !== "choose" && step !== "processing" && step !== "complete" && (
                <button
                  onClick={() => setStep("choose")}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                  {step === "choose" && (
                    <>
                      <Sparkles className="w-6 h-6 text-purple-400" />
                      Upload Meeting
                    </>
                  )}
                  {step === "upload-file" && "Upload Recording"}
                  {step === "paste-transcript" && "Paste Transcript"}
                  {step === "processing" && "Processing Meeting"}
                  {step === "complete" && "Meeting Ready!"}
                </h2>
                {step === "choose" && (
                  <p className="text-sm text-gray-400 mt-1">Choose how you'd like to add your meeting</p>
                )}
              </div>
            </div>
            {step !== "processing" && (
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-all hover:rotate-90 duration-300"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Step 1: Choose input type */}
          {step === "choose" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setStep("upload-file")}
                className="group relative p-8 bg-gradient-to-br from-purple-600/10 to-purple-600/5 border-2 border-purple-500/20 rounded-2xl hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Upload Recording</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Upload an audio or video file
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["MP3", "WAV", "M4A", "MP4"].map((format) => (
                      <span key={format} className="text-xs px-2 py-1 bg-white/5 rounded-full text-gray-400">
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              </button>

              <button
                onClick={() => setStep("paste-transcript")}
                className="group relative p-8 bg-gradient-to-br from-pink-600/10 to-pink-600/5 border-2 border-pink-500/20 rounded-2xl hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-600/0 to-pink-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Paste Transcript</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Already have a transcript?
                  </p>
                  <span className="text-xs px-3 py-1 bg-white/5 rounded-full text-gray-400">
                    Instant processing
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Step 2a: File upload */}
          {step === "upload-file" && (
            <div className="space-y-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? "border-purple-500 bg-purple-500/10 scale-105"
                    : selectedFile
                    ? "border-green-500/50 bg-green-500/5"
                    : "border-gray-700 hover:border-gray-600 hover:bg-white/5"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedExtensions.join(",")}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <div className={`transition-all duration-300 ${isDragging ? "scale-110" : ""}`}>
                  {selectedFile ? (
                    <CheckCircle2 className="w-20 h-20 mx-auto mb-4 text-green-400" />
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-20 animate-pulse" />
                      <Upload className={`relative w-20 h-20 mx-auto mb-4 ${isDragging ? "text-purple-400" : "text-gray-500"}`} />
                    </div>
                  )}
                  <p className="text-xl font-semibold text-white mb-2">
                    {selectedFile ? selectedFile.name : isDragging ? "Drop your file here" : "Drop your file here or click to browse"}
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    {selectedFile
                      ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                      : `MP3, WAV, M4A, MP4, MOV, AVI, WebM`}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full ${isPro ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "bg-white/10 text-gray-400"}`}>
                      {isPro ? "✨ Pro: Unlimited" : "Max: 200MB"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meeting Title <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="AI will generate if left blank"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder-gray-500"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in slide-in-from-top duration-300">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                onClick={processFileUpload}
                disabled={!selectedFile}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
              >
                Process Meeting
              </button>
            </div>
          )}

          {/* Step 2b: Transcript paste */}
          {step === "paste-transcript" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meeting Title <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="AI will generate if left blank"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meeting Transcript <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste your meeting transcript here..."
                  rows={14}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none text-white placeholder-gray-500"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    {transcript.length.toLocaleString()} characters
                  </p>
                  {transcript.length > 0 && (
                    <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded-full">
                      Ready to process
                    </span>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in slide-in-from-top duration-300">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                onClick={processTranscript}
                disabled={!transcript.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
              >
                Process Meeting
              </button>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === "processing" && (
            <div className="py-8">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                  <Loader2 className="relative w-20 h-20 text-purple-400 animate-spin" />
                </div>
              </div>
              <div className="space-y-4 max-w-md mx-auto">
                {processingSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 transition-all duration-300">
                    <div className="flex-shrink-0">
                      {step.status === "complete" && (
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                      )}
                      {step.status === "active" && (
                        <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                        </div>
                      )}
                      {step.status === "pending" && (
                        <div className="w-8 h-8 rounded-full border-2 border-gray-700" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium transition-colors ${
                        step.status === "complete"
                          ? "text-green-400"
                          : step.status === "active"
                          ? "text-purple-400"
                          : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500 mt-8 animate-pulse">
                Please don't close this window...
              </p>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === "complete" && (
            <div className="py-8 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-500">
                  <CheckCircle2 className="w-14 h-14 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-3 animate-in slide-in-from-bottom duration-500">
                Your meeting is ready!
              </h3>
              <p className="text-gray-400 mb-8 animate-in slide-in-from-bottom duration-500 delay-100">
                We extracted <span className="font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">{taskCount} action items</span> from your meeting
              </p>
              <button
                onClick={handleViewMeeting}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom duration-500 delay-200"
              >
                View Meeting
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
