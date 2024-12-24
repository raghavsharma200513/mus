import { useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import LanguageContext from "../../context/LanguageContext"; // Adjust the import path as needed

interface PolicyData {
  _id: string;
  type: "privacy_policy" | "terms_and_conditions";
  content: string;
}

const PolicyPage: React.FC = () => {
  const [policy, setPolicy] = useState<PolicyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Get language from context
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("PolicyPage must be used within a LanguageProvider");
  }
  const { language } = context;

  // Get policy type from search params
  const [searchParams] = useSearchParams();
  const policyType = searchParams.get("type");

  const getTitleFromType = (type: string | null): string => {
    switch (type) {
      case "privacy_policy":
        return language === "en" ? "Privacy Policy" : "Datenschutzerklärung";
      case "terms_and_conditions":
        return language === "en"
          ? "Terms & Conditions"
          : "Allgemeine Geschäftsbedingungen";
      default:
        return language === "en" ? "Policy" : "Richtlinie";
    }
  };

  const getBreadcrumb = (type: string | null): string => {
    const home = language === "en" ? "HOME" : "STARTSEITE";
    const title = getTitleFromType(type).toUpperCase();
    return `${home} / ${title}`;
  };

  useEffect(() => {
    const fetchPolicy = async () => {
      setLoading(true);
      setError("");

      try {
        if (
          !policyType ||
          !["privacy_policy", "terms_and_conditions"].includes(policyType)
        ) {
          throw new Error("Invalid policy type");
        }

        console.log(
          `${import.meta.env.VITE_BACKEND_URL}/api/policy/${policyType}`
        );

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/policy/${policyType}`
        );
        const policies = await response.json();

        setPolicy(policies);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch policy");
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [policyType]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="page-title">
          <h1>{language === "en" ? "Error" : "Fehler"}</h1>
          <h2>{language === "en" ? "HOME / ERROR" : "STARTSEITE / FEHLER"}</h2>
        </div>
        <div className="max-w-3xl mx-auto mt-8 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="page-title">
        <h1>{getTitleFromType(policyType)}</h1>
        <h2>{getBreadcrumb(policyType)}</h2>
      </div>

      <div className="max-w-3xl mx-auto mt-8">
        {/* Policy Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose max-w-none">
            {policy?.content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
