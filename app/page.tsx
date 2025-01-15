import { Button } from '../components/ui/button'
import Link from 'next/link'
import { Card } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import Image from 'next/image'

export default function Page () {

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      {/* Hero Section */}
      <Card
        className="py-10 flex-1 bg-cover bg-center relative text-white overflow-hidden"
        style={{ backgroundImage: 'url(\'/images/background/excalivator_bg_5.png\')' }}>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-75"></div>
        <div className="container mx-auto px-4 h-full relative">
          <header className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Image
                src="/images/excalivator-logo-small-no-bg.png"
                alt="Excalivator Logo"
                width={60}
                height={60}
                className="mr-4"
              />
              <h1 className="text-5xl font-extrabold ">Welcome to the Excalivator Mining Pool</h1>
            </div>
            <p className="text-xl font-light">Your Gateway to Efficient, Multi-Token Crypto Mining on Solana</p>
          </header>

          <Tabs defaultValue="overview" className="mt-10">
            <div className="flex flex-row w-full justify-center">
              <TabsList className="grid w-full grid-col-1 sm:grid-cols-4 h-fit">
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
                <TabsTrigger
                  className="text-lg font-medium"
                  value="diamond"
                >
                  Diamond Hands
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="overview" className="mt-6">
              <h2 className="text-3xl font-bold mb-4">What is the Excalivator Mining Pool?</h2>
              <p className="text-lg leading-relaxed">
                The Excalivator Mining Pool is an innovative, open-source cryptocurrency mining platform built on the
                Solana blockchain.<br/>Designed for both novice and experienced miners, the pool enables simultaneous
                mining
                of <strong>COAL</strong> and <strong>ORE</strong>, along with <strong>additional tokens</strong>,
                through a
                cutting-edge system called <strong>Reprocessing</strong>.
              </p>
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <h2 className="text-3xl font-bold mb-4">Why Choose Excalivator?</h2>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Multiple Tokens Advantage</strong>: Mine COAL, ORE, and other tokens in a single process.
                </li>
                <li><strong>No Entry Fees</strong>: Join the pool completely free of charge—no hidden costs or setup
                  fees.
                </li>
                <li><strong>Transparent Revenue Model</strong>: A simple <strong>5% fee on each mining event</strong>.
                </li>
                <li><strong>Open Source</strong>: Both the client and server software are fully open source.</li>
              </ul>
            </TabsContent>

            <TabsContent value="reprocessing" className="mt-6">
              <h2 className="text-3xl font-bold mb-4">Unlocking Extra Value with Reprocessing</h2>
              <p className="text-lg leading-relaxed">
                Reprocessing is our innovative approach to maximize your mining rewards. It works by:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Analyzing the time miners spend in the pool</li>
                <li>Evaluating the hash power contributed</li>
                <li>Distributing additional tokens based on these factors</li>
              </ul>
              <p className="text-lg leading-relaxed mt-2">
                This unique system ensures that your mining efforts are rewarded more comprehensively,
                boosting overall efficiency and potential earnings.
              </p>
            </TabsContent>

            <TabsContent value="diamond" className="mt-6">
              <h2 className="text-3xl font-bold mb-4">Diamond Hands: Amplify Your Mining Rewards</h2>
              <p className="text-lg leading-relaxed">
                Our Diamond Hands system is designed to reward loyal miners who demonstrate long-term commitment.
                Here&#39;s
                how it works:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Builds upon the reprocessing system, considering your weekly mining performance</li>
                <li>Rewards increase when you don&#39;t claim your tokens from the pool</li>
                <li>Multiplier increases each week you don&#39;t claim, up to 4x for 4 consecutive weeks</li>
                <li>Rewards are sourced from a portion of the pool treasury, accumulated from mining fees</li>
              </ul>
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      {/* Get Started Section */}
      <section className="text-center py-5">
        <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-lg leading-relaxed mb-6">
          Join the Excalivator Mining Pool today and become part of the future of decentralized, multi-token mining.
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
              <h3 className="text-2xl font-bold">$COAL</h3>
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
              <h3 className="text-2xl font-bold">$ORE</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Solana digital gold.
              </p>
            </Card>
          </a>
        </div>

      </div>

    </div>
  )
}
