import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | NEDX CRM",
  description: "Privacy Policy for NEDX CRM platform",
};

export default function PrivacyPolicy() {
  return (
    <div className="font-system bg-[#f9f9f9] min-h-screen py-0 px-0 m-0">
      <div className="max-w-[800px] mx-auto my-10 p-[30px] bg-white border border-[#e0e0e0] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.05)]">
        <h1 className="text-[2em] text-[#1a1a1a] border-b-2 border-[#e0e0e0] pb-[10px] mb-5">
          Privacy Policy
        </h1>
        <p className="text-[0.9em] text-[#777] -mt-[15px] mb-[30px]">
          <strong>Last Updated:</strong> July 31, 2025
        </p>

        <h2 className="text-[1.5em] text-[#1a1a1a] mt-[30px] mb-[15px]">Introduction</h2>
        <p className="mb-[15px] text-[#555]">
          Welcome to NEDX CRM. This Privacy Policy explains how NEDX (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, and discloses information about you when you use our SaaS platform and services. We are committed to protecting your privacy and handling your data in an open and transparent manner.
        </p>

        <h2 className="text-[1.5em] text-[#1a1a1a] mt-[30px] mb-[15px]">Information We Collect</h2>
        <p className="mb-[15px] text-[#555]">
          We collect information you provide directly to us, information from third parties, and information we collect automatically.
        </p>
        <ul className="list-disc pl-5 mb-[15px] text-[#555]">
          <li className="mb-[10px]"><strong className="text-[#333]">Company & Account Information:</strong> When a Company Manager registers, we collect their name, email, password, and company details (name, address, contact info, etc.).</li>
          <li className="mb-[10px]"><strong className="text-[#333]">User Information:</strong> Managers may add employees, providing their name and email.</li>
          <li className="mb-[10px]"><strong className="text-[#333]">Customer & Offer Data:</strong> You and your users will enter information about your customers, offers, tasks, and expenses. This data belongs to you, and we process it on your behalf.</li>
          <li className="mb-[10px]"><strong className="text-[#333]">Google User Data:</strong> When you connect your Google Account, we securely store a Refresh Token provided by Google&apos;s OAuth 2.0 flow. We do not see or store your Google password.</li>
          <li className="mb-[10px]"><strong className="text-[#333]">Stripe Data:</strong> When you connect your Stripe account, we securely store your Stripe Account ID (e.g., acct_...).</li>
        </ul>

        <h2 className="text-[1.5em] text-[#1a1a1a] mt-[30px] mb-[15px]">How We Use Your Information</h2>
        <ul className="list-disc pl-5 mb-[15px] text-[#555]">
          <li className="mb-[10px]"><strong className="text-[#333]">Google Calendar API Usage (Limited Use):</strong> Our application&apos;s use and transfer of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements. We use the .../auth/calendar.events scope for the sole purpose of creating, reading, and deleting calendar events related to approved offers in your CRM. This information is not used for any other purpose.</li>
          <li className="mb-[10px]"><strong className="text-[#333]">Stripe Integration Usage:</strong> We use your Stripe Account ID to create secure Stripe Checkout payment links for offers you send to your customers. All payments made through these links go directly from your customer to your Stripe account.</li>
        </ul>

        <h2 className="text-[1.5em] text-[#1a1a1a] mt-[30px] mb-[15px]">Data Sharing and Disclosure</h2>
        <p className="mb-[15px] text-[#555]">
          NEDX CRM&apos;s handling of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.
        </p>
        <ul className="list-disc pl-5 mb-[15px] text-[#555]">
          <li className="mb-[10px]"><strong className="text-[#333]">No Third-Party Sharing:</strong> We do not sell, transfer, or disclose the Google user data you provide to any third parties. The data obtained through the Google Calendar API is used solely for the application&apos;s stated purpose of integrating CRM offers with your calendar.</li>
          <li className="mb-[10px]"><strong className="text-[#333]">Legal Requirements:</strong> We may disclose your information if required to do so by law or in the good faith belief that such action is necessary to comply with a legal obligation, protect and defend our rights or property, or in urgent circumstances to protect the personal safety of users.</li>
        </ul>

        <h2 className="text-[1.5em] text-[#1a1a1a] mt-[30px] mb-[15px]">Data Retention and Deletion</h2>
        <ul className="list-disc pl-5 mb-[15px] text-[#555]">
          <li className="mb-[10px]"><strong className="text-[#333]">Data Retention:</strong> We retain your Google User Data, specifically the secure Refresh Token, only for as long as you maintain the connection between your NEDX CRM account and your Google Account. This token is essential to provide the Google Calendar integration.</li>
          <li className="mb-[10px]">
            <strong className="text-[#333]">Data Deletion:</strong> You have full control over your data. Upon your request, we will delete your Google user data. You can request deletion in the following ways:
            <ol className="list-decimal pl-5 mt-2">
              <li className="mt-[10px]"><strong className="text-[#333]">Disconnecting from within the App:</strong> You can disconnect your Google Account from NEDX CRM through your account settings. Upon disconnection, we will immediately and permanently delete the Google Refresh Token associated with your account from our systems.</li>
              <li className="mb-[10px]"><strong className="text-[#333]">Contacting Us:</strong> You may also request the deletion of your data by contacting us directly at <a href="mailto:privacy@ned-x.ch" className="text-[#007bff] no-underline hover:underline">privacy@ned-x.ch</a>. We are committed to honoring user requests to delete their data and will process your request promptly.</li>
            </ol>
          </li>
        </ul>

        <h2 className="text-[1.5em] text-[#1a1a1a] mt-[30px] mb-[15px]">Data Security</h2>
        <p className="mb-[15px] text-[#555]">
          We implement security measures designed to protect your information. This includes using SSL/TLS encryption for data in transit and encrypting sensitive data at rest, such as your Google Refresh Token.
        </p>
        
        <h2 className="text-[1.5em] text-[#1a1a1a] mt-[30px] mb-[15px]">Contact Us</h2>
        <p className="mb-[15px] text-[#555]">
          If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:privacy@ned-x.ch" className="text-[#007bff] no-underline hover:underline">privacy@ned-x.ch</a>.
        </p>
      </div>
    </div>
  );
}
