export default function PrivacyPage() {
  return (
    <div className="py-24 px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
        <p className="mt-4 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="mt-8 space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-bold text-foreground">1. Information We Collect</h2>
            <p className="mt-4">
              We collect information you provide directly to us, including name, email address, organization details, and usage data when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">2. How We Use Your Information</h2>
            <p className="mt-4">
              We use the information we collect to provide, maintain, and improve our services, communicate with you, and ensure security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">3. Data Security</h2>
            <p className="mt-4">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">4. Data Retention</h2>
            <p className="mt-4">
              We retain your information for as long as necessary to provide our services and comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">5. Your Rights</h2>
            <p className="mt-4">
              You have the right to access, correct, or delete your personal information. Contact us at privacy@labinventory.com to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">6. Contact Us</h2>
            <p className="mt-4">
              If you have questions about this Privacy Policy, please contact us at privacy@labinventory.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
