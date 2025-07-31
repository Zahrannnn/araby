import { Metadata } from "next";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "Terms of Service | NEDX CRM",
  description: "Terms of Service for NEDX CRM platform",
};

export default function TermsOfService() {
  const t = useTranslations("legal.termsOfService");
  
  return (
    <div className="bg-[#f4f4f7] min-h-screen py-10 px-4">
      <div className="bg-white rounded-lg shadow-md max-w-[900px] mx-auto p-6 md:p-10">
        <h2 className="flex items-center text-2xl font-semibold text-[#1a1a1a] mb-5">
          <span className="border-l-4 border-[#D32F2F] pl-4">{t("title")}</span>
        </h2>
        <p className="mb-6"><strong>{t("lastUpdated")}:</strong> July 31, 2025</p>
        <p className="text-[#555] leading-relaxed">
          {t("introText")}
        </p>
        <hr className="my-8 border-t border-[#e2e2e2]" />
        
        <h4 className="text-lg font-medium text-[#1a1a1a] mt-6 mb-3">{t("accounts")}</h4>
        <p className="text-[#555] leading-relaxed mb-6">
          {t("accountsText")}
        </p>

        <h4 className="text-lg font-medium text-[#1a1a1a] mt-6 mb-3">{t("subscriptions")}</h4>
        <p className="text-[#555] leading-relaxed mb-6">
          {t("subscriptionsText")}
        </p>
        
        <h4 className="text-lg font-medium text-[#1a1a1a] mt-6 mb-3">{t("thirdPartyIntegrations")}</h4>
        <p className="text-[#555] leading-relaxed">
          {t("thirdPartyIntegrationsText")}
        </p>
        <hr className="my-8 border-t border-[#e2e2e2]" />
        
        <h4 className="text-lg font-medium text-[#1a1a1a] mt-6 mb-3">{t("limitationOfLiability")}</h4>
        <p className="text-[#555] leading-relaxed mb-6">
          {t("limitationOfLiabilityText")}
        </p>
        
        <h4 className="text-lg font-medium text-[#1a1a1a] mt-6 mb-3">{t("governingLaw")}</h4>
        <p className="text-[#555] leading-relaxed">
          {t("governingLawText")}
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