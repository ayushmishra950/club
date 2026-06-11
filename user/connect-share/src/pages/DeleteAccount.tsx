import React from "react";

export default function DeleteAccount() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8">

        <h1 className="text-3xl font-bold text-gray-900">
          Delete Account & Data Policy – Club App
        </h1>

        <p className="text-sm text-gray-500 mt-2 mb-6">
          Last updated: 11 June 2026
        </p>

        <Section title="How Account Deletion Works">
          When you request to delete your Club App account, your account is
          immediately deactivated. You will no longer be able to use app
          features such as posts, chat, groups, or events.

          {"\n\n"}

          After deactivation, your account enters a retention period of 30 days.
          During this time, you may request reactivation by contacting support.
        </Section>

        <Section title="How to Request Account Deletion or Help">
          You can request account deletion or support by contacting us:

          {"\n\n"}

          📧 Email:{" "}
          <span className="font-semibold text-gray-800">
            support@clubapp.com
          </span>

          {"\n\n"}

          Please include:
          {"\n"}
          • Registered email or username  
          • Your request (delete or reactivation)
        </Section>

        <Section title="What Happens to Your Data">
          When your account is deleted, the following data is affected:

          {"\n"}
          • Profile information is deactivated immediately  
          • Posts, images, videos, and comments are removed from public view  
          • Chat messages and connections are disabled  
          • Associated account activity is suspended  

          {"\n\n"}

          Some data may be retained temporarily for security, legal, or abuse
          prevention purposes.
        </Section>

        <Section title="30-Day Recovery Period">
          If your account has been deactivated, you can request reactivation
          within 30 days by contacting our support team.

          {"\n\n"}

          After 30 days, your account and associated data will be permanently
          deleted and cannot be recovered.
        </Section>

        <Section title="Important Note">
          Account deletion is handled in a secure and controlled manner.
          Immediate access is disabled after deletion request, and final
          deletion occurs after the retention period.
        </Section>

        <div className="mt-6 border-t pt-4">
          <p className="font-semibold text-gray-800">Contact Support</p>
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