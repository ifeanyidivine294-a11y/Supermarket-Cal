import React, { useState } from 'react';
import { runAllMandatoryTests, TestCaseResult } from '../utils/testRunner';
import { X, CheckCircle2, XCircle, Play, Sparkles, RefreshCw } from 'lucide-react';

interface QATestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QATestRunnerModal: React.FC<QATestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [results, setResults] = useState<TestCaseResult[]>(() => runAllMandatoryTests());
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const handleReRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      const freshResults = runAllMandatoryTests();
      setResults(freshResults);
      setIsRunning(false);
    }, 400);
  };

  const allPassed = results.every((r) => r.passed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#12A84A] flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#071B3A]">
              Mandatory POS Basket Test Suite (Section 12)
            </h2>
            <p className="text-xs text-slate-500">
              Live automated validation of mathematical formulas, multi-tier pricing, and inventory arithmetic.
            </p>
          </div>
        </div>

        {/* Global Status Banner */}
        <div className="my-4 p-3.5 rounded-2xl flex items-center justify-between gap-3 bg-emerald-50 text-emerald-900 border border-emerald-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#12A84A] shrink-0" />
            <div>
              <div className="text-xs font-bold">
                {allPassed ? 'ALL 5 MANDATORY TESTS PASSED (100% ACCURACY)' : 'TEST FAILURES DETECTED'}
              </div>
              <div className="text-[11px] text-emerald-700">
                Verified against Asaba retail rules and small-business wholesale pricing tables.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReRun}
            disabled={isRunning}
            className="px-3.5 py-1.5 rounded-xl bg-[#12A84A] hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>Re-Run Suite</span>
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs scrollbar-thin">
          {results.map((r) => (
            <div
              key={r.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                r.passed ? 'bg-slate-50/80 border-slate-200' : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2">
                  {r.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#12A84A] shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <h4 className="font-extrabold text-slate-900">{r.name}</h4>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {r.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 mb-2">{r.description}</p>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-1 font-mono text-[11px]">
                <div className="text-slate-500">
                  <span className="font-bold text-slate-700">Expected:</span> {r.expected}
                </div>
                <div className="text-emerald-700">
                  <span className="font-bold text-slate-700">Actual:</span> {r.actual}
                </div>
                <div className="pt-1 border-t border-slate-100 text-[10px] text-slate-400 space-y-0.5 font-sans">
                  {r.details.map((d, idx) => (
                    <div key={idx}>• {d}</div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
          >
            Close Runner
          </button>
        </div>
      </div>
    </div>
  );
};
