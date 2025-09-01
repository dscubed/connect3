import FileUploadCube from "./cube/FileUploadCube";

interface FileUploadSectionProps {
  onFileUpload: (file: File) => void;
  files: File[];
  onFileRemove: (index: number) => void;
}

export default function FileUploadSection({
  onFileUpload,
  files,
  onFileRemove,
}: FileUploadSectionProps) {
  return (
    <div className="space-y-8">
      <FileUploadCube
        onFileUpload={onFileUpload}
        files={files}
        onFileRemove={onFileRemove}
      />
      <div className="text-center space-y-2">
        <p className="text-white/80">
          share your resume/portfolio to quickstart your profile
        </p>
        <p className="text-white/50 text-sm max-w-md mx-auto">
          Upload up to 2 files. Not up to date? No worries! You can always
          update them later.
        </p>
      </div>
    </div>
  );
}
