export default function TermsPage() {
  return (
    <div className="py-24 px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Terms of Service</h1>
        <p className="mt-4 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="mt-8 space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <p className="mt-4">
              By accessing and using LabInventory, you accept and agree to be bound by these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">2. Use License</h2>
            <p className="mt-4">
              We grant you a limited, non-exclusive, non-transferable license to use our service in accordance with these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">3. User Responsibilities</h2>
            <p className="mt-4">
              You are responsible for maintaining the confidentiality of your account and for all activities under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">4. Service Availability</h2>
            <p className="mt-4">
              We strive to maintain 99.9% uptime but do not guarantee uninterrupted access to our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">5. Limitation of Liability</h2>
            <p className="mt-4">
              LabInventory shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">6. Changes to Terms</h2>
            <p className="mt-4">
              We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">7. Contact</h2>
            <p className="mt-4">
              For questions about these Terms, contact us at legal@labinventory.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
