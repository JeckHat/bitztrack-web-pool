import nextMDX from '@next/mdx'
import rehypePrettyCode from 'rehype-pretty-code'

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects () {
    return [
      {
        source: '/getting-started',
        destination: '/getting-started/quick-start',
        permanent: true,
      },
      {
        source: '/info',
        destination: '/info/pool-details',
        permanent: true,
      },
      {
        source: '/miner',
        destination: '/miner/stake-coal',
        permanent: true,
      },
    ]
  },
}

const options = {}

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [[rehypePrettyCode, options]],
  },
})

export default withMDX(nextConfig)
