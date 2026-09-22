import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Credentials } from '../types';
import { GeminiService } from '../services/gemini';
import { GitHubService } from '../services/github';
import { Key, CheckCircle2, AlertCircle, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

export function Setup() {
  const { saveCredentials } = useAuth();
  const [step, setStep] = useState(0);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Credentials>({
    geminiApiKey: '',
    githubToken: '',
    geminiModel: 'gemini-2.5-pro',
  });

  const steps = [
    { title: 'Welcome', description: 'Set up DocuRelease AI' },
    { title: 'Google Gemini', description: 'AI model configuration' },
    { title: 'GitHub', description: 'Repository access' },
    { title: 'Complete', description: 'Ready to go!' },
  ];

  const testGemini = async () => {
    setTesting('gemini');
    try {
      const service = new GeminiService(form);
      const ok = await service.testConnection();
      setTestResults(prev => ({ ...prev, gemini: ok }));
    } catch {
      setTestResults(prev => ({ ...prev, gemini: false }));
    }
    setTesting(null);
  };

  const testGitHub = async () => {
    setTesting('github');
    try {
      const service = new GitHubService(form.githubToken);
      const user = await service.testConnection();
      setTestResults(prev => ({ ...prev, github: !!user.login }));
    } catch {
      setTestResults(prev => ({ ...prev, github: false }));
    }
    setTesting(null);
  };

  const handleComplete = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveCredentials(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save credentials');
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return testResults.gemini === true;
    if (step === 2) return testResults.github === true;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'bg-accent-500 text-white' :
                i === step ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                'bg-surface-200 text-surface-400'
              }`}>
                {i < step ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${i < step ? 'bg-accent-500' : 'bg-surface-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-surface-200 overflow-hidden">
          <div className="p-6 border-b border-surface-100">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-surface-900">DocuRelease AI</h1>
                <p className="text-xs text-surface-500">Step {step + 1}: {steps[step].title}</p>
              </div>
            </div>
            <p className="text-sm text-surface-500 mt-2">{steps[step].description}</p>
          </div>

          <div className="p-6">
            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
                  <h3 className="font-semibold text-primary-900 mb-2">Welcome to DocuRelease AI</h3>
                  <p className="text-sm text-primary-700">
                    Automatically generate changelogs and developer documentation from your GitHub PRs using Google Gemini AI.
                  </p>
                </div>
                <div className="space-y-3">
                  <Feature icon="🧠" title="Google Gemini 2.5 Pro" desc="State-of-the-art AI for code analysis" />
                  <Feature icon="🔗" title="GitHub Integration" desc="Track PRs and extract code diffs" />
                  <Feature icon="💬" title="Slack Workflows" desc="Review and approve in your channels" />
                  <Feature icon="📝" title="Dual Output" desc="Customer changelogs + developer docs" />
                </div>
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <p className="text-xs text-amber-800">
                    <strong>Security Note:</strong> All API keys are stored locally in your browser's IndexedDB. They never leave your device except when making direct API calls to the respective services.
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Gemini */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    Google AI Studio API Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={form.geminiApiKey}
                    onChange={e => setForm(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                    placeholder="AIza..."
                    className="w-full px-3 py-2.5 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none font-mono"
                  />
                  <p className="text-xs text-surface-400 mt-1">
                    Get your key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="text-primary-600 hover:underline">aistudio.google.com/apikey</a>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Model</label>
                  <select
                    value={form.geminiModel}
                    onChange={e => setForm(prev => ({ ...prev, geminiModel: e.target.value as Credentials['geminiModel'] }))}
                    className="w-full px-3 py-2.5 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none"
                  >
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Best quality)</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast & efficient)</option>
                    <option value="gemini-3.8-flash">Gemini 3.8 Flash (Latest stable)</option>
                  </select>
                </div>
                <TestButton
                  label="Test Gemini Connection"
                  testing={testing === 'gemini'}
                  result={testResults.gemini}
                  onClick={testGemini}
                  disabled={!form.geminiApiKey}
                />
              </div>
            )}

            {/* Step 2: GitHub */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    GitHub Personal Access Token <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={form.githubToken}
                    onChange={e => setForm(prev => ({ ...prev, githubToken: e.target.value }))}
                    placeholder="ghp_..."
                    className="w-full px-3 py-2.5 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none font-mono"
                  />
                  <p className="text-xs text-surface-400 mt-1">
                    Create a token at <a href="https://github.com/settings/tokens" target="_blank" rel="noopener" className="text-primary-600 hover:underline">github.com/settings/tokens</a> with <code className="bg-surface-100 px-1 rounded">repo</code> scope.
                  </p>
                </div>
                <TestButton
                  label="Test GitHub Connection"
                  testing={testing === 'github'}
                  result={testResults.github}
                  onClick={testGitHub}
                  disabled={!form.githubToken}
                />
              </div>
            )}

            {/* Step 3: Complete */}
            {step === 3 && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-accent-600" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 mb-2">You're all set!</h3>
                <p className="text-sm text-surface-500 mb-4">
                  DocuRelease AI is configured and ready to generate documentation from your PRs.
                </p>
                <div className="bg-surface-50 rounded-lg p-4 text-left space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${testResults.gemini ? 'bg-accent-500' : 'bg-surface-300'}`} />
                    <span>Gemini AI: {testResults.gemini ? 'Connected' : 'Not configured'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${testResults.github ? 'bg-accent-500' : 'bg-surface-300'}`} />
                    <span>GitHub: {testResults.github ? 'Connected' : 'Not configured'}</span>
                  </div>
                </div>
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-surface-50 border-t border-surface-100 flex items-center justify-between">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm text-surface-600 hover:text-surface-900">
                <ArrowLeft size={14} /> Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  canProceed()
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-surface-200 text-surface-400 cursor-not-allowed'
                }`}
              >
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={saving}
                className={`flex items-center gap-1 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  saving
                    ? 'bg-accent-400 text-white cursor-not-allowed'
                    : 'bg-accent-600 text-white hover:bg-accent-700'
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    Launch Dashboard <ArrowRight size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-sm font-medium text-surface-900">{title}</p>
        <p className="text-xs text-surface-500">{desc}</p>
      </div>
    </div>
  );
}

function TestButton({ label, testing, result, onClick, disabled }: {
  label: string; testing: boolean; result: boolean | null | undefined; onClick: () => void; disabled: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onClick}
        disabled={disabled || testing}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          disabled ? 'bg-surface-100 text-surface-400 cursor-not-allowed' :
          'bg-surface-100 text-surface-700 hover:bg-surface-200'
        }`}
      >
        {testing ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
        {label}
      </button>
      {result === true && (
        <span className="flex items-center gap-1 text-xs text-accent-600">
          <CheckCircle2 size={14} /> Connected
        </span>
      )}
      {result === false && (
        <span className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={14} /> Failed
        </span>
      )}
    </div>
  );
}
