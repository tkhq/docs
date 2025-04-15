// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
  // Find the specific download link by its ID
  const smsDownloadLink = document.getElementById('sms-price-download-link');

  if (smsDownloadLink) {
    smsDownloadLink.addEventListener('click', async (event) => {
      event.preventDefault(); // Stop the browser from following the link directly

      const linkElement = event.currentTarget; // Get the link element itself
      const fileUrl = linkElement.getAttribute('href');
      const downloadFileName = linkElement.getAttribute('download') || 'download';

      // Add a visual indicator (optional)
      const originalText = linkElement.textContent;
      linkElement.textContent = 'Downloading...';
      linkElement.style.pointerEvents = 'none'; // Disable further clicks while processing

      try {
        console.log(`Fetching ${fileUrl} for download...`);
        const response = await fetch(fileUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} for ${response.url}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const tempLink = document.createElement('a');
        tempLink.href = url;
        tempLink.setAttribute('download', downloadFileName);

        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);

        window.URL.revokeObjectURL(url);
        console.log('Download triggered successfully.');

      } catch (error) {
        console.error('Download failed:', error);
        // Provide feedback to the user (optional)
        linkElement.textContent = 'Download Failed!';
        // Consider adding a title attribute with the error for more details
        linkElement.setAttribute('title', `Error: ${error.message}`);
        // Don't restore original text on failure, so user knows it failed
        return; // Exit early

      } finally {
        // Restore link text and clickability only on success or if no error occurred
        if (linkElement.textContent !== 'Download Failed!') {
           linkElement.textContent = originalText;
        }
         linkElement.style.pointerEvents = 'auto';
      }
    });
  } else {
    console.log('SMS price download link not found on this page.');
  }
});
