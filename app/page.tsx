import { Button } from '../components/ui/button'
import Link from 'next/link'
import { Card } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'

export default function Page() {

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      {/* Hero Section */}
      <Card className="py-10 flex-1 bg-gradient-to-b from-gray-100 via-stone-100 to-white dark:from-gray-900 dark:via-stone-800 dark:to-black">
        <div className="container mx-auto px-4 h-full ">
          <header className="text-center">
            <h1 className="text-5xl font-extrabold mb-4">Welcome to the COAL + ORE Mining Pool</h1>
            <p className="text-xl font-light">Your Gateway to Efficient, Multi-Token Crypto Mining on Solana</p>
          </header>

          <Tabs defaultValue="overview" className="mt-10">
            <div className="flex flex-row w-full justify-center">
            <TabsList className="min-w-[50%] grid grid-cols-3 h-fit">
              <TabsTrigger
                className="text-lg font-medium"
                value="overview"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                className="text-lg font-medium"
                value="features"
              >
                Features
              </TabsTrigger>
              <TabsTrigger
                className="text-lg font-medium"
                value="reprocessing"
              >
                Reprocessing
              </TabsTrigger>
            </TabsList>
            </div>
            <TabsContent value="overview" className="mt-6">
              <h2 className="text-3xl font-bold mb-4">What is the COAL + ORE Mining Pool?</h2>
              <p className="text-lg leading-relaxed">
                The COAL + ORE Mining Pool is an innovative, open-source cryptocurrency mining platform built on the
                Solana blockchain. Designed for both novice and experienced miners, the pool enables simultaneous mining
                of <strong>COAL</strong> and <strong>ORE</strong>, along with an additional
                token, <strong>CHROMIUM</strong>, through a
                cutting-edge system called <strong>Reprocessing</strong>.
              </p>
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <h2 className="text-3xl font-bold mb-4">Why Choose COAL + ORE?</h2>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Triple Token Advantage</strong>: Mine COAL, ORE, and CHROMIUM in a single process.</li>
                <li><strong>No Entry Fees</strong>: Join the pool completely free of charge—no hidden costs or setup
                  fees.
                </li>
                <li><strong>Transparent Revenue Model</strong>: A simple <strong>5% fee on each mining event</strong>.
                </li>
                <li><strong>Open Source</strong>: Both the client and server software are fully open source.</li>
              </ul>
            </TabsContent>

            <TabsContent value="reprocessing" className="mt-6">
              <h2 className="text-3xl font-bold mb-4">How Reprocessing Works</h2>
              <p className="text-lg leading-relaxed">
                Reprocessing enhances mining efficiency. By reprocessing mined COAL, the pool unlocks CHROMIUM, a
                high-value token that adds another layer of profitability to your mining efforts.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      {/* Get Started Section */}
      <section className="text-center py-5">
        <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-lg leading-relaxed mb-6">
          Join the COAL + ORE Mining Pool today and become part of the future of decentralized, multi-token mining.
        </p>
        <Link href="/getting-started/quick-start" passHref>
          <Button size="lg">
            <strong>START MINING NOW</strong>
          </Button>
        </Link>
      </section>

      {/* Placeholder Grid Section */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {/* Discord Link */}
        <a
          href="https://discord.gg/p9V24cMNn6"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Card
            className="aspect-video flex flex-col justify-center items-center group">
            <img src="/images/discord-logo.svg" alt="Discord"
                 className="w-16 h-16 mb-4 transition-transform group-hover:scale-110 hidden dark:block"/>
            <img src="/images/discord-logo-black.svg" alt="Discord"
                 className="w-16 h-16 mb-4 transition-transform group-hover:scale-110 block dark:hidden"/>
            <h3 className="text-xl font-bold text-center">Join Our Discord</h3>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
              Connect with the community and get the latest updates.
            </p>
          </Card>
        </a>

        {/* GitHub Link */}
        <a
          href="https://github.com/shinyst-shiny"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Card
            className="aspect-video flex flex-col justify-center items-center group">
            <img src="/images/github-logo.svg" alt="GitHub"
                 className="w-16 h-16 mb-4 transition-transform group-hover:scale-110 hidden dark:block"/>
            <img src="/images/github-logo-black.svg" alt="GitHub"
                 className="w-16 h-16 mb-4 transition-transform group-hover:scale-110 block dark:hidden"/>
            <h3 className="text-xl font-bold text-center">Explore on GitHub</h3>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
              View our open-source code and contribute to the project.
            </p>
          </Card>
        </a>

        <div className="flex flex-col md:flex-row gap-4">
          {/* COAL Official Website */}
          <a
            href="https://minechain.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex"
          >
            <Card
              className="flex-1 flex flex-col justify-center items-center group">
              <div className="p-1 bg-black rounded-full w-16 h-16 mb-4 transition-transform group-hover:scale-110">
                <img
                  src="/images/coal-logo.png"
                  alt="COAL Logo"
                />
              </div>
              <h3 className="text-2xl font-bold">COAL Website</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                The minechain.
              </p>
            </Card>
          </a>

          {/* ORE Official Website */}
          <a
            href="https://ore.supply"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex"
          >
            <Card
              className="flex-1 flex flex-col justify-center items-center group">
              <img
                src="/images/ore-logo.png"
                alt="ORE Logo"
                className="w-16 h-16 mb-4 transition-transform group-hover:scale-110"
              />
              <h3 className="text-2xl font-bold">ORE Website</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Solana digital gold.
              </p>
              </Card>
          </a>
        </div>

      </div>

    </div>
  );
}
