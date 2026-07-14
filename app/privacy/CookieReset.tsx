'use client';

// Lets visitors change their analytics-consent choice from the privacy page.
// Clearing the stored choice re-shows the consent banner on reload.
export default function CookieReset() {
  return (
    <button
      type="button"
      className="top-btn"
      onClick={() => {
        localStorage.removeItem('imgora-consent');
        location.reload();
      }}
    >
      Reset my cookie choice
    </button>
  );
}
