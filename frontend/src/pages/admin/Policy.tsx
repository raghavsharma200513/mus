import { useState, useEffect } from "react";
import { Lock, FileText } from "lucide-react";

interface PolicyData {
  _id: string;
  type: "privacy_policy" | "terms_and_conditions";
  content: string;
}

interface PolicyIconProps {
  type: PolicyData["type"];
}

const PolicyManagement: React.FC = () => {
  const [policies, setPolicies] = useState<PolicyData[]>([]);
  const [editingPolicy, setEditingPolicy] = useState<PolicyData | null>(null);
  const [policyContent, setPolicyContent] = useState<string>("");
  const [selectedType, setSelectedType] =
    useState<PolicyData["type"]>("privacy_policy");
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async (): Promise<void> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/policy`
      );
      const data: PolicyData[] = await response.json();
      setPolicies(data);
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    }
  };

  const handlePolicySelect = (policy: PolicyData): void => {
    setEditingPolicy(policy);
    setPolicyContent(policy.content);
    setSelectedType(policy.type);
    setPreviewMode(false);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    try {
      const url = editingPolicy
        ? `${import.meta.env.VITE_BACKEND_URL}/api/policy`
        : `${import.meta.env.VITE_BACKEND_URL}/api/policy`;
      const method = editingPolicy ? "POST" : "POST";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          content: policyContent,
        }),
      });

      fetchPolicies();
      resetForm();
    } catch (error) {
      console.error("Failed to save policy:", error);
    }
  };

  const resetForm = (): void => {
    setEditingPolicy(null);
    setPolicyContent("");
    setPreviewMode(false);
  };

  const PolicyIcon: React.FC<PolicyIconProps> = ({ type }) => {
    return type === "privacy_policy" ? (
      <Lock className="w-6 h-6" />
    ) : (
      <FileText className="w-6 h-6" />
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen h-full w-full">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        Policy Management
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Policy Editor Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {editingPolicy ? "Edit Policy" : "Create New Policy"}
            </h3>

            {!editingPolicy && policies.length < 2 && (
              <div className="flex space-x-4 mb-6">
                <button
                  type="button"
                  onClick={() => setSelectedType("privacy_policy")}
                  className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedType === "privacy_policy"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-200"
                  }`}
                >
                  <Lock className="w-6 h-6 mr-2" />
                  <div>
                    <div className="font-medium">Privacy Policy</div>
                    <div className="text-sm text-gray-500">
                      Data collection and usage terms
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType("terms_and_conditions")}
                  className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedType === "terms_and_conditions"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-200"
                  }`}
                >
                  <FileText className="w-6 h-6 mr-2" />
                  <div>
                    <div className="font-medium">Terms & Conditions</div>
                    <div className="text-sm text-gray-500">
                      User agreement and rules
                    </div>
                  </div>
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <PolicyIcon type={selectedType} />
                <span className="font-medium capitalize">
                  {selectedType.replace("_", " ")}
                </span>
              </div>
              {/* <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="text-blue-500 hover:text-blue-600"
              >
                {previewMode ? "Edit" : "Preview"}
              </button> */}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {previewMode ? (
                <div className="prose max-w-none border rounded-lg p-4 min-h-[300px] bg-gray-50">
                  {policyContent || "No content to preview"}
                </div>
              ) : (
                <textarea
                  value={policyContent}
                  onChange={(e) => setPolicyContent(e.target.value)}
                  className="w-full min-h-[300px] p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your policy content here..."
                  required
                />
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {editingPolicy ? "Update Policy" : "Create Policy"}
                </button>
                {editingPolicy && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Existing Policies Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-6">Existing Policies</h3>
          <div className="space-y-4">
            {policies.map((policy) => (
              <div
                key={policy._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <PolicyIcon type={policy.type} />
                  <div>
                    <div className="font-medium capitalize">
                      {policy.type.replace("_", " ")}
                    </div>
                    <div className="text-sm text-gray-500">
                      {policy.content.slice(0, 50)}...
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handlePolicySelect(policy)}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  Edit
                </button>
              </div>
            ))}
            {policies.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No policies created yet. Start by creating one!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyManagement;
