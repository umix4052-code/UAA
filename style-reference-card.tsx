import React from 'react';
import { ReferenceFile } from './types';

interface StyleReferenceCardProps {
    isDragging: boolean;
    setIsDragging: (isDragging: boolean) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    referenceFiles: ReferenceFile[];
    onDeleteFile: (fileName: string) => void;
}

export const StyleReferenceCard: React.FC<StyleReferenceCardProps> = ({
    isDragging,
    setIsDragging,
    onDrop,
    onPaste,
    fileInputRef,
    onFileUpload,
    referenceFiles,
    onDeleteFile
}) => {
    return (
        <div className="card style-reference-card">
            <h2>Style Reference (Manual)</h2>
            <p className="description">Upload or paste images to auto-detect style (Theme, Modifiers & Camera Angle).</p>
            <div 
                className={`drop-zone ${isDragging ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onPaste={onPaste}
                tabIndex={0}
            >
                <p>Drag & Drop images here, paste from clipboard (Ctrl+V), or click button to upload.</p>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={onFileUpload} 
                    accept="image/*" 
                    multiple
                    style={{display: 'none'}} 
                />
                <button onClick={() => fileInputRef.current?.click()}>Upload Images</button>
            </div>
            {referenceFiles.length > 0 && (
                <div className="reference-files-grid">
                    {referenceFiles.map((file, index) => (
                        <div key={index} className="ref-file-item">
                            <img src={file.dataUrl || undefined} alt={file.name} className="ref-file-preview" />
                            <button onClick={() => onDeleteFile(file.name)} className="ref-delete-btn">×</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};