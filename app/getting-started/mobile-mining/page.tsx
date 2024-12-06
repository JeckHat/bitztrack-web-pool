import { Card, CardContent, CardTitle } from '../../../components/ui/card'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">Mobile Mining Guide</h1>

      <div className="text-center mb-6">
        <p className="text-lg leading-relaxed">
          Mine COAL on your mobile device with super low power consumption using the Android client.
          <br/>Follow these steps to get started.
        </p>
        <Link href="https://github.com/shinyst-shiny/coal-pool-mobile/releases/download/2.0.0/coal-pool-mobile-v2.0.0.apk" target="_blank">
          <Button size="lg" className="mt-3">
            <strong>DOWNLOAD THE APP</strong>
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-5">

        {/* Installation */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">1. Install the app</h2></CardTitle>
          <CardContent>
            <ul className="list-disc list-inside mt-2">
              <li>Allow your phone&#39;s browser to install unknown sources apps</li>
              <li>Select the downloaded app and install it</li>
            </ul>
          </CardContent>
        </Card>

        {/* Startup */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">2. Startup</h2></CardTitle>
          <CardContent>
            <ul className="list-disc list-inside mt-2">
              <li>Launch the application and let it generate an hot wallet</li>
              <li>Connect the app to an external wallet</li>
            </ul>
            <p className="mt-2">The connected wallet will be the one that will claim the rewards</p>
          </CardContent>
        </Card>

        {/* Mining */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">3. Mining</h2></CardTitle>
          <CardContent>
            <p>To start mining, from the home:</p>
            <ol className="list-disc list-inside mt-2">
              <li>Navigate to the mining screen</li>
              <li>Hit the &#34;Start Mining&#34; button</li>
              <li>Adjust the number of cores used by the app</li>
            </ol>
          </CardContent>
        </Card>

        {/* Optimization */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">Optimization</h2></CardTitle>
          <CardContent>
            <p>For the best possible uptime check your Android phone&#39;s settings for <strong>battery optimization</strong> and disable <strong>battery optimization</strong> for the mining app</p>
          </CardContent>
        </Card>

        {/* Final Section */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">You&#39;re All Set! 🎉</h2>
          <p className="text-lg">
            Enjoy mining with the low power consumption of the phone and your old devices.
          </p>
        </div>
      </div>
    </div>
  )
}
