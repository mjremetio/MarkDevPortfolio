export const downloadResume = () => {
  fetch('/api/download-resume')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to download resume');
      }
      return response.blob();
    })
    .then(blob => {
      // Create a blob URL for the file
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Mark_Remetio_Resume.pdf';
      
      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. Please try again later.');
    });
};