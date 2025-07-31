import { Metadata } from "next";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "Privacy Policy | NEDX CRM",
  description: "Privacy Policy for NEDX CRM platform",
};

export default function PrivacyPolicy() {
  const t = useTranslations("legal.privacyPolicy");
  
  return (
    <div className="bg-[#f4f4f7] min-h-screen py-10 px-4">
      <div className="bg-white rounded-lg shadow-md max-w-[900px] mx-auto p-6 md:p-10">
        <h2 className="flex items-center text-2xl font-semibold text-[#1a1a1a] mb-5">
          <span className="border-l-4 border-[#D32F2F] pl-4">{t("title")}</span>
        </h2>
        <p className="mb-6"><strong>{t("lastUpdated")}:</strong> July 31, 2025</p>

        <h4 className="text-lg font-medium text-[#1a1a1a] mt-6 mb-3">{t("introduction")}</h4>
        <p className="text-[#555] leading-relaxed">
          {t("introText")}
        </p>
        <hr className="my-8 border-t border-[#e2e2e2]" />
        
        <h4 className="text-lg font-medium text-[#1a1a1a] mt-6 mb-3">{t("informationWeCollect")}</h4>
        <p className="text-[#555] leading-relaxed mb-3">
          {t("informationWeCollectText")}
        </p>
        <ul className="list-disc pl-6 text-[#555] leading-relaxed space-y-2 mb-4">
          <li><strong>{t("companyAccountInfo")}:</strong> {t("companyAccountInfoText")}</li>
          <li><strong>{t("userInfo")}:</strong> {t("userInfoText")}</li>
          <li><strong>{t("customerOfferData")}:</strong> {t("customerOfferDataText")}</li>
          <li><strong>{t("googleUserData")}:</strong> {t("googleUserDataText")}</li>
          <li><strong>{t("stripeData")}:</strong> {t("stripeDataText")}</li>
        </ul>
        <hr className="my-8 border-t border-[#e2e2e2]" />

        <h4 className="text-lg font-medium text-[#1a1a1a] mt-6 mb-3">{t("howWeUseInfo")}</h4>
        <p className="text-[#555] leading-relaxed mb-4">
          <strong>{t("googleCalendarUsage")}:</strong> {t("googleCalendarUsageText")}
        </p>
        <p className="text-[#555] leading-relaxed">
          <strong>{t("stripeIntegrationUsage")}:</strong> {t("stripeIntegrationUsageText")}
        </p>
        <hr className="my-8 border-t border-[#e2e2e2]" />

        <h4 className="text-lg font-medium text-[#1a1a1a] mt-6 mb-3">{t("dataSecurity")}</h4>
        <p className="text-[#555] leading-relaxed">
          {t("dataSecurityText")}
        </p>
        <hr className="my-8 border-t border-[#e2e2e2]" />
        
        <h4 className="text-lg font-medium text-[#1a1a1a] mt-6 mb-3">{t("contactUs")}</h4>
        <p className="text-[#555] leading-relaxed">
          {t("contactUsText")}
        </p>
      </div>
    </div>
  );
}
