import { useState } from "react";

interface SetupEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (apiKey: string) => void;
}

export default function SetupEventsModal({
  isOpen,
  onClose,
  onSubmit,
}: SetupEventsModalProps) {
  const [apiKey, setApiKey] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(apiKey);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-y-auto max-h-[90vh]">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            Setup Humanitix Integration
          </h2>

          <p className="mb-3 text-sm">
            To reduce your workload, we support an automatic event
            synchronisation system. Any events you create on Humanitix will be
            automatically uploaded to Connect3 - no extra work required.
          </p>
          <p className="text-sm mb-3">
            To enable this, please enter your Humanitix API key below.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="flex-1 bg-foreground text-white py-2 px-4 rounded-full hover:bg-foreground/70 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Submit
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <a
              href="https://console.humanitix.com/console/account/advanced/api-key"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground  underline text-sm"
            >
              I&apos;m not a nerd!! What is an API key?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
