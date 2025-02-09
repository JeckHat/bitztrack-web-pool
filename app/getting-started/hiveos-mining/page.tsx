import { Card, CardContent, CardTitle } from '../../../components/ui/card'
import Link from 'next/link'
import { ZoomableImage } from '../../../components/zoomable-image'

export default function Page () {
  return (
    <div className="px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">Setting Up HiveOS with Excalivator Pool</h1>

      <div className="text-center mb-6">
        <p className="text-lg leading-relaxed">
          This guide will help you set up HiveOS to mine with the Excalivator pool using the Orion Client.
        </p>
      </div>

      <Card className="px-6 pt-6 mb-6">
        <CardContent>
          <p className="text-center italic">
            Special thanks to <Link href="https://github.com/TheRetroMike"
                                    className="text-blue-500 hover:underline">TheRetroMike</Link> for creating this
            implementation.<br/>
            The original explanation and more details can be found in his fork of the <Link
            href="https://github.com/TheRetroMike/OrionClient" className="text-blue-500 hover:underline">Orion Client
            repository</Link>.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-5">
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">1. Prepare the HiveOS System</h2></CardTitle>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>SSH into your HiveOS system (or use Hive Shell)</li>
              <li>Run the following commands and answer Y if prompted:
                <pre className="bg-muted p-2 rounded-md text-sm overflow-x-auto mt-2">
                  <code>sudo apt-get update</code>
                </pre>
                <pre className="bg-muted p-2 rounded-md text-sm overflow-x-auto mt-2">
                  <code>apt install curl git build-essential libssl-dev pkg-config -y</code>
                </pre>
                <pre className="bg-muted p-2 rounded-md text-sm overflow-x-auto mt-2">
                  <code>curl --proto &#39;=https&#39; --tlsv1.2 -sSf https://sh.rustup.rs/ | sh</code>
                </pre>
              </li>
              <li>Disconnect and restart the machine</li>
              <li>Reconnect to SSH or HiveShell</li>
              <li>Install the COAL pool client:
                <pre className="bg-muted p-2 rounded-md text-sm overflow-x-auto mt-2">
                  <code>cargo install coal-pool-client</code>
                </pre>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">2. Create and Launch Flightsheet</h2></CardTitle>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to the Hive dashboard</li>
              <li>Create and launch a flightsheet with custom miner</li>
              <li>Use the following Installation URL:
                <pre className="bg-muted p-2 rounded-md text-sm overflow-x-auto mt-2">
                  <code>https://github.com/TheRetroMike/OrionClient/releases/download/v1.2.0.0/coal_pool_client-1.0.tar.gz</code>
                </pre>
              </li>
              <li>Configure the settings as shown in the images below:
                <div className="mt-4 flex justify-center">
                  <ZoomableImage
                    src="/images/hive_os/hive_os_1.webp"
                    alt="HiveOS Flightsheet Settings 1"
                    width={600}
                    height={400}
                  />
                </div>
                <div className="mt-4 flex justify-center">
                  <ZoomableImage
                    src="/images/hive_os/hive_os_2.webp"
                    alt="HiveOS Flightsheet Settings 2"
                    width={600}
                    height={400}
                  />
                </div>
              </li>
              <li>If the &#34;Pool URL&#34; setting doesn&#39;t work, try using &#34;pool.excalivator.xyz&#34;</li>
            </ol>
          </CardContent>
        </Card>

        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">3. Final Setup and Mining</h2></CardTitle>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>SSH or use HiveShell to access your system</li>
              <li>Run the command:
                <pre className="bg-muted p-2 rounded-md text-sm overflow-x-auto mt-2">
                  <code>miner</code>
                </pre>
              </li>
              <li>Follow the setup and/or mining steps through the CLI interface</li>
            </ol>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <h2 className="text-2xl font-semibold mb-4">You&#39;re All Set! 🎉</h2>
          <p className="text-lg">
            You are now ready to mine with HiveOS using the Excalivator pool. Happy mining!
          </p>
        </div>
      </div>
    </div>
  )
}
