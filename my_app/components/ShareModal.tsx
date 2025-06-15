import React, { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, projectName }) => {
  const [shareSettings, setShareSettings] = useState({
    access: 'view' as 'view' | 'edit' | 'comment',
    expiry: '7days' as 'never' | '24hours' | '7days' | '30days',
    requireAuth: false,
    allowDownload: true,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const mockDomain = 'https://flowx.app';
  
  const generateShareLink = async () => {
    setIsGenerating(true);
    
    // Mock link generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockId = Math.random().toString(36).substring(2, 15);
    const params = new URLSearchParams({
      access: shareSettings.access,
      ...(shareSettings.expiry !== 'never' && { expires: shareSettings.expiry }),
      ...(shareSettings.requireAuth && { auth: 'required' }),
      ...(shareSettings.allowDownload && { download: 'enabled' }),
    });
    
    const link = `${mockDomain}/shared/${mockId}?${params.toString()}`;
    setGeneratedLink(link);
    setIsGenerating(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generatedLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setGeneratedLink('');
    setCopied(false);
    onClose();
  };

  const getAccessIcon = (access: string) => {
    switch (access) {
      case 'view':
        return '👁️';
      case 'edit':
        return '✏️';
      case 'comment':
        return '💬';
      default:
        return '👁️';
    }
  };

  const getExpiryText = (expiry: string) => {
    switch (expiry) {
      case 'never': return 'Never expires';
      case '24hours': return 'Expires in 24 hours';
      case '7days': return 'Expires in 7 days';
      case '30days': return 'Expires in 30 days';
      default: return 'Never expires';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Share Project</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900">{projectName}</div>
              <div className="text-sm text-gray-500">Funnel mapping project</div>
            </div>
          </div>
        </div>

        {/* Share Settings */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
            <div className="grid grid-cols-3 gap-2">
              {['view', 'comment', 'edit'].map((access) => (
                <button
                  key={access}
                  onClick={() => setShareSettings(prev => ({ ...prev, access: access as any }))}
                  className={`flex items-center gap-2 p-3 border rounded-lg transition-all ${
                    shareSettings.access === access
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>{getAccessIcon(access)}</span>
                  <span className="text-sm font-medium capitalize">{access}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link Expiry</label>
            <select
              value={shareSettings.expiry}
              onChange={(e) => setShareSettings(prev => ({ ...prev, expiry: e.target.value as any }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="never">Never expires</option>
              <option value="24hours">24 hours</option>
              <option value="7days">7 days</option>
              <option value="30days">30 days</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={shareSettings.requireAuth}
                onChange={(e) => setShareSettings(prev => ({ ...prev, requireAuth: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-700">Require authentication</div>
                <div className="text-xs text-gray-500">Users must sign in to access</div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={shareSettings.allowDownload}
                onChange={(e) => setShareSettings(prev => ({ ...prev, allowDownload: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-700">Allow downloads</div>
                <div className="text-xs text-gray-500">Users can export the flow</div>
              </div>
            </label>
          </div>
        </div>

        {/* Generated Link */}
        {generatedLink ? (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Share Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
              />
              <button
                onClick={copyToClipboard}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  copied
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {getExpiryText(shareSettings.expiry)} • {shareSettings.access} access
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <button
              onClick={generateShareLink}
              disabled={isGenerating}
              className={`w-full flex items-center justify-center gap-3 p-4 rounded-lg transition-all ${
                isGenerating
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating link...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Generate Share Link
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
          {generatedLink && (
            <button
              onClick={() => {
                setGeneratedLink('');
                generateShareLink();
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Generate New
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal; 