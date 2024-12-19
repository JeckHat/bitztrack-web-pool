import { Card, CardContent, CardFooter, CardTitle } from '../../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'

export default function Page () {
  return (
    <div className="max-w-4xl w-[min(56rem,100vw)]  mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">How to Start Mining in the Pool</h1>

      <div className="text-center mb-6">
        <p className="text-lg leading-relaxed">
          Follow these steps in your terminal to get started.
        </p>
      </div>

      {/* Step 1 & 2: Install Prerequisites and Rust */}
      <div className="flex flex-col gap-5">
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">1. Install Prerequisites and Rust</h2></CardTitle>
          <CardContent>
            <p>
              Follow the instructions for your operating system.
            </p>
            <p className="mb-4">For more detailed information, refer to the{' '}
              <a
                href="https://doc.rust-lang.org/cargo/getting-started/installation.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                official Rust installation guide
              </a>.</p>
            <Tabs defaultValue="linux" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="linux">Linux</TabsTrigger>
                <TabsTrigger value="macos">macOS</TabsTrigger>
                <TabsTrigger value="windows">Windows</TabsTrigger>
              </TabsList>
              <TabsContent value="linux">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Open a terminal window.</li>
                  <li>Install the necessary dependencies:
                    <pre className="bg-muted p-2 rounded-md text-sm overflow-x-auto mt-2">
                      <code>sudo apt install git build-essential libssl-dev pkg-config -y</code>
                    </pre>
                  </li>
                  <li>Install Rust:
                    <pre className="bg-muted p-2 rounded-md text-sm overflow-x-auto mt-2">
                      <code>curl --proto &#39;=https&#39; --tlsv1.2 -sSf https://sh.rustup.rs | sh</code>
                    </pre>
                  </li>
                  <li>Follow the on-screen instructions to complete the Rust installation.</li>
                  <li>Restart your terminal or run <code>source $HOME/.cargo/env</code> to update your PATH.</li>
                </ol>
              </TabsContent>
              <TabsContent value="macos">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Open Terminal.</li>
                  <li>Install Xcode Command Line Tools:
                    <pre className="bg-muted p-2 rounded-md text-sm overflow-x-auto mt-2">
                      <code>xcode-select --install</code>
                    </pre>
                  </li>
                  <li>Install Homebrew (if not already installed):
                    <pre className="bg-muted p-2 rounded-md text-sm overflow-x-auto mt-2">
                      <code>/bin/bash -c &#34;$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)&#34;</code>
                    </pre>
                  </li>
                  <li>Install necessary dependencies:
                    <pre className="bg-muted p-2 rounded-md text-sm overflow-x-auto mt-2">
                      <code>brew install openssl</code>
                    </pre>
                  </li>
                  <li>Install Rust:
                    <pre className="bg-muted p-2 rounded-md text-sm overflow-x-auto mt-2">
                      <code>curl --proto &#39;=https&#39; --tlsv1.2 -sSf https://sh.rustup.rs | sh</code>
                    </pre>
                  </li>
                  <li>Follow the on-screen instructions to complete the Rust installation.</li>
                  <li>Restart your terminal or run <code>source $HOME/.cargo/env</code> to update your PATH.</li>
                </ol>
              </TabsContent>
              <TabsContent value="windows">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Download and install <a href="https://visualstudio.microsoft.com/visual-cpp-build-tools/"
                                              className="text-blue-500 hover:underline" target="_blank"
                                              rel="noopener noreferrer">Visual C++ Build Tools</a>.
                  </li>
                  <li>During installation, ensure you select &#34;Desktop development with C++&#34;.</li>
                  <li>Download and run the <a href="https://www.rust-lang.org/tools/install"
                                              className="text-blue-500 hover:underline" target="_blank"
                                              rel="noopener noreferrer">Rust installer</a> (rustup-init.exe).
                  </li>
                  <li>Follow the on-screen instructions to complete the Rust installation.</li>
                  <li>Restart your computer to ensure all changes take effect.</li>
                </ol>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Step 3: Install the Mining Client */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">2. Install the Mining Client</h2></CardTitle>
          <CardContent>
            <p>Now that Rust is installed, you can install the Excalivator mining client using Cargo:</p>
          </CardContent>
          <CardFooter>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto w-full">
               <code>cargo install coal-pool-client</code>
            </pre>
          </CardFooter>
        </Card>

        {/* Step 4: Start Mining */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">3. Start Mining!</h2></CardTitle>
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
          <CardTitle><h2 className="text-2xl font-semibold mb-4">4. Create Your Wallet</h2></CardTitle>
          <CardContent>
            <p>When you launch the <code>coal-pool-client</code> command, you’ll be prompted to create a wallet. Choose
              the <strong>&#34;Generate Keypair&#34;</strong> option to generate your wallet keypair.</p>
          </CardContent>
        </Card>

        {/* Step 6: Sign Up for the Pool */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">5. Sign Up for the Pool</h2></CardTitle>
          <CardContent>
            <p>After generating your keypair, use the <strong>&#34;Sign Up&#34;</strong> option to register your keypair
              with the pool.</p>
          </CardContent>
        </Card>

        {/* Step 7: Start Mining */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">6. Start Mining</h2></CardTitle>
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
