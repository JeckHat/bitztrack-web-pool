'use client'

import { Card, CardContent, CardTitle } from '../../../components/ui/card'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

// Component for copyable code block
function CopyableCode ({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative mt-3 mb-3">
      <pre className="bg-gray-800 text-gray-100 p-3 rounded-md overflow-x-auto">
        <code>{code}</code>
      </pre>
      <button
        className="absolute top-2 right-2 p-1 rounded-md bg-gray-700 hover:bg-gray-600"
        onClick={copyToClipboard}
      >
        {copied ? <Check size={16}/> : <Copy size={16}/>}
      </button>
    </div>
  )
}

export default function Page () {
  return (
    <div className="px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">Mobile Mining Guide</h1>

      <div className="text-center mb-6">
        <p className="text-lg leading-relaxed">
          Mine COAL on your Android device using UserLAnd - a Linux distribution app.
          <br/>This method allows you to run the full mining client on your phone.
        </p>
        <Link
          href="https://play.google.com/store/apps/details?id=tech.ula&hl=it"
          target="_blank">
          <Button size="lg" className="mt-3">
            <strong>DOWNLOAD USERLAND APP</strong>
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-5">
        {/* Installation */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">1. Install UserLAnd</h2></CardTitle>
          <CardContent>
            <p>Install the UserLAnd app from the Google Play Store and follow these steps:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Open the UserLAnd app</li>
              <li>Select <strong>Ubuntu</strong> as your distribution</li>
              <li>Create a virtual machine by following the on-screen instructions</li>
            </ul>
          </CardContent>
        </Card>

        {/* Setup Dependencies */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">2. Install Dependencies</h2></CardTitle>
          <CardContent>
            <p>Once your Ubuntu system is running, enter the following command in the terminal:</p>
            <CopyableCode code="sudo apt-get update && sudo apt install git build-essential libssl-dev pkg-config -y"/>
            <p>This will update package lists and install essential build tools.</p>
          </CardContent>
        </Card>

        {/* Install Rust */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">3. Install Rust</h2></CardTitle>
          <CardContent>
            <p>Install Rust programming language by running:</p>
            <CopyableCode code="curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"/>
            <p>When prompted, select the default installation options by pressing Enter.</p>
            <p className="mt-2">After installation completes, load the Rust environment:</p>
            <CopyableCode code='. "$HOME/.cargo/env"'/>
          </CardContent>
        </Card>

        {/* Install Mining Client */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">4. Install Mining Client</h2></CardTitle>
          <CardContent>
            <p>Install the Excalivator mining client with:</p>
            <CopyableCode code="cargo install excalivator-client"/>
            <p>This may take some time to compile on a mobile device. Be patient during the installation process.</p>
          </CardContent>
        </Card>

        {/* Start Mining */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">5. Start Mining</h2></CardTitle>
          <CardContent>
            <p>Launch the mining client:</p>
            <CopyableCode code="excalivator-client"/>
            <p className="mt-2">In the client interface:</p>
            <ol className="list-decimal list-inside mt-2">
              <li>Select &#34;Mine with public key&#34;</li>
              <li>Input your Solana public key when prompted</li>
              <li>Accept the default settings or customize the number of CPU cores you want to use for mining</li>
              <li>Begin mining with the Excalivator pool</li>
            </ol>
          </CardContent>
        </Card>

        {/* Optimization */}
        <Card className="px-6 py-4">
          <CardTitle><h2 className="text-2xl font-semibold mb-4">6. Optimize for Continuous Mining</h2></CardTitle>
          <CardContent>
            <p>To ensure uninterrupted mining:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Disable battery optimization for UserLAnd in your Android settings</li>
              <li>In the UserLAnd notification tray, tap &#34;Acquire wakelock&#34; to prevent the app from being killed
                by the
                system
              </li>
              <li>Keep your device plugged in while mining to prevent battery drain</li>
              <li>Consider using a cooling solution if mining for extended periods</li>
            </ul>
          </CardContent>
        </Card>

        {/* Final Section */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">You&#39;re All Set! 🎉</h2>
          <p className="text-lg">
            You&#39;re now mining on your Android device using a full Linux environment.
          </p>
          <p className="mt-2">
            Remember to monitor your device&#39;s temperature during mining sessions to prevent overheating.
          </p>
        </div>
      </div>
    </div>
  )
}
