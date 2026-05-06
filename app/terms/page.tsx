"use client"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="glass-card p-8 md:p-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: May 6, 2026</p>

          <div className="space-y-8 text-foreground/90">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing or using MeetRix Action ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.
              </p>
              <p className="mb-4">
                These Terms constitute a legally binding agreement between you and MeetRix Action ("Company," "we," "us," or "our").
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
              <p className="mb-4">
                MeetRix Action is a SaaS platform that provides:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Meeting recording upload and storage</li>
                <li>AI-powered transcription services</li>
                <li>Automatic action item and task extraction</li>
                <li>Task management and tracking</li>
                <li>Calendar integration (Google Calendar)</li>
                <li>Team collaboration features</li>
                <li>Analytics and reporting</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-4">3.1 Account Creation</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>You must provide accurate and complete information</li>
                <li>You must be at least 13 years old to use the Service</li>
                <li>You are responsible for maintaining account security</li>
                <li>You must not share your account credentials</li>
                <li>One person or entity may not maintain more than one free account</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">3.2 Account Responsibilities</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>You are responsible for all activity under your account</li>
                <li>You must notify us immediately of any unauthorized access</li>
                <li>You must not use the Service for any illegal purpose</li>
                <li>You must comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Subscription Plans and Payments</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-4">4.1 Free Plan</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>5 meetings per month</li>
                <li>Basic features included</li>
                <li>No credit card required</li>
                <li>Subject to fair use policy</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Pro Plan</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Unlimited meetings</li>
                <li>All premium features</li>
                <li>Priority support</li>
                <li>Billed monthly or annually</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">4.3 Payment Terms</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Payments are processed through Stripe</li>
                <li>Subscriptions auto-renew unless canceled</li>
                <li>Prices are subject to change with 30 days notice</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>You are responsible for all applicable taxes</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">4.4 Cancellation and Refunds</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>You may cancel your subscription at any time</li>
                <li>Cancellation takes effect at the end of the current billing period</li>
                <li>No refunds for partial months</li>
                <li>Access continues until the end of the paid period</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Acceptable Use Policy</h2>
              <p className="mb-4">You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Upload illegal, harmful, or offensive content</li>
                <li>Violate any intellectual property rights</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Use the Service to spam or send unsolicited messages</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Use automated tools to access the Service without permission</li>
                <li>Resell or redistribute the Service</li>
                <li>Upload content containing viruses or malicious code</li>
                <li>Impersonate another person or entity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Content and Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-4">6.1 Your Content</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>You retain all rights to your meeting recordings and content</li>
                <li>You grant us a license to process and store your content to provide the Service</li>
                <li>You are responsible for ensuring you have rights to upload content</li>
                <li>You must obtain consent before recording meetings with others</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">6.2 Our Intellectual Property</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>The Service, including software, design, and content, is owned by us</li>
                <li>Our trademarks and logos may not be used without permission</li>
                <li>You may not copy, modify, or create derivative works</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Recording Consent and Legal Compliance</h2>
              <p className="mb-4">
                <strong>Important:</strong> You are solely responsible for complying with all applicable laws regarding recording conversations, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Obtaining consent from all participants before recording</li>
                <li>Complying with one-party or two-party consent laws in your jurisdiction</li>
                <li>Providing notice that meetings are being recorded</li>
                <li>Complying with GDPR, CCPA, and other privacy regulations</li>
              </ul>
              <p className="mb-4">
                We are not responsible for your failure to obtain proper consent or comply with recording laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Third-Party Integrations</h2>
              <p className="mb-4">
                The Service integrates with third-party services (Google Calendar, etc.):
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>You must comply with third-party terms of service</li>
                <li>We are not responsible for third-party service availability or changes</li>
                <li>You can disconnect integrations at any time</li>
                <li>Third-party services may have their own privacy policies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Data and Privacy</h2>
              <p className="mb-4">
                Your use of the Service is also governed by our <a href="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>. Key points:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>We process your data to provide the Service</li>
                <li>We use AI services (OpenAI, Anthropic) to process meeting content</li>
                <li>We implement security measures to protect your data</li>
                <li>You can export or delete your data at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Service Availability and Modifications</h2>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>We strive for 99.9% uptime but do not guarantee uninterrupted service</li>
                <li>We may perform maintenance with or without notice</li>
                <li>We may modify or discontinue features at any time</li>
                <li>We will provide notice of material changes when possible</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Termination</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-4">11.1 By You</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>You may terminate your account at any time from Settings</li>
                <li>Termination does not entitle you to a refund</li>
                <li>You may export your data before termination</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">11.2 By Us</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>We may suspend or terminate accounts that violate these Terms</li>
                <li>We may terminate accounts for non-payment</li>
                <li>We may terminate the Service entirely with 30 days notice</li>
                <li>We will provide opportunity to export data before termination</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">12. Disclaimers and Limitations of Liability</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-4">12.1 Service "As Is"</h3>
              <p className="mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">12.2 AI Accuracy</h3>
              <p className="mb-4">
                We use AI to transcribe meetings and extract tasks. While we strive for accuracy, AI-generated content may contain errors. You should review all transcripts and tasks for accuracy.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">12.3 Limitation of Liability</h3>
              <p className="mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
              <p className="mb-4">
                OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">13. Indemnification</h2>
              <p className="mb-4">
                You agree to indemnify and hold us harmless from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Your failure to obtain proper recording consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">14. Dispute Resolution</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-4">14.1 Informal Resolution</h3>
              <p className="mb-4">
                Before filing a claim, you agree to contact us at <a href="mailto:legal@actionflow.ai" className="text-purple-400 hover:text-purple-300">legal@actionflow.ai</a> to attempt to resolve the dispute informally.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">14.2 Arbitration</h3>
              <p className="mb-4">
                Any disputes that cannot be resolved informally shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">14.3 Class Action Waiver</h3>
              <p className="mb-4">
                You agree to resolve disputes on an individual basis and waive any right to participate in a class action lawsuit or class-wide arbitration.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">15. General Provisions</h2>
              
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Governing Law:</strong> These Terms are governed by the laws of [Your Jurisdiction]</li>
                <li><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in effect</li>
                <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and us</li>
                <li><strong>No Waiver:</strong> Our failure to enforce any right does not waive that right</li>
                <li><strong>Assignment:</strong> You may not assign these Terms; we may assign them without restriction</li>
                <li><strong>Force Majeure:</strong> We are not liable for delays due to circumstances beyond our control</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">16. Changes to Terms</h2>
              <p className="mb-4">
                We may modify these Terms at any time. We will notify you of material changes by:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Posting the updated Terms on this page</li>
                <li>Updating the "Last updated" date</li>
                <li>Sending an email notification (for material changes)</li>
              </ul>
              <p className="mb-4">
                Your continued use of the Service after changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">17. Contact Information</h2>
              <p className="mb-4">
                For questions about these Terms, please contact us:
              </p>
              <ul className="list-none space-y-2 mb-4">
                <li><strong>Email:</strong> <a href="mailto:legal@actionflow.ai" className="text-purple-400 hover:text-purple-300">legal@actionflow.ai</a></li>
                <li><strong>Support:</strong> <a href="mailto:support@actionflow.ai" className="text-purple-400 hover:text-purple-300">support@actionflow.ai</a></li>
                <li><strong>Address:</strong> [Your Business Address]</li>
              </ul>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-center text-muted-foreground">
              By using MeetRix Action, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
