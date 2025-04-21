'use client'

import { Card, CardContent } from '../../../components/ui/card'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { ChevronDown } from 'lucide-react'

// Collapsible section component for organizing content
function CollapsibleSection ({ title, children }: Readonly<{ title: string, children: React.ReactNode }>) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-md mb-4 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left transition-colors flex justify-between items-center"
      >
        <h2 className="text-2xl font-semibold">{title}</h2>
        <ChevronDown className={`h-6 w-6 transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
      </button>
      {isOpen && (
        <div className="px-6 py-4">
          {children}
        </div>
      )}
    </div>
  )
}

// Copyable code block component for terminal commands
function CopyableCode ({ code }: Readonly<{ code: string }>) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative bg-muted p-4 rounded-md text-sm overflow-x-auto my-3 group">
      <pre><code>{code}</code></pre>
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 bg-gray-700 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

export default function Page () {
  return (
    <div className="px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">Mining with HiveOS and OrionClient</h1>

      <div className="text-center mb-6">
        <p className="text-lg leading-relaxed">
          This comprehensive guide explains how to set up OrionClient on a running HiveOS system
          to mine with the Excalivator pool.
        </p>
        <Link
          href="https://github.com/SL-x-TnT/OrionClient/releases"
          target="_blank">
          <Button size="lg" className="mt-3">
            <strong>OrionClient GitHub Releases</strong>
          </Button>
        </Link>
      </div>

      <CollapsibleSection title="1. Installing OrionClient">
        <Card className="mb-4">
          <CardContent className="pt-6">
            <h3 className="text-xl font-medium mb-3">Downloading the Binary</h3>
            <p className="mb-3">
              Log in to the HiveOS terminal (SSH or ShellInABox) and download the latest release:
            </p>
            <CopyableCode
              code="wget https://github.com/SL-x-TnT/OrionClient/releases/download/v1.5.0.0/linux-x64-standalone.zip"/>
            <p className="text-sm text-gray-500 mt-2 mb-4">
              Note: Check the GitHub releases page for the latest version and adjust the URL accordingly.
            </p>

            <h3 className="text-xl font-medium mb-3">Extracting and Setting Up</h3>
            <p className="mb-3">Extract the downloaded archive:</p>
            <CopyableCode code="unzip linux-x64-standalone.zip"/>

            <p className="mb-3">If unzip is not installed, run:</p>
            <CopyableCode code="sudo apt-get update && sudo apt-get install -y unzip"/>

            <p className="mb-3">Create a dedicated directory for the miner:</p>
            <CopyableCode code="mkdir -p /hive/miners/custom/orionclient"/>

            <p className="mb-3">Move the OrionClient executable file to the custom miner directory:</p>
            <CopyableCode code="mv OrionClient /hive/miners/custom/orionclient/"/>

            <p className="mb-3">Set executable permissions:</p>
            <CopyableCode code="chmod +x /hive/miners/custom/orionclient/OrionClient"/>
          </CardContent>
        </Card>
      </CollapsibleSection>

      <CollapsibleSection title="2. Configuring OrionClient in HiveOS">
        <Card className="mb-4">
          <CardContent className="pt-6">
            <h3 className="text-xl font-medium mb-3">Create a Custom Miner</h3>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>Log in to the HiveOS web interface</li>
              <li>Navigate to your Farm settings</li>
              <li>Go to the &#34;Wallets&#34; tab and add your Solana wallet address with a recognizable name</li>
              <li>Select SOL as the coin type if ORE/COAL are not available options</li>
              <li>Navigate to the &#34;Flight Sheets&#34; tab and click &#34;Add Flight Sheet&#34;</li>
              <li>Select a Coin (SOL or a custom coin for ORE/COAL), then select your Solana wallet</li>
              <li>For Pool, select &#34;Configure in miner&#34;</li>
              <li>In the &#34;Miner&#34; dropdown, select &#34;Configure Miner&#34;</li>
              <li>In the new window, click &#34;Show All&#34; or search for &#34;Custom&#34; miner option</li>
            </ol>

            <h3 className="text-xl font-medium mb-3">Configure the Custom Miner</h3>
            <p>Fill in the following fields:</p>
            <div className="pl-4 my-3 space-y-1">
              <p><strong>Miner Name:</strong> OrionClient</p>
              <p><strong>Installation URL:</strong> Leave blank (installed manually)</p>
              <p><strong>Installation Path:</strong> /hive/miners/custom/orionclient/</p>
              <p><strong>Executable Name:</strong> OrionClient</p>
              <p><strong>Hashing Algorithm:</strong> Autolykos2 (or another placeholder)</p>
              <p><strong>Wallet and worker template:</strong> %WAL%</p>
              <p><strong>Pool URL:</strong> Leave blank or use %URL%</p>
              <p><strong>Extra config arguments:</strong></p>
              <CopyableCode code="mine --key %WAL% --pool excalivator -t 0 --gpu"/>
            </div>

            <div className="p-4 rounded-md mt-4">
              <h4 className="font-medium mb-2">Arguments Explained:</h4>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><code>mine</code>: The primary command for the client</li>
                <li><code>--key %WAL%</code>: Passes your Solana wallet address (public key)</li>
                <li><code>--pool excalivator</code>: Specifies the pool (resolves to pool.excalivator.xyz)</li>
                <li><code>-t 0</code>: Sets thread configuration for OrionClient</li>
                <li><code>--gpu</code>: Enables GPU mining</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium mt-4 mb-3">Finalize Configuration</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Click &#34;Apply Changes&#34; or &#34;Update Miner&#34;</li>
              <li>Name your Flight Sheet (e.g., &#34;OrionClient ORE/COAL&#34;)</li>
              <li>Click &#34;Create Flight Sheet&#34;</li>
            </ol>
          </CardContent>
        </Card>
      </CollapsibleSection>

      <CollapsibleSection title="3. Running and Monitoring">
        <Card className="mb-4">
          <CardContent className="pt-6">
            <h3 className="text-xl font-medium mb-3">Applying the Flight Sheet</h3>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>Go to the &#34;Workers&#34; tab in HiveOS</li>
              <li>Select the worker(s) where OrionClient was installed</li>
              <li>Click the Flight Sheet icon (rocket) for the selected worker(s)</li>
              <li>Choose your newly created OrionClient Flight Sheet</li>
              <li>Click &#34;Apply&#34;</li>
            </ol>

            <h3 className="text-xl font-medium mb-3">Monitoring Performance</h3>
            <div className="mb-4">
              <h4 className="font-medium mb-2">HiveOS Web Interface</h4>
              <p>Look for:</p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Increasing miner uptime</li>
                <li>GPU/CPU temperatures and fan speeds</li>
                <li>Hashrate reporting (if stats parsing is successful)</li>
                <li>Any error messages in the miner status section</li>
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-2">HiveOS Terminal</h4>
              <p>For detailed monitoring, connect to your rig&#39;s terminal and run:</p>
              <CopyableCode code="miner"/>
              <p>Watch for:</p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Successful connection messages to the Excalivator pool</li>
                <li>Share acceptance notifications or &#34;Sending solution&#34; messages</li>
                <li>Stats table output showing mining performance</li>
                <li>Any error messages</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Log Files</h4>
              <p>Check the miner log files for historical output and errors:</p>
              <CopyableCode code="tail -f /var/log/miner/orionclient/orionclient.log"/>
              <p className="text-sm text-gray-500 mt-2">
                Successful operation is indicated by accepted shares appearing in the miner output and statistics
                showing up on the Excalivator pool&#39;s dashboard for your Solana address.
              </p>
            </div>
          </CardContent>
        </Card>
      </CollapsibleSection>

      <CollapsibleSection title="4. Updating OrionClient">
        <Card>
          <CardContent className="pt-6">
            <ol className="list-decimal list-inside space-y-2">
              <li>Check the <Link href="https://github.com/SL-x-TnT/OrionClient/releases"
                                  className="text-blue-500 hover:underline" target="_blank">OrionClient GitHub
                Releases</Link> page for newer versions
              </li>
              <li>Download the new binary archive to your HiveOS rig</li>
              <li>Stop the OrionClient miner in HiveOS (apply a different Flight Sheet or use &#34;Stop Miner&#34;)</li>
              <li>Extract the new binary from the downloaded archive</li>
              <li>Replace the old executable with the new one:</li>
            </ol>
            <CopyableCode code="mv OrionClient /hive/miners/custom/orionclient/"/>
            <p>Ensure the new file has execute permissions:</p>
            <CopyableCode code="chmod +x /hive/miners/custom/orionclient/OrionClient"/>
            <p>Re-apply the Flight Sheet configured for OrionClient</p>
          </CardContent>
        </Card>
      </CollapsibleSection>

      <CollapsibleSection title="5. Troubleshooting">
        <Card className="mb-4">
          <CardContent className="pt-6">
            <h3 className="text-xl font-medium mb-3">Miner Fails to Start</h3>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                <strong>Check Permissions:</strong> Verify the executable has execute permissions:
                <CopyableCode code="ls -l /hive/miners/custom/orionclient/OrionClient"/>
                If not, run: <code className="px-1 rounded">chmod +x
                /hive/miners/custom/orionclient/OrionClient</code>
              </li>
              <li>
                <strong>Check Path:</strong> Ensure the &#34;Installation Path&#34; and &#34;Executable Name&#34; in
                HiveOS configuration match the actual location
              </li>
              <li>
                <strong>Check HiveOS Logs:</strong>
                <CopyableCode code="cat /var/log/hive-agent.log | grep -i orionclient"/>
              </li>
              <li>
                <strong>Try Manual Execution:</strong>
                <CopyableCode
                  code="cd /hive/miners/custom/orionclient/\n./OrionClient mine --key YOUR_SOLANA_WALLET_ADDRESS --pool excalivator -t 0 --gpu"/>
              </li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Connection/Authentication Issues</h3>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li><strong>Check Wallet Address:</strong> Ensure your Solana public key is correct in the Flight Sheet
              </li>
              <li><strong>Check Pool Argument:</strong> Confirm <code>--pool excalivator</code> is correctly specified
              </li>
              <li><strong>Verify Network:</strong> Confirm your rig has proper network connectivity</li>
              <li><strong>Firewall:</strong> Check for any firewall rules blocking outbound connections</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Configuration Errors</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Use miner Command:</strong> Run the <code
                className="px-1 rounded">miner</code> command to see specific errors
              </li>
              <li>
                <strong>Verify Arguments:</strong> Check each part of the command line for typos:
                <CopyableCode code="mine --key %WAL% --pool excalivator -t 0 --gpu"/>
                Ensure %WAL% is being correctly substituted with your Solana address
              </li>
            </ul>
          </CardContent>
        </Card>
      </CollapsibleSection>

      <div className="text-center mt-8">
        <h2 className="text-2xl font-semibold mb-4">You&#39;re All Set! 🎉</h2>
        <p className="text-lg">
          Your HiveOS rig is now configured to mine with OrionClient on the Excalivator pool.
        </p>
      </div>
    </div>
  )
}
