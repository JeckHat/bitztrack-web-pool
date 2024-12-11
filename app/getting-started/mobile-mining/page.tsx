import { Card, CardContent, CardTitle } from '../../../components/ui/card'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'

export default function Page () {
  return (
    <div className="max-w-4xl w-[min(56rem,100vw)]  mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">Mobile Mining Guide</h1>

      <div className="text-center mb-6">
        <p className="text-lg leading-relaxed">
          Mine COAL on your Android device with super low power consumption using the official mobile client.
          <br/>Follow these simple steps to start mining on your phone.
        </p>
        <Link
          href="https://github.com/shinyst-shiny/coal-pool-mobile/releases/download/2.0.0/coal-pool-mobile-v2.0.0.apk"
          target="_blank">
          <Button size="lg" className="mt-3">
            <strong>DOWNLOAD THE APP (v2.0.0)</strong>
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-5">

        {/* Installation */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">1. Install the app</h2></CardTitle>
          <CardContent>
            <ul className="list-disc list-inside mt-2">
              <li>Enable installation from unknown sources in your phone&#39;s settings</li>
              <li>Download and install the APK file</li>
            </ul>
          </CardContent>
        </Card>

        {/* Startup */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">2. Set up your wallet</h2></CardTitle>
          <CardContent>
            <ul className="list-disc list-inside mt-2">
              <li>Launch the application</li>
              <li>The app will generate a new hot wallet for mining</li>
              <li>Connect this hot wallet to your main Solana wallet for receiving rewards</li>
            </ul>
            <p className="mt-2">Note: Your connected main wallet will receive the mining rewards, not the app&#39;s hot
              wallet.</p>
          </CardContent>
        </Card>

        {/* Mining */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">3. Start mining</h2></CardTitle>
          <CardContent>
            <p>To start mining, from the home:</p>
            <ol className="list-disc list-inside mt-2">
              <li>Go to the mining screen in the app</li>
              <li>Tap the &#34;Start Mining&#34; button</li>
              <li>Adjust the number of CPU cores used for mining (start with a lower number and increase gradually)</li>
            </ol>
            <p className="mt-2">The app will now mine COAL in the background. You can monitor your mining progress and
              earnings in the app.</p>
          </CardContent>
        </Card>

        {/* Optimization */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">4. Optimize for continuous mining</h2></CardTitle>
          <CardContent>
            <p>To ensure uninterrupted mining:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Go to your Android phone&#39;s battery settings</li>
              <li>Find and disable battery optimization for the COAL mining app</li>
            </ul>
            <p className="mt-2">This prevents the system from closing the app to save power, allowing for continuous
              mining operations.</p>
          </CardContent>
        </Card>

        {/* Final Section */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">You&#39;re All Set! 🎉</h2>
          <p className="text-lg">
            Start mining COAL efficiently on your mobile device. Remember to monitor your device&#39;s temperature and
            battery usage for optimal performance and longevity.
          </p>
        </div>
      </div>
    </div>
  )
}
