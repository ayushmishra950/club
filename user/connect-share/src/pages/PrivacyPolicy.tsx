import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8">

        <h1 className="text-3xl font-bold text-gray-900">
          Privacy Policy – Club App
        </h1>

        <p className="text-sm text-gray-500 mt-2 mb-6">
          Effective Date: 11 June 2026
        </p>

        <Section title="1. Information We Collect">
          We collect personal information such as name, email address, phone number,
          profile details, and device information. We also collect user-generated
          content including posts, images, videos, comments, and chat messages.
        </Section>

        <Section title="2. How We Use Information">
          We use your information to provide app features like posts, chat,
          friend requests, events, notifications, and business directory services.
        </Section>

        <Section title="3. User-Generated Content">
          Users are responsible for the content they post. We may remove content
          that violates our policies or is inappropriate.
        </Section>

        <Section title="4. Messaging & Chat">
          Messages are used only to enable communication between users. We do not
          publicly display private messages but may act on abuse reports.
        </Section>

        <Section title="5. Data Sharing">
          We do not sell user data. Data may be shared only with service providers
          or legal authorities when required by law.
        </Section>

        {/* ✅ UPDATED SECTION */}
        <Section title="6. Data Security & Protection">
          We take the security of your data seriously. We use industry-standard
          security measures including encryption, secure servers, and access controls
          to protect your personal information.

          {"\n\n"}

          Your data is stored securely and is accessible only to authorized systems
          required for app functionality. However, while we strive to protect your
          information, no method of transmission or storage is 100% secure.

          {"\n\n"}

          We continuously work to improve our security practices to ensure that
          user data remains safe and protected from unauthorized access, loss, or misuse.
        </Section>

        <Section title="7. User Rights">
          Users can access, update, or request deletion of their personal data anytime.
        </Section>

        <Section title="8. Children’s Privacy">
          This app is not intended for users under 13 years of age.
        </Section>

        <Section title="9. Account Deletion">
          Users may request account deletion by contacting support.
        </Section>

        <div className="mt-6 border-t pt-4">
          <p className="font-semibold text-gray-800">Contact Us</p>
          <p className="text-gray-600">support@clubapp.com</p>
        </div>

      </div>
    </div>
  );
}

/* Reusable Section Component */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        {title}
      </h2>
      <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
        {children}
      </p>
    </div>
  );
}