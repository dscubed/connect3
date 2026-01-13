import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import FileUploadCube from "../../cube/FileUploadCube";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { parseDocument } from "@/lib/resume/parsers/documentParser";
import { toast } from "sonner";
import { ResumeChunkResult } from "./ChunkResumeModal";
import { useState } from "react";

export function ResumeUploadContent({
  files,
  setFiles,
  onClose,
  setResult,
}: {
  files: File[];
  setFiles: (files: File[]) => void;
  onClose: () => void;
  setResult: (result: ResumeChunkResult) => void;
}) {
  const { makeAuthenticatedRequest, user } = useAuthStore.getState();
  const [fileProcessing, setFileProcessing] = useState(false);

  const handleProcessResume = async () => {
    if (files.length === 0) {
      toast.error("Please upload a resume before processing.");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to upload a resume.");
      return;
    }

    setFileProcessing(true);
    // Parse the file on the client and send text to the server
    try {
      const parseResult = await parseDocument(files[0]);
      if (!parseResult.success) {
        toast.error(parseResult.error || "Failed to parse resume.");
        return;
      }

      const resumeText = parseResult.text || "";

      const response = await makeAuthenticatedRequest("/api/profiles/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: user.id,
          text: resumeText,
        }),
      });

      if (!response.ok) {
        const respText = await response.text().catch(() => null);
        console.error("Resume processing failed:", respText);
        toast.error("Failed to process resume. Please try again.");
        return;
      }

      toast.success(
        `Resume ${files.map((f) => f.name).join(", ")} processed successfully!`
      );

      setResult((await response.json()).chunks);
    } catch (err) {
      console.error("Error processing resume:", err);
      toast.error("Failed to process resume. Please try again.");
    } finally {
      setFileProcessing(false);
    }
  };

  return (
    <>
      <DialogTitle className="text-2xl font-semibold text-center text-white drop-shadow-md">
        Upload Your Resume
      </DialogTitle>
      <DialogDescription className="text-center mb-16 text-white/80 drop-shadow-md">
        Upload your resume to auto fill your profile information.
      </DialogDescription>

      <FileUploadCube
        files={files}
        onFileUpload={(file: File) => setFiles([file])}
        onFileRemove={() => setFiles([])}
      />

      <div className="flex flex-row w-full justify-center gap-6 mt-12">
        <Button
          variant="default"
          className="block shadow-lg hover:bg-background/80"
          onClick={onClose}
        >
          Cancel Upload
        </Button>
        <Button
          variant="default"
          className="block shadow-lg text-background bg-foreground hover:bg-foreground/80"
          onClick={handleProcessResume}
          disabled={files.length === 0 || fileProcessing}
        >
          {fileProcessing ? "Processing..." : "Process Resume"}
        </Button>
      </div>
    </>
  );
}
