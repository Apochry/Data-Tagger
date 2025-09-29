export default function ProgressStepper({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          {/* Step Circle */}
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index < currentStep
                  ? 'bg-gray-900'
                  : index === currentStep
                  ? 'bg-gray-900 ring-4 ring-gray-200'
                  : 'bg-gray-300'
              }`}
            />
            <div className="mt-3 text-center">
              <div
                className={`text-xs font-medium ${
                  index <= currentStep ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {step.label}
              </div>
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
      ))}
    </div>
  )
}
