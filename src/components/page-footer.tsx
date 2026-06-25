/**
 * PulseGuard trademark footer — rendered on all full-page auth/onboarding screens.
 * Uses the `.pg-footer` design system utility.
 */
export function PageFooter() {
  return (
    <div className="pg-footer">
      PULSEGUARD &copy; {new Date().getFullYear()}
    </div>
  );
}
