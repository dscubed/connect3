import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import FileUploadCube from "../../cube/FileUploadCube";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { parseDocument } from "@/lib/resume/parsers/documentParser";
import { toast } from "sonner";
import { ResumeChunkResult } from "./ChunkResumeModal";
import { useState } from "react";

export function ResumeUploadContent({
  file,
  setFile,
  onClose,
  setResult,
}: {
  file: File | null;
  setFile: (file: File | null) => void;
  onClose: () => void;
  setResult: (result: ResumeChunkResult) => void;
}) {
  const { makeAuthenticatedRequest, user } = useAuthStore.getState();
  const [fileProcessing, setFileProcessing] = useState(false);

  const handleProcessResume = async () => {
    if (!file) {
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
      const parseResult = await parseDocument(file);
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

      toast.success(`Resume ${file?.name} processed successfully!`);

      const data = await response.json();
      const result = data.result ?? data.chunks;
      if (!result) {
        toast.error("Failed to process resume. Please try again.");
        return;
      }
      setResult(result);
    } catch (err) {
      console.error("Error processing resume:", err);
      toast.error("Failed to process resume. Please try again.");
    } finally {
      setFileProcessing(false);
    }
  };

  return (
    <>
      <DialogTitle className="text-2xl font-semibold text-center drop-shadow-md">
        Upload Your Resume
      </DialogTitle>
      <DialogDescription className="text-center mb-16 text-muted drop-shadow-md">
        Upload your resume to auto fill your profile information.
      </DialogDescription>

      <FileUploadCube
        file={file}
        onFileChange={(file: File | null) => setFile(file)}
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
          disabled={!file || fileProcessing}
        >
          {fileProcessing ? "Processing..." : "Process Resume"}
        </Button>
      </div>
    </>
  );
}
