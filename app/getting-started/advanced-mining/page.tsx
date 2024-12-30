import { Card, CardContent, CardFooter, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import Link from 'next/link'

export default function Page () {
  return (
    <div className="max-w-4xl w-[min(56rem,100vw)]  mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">Advanced Mining with Orion Client</h1>

      <div className="text-center mb-6">
        <p className="text-lg leading-relaxed">
          Optimize your mining performance using the <strong>Orion Client</strong>, which supports both CPU and GPU
          mining.
          <br/>Follow these steps to get started.
        </p>
        <Link href="https://github.com/SL-x-TnT/OrionClient" target="_blank">
          <Button size="lg" className="mt-3">
            <strong>DOWNLOAD ORION CLIENT</strong>
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-5">
        {/* Step 1: Run Benchmarks */}
        <Card className="px-6 py-4">
          <CardTitle>
            <h2 className="text-2xl font-semibold mb-4">1. Run Benchmarks</h2>
          </CardTitle>
          <CardContent>
            <p>Launch the Orion Client and go to the <strong>Benchmarks</strong> section. Run benchmarks to identify the
              best algorithm for your hardware.</p>
          </CardContent>
        </Card>

        {/* Step 2: Setup Environment */}
        <Card className="px-6 py-4">
          <CardTitle>
            <h2 className="text-2xl font-semibold mb-4">2. Setup Your Environment</h2>
          </CardTitle>
          <CardContent>
            <p>Navigate to the <strong>Setup</strong> section and follow these steps:</p>
          </CardContent>
          <CardFooter>
            <ul className="list-disc list-inside">
              <li>Create a new keypair or use the <strong>Search</strong> function to load an existing one.</li>
              <li>Set the optimal algorithm for both CPU and GPU based on your benchmark results.</li>
              <li>Select <strong>Excalivator</strong> as your mining pool.</li>
            </ul>
          </CardFooter>
        </Card>

        {/* Step 3: Start Mining */}
        <Card className="px-6 py-4">
          <CardTitle>
            <h2 className="text-2xl font-semibold mb-4">3. Start Mining</h2>
          </CardTitle>
          <CardContent>
            <p>Once the setup is complete, simply hit the <strong>Mine</strong> button. The Orion Client will handle
              connecting to the pool and optimizing your mining output.</p>
          </CardContent>
        </Card>

        {/* Final Section */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">You&#39;re All Set! 🎉</h2>
          <p className="text-lg">
            Enjoy mining with maximum efficiency using both your CPU and GPU. Monitor your progress and rewards directly
            in the Orion Client.
          </p>
        </div>
      </div>
    </div>
  )
}
