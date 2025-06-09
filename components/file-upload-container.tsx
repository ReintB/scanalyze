"use client";

import { useState } from "react";

import FileUpload from "./file-upload";
import { FileWithPreview } from "@/types/file";
import { toast } from "sonner";

const FileUploadContainer = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const handleChange = (newFiles: FileWithPreview[]) => {
    setFiles(newFiles);
  };

  const handleRemove = (fileToRemove: FileWithPreview) => {
    setFiles(files.filter(file => file !== fileToRemove));
    toast.success("File removed successfully");
  };

  return (
    <div className="w-full">
      <FileUpload
        value={files}
        onChange={handleChange}
        onRemove={handleRemove}
        maxFiles={1}
        maxSize={20}
        accept={{
          "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
          "application/pdf": [".pdf"],
        }}
      />
    </div>
  );
};

export default FileUploadContainer;