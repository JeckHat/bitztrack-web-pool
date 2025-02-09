export default function Page () {
  return (
    <div className="px-6 py-10 flex flex-col items-center text-center">
      <h1 className="text-4xl font-bold mb-4">Work in Progress</h1>
      <p className="text-lg leading-relaxed mb-6">
        This page is currently under development. We&#39;re working hard to bring you exciting new features. Stay tuned!
      </p>
      <div className="flex items-center justify-center w-full max-w-md">
        <img
          src="/images/work-in-progress.svg"
          alt="Work in Progress Illustration"
          className="w-full h-auto hidden dark:block"
        />
        <img
          src="/images/work-in-progress-black.svg"
          alt="Work in Progress Illustration"
          className="w-full h-auto block dark:hidden"
        />
      </div>
      <p className="mt-6 text-gray-500">
        If you have any questions or suggestions, feel free to write me on discord @shinyst.
      </p>
    </div>
  )
}
