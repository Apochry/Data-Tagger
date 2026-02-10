export default function ProgressStepper({ steps, currentStep, onStepClick }) {
  const handleStepClick = (index) => {
    // Only allow clicking on completed steps, not current or future steps
    if (index < currentStep && onStepClick) {
      onStepClick(index)
    }
  }

  const getDotClasses = (isCompleted, isCurrent) =>
    `w-3 h-3 rounded-full transition-all duration-300 ${
      isCompleted
        ? 'bg-gray-900 cursor-pointer hover:ring-2 hover:ring-gray-400'
        : isCurrent
        ? 'bg-gray-900 ring-4 ring-gray-200 cursor-default'
        : 'bg-gray-300 cursor-default'
    } disabled:cursor-default`

  const getLabelClasses = (isActive, isClickable) =>
    `text-xs font-medium ${
      isActive ? 'text-gray-900' : 'text-gray-400'
    } ${isClickable ? 'cursor-pointer hover:underline' : 'cursor-default'}`

  return (
    <div className="w-full">
      {/* Mobile: vertical timeline to prevent horizontal overflow */}
      <div className="sm:hidden">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isClickable = isCompleted

          return (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center flex-shrink-0">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={getDotClasses(isCompleted, isCurrent)}
                  title={isClickable ? `Go back to ${step.label}` : ''}
                />
                {index < steps.length - 1 && (
                  <div
                    className={`w-px h-10 mt-2 transition-all duration-300 ${
                      index < currentStep ? 'bg-gray-900' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
              <div className={`min-w-0 ${index < steps.length - 1 ? 'pb-4' : 'pb-0'}`}>
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={`text-left text-sm font-medium ${
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
          )
        })}
      </div>

      {/* Desktop and tablet: horizontal timeline */}
      <div className="hidden sm:flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isClickable = isCompleted

          return (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={getDotClasses(isCompleted, isCurrent)}
                  title={isClickable ? `Go back to ${step.label}` : ''}
                />
                <div className="mt-3 text-center">
                  <button
                    onClick={() => handleStepClick(index)}
                    disabled={!isClickable}
                    className={getLabelClasses(index <= currentStep, isClickable)}
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

              {index < steps.length - 1 && (
                <div
                  className={`w-10 md:w-16 lg:w-24 h-px mx-2 md:mx-4 transition-all duration-300 ${
                    index < currentStep ? 'bg-gray-900' : 'bg-gray-300'
                  }`}
                  style={{ marginBottom: '52px' }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
