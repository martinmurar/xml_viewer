import { processXML } from "./xmlProcessor.js";

export function initializeDragDrop() {
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");

    if (!dropZone || !fileInput) return;

    // Prevent default drag and drop behavior
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop zone when dragging over
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.style.backgroundColor = '#f0f0f0';
            dropZone.style.borderColor = '#000';
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.style.backgroundColor = '';
            dropZone.style.borderColor = '';
        });
    });

    // Handle dropped files
    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });

    // Handle file input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Make drop zone clickable
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
}

function handleFileUpload(file) {
    const status = document.getElementById("loadingStatus");
    
    if (!file.name.toLowerCase().endsWith('.xml')) {
        status.textContent = 'Please select an XML file';
        status.style.color = 'red';
        return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
        const xmlText = e.target.result;
        await processXML(xmlText);
    };

    reader.onerror = () => {
        status.textContent = 'Error reading file';
        status.style.color = 'red';
    };

    reader.readAsText(file);
}