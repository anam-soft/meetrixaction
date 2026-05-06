"use client"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="glass-card p-8 md:p-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: May 6, 2026</p>

          <div className="space-y-8 text-foreground/90">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="mb-4">
                Welcome to MeetRix Action ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our meeting transcription and task management service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Account Information:</strong> Name, email address, password</li>
                <li><strong>Meeting Content:</strong> Audio/video recordings, transcripts, meeting notes</li>
                <li><strong>Task Information:</strong> Task descriptions, assignments, deadlines</li>
                <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store credit card details)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent</li>
                <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
                <li><strong>Cookies:</strong> Session cookies for authentication and preferences</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">2.3 Third-Party Integrations</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Google Calendar:</strong> Calendar events, event details (with your explicit permission)</li>
                <li><strong>Future Integrations:</strong> Slack, Zoom (when you choose to connect them)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Provide and maintain our service</li>
                <li>Process your meeting recordings and generate transcripts</li>
                <li>Extract action items and tasks using AI</li>
                <li>Sync tasks with your Google Calendar (if connected)</li>
                <li>Send you service-related notifications and updates</li>
                <li>Process payments and manage subscriptions</li>
                <li>Improve our service and develop new features</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Data Processing and AI</h2>
              <p className="mb-4">
                We use artificial intelligence services to process your meeting content:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>OpenAI:</strong> For transcription (Whisper API) and task extraction (GPT models)</li>
                <li><strong>Anthropic Claude:</strong> For advanced task analysis and summarization</li>
              </ul>
              <p className="mb-4">
                Your meeting content is sent to these AI providers for processing. We have agreements with these providers to ensure your data is handled securely and not used to train their models.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Data Storage and Security</h2>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Storage:</strong> Your data is stored securely on AWS S3 and PostgreSQL databases</li>
                <li><strong>Encryption:</strong> Data is encrypted in transit (TLS/SSL) and at rest</li>
                <li><strong>Access Control:</strong> Strict access controls and authentication mechanisms</li>
                <li><strong>Backups:</strong> Regular automated backups for data recovery</li>
                <li><strong>Retention:</strong> We retain your data as long as your account is active or as needed to provide services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Data Sharing and Disclosure</h2>
              <p className="mb-4">We do not sell your personal information. We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Service Providers:</strong> AWS (hosting), Stripe (payments), OpenAI/Anthropic (AI processing)</li>
                <li><strong>Team Members:</strong> Other users in your team workspace (for shared meetings and tasks)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Your Rights and Choices</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct your information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Export:</strong> Download your meeting data and transcripts</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing emails</li>
                <li><strong>Disconnect:</strong> Remove third-party integrations at any time</li>
              </ul>
              <p className="mb-4">
                To exercise these rights, contact us at <a href="mailto:privacy@actionflow.ai" className="text-purple-400 hover:text-purple-300">privacy@actionflow.ai</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Google Calendar Integration</h2>
              <p className="mb-4">
                When you connect Google Calendar:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>We request read access to your calendar events and write access to event descriptions</li>
                <li>We only access calendar data when you explicitly use the sync feature</li>
                <li>We store OAuth tokens securely and refresh them automatically</li>
                <li>You can disconnect at any time from Settings → Integrations</li>
                <li>We comply with Google's API Services User Data Policy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Children's Privacy</h2>
              <p className="mb-4">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. International Data Transfers</h2>
              <p className="mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Changes to This Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of the service after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">12. Contact Us</h2>
              <p className="mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="list-none space-y-2 mb-4">
                <li><strong>Email:</strong> <a href="mailto:privacy@actionflow.ai" className="text-purple-400 hover:text-purple-300">privacy@actionflow.ai</a></li>
                <li><strong>Support:</strong> <a href="mailto:support@actionflow.ai" className="text-purple-400 hover:text-purple-300">support@actionflow.ai</a></li>
                <li><strong>Address:</strong> [Your Business Address]</li>
              </ul>
            </section>

            <section className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold mb-4">GDPR Compliance (EU Users)</h2>
              <p className="mb-4">
                If you are located in the European Economic Area (EEA), you have additional rights under GDPR:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to restrict processing</li>
                <li>Right to lodge a complaint with a supervisory authority</li>
              </ul>
              <p className="mb-4">
                Our legal basis for processing your data includes: consent, contract performance, legal obligations, and legitimate interests.
              </p>
            </section>

            <section className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold mb-4">CCPA Compliance (California Users)</h2>
              <p className="mb-4">
                California residents have specific rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to opt-out of the sale of personal information (we do not sell data)</li>
                <li>Right to deletion</li>
                <li>Right to non-discrimination for exercising CCPA rights</li>
              </ul>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-center text-muted-foreground">
              By using MeetRix Action, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
