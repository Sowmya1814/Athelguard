import React, { useEffect, useRef, useState } from "react";
import "./FileUpload.css";

function FileUpload({ addFile }) {
  const [showMenu, setShowMenu] = useState(false);

  const wrapperRef = useRef(null);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
  };

  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setShowMenu(false);
  };

  const handleFolderUploadClick = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click();
    }
    setShowMenu(false);
  };

  const handleCreateFolder = () => {
    const folderName = prompt("Enter folder name");

    if (folderName && folderName.trim() !== "") {
      addFile({
        name: folderName.trim(),
        type: "folder"
      });
    }

    setShowMenu(false);
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);

    selectedFiles.forEach((file) => {
      addFile({
        name: file.name,
        type: "file"
      });
    });

    event.target.value = "";
  };

  const handleFolderChange = (event) => {
    const selectedFiles = Array.from(event.target.files);

    if (selectedFiles.length > 0) {
      const folderPath = selectedFiles[0].webkitRelativePath;
      const folderName = folderPath.split("/")[0];

      addFile({
        name: folderName,
        type: "folder"
      });
    }

    event.target.value = "";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="driveUploadWrapper" ref={wrapperRef}>
      <button className="newButton" onClick={toggleMenu}>
        <span className="plusIcon">+</span>
        <span className="newText">New</span>
      </button>

      {showMenu && (
        <div className="uploadDropdown">
          <div className="dropdownRow" onClick={handleCreateFolder}>
            <span className="dropdownIcon">📁</span>
            <span>Create folder</span>
          </div>

          <div className="dropdownRow" onClick={handleFileUploadClick}>
            <span className="dropdownIcon">📄</span>
            <span>File upload</span>
          </div>

          <div className="dropdownRow" onClick={handleFolderUploadClick}>
            <span className="dropdownIcon">🗂</span>
            <span>Folder upload</span>
          </div>
        </div>
      )}

      <input
        type="file"
        multiple
        ref={fileInputRef}
        className="hiddenFileInput"
        onChange={handleFileChange}
      />

      <input
        type="file"
        ref={folderInputRef}
        className="hiddenFileInput"
        onChange={handleFolderChange}
        webkitdirectory="true"
        directory=""
        multiple
      />
    </div>
  );
}

export default FileUpload;