import { Card } from '../../../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import { FaDiscord, FaGithub, FaXTwitter } from 'react-icons/fa6'

interface TeamMember {
  name: string
  avatar: string
  discord?: string
  twitter?: string
  github?: string
  role: string
}

interface SpecialThanks {
  name: string
  contribution: string
}

const teamMembers: TeamMember[] = [
  {
    name: 'Shinyst',
    avatar: '/avatars/shinyst.webp',
    twitter: 'shinyst_',
    github: 'shinyst-shiny',
    role: 'Developer and Pool Operator'
  },
  {
    name: 'SirBassy',
    avatar: '/avatars/sirbassy.webp',
    twitter: 'aruthus13',
    role: 'Consultant and Sponsor'
  },
  {
    name: 'Griev0us',
    avatar: '/avatars/griev0us.webp',
    github: 'MattNocash',
    role: 'Web Developer'
  },
]

const specialThanks: SpecialThanks[] = [
  { name: 'SLxTnT', contribution: 'Inclusion of the pool in the Orion Client' },
  { name: 'Kriptikz and Ec1ipse', contribution: 'Original pool code and coding help' },
  { name: 'Grant', contribution: 'Coding help and COAL implementations' },
  { name: 'CryptoMykel', contribution: 'Video coverage' },
]

const SocialLink = ({ href, icon: Icon, label }: { href?: string; icon: React.ElementType; label: string }) => {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200" aria-label={label}>
      <Icon size={24} />
    </a>
  );
};

export default function Page() {
  return (
    <div className="flex flex-col gap-8 p-4">
      <h1 className="text-4xl font-bold mb-6">The Team</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.name} className="p-6 flex flex-col items-center">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback>{member.name[0]}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-semibold mb-2">{member.name}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{member.role}</p>
            <div className="flex gap-4">
              <SocialLink href={member.discord ? `https://discord.com/users/${member.discord}` : undefined} icon={FaDiscord} label="Discord" />
              <SocialLink href={member.twitter ? `https://twitter.com/${member.twitter}` : undefined} icon={FaXTwitter} label="Twitter" />
              <SocialLink href={member.github ? `https://github.com/${member.github}` : undefined} icon={FaGithub} label="GitHub" />
            </div>
          </Card>
        ))}
      </div>

      <h2 className="text-3xl font-bold mt-12 mb-6">Special Thanks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {specialThanks.map((person) => (
          <Card key={person.name} className="p-6">
            <h3 className="text-xl font-semibold mb-2">{person.name}</h3>
            <p className="text-gray-600 dark:text-gray-400">{person.contribution}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
