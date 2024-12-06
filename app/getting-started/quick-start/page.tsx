import { Card, CardContent, CardFooter, CardTitle } from '../../../components/ui/card'

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">How to Start Mining in the Pool</h1>

      <div className="text-center mb-6">
        <p className="text-lg leading-relaxed">
         Follow these steps in your terminal to get started.
        </p>
      </div>

      {/* Step 1: Install Prerequisites */}
      <div className="flex flex-col gap-5">
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">1. Install the Prerequisite Dependencies</h2>
          </CardTitle>
          <CardContent>
            <p>To get started, install the necessary dependencies on your machine by running:</p>
          </CardContent>
          <CardFooter>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto w-full">
              <code>sudo apt install git build-essential libssl-dev pkg-config -y</code>
            </pre>
          </CardFooter>
        </Card>

        {/* Step 2: Install Rust */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">2. Install Rust</h2></CardTitle>
          <CardContent>
            <p>You’ll need to install Rust to run the mining client. Use the following command to install Rust:</p>
          </CardContent>
          <CardFooter>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto w-full">
               <code>curl --proto &#39;=https&#39; --tlsv1.2 -sSf https://sh.rustup.rs | sh</code>
            </pre>
          </CardFooter>
        </Card>

        {/* Step 3: Install the Mining Client */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">3. Install the Mining Client</h2></CardTitle>
          <CardContent>
            <p>Now that Rust is installed, you can install the COAL + ORE mining client using Cargo:</p>
          </CardContent>
          <CardFooter>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto w-full">
               <code>cargo install coal-pool-client</code>
            </pre>
          </CardFooter>
        </Card>

        {/* Step 4: Start Mining */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">4. Start Mining!</h2></CardTitle>
          <CardContent>
            <p>Once the mining client is installed, you&#39;re ready to start mining. Run the following command to start
              the client:</p>
          </CardContent>
          <CardFooter>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto w-full">
               <code>coal-pool-client</code>
            </pre>
          </CardFooter>
        </Card>

        {/* Step 5: Create Your Wallet */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">5. Create Your Wallet</h2></CardTitle>
          <CardContent>
            <p>When you launch the <code>coal-pool-client</code> command, you’ll be prompted to create a wallet. Choose
              the <strong>&#34;Generate Keypair&#34;</strong> option to generate your wallet keypair.</p>
          </CardContent>
        </Card>

        {/* Step 6: Sign Up for the Pool */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">6. Sign Up for the Pool</h2></CardTitle>
          <CardContent>
            <p>After generating your keypair, use the <strong>&#34;Sign Up&#34;</strong> option to register your keypair
              with the pool.</p>
          </CardContent>
        </Card>

        {/* Step 7: Start Mining */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">7. Start Mining</h2></CardTitle>
          <CardContent>
            <p> Once registered, follow these steps to start mining:</p>
          </CardContent>
          <CardFooter>
            <ul className="list-disc list-inside">
              <li>Select the <strong>Mine</strong> option.</li>
              <li>Press Enter to confirm the default pool address.</li>
              <li>Select the keypair you created or choose a custom one.</li>
              <li>Select the number of cores available on your machine.</li>
              <li>Confirm the default 0 seconds buffer time and press Enter.</li>
            </ul>
          </CardFooter>
        </Card>

        {/* Final Section */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">You&#39;re All Set! 🎉</h2>
          <p className="text-lg mb-6">
            You&#39;re now mining COAL and ORE with the pool! Keep an eye on your mining progress and rewards.
          </p>
        </div>
      </div>
    </div>
  )
}
