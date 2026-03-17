// Copy to clipboard functionality
function copyToClipboard(text, btnElement) {
    // Create a temporary input to copy from
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    // Visual feedback on button
    const originalText = btnElement.innerText;
    btnElement.innerText = '✅';
    setTimeout(() => {
        btnElement.innerText = originalText;
    }, 1500);
}