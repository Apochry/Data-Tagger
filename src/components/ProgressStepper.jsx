export default function ProgressStepper({ steps, currentStep, onStepClick }) {
  const handleStepClick = (index) => {
    // Only allow clicking on completed steps, not current or future steps
    if (index < currentStep && onStepClick) {
      onStepClick(index)
    }
  }

  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isClickable = isCompleted

        return (
          <div key={index} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleStepClick(index)}
                disabled={!isClickable}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gray-900 cursor-pointer hover:ring-2 hover:ring-gray-400'
                    : isCurrent
                    ? 'bg-gray-900 ring-4 ring-gray-200 cursor-default'
                    : 'bg-gray-300 cursor-default'
                } disabled:cursor-default`}
                title={isClickable ? `Go back to ${step.label}` : ''}
              />
              <div className="mt-3 text-center">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={`text-xs font-medium ${
                    index <= currentStep ? 'text-gray-900' : 'text-gray-400'
                  } ${isClickable ? 'cursor-pointer hover:underline' : 'cursor-default'}`}
                >
                  {step.label}
                </button>
                <div
                  className={`text-xs mt-0.5 ${
                    index <= currentStep ? 'text-gray-500' : 'text-gray-300'
                  }`}
                >
                  {step.description}
                </div>
              </div>
            </div>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div
                className={`w-24 h-px mx-4 transition-all duration-300 ${
                  index < currentStep ? 'bg-gray-900' : 'bg-gray-300'
                }`}
                style={{ marginBottom: '52px' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
