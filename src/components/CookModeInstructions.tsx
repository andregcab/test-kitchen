'use client';

import { useState } from 'react';
import { Flame, X, Check } from 'lucide-react';
import { Instruction } from '@/lib/types';

interface Props {
  instructions: Instruction[];
}

export default function CookModeInstructions({ instructions }: Props) {
  const [cookMode, setCookMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  function enterCookMode() {
    setCurrentStep(1);
    setCookMode(true);
  }

  function exitCookMode() {
    setCookMode(false);
    setCurrentStep(1);
  }

  function goToStep(step: number) {
    if (cookMode) setCurrentStep(step);
  }

  function nextStep(e: React.MouseEvent) {
    e.stopPropagation();
    if (currentStep < instructions.length) setCurrentStep((s) => s + 1);
  }

  function finish(e: React.MouseEvent) {
    e.stopPropagation();
    exitCookMode();
  }

  const progress = ((currentStep - 1) / instructions.length) * 100;
  const isLast = currentStep === instructions.length;

  return (
    <section>
      <div className='flex items-center justify-between mb-3'>
        <h2 className='text-lg font-bold'>Instructions</h2>
        {!cookMode && (
          <button
            onClick={enterCookMode}
            className='flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97]'
            style={{ background: 'var(--accent)' }}
          >
            <Flame size={15} strokeWidth={2} />
            Cook
          </button>
        )}
      </div>

      {cookMode && (
        <>
          {/* Banner */}
          <div
            className='flex items-center justify-between px-4 py-3 rounded-xl mb-3'
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            <div className='flex items-center gap-2'>
              <Flame size={16} strokeWidth={2} />
              <span className='font-semibold text-sm'>Cook Mode</span>
            </div>
            <span className='text-sm font-medium' style={{ opacity: 0.85 }}>
              Step {currentStep} of {instructions.length}
            </span>
            <button
              onClick={exitCookMode}
              className='flex items-center justify-center w-7 h-7 rounded-full transition-colors'
              style={{ background: 'rgba(255,255,255,0.2)' }}
              aria-label='Exit cook mode'
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>

          {/* Progress bar */}
          <div
            className='h-1 rounded-full mb-4 overflow-hidden'
            style={{ background: 'var(--border)' }}
          >
            <div
              className='h-full rounded-full'
              style={{
                width: `${progress}%`,
                background: 'var(--accent)',
                transition: 'width 400ms ease',
              }}
            />
          </div>
        </>
      )}

      <ol className='flex flex-col gap-3'>
        {instructions.map((inst) => {
          const isDone = cookMode && inst.step < currentStep;
          const isCurrent = cookMode && inst.step === currentStep;

          return (
            <li
              key={inst.step}
              onClick={() => goToStep(inst.step)}
              className='flex gap-4 p-4 rounded-xl'
              style={{
                background: 'var(--card)',
                borderTop: '1px solid var(--border)',
                borderRight: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                borderLeft: isCurrent
                  ? '4px solid var(--accent)'
                  : '1px solid var(--border)',
                opacity: isDone ? 0.45 : 1,
                cursor: cookMode ? 'pointer' : 'default',
                boxShadow: isCurrent
                  ? '0 0 0 3px var(--accent-light)'
                  : 'none',
                transition: 'opacity 300ms ease, box-shadow 300ms ease',
              }}
            >
              {/* Step number / check */}
              <span
                className='flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm'
                style={{
                  background: isDone ? 'var(--border)' : 'var(--accent)',
                  color: isDone ? 'var(--muted)' : 'white',
                  transition: 'background 300ms ease',
                }}
              >
                {isDone ? (
                  <Check size={16} strokeWidth={2.5} />
                ) : (
                  inst.step
                )}
              </span>

              <div className='flex-1 min-w-0'>
                <p className='pt-1 leading-relaxed'>{inst.text}</p>

                {isCurrent && !isLast && (
                  <button
                    onClick={nextStep}
                    className='mt-4 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97]'
                    style={{ background: 'var(--accent)' }}
                  >
                    Next Step →
                  </button>
                )}

                {isCurrent && isLast && (
                  <button
                    onClick={finish}
                    className='mt-4 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97]'
                    style={{ background: 'var(--accent)' }}
                  >
                    Done cooking
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
