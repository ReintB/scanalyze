import FileUploadContainer from "@/components/file-upload-container";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center px-4">
      <div className="flex-1 w-full flex flex-col items-center justify-center max-w-4xl mx-auto py-16">
        {/* Hero Section */}
        <div className="w-full text-center mt-16">
          <h1 className="text-5xl font-bold m-4">
            Scanalyze
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your documents, analyze them with AI, and get instant insights—all in one platform.
          </p>
        </div>

        {/* Main Upload Section */}
        <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl p-8">
          <FileUploadContainer />
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-black">
          A smart analysis, infinite possibilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="text-xl font-semibold mb-3 text-black">Document Analysis</h3>
            <p className="text-gray-600">
              Process and analyze documents with advanced AI technology for deeper insights.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="text-xl font-semibold mb-3 text-black">Smart Results</h3>
            <p className="text-gray-600">
              Get comprehensive analysis and actionable insights from your documents instantly.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="text-xl font-semibold mb-3 text-black">Secure Processing</h3>
            <p className="text-gray-600">
              Your documents are processed with the highest security standards and encryption.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="w-full max-w-4xl mx-auto mt-24 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-black">
          Your questions, answered
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-black">What is Scanalyze?</h3>
            <p className="text-gray-600">
              Scanalyze is an AI-powered document analysis tool that helps you extract insights from your documents quickly and efficiently.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-black">How does it work?</h3>
            <p className="text-gray-600">
              Simply upload your document, enter your analysis prompt, and let our AI generate comprehensive insights for you.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-black">What file types are supported?</h3>
            <p className="text-gray-600">
              Currently, we support PDF documents and various image formats including JPEG, PNG, and GIF.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-black">Is my data secure?</h3>
            <p className="text-gray-600">
              Yes, we use industry-standard encryption and security measures to protect your documents and data.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
