export const downloadResume = () => {
  // Creating a link to download the PDF
  const link = document.createElement('a');
  link.href = '/api/download-resume';
  link.download = 'Mark_Remetio_CV.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
