import React, { useEffect } from 'react';

function BugcrowdForm() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://bugcrowd.com/a9e1eca7-990e-4602-bf6d-a9f70df1c2fa/external/script';
    script.async = true;
    script.setAttribute('data-bugcrowd-program', 'https://bugcrowd.com/a9e1eca7-990e-4602-bf6d-a9f70df1c2fa/external/report');
    
    // Find the container and append the script there
    const container = document.getElementById('bugcrowd-form-container');
    if (container) {
      container.appendChild(script);
    }

    return () => {
      if (container) {
        container.removeChild(script);
      }
    };
  }, []);

  return <div id="bugcrowd-form-container"></div>;
}

export default BugcrowdForm;
